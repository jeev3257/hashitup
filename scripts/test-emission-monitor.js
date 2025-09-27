import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function testConnectivity() {
  console.log('🧪 Testing Firebase and Blockchain connectivity...');
  
  try {
    // Test Firebase
    console.log('📡 Testing Firebase connection...');
    const companiesRef = collection(db, 'companies');
    const snapshot = await getDocs(companiesRef);
    console.log(`✅ Firebase: Found ${snapshot.size} companies`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.companyName} (Cap: ${data.carbonEmissionCap} tons)`);
    });
    
    // Test Blockchain
    console.log('\n⛓️  Testing Blockchain connection...');
    await blockchainService.initialize();
    console.log('✅ Blockchain service initialized successfully');
    
    // Test contract interaction
    const testAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const balance = await blockchainService.checkCreditBalance(testAddress);
    console.log(`✅ Contract interaction successful. Test balance: ${balance}`);
    
    console.log('\n🎉 All systems operational!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

testConnectivity();