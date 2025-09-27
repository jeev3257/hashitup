// Start Smart Contract Scheduler
// This script starts the automated compliance system

import scheduler from "../src/scheduler.js";
import { getDocs, collection, where, query } from "firebase/firestore";
import { db } from "../src/firebase.js";

async function startScheduler() {
  try {
    console.log("🚀 INITIALIZING SMART CONTRACT SCHEDULER");
    console.log("=========================================");

    // Get all approved companies from Firebase
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
      const companyId = doc.id;

      // Register company for automated compliance
      scheduler.registerCompany(companyId);
      registeredCount++;

      console.log(`✅ Registered: ${companyData.name || companyId}`);
    });

    console.log(`\n📊 REGISTRATION SUMMARY:`);
    console.log(`   Companies found: ${querySnapshot.size}`);
    console.log(`   Companies registered: ${registeredCount}`);

    if (registeredCount === 0) {
      console.log(
        "⚠️  No approved companies found. The scheduler will start but won't run checks until companies are registered."
      );
    }

    // Start the scheduler
    console.log("\n🕐 STARTING SCHEDULER...");
    scheduler.start();

    // Show status
    const status = scheduler.getStatus();
    console.log("\n📊 SCHEDULER STATUS:");
    console.log(`   Running: ${status.isRunning}`);
    console.log(`   Companies: ${status.companiesCount}`);
    console.log(
      `   Next run: ${status.nextRun ? status.nextRun.toLocaleString() : "N/A"}`
    );

    console.log("\n✨ Scheduler is now running!");
    console.log(
      "💡 Compliance checks will run automatically every 5 minutes by clock time"
    );
    console.log(
      "🔗 Smart contracts will be executed and data will be updated in both blockchain and Firebase"
    );

    // Keep the process running
    console.log("\n⏰ Press Ctrl+C to stop the scheduler");

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping scheduler...");
      scheduler.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error starting scheduler:", error);
    process.exit(1);
  }
}

// Start the scheduler
startScheduler();
