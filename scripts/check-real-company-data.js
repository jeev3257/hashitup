import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { db } from '../src/firebase.js';

async function checkRealCompanyData() {
  console.log('🔍 Checking Firebase for REAL company compliance data...');
  
  try {
    // Check for the real company IDs that were processed
    const realCompanies = [
      'complete-test-001',
      'test-company-immutable-001'
    ];

    for (const companyId of realCompanies) {
      console.log(`\n📊 Checking compliance history for ${companyId}:`);
      
      const historyRef = collection(db, 'compliance_history', companyId, 'checks');
      const historyQuery = query(historyRef, orderBy('loggedAt', 'desc'), limit(5));
      const historySnapshot = await getDocs(historyQuery);
      
      console.log(`✅ Found ${historySnapshot.size} compliance check records`);
      
      historySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.loggedAt?.toDate().toLocaleTimeString() || 'Unknown time'}`);
        console.log(`     Emissions: ${data.totalEmissions || 'N/A'} tons`);
        console.log(`     Cap: ${data.emissionCap || 'N/A'} tons`);
        console.log(`     Status: ${data.isCompliant ? 'COMPLIANT' : 'OVER CAP'}`);
        console.log(`     Action: ${data.action || 'None'}`);
        if (data.error) console.log(`     Error: ${data.error}`);
      });
    }

    // Check recent blockchain transactions for these companies
    console.log(`\n🔗 Recent blockchain transactions:`);
    const transactionsRef = collection(db, 'blockchain_transactions');
    const transactionsQuery = query(transactionsRef, orderBy('timestamp', 'desc'), limit(5));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    
    transactionsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.timestamp?.toDate().toLocaleTimeString() || 'Unknown'} - Company: ${data.companyId}`);
      console.log(`     Type: ${data.type} | Amount: ${data.amount} CCT | Reason: ${data.reason}`);
      console.log(`     TX Hash: ${data.txHash?.substring(0, 20)}...`);
    });

  } catch (error) {
    console.error('❌ Error checking real company data:', error.message);
  }
  
  process.exit(0);
}

checkRealCompanyData();