import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1HciA35uKQCEQRpwhI54QgwpOeffCfZQ",
  authDomain: "hashitup-5bb9b.firebaseapp.com",
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.firebasestorage.app",
  messagingSenderId: "620690168173",
  appId: "1:620690168173:web:8b3306843fdb65f99ae264",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const companyId = "AZqujNiZgPRkcK9T1emKBIJyb4t1";

async function getLatestRecord(collectionName, label) {
  const ref = collection(db, collectionName);
  const q = query(ref, where("companyId", "==", companyId));
  const snapshot = await getDocs(q);
  console.log(`\n${label} count:`, snapshot.size);
  let latest = null;
  snapshot.forEach((doc) => {
    const data = doc.data();
    const timestamp =
      data.metadata?.timestamp?.toDate?.() || data.timestamp?.toDate?.();
    if (
      !latest ||
      (timestamp && timestamp > (latest.timestamp || new Date(0)))
    ) {
      latest = {
        type: data.complianceData?.type || data.type,
        amount: data.complianceData?.amount || data.amount,
        timestamp,
        raw: data,
      };
    }
  });
  if (latest) {
    console.log(
      `Latest ${label}:`,
      latest.type,
      latest.amount,
      "CCT at",
      latest.timestamp
    );
  } else {
    console.log(`No ${label.toLowerCase()} found`);
  }
}

async function main() {
  try {
    await getLatestRecord("immutable_blockchain_records", "Immutable records");
    await getLatestRecord("blockchain_transactions", "Regular transactions");
    await getLatestRecord("compliance_actions", "Compliance actions");
  } catch (error) {
    console.error("Error checking activity:", error);
  }
}

main().then(() => process.exit(0));
