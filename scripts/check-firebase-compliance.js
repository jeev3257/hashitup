import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1HciA35uKQCEQRpwhI54QgwpOeffCfZQ",
  authDomain: "hashitup-5bb9b.firebaseapp.com",
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.firebasestorage.app",
  messagingSenderId: "620690168173",
  appId: "1:620690168173:web:8b3306843fdb65f99ae264",
  measurementId: "G-97PR8NFRRQ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirebaseCompliance() {
  try {
    console.log("🔍 Checking Firebase compliance data...");

    // Check compliance_actions collection
    console.log("\n📋 Compliance Actions:");
    const complianceQuery = query(
      collection(db, "compliance_actions"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const complianceSnapshot = await getDocs(complianceQuery);
    console.log(`  Found ${complianceSnapshot.size} compliance actions`);

    complianceSnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate?.() || data.timestamp;
      console.log(
        `    ${doc.id}: ${data.action} for ${data.companyName} at ${timestamp}`
      );
    });

    // Check blockchain_transactions collection
    console.log("\n⛓️  Blockchain Transactions:");
    const txQuery = query(
      collection(db, "blockchain_transactions"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const txSnapshot = await getDocs(txQuery);
    console.log(`  Found ${txSnapshot.size} blockchain transactions`);

    txSnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate?.() || data.timestamp;
      console.log(
        `    ${doc.id}: ${data.type} - ${
          data.amount || "N/A"
        } CCT at ${timestamp}`
      );
    });

    // Check immutable_blockchain_records collection
    console.log("\n🔒 Immutable Blockchain Records:");
    const recordsQuery = query(
      collection(db, "immutable_blockchain_records"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const recordsSnapshot = await getDocs(recordsQuery);
    console.log(`  Found ${recordsSnapshot.size} immutable records`);

    recordsSnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate?.() || data.timestamp;
      console.log(`    ${doc.id}: ${data.eventType} at ${timestamp}`);
    });

    console.log("\n🕐 Current time:", new Date().toISOString());
  } catch (error) {
    console.error("❌ Failed to check Firebase data:", error.message);
  }
}

checkFirebaseCompliance();
