import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query, where, orderBy, limit } from 'firebase/firestore';
import blockchainService from '../src/blockchain.js';

const firebaseConfig = {
  apiKey: "AIzaSyD1HciA35uKQCEQRpwhI54QgwpOeffCfZQ",
  authDomain: "hashitup-5bb9b.firebaseapp.com",
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.firebasestorage.app",
  messagingSenderId: "620690168173",
  appId: "1:620690168173:web:8b3306843fdb65f99ae264",
  measurementId: "G-97PR8NFRRQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class EmissionMonitor {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  async start() {
    if (this.isRunning) {
      console.log('🔄 Emission monitor is already running');
      return;
    }

    console.log('🚀 Starting Emission Monitor with 5-minute intervals...');
    this.isRunning = true;

    // Try to initialize blockchain service (optional for now)
    try {
      await blockchainService.initialize();
      console.log('✅ Blockchain service initialized');
    } catch (error) {
      console.log('⚠️  Blockchain service not available, continuing with Firebase-only updates');
    }
    
    // Run immediately on start
    await this.checkAllCompanies();
    
    // Then run every 5 minutes (300,000 ms)
    this.intervalId = setInterval(async () => {
      await this.checkAllCompanies();
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Emission monitor stopped');
  }

  async checkAllCompanies() {
    try {
      console.log('\n🔍 Checking emissions for all companies...');
      console.log(`⏰ Time: ${new Date().toISOString()}`);
      
      // Get all approved companies with wallet addresses
      const companiesRef = collection(db, 'companies');
      const companiesSnapshot = await getDocs(companiesRef);
      
      // Filter for approved companies with wallet addresses
      const validCompanies = [];
      companiesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.registrationStatus === 'approved' && data.walletAddress) {
          validCompanies.push({ id: doc.id, data });
        }
      });
      
      console.log(`📊 Found ${validCompanies.length} approved companies with wallet addresses`);
      
      for (const company of validCompanies) {
        const companyName = company.data.company_details?.companyName || company.data.companyName || company.id;
        console.log(`\n🏭 Processing: ${companyName} (${company.data.walletAddress})`);
        
        await this.processCompanyEmissions(company.id, company.data);
      }
      
      console.log('\n✅ Completed emission check cycle\n' + '='.repeat(50));
      
    } catch (error) {
      console.error('❌ Error in emission check cycle:', error);
    }
  }

  async processCompanyEmissions(companyId, companyData) {
    try {
      // Get emission cap
      const emissionCap = companyData.carbonEmissionCap;
      if (!emissionCap) {
        console.log(`⚠️  No emission cap found for ${companyId}`);
        return;
      }

      // Get latest emission records
      const emissionsRef = collection(db, 'emissions', companyId, 'records');
      const recentEmissionsQuery = query(
        emissionsRef, 
        orderBy('timestamp', 'desc'), 
        limit(10)
      );
      
      const emissionsSnapshot = await getDocs(recentEmissionsQuery);
      
      if (emissionsSnapshot.empty) {
        console.log(`📊 No emission records found for ${companyId}`);
        return;
      }

      // Calculate total recent emissions
      let totalEmissions = 0;
      const emissionRecords = [];
      
      emissionsSnapshot.forEach(doc => {
        const record = doc.data();
        const emissionValue = parseFloat(record.emissionValue || 0);
        totalEmissions += emissionValue;
        emissionRecords.push({
          id: doc.id,
          value: emissionValue,
          timestamp: record.timestamp
        });
      });

      console.log(`📈 Total recent emissions: ${totalEmissions.toFixed(2)}`);
      console.log(`🎯 Emission cap: ${emissionCap}`);
      
      // Determine compliance status
      const isCompliant = totalEmissions <= emissionCap;
      const excessEmissions = Math.max(0, totalEmissions - emissionCap);
      
      console.log(`${isCompliant ? '✅' : '❌'} Compliance: ${isCompliant ? 'COMPLIANT' : 'EXCEEDED'}`);
      
      if (!isCompliant) {
        console.log(`⚠️  Excess emissions: ${excessEmissions.toFixed(2)}`);
      }

      // Update wallet balance based on compliance
      await this.updateWalletBalance(companyId, companyData, {
        totalEmissions,
        emissionCap,
        isCompliant,
        excessEmissions,
        records: emissionRecords
      });

    } catch (error) {
      console.error(`❌ Error processing company ${companyId}:`, error);
    }
  }

  async updateWalletBalance(companyId, companyData, emissionData) {
    try {
      const walletAddress = companyData.walletAddress;
      if (!walletAddress) {
        console.log(`⚠️  No wallet address for ${companyId}`);
        return;
      }

      // Current balance from Firebase
      const currentBalance = parseFloat(companyData.creditBalance || 0);
      console.log(`💰 Current balance: ${currentBalance}`);

      let newBalance = currentBalance;
      let action = 'none';
      let reason = '';

      if (!emissionData.isCompliant) {
        // Deduct credits for excess emissions (1 credit per unit of excess)
        const penalty = Math.floor(emissionData.excessEmissions);
        newBalance = Math.max(0, currentBalance - penalty);
        action = 'deducted';
        reason = `Excess emissions: ${emissionData.excessEmissions.toFixed(2)} units`;
        console.log(`⬇️  Deducting ${penalty} credits for excess emissions`);
      } else {
        // Award credits for compliance (small reward)
        const reward = 5; // Small reward for compliance
        newBalance = currentBalance + reward;
        action = 'awarded';
        reason = `Compliance reward`;
        console.log(`⬆️  Awarding ${reward} credits for compliance`);
      }

      console.log(`💳 New balance: ${newBalance}`);

      // Update Firebase
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, {
        creditBalance: newBalance,
        lastBalanceUpdate: new Date(),
        lastEmissionCheck: {
          timestamp: new Date(),
          totalEmissions: emissionData.totalEmissions,
          emissionCap: emissionData.emissionCap,
          isCompliant: emissionData.isCompliant,
          action,
          reason,
          balanceChange: newBalance - currentBalance
        }
      });

      // Log the transaction
      await this.logTransaction(companyId, {
        companyName: companyData.company_details?.companyName || companyData.companyName,
        walletAddress,
        oldBalance: currentBalance,
        newBalance,
        action,
        reason,
        emissionData
      });

      console.log(`✅ Updated balance in Firebase: ${currentBalance} → ${newBalance}`);

    } catch (error) {
      console.error(`❌ Error updating wallet balance for ${companyId}:`, error);
    }
  }

  async logTransaction(companyId, transactionData) {
    try {
      const transactionsRef = collection(db, 'emission_transactions');
      await addDoc(transactionsRef, {
        companyId,
        ...transactionData,
        timestamp: new Date(),
        type: 'emission_compliance_check'
      });
    } catch (error) {
      console.error('❌ Error logging transaction:', error);
    }
  }
}

// Create and start the monitor
const monitor = new EmissionMonitor();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down emission monitor...');
  monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down emission monitor...');
  monitor.stop();
  process.exit(0);
});

// Start the monitor
monitor.start().catch(console.error);

export default monitor;