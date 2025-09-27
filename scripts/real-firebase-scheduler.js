// Real Firebase-based compliance scheduler
import { collection, getDocs, query, where, doc, getDoc, orderBy, limit, updateDoc } from 'firebase/firestore';
import { db, processEmissionCompliance, logBlockchainTransaction } from '../src/firebase.js';
import blockchainService from '../src/blockchain.js';

// Function to get all active companies with emission caps
async function getActiveCompaniesWithCaps() {
  console.log('🏢 Fetching active companies from Firebase...');
  
  try {
    // Get all approved companies (handle both status fields)
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    const approvedCompanies = companiesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === 'approved' || data.registrationStatus === 'approved';
    });
    
    const activeCompanies = [];
    
    for (const companyDoc of approvedCompanies) {
      const companyData = companyDoc.data();
      const companyId = companyDoc.id;
      
      // Handle wallet address - create if missing
      let walletAddress = companyData.walletAddress;
      if (!walletAddress) {
        console.log(`🔧 Creating wallet for ${companyId}...`);
        try {
          const walletResult = await blockchainService.createCompanyWallet();
          if (walletResult.success) {
            walletAddress = walletResult.walletAddress;
            // Update company with new wallet
            await updateDoc(doc(db, 'companies', companyId), {
              walletAddress: walletAddress,
              walletAssignedAt: new Date()
            });
            console.log(`✅ Created wallet ${walletAddress} for ${companyId}`);
          } else {
            console.log(`❌ Failed to create wallet for ${companyId}:`, walletResult.error);
            continue;
          }
        } catch (error) {
          console.log(`❌ Error creating wallet for ${companyId}:`, error.message);
          continue;
        }
      }
      
      // Get emission cap
      let emissionCap = null;
      
      // First try from company data directly
      if (companyData.carbonEmissionCap) {
        emissionCap = companyData.carbonEmissionCap;
      } else {
        // Try from emission_caps collection
        const capDoc = await getDoc(doc(db, 'emission_caps', companyId));
        if (capDoc.exists()) {
          emissionCap = capDoc.data().cap;
        }
      }
      
      if (!emissionCap) {
        console.log(`⚠️  Skipping ${companyId} - no emission cap set`);
        continue;
      }
      
      // Get recent emissions (last 5 minutes worth)
      const emissionsSnapshot = await getDocs(
        query(
          collection(db, 'emissions', companyId, 'records'),
          orderBy('timestamp', 'desc'),
          limit(5)
        )
      );
      
      let totalEmissions = 0;
      let recordCount = 0;
      
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      emissionsSnapshot.docs.forEach(doc => {
        const emission = doc.data();
        const emissionTime = emission.timestamp?.toDate() || emission.date?.toDate();
        
        if (emissionTime && emissionTime > fiveMinutesAgo) {
          totalEmissions += emission.emissionValue || 0;
          recordCount++;
        }
      });
      
      // If no recent emissions, use latest value for testing
      if (recordCount === 0 && emissionsSnapshot.docs.length > 0) {
        const latestEmission = emissionsSnapshot.docs[0].data();
        totalEmissions = latestEmission.emissionValue || 0;
        recordCount = 1;
      }
      
      activeCompanies.push({
        id: companyId,
        name: companyData.name || companyData.company_details?.companyName || `Company ${companyId.substring(0, 8)}`,
        email: companyData.email,
        walletAddress: companyData.walletAddress,
        emissionCap: parseFloat(emissionCap),
        currentEmissions: totalEmissions,
        emissionRecords: recordCount,
        creditBalance: companyData.creditBalance || 0
      });
    }
    
    console.log(`✅ Found ${activeCompanies.length} active companies with complete data`);
    return activeCompanies;
    
  } catch (error) {
    console.error('❌ Error fetching companies:', error.message);
    return [];
  }
}

// Enhanced compliance check function
async function runRealComplianceCheck() {
  try {
    console.log(`\n🔍 [${new Date().toLocaleTimeString()}] RUNNING REAL COMPLIANCE CHECK`);
    
    // Initialize blockchain service
    if (!blockchainService.initialized) {
      console.log('🚀 Initializing blockchain service...');
      await blockchainService.initialize();
    }
    
    // Get active companies from Firebase
    const companies = await getActiveCompaniesWithCaps();
    
    if (companies.length === 0) {
      console.log('⚠️  No active companies found with complete data');
      return;
    }
    
    // Process each company
    for (const company of companies) {
      console.log(`\n🏢 Processing: ${company.name} (${company.id})`);
      console.log(`📧 Email: ${company.email}`);
      console.log(`💰 Wallet: ${company.walletAddress}`);
      console.log(`📊 Current Emissions: ${company.currentEmissions.toFixed(2)}`);
      console.log(`🎯 Emission Cap: ${company.emissionCap}`);
      console.log(`💳 Current Balance: ${company.creditBalance} CCT`);
      
      // Use the Firebase compliance processing function
      const result = await processEmissionCompliance(company.id);
      
      if (result.success) {
        console.log(`✅ Compliance processing completed!`);
        console.log(`🎯 Action: ${result.action || 'Processed'}`);
        
        // Check updated balance
        try {
          const balanceResult = await blockchainService.checkCreditBalance(company.walletAddress);
          console.log(`💰 Updated Balance: ${balanceResult.balance} CCT`);
          
          // Update balance in Firebase companies collection
          const companyRef = doc(db, 'companies', company.id);
          await updateDoc(companyRef, {
            creditBalance: balanceResult.balance,
            lastBalanceUpdate: new Date()
          });
          
        } catch (balanceError) {
          console.log(`⚠️  Could not fetch/update balance: ${balanceError.message}`);
        }
        
      } else {
        console.log(`❌ Compliance processing failed: ${result.error}`);
      }
    }
    
    console.log(`\n✅ Real compliance check completed at ${new Date().toLocaleTimeString()}`);
    console.log(`📅 Next check in 5 minutes...`);
    
  } catch (error) {
    console.error('❌ Real compliance check failed:', error.message);
  }
}

// Start the real scheduler
async function startRealScheduler() {
  console.log('🚀 Starting REAL Firebase-Based Compliance Scheduler');
  console.log('📋 This scheduler uses real Firebase company data');
  console.log('🏢 It processes approved companies with emission caps');
  console.log('⛓️  Smart contract transactions update both blockchain and Firebase');
  console.log('🔄 Press Ctrl+C to stop\n');

  // Run first check immediately
  await runRealComplianceCheck();

  // Then run every 5 minutes
  const intervalId = setInterval(runRealComplianceCheck, 5 * 60 * 1000);

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping scheduler...');
    clearInterval(intervalId);
    process.exit(0);
  });
}

// Start the scheduler
startRealScheduler().catch(console.error);