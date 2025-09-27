// Simple compliance automation with Firebase logging
import { ethers } from "ethers";
import blockchainService from "../src/blockchain.js";
import { processEmissionCompliance } from "../src/firebase.js";

// Simple compliance data simulation
const testCompanies = [
  {
    id: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    name: "Green Tech Corp",
    emissionValue: 80, // Under cap
    emissionCap: 100,
  },
  {
    id: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    name: "Heavy Industry Inc",
    emissionValue: 120, // Over cap
    emissionCap: 100,
  },
];

async function runComplianceCheck() {
  try {
    console.log(
      `\n⏰ [${new Date().toLocaleTimeString()}] RUNNING COMPLIANCE CHECK`
    );

    // Initialize blockchain service
    if (!blockchainService.initialized) {
      await blockchainService.initialize();
    }

    for (const company of testCompanies) {
      console.log(`\n🏢 Processing: ${company.name} (${company.id})`);
      console.log(
        `📊 Emission: ${company.emissionValue}, Cap: ${company.emissionCap}`
      );

      // Use the Firebase function that includes logging to Firestore
      console.log("📝 Processing compliance with Firebase logging...");
      
      const result = await processEmissionCompliance(
        company.id, // companyId
        company.id, // walletAddress (using same for simplicity)
        {
          totalEmissions: company.emissionValue,
          emissionCap: company.emissionCap,
          creditsToMint: company.emissionValue < company.emissionCap ? 50 : 0,
          action: company.emissionValue < company.emissionCap ? "CREDITS_MINTED" : "CREDITS_DEDUCTED"
        }
      );

      if (result.success) {
        console.log(`✅ Compliance processing completed! Action: ${result.action || 'Processed'}`);
        console.log(`� Data logged to Firebase successfully`);
        
        // Check balance to show current state
        try {
          const balance = await blockchainService.checkCreditBalance(company.id);
          console.log(`💰 Current balance: ${balance.balance} CCT`);
        } catch (balanceError) {
          console.log(`⚠️ Could not fetch balance: ${balanceError.message}`);
        }
      } else {
        console.log(`❌ Compliance processing failed: ${result.error}`);
      }
    }

    console.log(
      `\n✅ Compliance check completed at ${new Date().toLocaleTimeString()}`
    );
    console.log(`📅 Next check in 5 minutes...`);
  } catch (error) {
    console.error("❌ Compliance check failed:", error.message);
  }
}

async function startSimpleScheduler() {
  console.log("🚀 Starting Simple Compliance Scheduler");
  console.log("📋 This will run compliance checks every 5 minutes");
  console.log("⛓️  Smart contract transactions will be created");
  console.log("🔄 Press Ctrl+C to stop\n");

  // Run first check immediately
  await runComplianceCheck();

  // Then run every 5 minutes
  const intervalId = setInterval(runComplianceCheck, 5 * 60 * 1000);

  // Handle cleanup
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping scheduler...");
    clearInterval(intervalId);
    process.exit(0);
  });
}

startSimpleScheduler();
