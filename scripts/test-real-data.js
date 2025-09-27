const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit } = require('firebase/firestore');
const { ethers } = require('ethers');

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

async function testRealData() {
  console.log('=== Testing Real Data Sources ===\n');
  
  try {
    // Check Firebase companies data
    console.log('1. Firebase Companies Data:');
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    
    if (companiesSnapshot.empty) {
      console.log('   No companies found in Firebase');
    } else {
      companiesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   Company: ${data.companyName || doc.id}`);
        console.log(`   Wallet: ${data.walletAddress || 'No wallet'}`);
        console.log(`   Emissions: ${data.currentEmissions || 'No data'} tons`);
        console.log(`   Cap: ${data.emissionsCap || 'No cap'} tons`);
        console.log(`   Balance: ${data.creditBalance || 0} CCT`);
        console.log('   ---');
      });
    }
    
    // Check emission records
    console.log('\n2. Emission Records:');
    const emissionsSnapshot = await getDocs(
      query(collection(db, 'emissionRecords'), orderBy('timestamp', 'desc'), limit(5))
    );
    
    if (emissionsSnapshot.empty) {
      console.log('   No emission records found');
    } else {
      emissionsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   Company: ${data.companyId}`);
        console.log(`   Emissions: ${data.emissions} tons`);
        console.log(`   Timestamp: ${data.timestamp?.toDate?.() || data.timestamp}`);
        console.log('   ---');
      });
    }
    
    // Check blockchain data (if available)
    console.log('\n3. Blockchain Contract Test:');
    try {
      const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/bb8e63cd5a6b4c3481b32b34e95bbfd5');
      const contractABI = [
        "function name() view returns (string)",
        "function symbol() view returns (string)", 
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)"
      ];
      
      const contract = new ethers.Contract('0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e', contractABI, provider);
      
      const name = await contract.name();
      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      
      console.log(`   Contract Name: ${name}`);
      console.log(`   Symbol: ${symbol}`);
      console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, 18)} tokens`);
      
      // Test balance for a company wallet (if available)
      const companiesArray = [];
      companiesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.walletAddress) {
          companiesArray.push({ id: doc.id, wallet: data.walletAddress, name: data.companyName });
        }
      });
      
      if (companiesArray.length > 0) {
        const testCompany = companiesArray[0];
        console.log(`   Testing balance for ${testCompany.name}:`);
        const balance = await contract.balanceOf(testCompany.wallet);
        console.log(`   Balance: ${ethers.formatUnits(balance, 18)} CCT`);
      }
      
    } catch (error) {
      console.log(`   Blockchain error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

testRealData();