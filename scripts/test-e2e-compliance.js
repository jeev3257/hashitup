import { processEmissionCompliance } from "../src/firebase.js";

async function testComplianceEnd2End() {
  try {
    console.log("🧪 Testing end-to-end compliance automation...");

    // Test data - company under emission cap (should get minted credits)
    const underCapComplianceData = {
      companyId: "test-company-under-cap",
      companyName: "Green Tech Corp",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account 1
      emissionValue: 80, // Under cap
      emissionCap: 100,
    };

    console.log("\n🌱 Testing UNDER CAP compliance (should mint credits)...");
    console.log(`📊 Company: ${underCapComplianceData.companyName}`);
    console.log(
      `📈 Emission: ${underCapComplianceData.emissionValue}, Cap: ${underCapComplianceData.emissionCap}`
    );

    const underCapResult = await processEmissionCompliance(
      underCapComplianceData
    );
    console.log("📋 Result:", underCapResult);

    // Test data - company over emission cap (should get credits deducted)
    const overCapComplianceData = {
      companyId: "test-company-over-cap",
      companyName: "Heavy Industry Inc",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account 2 (need to register first)
      emissionValue: 120, // Over cap
      emissionCap: 100,
    };

    console.log("\n🚨 Testing OVER CAP compliance (should deduct credits)...");
    console.log(`📊 Company: ${overCapComplianceData.companyName}`);
    console.log(
      `📈 Emission: ${overCapComplianceData.emissionValue}, Cap: ${overCapComplianceData.emissionCap}`
    );

    // First register and give some initial credits to the over cap company
    console.log("📝 Setting up over cap company...");

    // Import blockchain service to register company
    import("../src/blockchain.js").then(
      async ({ default: blockchainService }) => {
        await blockchainService.initialize();

        // Register the company
        await blockchainService.registerCompanyOnChain(
          "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
        );

        // Mint some initial tokens so we can deduct later
        await blockchainService.mintInitialTokens(
          "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          "500"
        );

        console.log("✅ Over cap company setup complete");

        // Now test the over cap compliance
        const overCapResult = await processEmissionCompliance(
          overCapComplianceData
        );
        console.log("📋 Result:", overCapResult);

        console.log("\n🎉 End-to-end compliance automation test complete!");
      }
    );
  } catch (error) {
    console.error("❌ End-to-end test failed:", error.message);
    console.error("Full error:", error);
  }
}

testComplianceEnd2End();
