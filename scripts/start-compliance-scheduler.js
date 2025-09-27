import scheduler from "../src/scheduler.js";

async function startComplianceScheduler() {
  try {
    console.log("🚀 Starting compliance scheduler...");

    // Register test companies (the ones we've been working with)
    const testCompanies = [
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account 1 - under cap company
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account 2 - over cap company
    ];

    console.log("📋 Registering test companies...");
    testCompanies.forEach((companyId) => {
      scheduler.registerCompany(companyId);
    });

    // Check scheduler status
    const status = scheduler.getStatus();
    console.log("\n📊 Scheduler Status:");
    console.log(`  Running: ${status.isRunning}`);
    console.log(`  Companies: ${status.companiesCount}`);
    console.log(`  Next run: ${status.nextRun}`);

    // Start the scheduler
    console.log("\n🎯 Starting automated compliance processing...");
    scheduler.start();

    console.log("\n✅ Compliance scheduler is now running!");
    console.log(
      "📝 The scheduler will automatically process compliance every 5 minutes"
    );
    console.log(
      "💾 Results will be saved to Firebase and displayed in the dashboard"
    );
    console.log("\n🔄 Press Ctrl+C to stop the scheduler");

    // Keep the process alive
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping scheduler...");
      scheduler.stop();
      process.exit(0);
    });

    // Log status every minute to show it's working
    setInterval(() => {
      const currentStatus = scheduler.getStatus();
      const now = new Date().toLocaleTimeString();
      console.log(
        `\n⏰ [${now}] Scheduler running - Next compliance check: ${currentStatus.nextRun?.toLocaleTimeString()}`
      );
    }, 60000);
  } catch (error) {
    console.error("❌ Failed to start scheduler:", error.message);
    process.exit(1);
  }
}

startComplianceScheduler();
