import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../src/firebase.js';

async function exploreFirebaseStructure() {
  console.log('🔍 Exploring Firebase collections for company data...\n');
  
  try {
    // 1. Get all companies
    console.log('📊 COMPANIES COLLECTION:');
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    console.log(`Found ${companiesSnapshot.size} companies\n`);
    
    companiesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Company ID: ${doc.id}`);
      console.log(`   Name: ${data.companyName || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      console.log(`   Wallet: ${data.walletAddress || 'N/A'}`);
      console.log('   Fields:', Object.keys(data).join(', '));
      console.log('');
    });

    // 2. Get emission caps
    console.log('📈 EMISSION_CAPS COLLECTION:');
    const capsSnapshot = await getDocs(collection(db, 'emission_caps'));
    console.log(`Found ${capsSnapshot.size} emission caps\n`);
    
    capsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Company ID: ${doc.id}`);
      console.log(`   Emission Cap: ${data.emissionCap || 'N/A'}`);
      console.log('   Fields:', Object.keys(data).join(', '));
      console.log('');
    });

    // 3. Sample recent emissions to understand structure
    console.log('📊 RECENT EMISSIONS SAMPLES:');
    if (companiesSnapshot.size > 0) {
      const firstCompanyId = companiesSnapshot.docs[0].id;
      console.log(`Checking emissions for company: ${firstCompanyId}`);
      
      const emissionsSnapshot = await getDocs(collection(db, 'emissions', firstCompanyId, 'records'));
      console.log(`Found ${emissionsSnapshot.size} emission records\n`);
      
      emissionsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. Emission Record:`);
        console.log(`   Value: ${data.emissionValue || 'N/A'}`);
        console.log(`   Date: ${data.date?.toDate().toLocaleString() || 'N/A'}`);
        console.log('   Fields:', Object.keys(data).join(', '));
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error exploring Firebase:', error.message);
  }
  
  process.exit(0);
}

exploreFirebaseStructure();