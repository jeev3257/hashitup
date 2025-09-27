import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/firebase.js';

async function checkImmutableRecords() {
  console.log('🔍 Checking immutable blockchain records...\n');
  
  try {
    // Get recent immutable blockchain records
    const immutableRef = collection(db, 'immutable_blockchain_records');
    const immutableQuery = query(immutableRef, orderBy('metadata.timestamp', 'desc'), limit(5));
    const immutableSnapshot = await getDocs(immutableQuery);
    
    console.log(`✅ Found ${immutableSnapshot.size} immutable blockchain records\n`);
    
    immutableSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📝 Record ${index + 1}:`);
      console.log(`   Record ID: ${data.recordId}`);
      console.log(`   Company ID: ${data.companyId}`);
      console.log(`   Time: ${data.metadata?.timestamp?.toDate().toLocaleString() || 'Unknown'}`);
      
      console.log(`\n   🔗 Blockchain Data:`);
      console.log(`     Block Hash: ${data.blockchainData?.blockHash?.substring(0, 20)}...`);
      console.log(`     Block Number: ${data.blockchainData?.blockNumber}`);
      console.log(`     Chain ID: ${data.blockchainData?.chainId}`);
      console.log(`     Contract: ${data.blockchainData?.contractAddress?.substring(0, 20)}...`);
      console.log(`     TX Hash: ${data.blockchainData?.transactionHash?.substring(0, 20)}...`);
      
      console.log(`\n   💰 Compliance Data:`);
      console.log(`     Type: ${data.complianceData?.type}`);
      console.log(`     Amount: ${data.complianceData?.amount} CCT`);
      console.log(`     Balance After: ${data.complianceData?.balanceAfter} CCT`);
      console.log(`     Description: ${data.complianceData?.description}`);
      console.log(`     Wallet: ${data.complianceData?.walletAddress?.substring(0, 20)}...`);
      
      console.log(`\n   📋 Metadata:`);
      console.log(`     Is Immutable: ${data.metadata?.isImmutable}`);
      console.log(`     Service ID: ${data.metadata?.serviceId}`);
      console.log(`     Version: ${data.metadata?.version}`);
      console.log(`     Verification Hash: ${data.metadata?.verificationHash?.substring(0, 20)}...`);
      
      console.log('\n' + '='.repeat(80) + '\n');
    });

    // Also check wallet balances in companies collection
    console.log('💳 Checking company wallet balances:\n');
    
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    
    companiesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved' && data.walletAddress) {
        console.log(`🏢 Company: ${doc.id}`);
        console.log(`   Name: ${data.name || data.company_details?.companyName || 'N/A'}`);
        console.log(`   Credit Balance: ${data.creditBalance || 0} CCT`);
        console.log(`   Last Updated: ${data.lastBalanceUpdate?.toDate().toLocaleString() || 'Never'}`);
        console.log(`   Wallet: ${data.walletAddress?.substring(0, 20)}...`);
        console.log('');
      }
    });

  } catch (error) {
    console.error('❌ Error checking immutable records:', error.message);
  }
  
  process.exit(0);
}

checkImmutableRecords();