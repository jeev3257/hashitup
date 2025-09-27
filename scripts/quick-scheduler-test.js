// Quick Test: Start Scheduler for Current Company
// This runs the scheduler immediately for testing

import scheduler from "../src/scheduler.js";

async function quickTest() {
  console.log("🧪 QUICK SCHEDULER TEST");
  console.log("=======================");

  // Test company ID (you can change this to your actual company ID)
  const testCompanyId = "test-company-123";

  console.log(`📋 Registering company: ${testCompanyId}`);
  scheduler.registerCompany(testCompanyId);

  console.log("🚀 Starting scheduler...");
  scheduler.start();

  // Show status
  const status = scheduler.getStatus();
  console.log("\n📊 SCHEDULER STATUS:");
  console.log(`   Running: ${status.isRunning}`);
  console.log(`   Companies: ${status.companiesCount}`);
  console.log(
    `   Next run: ${status.nextRun ? status.nextRun.toLocaleString() : "N/A"}`
  );

  console.log(
    "\n⏰ Scheduler will run compliance checks every 5 minutes by clock time"
  );
  console.log("🔗 Smart contracts will be executed automatically");
  console.log("💾 Results will be saved to both blockchain and Firebase");
  console.log("\n⚡ Press Ctrl+C to stop");

  // Keep running
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping scheduler...");
    scheduler.stop();
    process.exit(0);
  });
}

quickTest();
