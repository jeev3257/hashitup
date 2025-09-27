import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { db } from '../src/firebase.js';

async function checkFirebaseData() {
  console.log('🔍 Checking Firebase for logged compliance data...');
  
  try {
    // Check for compliance history for both test companies
    const testCompanies = [
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    ];

    for (const companyId of testCompanies) {
      console.log(`\n📊 Checking compliance history for ${companyId}:`);
      
      const historyRef = collection(db, 'compliance_history', companyId, 'checks');
      const historyQuery = query(historyRef, orderBy('loggedAt', 'desc'), limit(5));
      const historySnapshot = await getDocs(historyQuery);
      
      console.log(`✅ Found ${historySnapshot.size} compliance check records`);
      
      historySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.loggedAt?.toDate().toLocaleTimeString() || 'Unknown time'} - Error: ${data.error || 'None'}`);
      });
    }

    // Check blockchain transactions collection
    console.log(`\n🔗 Checking blockchain_transactions collection:`);
    const transactionsRef = collection(db, 'blockchain_transactions');
    const transactionsQuery = query(transactionsRef, orderBy('timestamp', 'desc'), limit(10));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    
    console.log(`✅ Found ${transactionsSnapshot.size} blockchain transaction records`);
    transactionsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.timestamp?.toDate().toLocaleTimeString() || 'Unknown time'} - ${data.type} - ${data.amount} CCT`);
    });

  } catch (error) {
    console.error('❌ Error checking Firebase data:', error.message);
  }
  
  process.exit(0);
}

checkFirebaseData();