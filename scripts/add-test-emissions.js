import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDocs, query, where } from 'firebase/firestore';

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

async function addTestEmissionData() {
  try {
    console.log('🔧 Adding test emission data for your companies...\n');

    // Get approved companies
    const companiesRef = collection(db, 'companies');
    const companiesQuery = query(companiesRef, where('registrationStatus', '==', 'approved'));
    const companiesSnapshot = await getDocs(companiesQuery);

    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;
      const companyData = companyDoc.data();
      const companyName = companyData.company_details?.companyName || companyData.companyName || companyId;
      const emissionCap = companyData.carbonEmissionCap;

      console.log(`📊 Adding emissions for: ${companyName} (Cap: ${emissionCap})`);

      // Create emissions subcollection
      const emissionsRef = collection(db, 'emissions', companyId, 'records');

      // Add some realistic emission records
      const emissionRecords = [
        { emissionValue: "145.50", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) }, // 4 hours ago
        { emissionValue: "167.20", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) }, // 3 hours ago
        { emissionValue: "132.80", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours ago
        { emissionValue: "189.40", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) }, // 1 hour ago
        { emissionValue: "156.30", timestamp: new Date() }, // now
      ];

      // Add records that might exceed cap for some companies to test compliance
      if (emissionCap && emissionCap < 500) {
        // Add higher emissions for companies with lower caps
        emissionRecords.push(
          { emissionValue: "220.50", timestamp: new Date(Date.now() - 30 * 60 * 1000) }, // 30 min ago
          { emissionValue: "195.80", timestamp: new Date(Date.now() - 15 * 60 * 1000) }  // 15 min ago
        );
      }

      for (const record of emissionRecords) {
        await addDoc(emissionsRef, record);
      }

      const totalEmissions = emissionRecords.reduce((sum, record) => sum + parseFloat(record.emissionValue), 0);
      console.log(`   Added ${emissionRecords.length} records, Total: ${totalEmissions.toFixed(2)}`);
      console.log(`   ${totalEmissions > emissionCap ? '❌ EXCEEDS CAP' : '✅ Within cap'}\n`);
    }

    console.log('✅ Test emission data added successfully!');
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

addTestEmissionData();