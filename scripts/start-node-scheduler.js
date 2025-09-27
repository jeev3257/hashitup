// Node.js Compatible Scheduler Starter
// Starts automated compliance system that runs every 5 minutes by clock

import NodeScheduler from "../src/node-scheduler.js";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// Firebase config
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

async function startNodeScheduler() {
  try {
    console.log("🚀 SMART CONTRACT SCHEDULER - NODE.JS");
    console.log("====================================");

    const scheduler = new NodeScheduler();

    // Find approved companies
    console.log("📋 Finding approved companies...");
    const companiesRef = collection(db, "companies");
    const approvedQuery = query(
      companiesRef,
      where("status", "==", "approved")
    );
    const querySnapshot = await getDocs(approvedQuery);

    let registeredCount = 0;
    querySnapshot.forEach((doc) => {
      const companyData = doc.data();
      scheduler.registerCompany(doc.id);
      registeredCount++;
      console.log(`✅ Registered: ${companyData.name || doc.id}`);
    });

    // If no approved companies, register a test company
    if (registeredCount === 0) {
      console.log(
        "⚠️  No approved companies found. Registering test company..."
      );
      scheduler.registerCompany("test-company-001");
      registeredCount = 1;
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Companies registered: ${registeredCount}`);
    console.log(`   Blockchain: http://127.0.0.1:8545`);
    console.log(`   Contract: 0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE`);

    // Start scheduler
    console.log("\n🕐 STARTING SCHEDULER...");
    await scheduler.start();

    console.log("\n✨ SCHEDULER IS NOW RUNNING!");
    console.log("💡 Compliance checks will run every 5 minutes by clock time");
    console.log("🔗 Smart contracts will execute automatically");
    console.log("💾 Data will be updated in blockchain and Firebase");
    console.log("📊 Check your dashboard to see real-time activity");
    console.log("\n⏰ Press Ctrl+C to stop the scheduler\n");

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping scheduler...");
      scheduler.stop();
      console.log("✅ Scheduler stopped successfully");
      process.exit(0);
    });

    // Keep process alive
    setInterval(() => {
      // Just to keep the process running
    }, 1000);
  } catch (error) {
    console.error("❌ Error starting scheduler:", error);
    process.exit(1);
  }
}

startNodeScheduler();
