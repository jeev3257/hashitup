// Manual Compliance Test - Trigger compliance processing manually

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

async function manualComplianceTest() {
  try {
    console.log("🧪 MANUAL COMPLIANCE TEST");
    console.log("=========================");

    const companyId = "AZqujNiZgPRkcK9T1emKBIJyb4t1";

    // Import functions from firebase
    const {
      processEmissionCompliance,
      checkEmissionCompliance,
      addSampleEmissionData,
    } = await import("../src/firebase.js");

    console.log("1️⃣ Adding sample emission data to trigger compliance...");

    // Add some emission data to trigger compliance check
    const sampleResult = await addSampleEmissionData(companyId, 5);
    if (sampleResult.success) {
      console.log("✅ Sample emission data added");
    } else {
      console.log("❌ Failed to add sample data:", sampleResult.error);
    }

    console.log("\n2️⃣ Checking emission compliance status...");

    // Check current compliance
    const complianceCheck = await checkEmissionCompliance(companyId, 5);
    if (complianceCheck.success) {
      const c = complianceCheck.compliance;
      console.log("📊 Compliance Status:");
      console.log("  - Total Emissions:", c.totalEmissions);
      console.log("  - Emission Cap:", c.emissionCap);
      console.log("  - Is Compliant:", c.isCompliant);
      console.log(
        "  - Credits to Mint/Deduct:",
        c.isCompliant ? c.creditsToMint : c.creditsToDeduct
      );
    } else {
      console.log("❌ Compliance check failed:", complianceCheck.error);
      return;
    }

    console.log("\n3️⃣ Processing emission compliance (manual trigger)...");

    // Manually trigger compliance processing
    const processResult = await processEmissionCompliance(companyId);
    if (processResult.success) {
      console.log("✅ Compliance processing successful!");
      console.log("📋 Action:", processResult.action);
      console.log("💰 Amount:", processResult.amount);

      if (processResult.timer) {
        console.log(
          "⏰ Timer started, expires at:",
          processResult.timer.expiresAt
        );
      }
    } else {
      console.log("❌ Compliance processing failed:", processResult.error);
    }

    console.log("\n4️⃣ Checking for new blockchain transactions...");

    // Wait a moment for blockchain transaction to complete
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check latest activity again
    const { getSmartContractHistory } = await import("../src/firebase.js");
    const historyResult = await getSmartContractHistory(companyId, 5);

    if (historyResult.success && historyResult.transactions.length > 0) {
      console.log("📋 Latest transactions:");
      historyResult.transactions.forEach((tx, i) => {
        console.log(
          `  ${i + 1}. ${tx.type}: ${tx.amount} CCT at ${tx.timestamp}`
        );
      });
    } else {
      console.log("❌ No transactions found or failed to fetch");
    }

    console.log("\n🎉 Manual compliance test completed!");
    console.log("Check your dashboard to see if new activity appears.");
  } catch (error) {
    console.error("❌ Manual compliance test failed:", error);
  }
}

manualComplianceTest().then(() => process.exit(0));
