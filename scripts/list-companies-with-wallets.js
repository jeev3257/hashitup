import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDdxqVmVYfU21Sih5rJ5sMXN3JxP-4wMKU",
  authDomain: "hashitup-5bb9b.firebaseapp.com", 
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.appspot.com",
  messagingSenderId: "648574696779",
  appId: "1:648574696779:web:0ae80db7ed30d5d0b9cb67"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listCompaniesWithWallets() {
  try {
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    
    console.log('🏭 Companies with Wallet Addresses:\n');
    
    let count = 0;
    companiesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.walletAddress && data.registrationStatus === 'approved') {
        count++;
        const name = data.company_details?.companyName || data.companyName || doc.id;
        const cap = data.carbonEmissionCap || 'N/A';
        const balance = data.creditBalance || 0;
        
        console.log(`${count}. 🏢 ${name}`);
        console.log(`   📧 Email: ${data.email}`);
        console.log(`   🪙  Wallet: ${data.walletAddress}`);
        console.log(`   🎯 Emission Cap: ${cap}`);
        console.log(`   💰 Credit Balance: ${balance}`);
        console.log(`   ✅ Status: ${data.registrationStatus}\n`);
      }
    });
    
    console.log(`📊 Total companies ready for monitoring: ${count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listCompaniesWithWallets();