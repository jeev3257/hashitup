import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function inspectAllCompanies() {
  try {
    console.log('🔍 Inspecting all companies in Firebase...\n');
    
    // Get all companies
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    
    console.log(`📊 Total companies found: ${companiesSnapshot.size}\n`);
    
    let companyIndex = 0;
    companiesSnapshot.forEach((doc) => {
      companyIndex++;
      const data = doc.data();
      console.log(`${companyIndex}. Company ID: ${doc.id}`);
      console.log(`   Name: ${data.name || data.companyName || (data.company_details?.companyName) || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Status: ${data.status || data.registrationStatus || 'N/A'}`);
      console.log(`   Wallet Address: ${data.walletAddress || 'N/A'}`);
      console.log(`   Carbon Emission Cap: ${data.carbonEmissionCap || 'N/A'}`);
      console.log(`   Credit Balance: ${data.creditBalance || 'N/A'}`);
      console.log(`   Created: ${data.createdAt ? (data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : data.createdAt) : 'N/A'}`);
      console.log(`   All fields: ${Object.keys(data).join(', ')}\n`);
    });
    
    // Check emission caps
    console.log('\n🎯 Checking emission caps...\n');
    const capsRef = collection(db, 'emission_caps');
    const capsSnapshot = await getDocs(capsRef);
    
    console.log(`📊 Total emission caps found: ${capsSnapshot.size}\n`);
    
    let capIndex = 0;
    capsSnapshot.forEach((doc) => {
      capIndex++;
      const data = doc.data();
      console.log(`${capIndex}. Cap ID: ${doc.id}`);
      console.log(`   Company ID: ${data.companyId || doc.id || 'N/A'}`);
      console.log(`   Cap Limit: ${data.capLimit || data.cap || 'N/A'}`);
      console.log(`   Current Emissions: ${data.currentEmissions || 'N/A'}`);
      console.log(`   Set By: ${data.setBy || 'N/A'}`);
      console.log(`   Set At: ${data.setAt || 'N/A'}`);
      console.log(`   All fields: ${Object.keys(data).join(', ')}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error inspecting companies:', error);
  }
}

inspectAllCompanies();
