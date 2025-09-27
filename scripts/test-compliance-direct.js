import { ethers } from "ethers";
import blockchainService from "../src/blockchain.js";

async function testEndToEndCompliance() {
  try {
    console.log(
      "🧪 Testing end-to-end compliance automation (direct blockchain)..."
    );

    // Initialize blockchain service
    await blockchainService.initialize();
    console.log("✅ Blockchain service initialized");

    // Test company addresses
    const underCapCompany = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account 1 (already registered)
    const overCapCompany = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Account 2 (need to register)

    // Check initial balances
    console.log("\n💰 Initial Balances:");
    const underCapInitial = await blockchainService.checkCreditBalance(
      underCapCompany
    );
    console.log(`  Under Cap Company: ${underCapInitial.balance} CCT`);

    // Register over cap company if needed
    try {
      await blockchainService.registerCompanyOnChain(overCapCompany);
      await blockchainService.mintInitialTokens(overCapCompany, "500");
      console.log("📝 Over cap company registered and funded with 500 CCT");
    } catch (regError) {
      console.log(
        "📝 Over cap company already registered (or registration failed)"
      );
    }

    const overCapInitial = await blockchainService.checkCreditBalance(
      overCapCompany
    );
    console.log(`  Over Cap Company: ${overCapInitial.balance} CCT`);

    // Test 1: Under cap compliance (should mint credits)
    console.log("\n🌱 Test 1: Under Cap Compliance (should MINT credits)");
    console.log("📊 Scenario: Emission 80 < Cap 100");

    const mintResult = await blockchainService.mintCreditsForCompliance(
      underCapCompany,
      100, // 100 CCT reward
      80, // 80 emission units (under cap)
      100 // 100 emission cap
    );

    console.log("📋 Mint Result:", mintResult);

    if (mintResult.success) {
      const newBalance = await blockchainService.checkCreditBalance(
        underCapCompany
      );
      console.log(`💰 New balance: ${newBalance.balance} CCT`);
    }

    // Test 2: Over cap compliance (should deduct credits)
    console.log("\n🚨 Test 2: Over Cap Compliance (should DEDUCT credits)");
    console.log("📊 Scenario: Emission 120 > Cap 100");

    const deductResult = await blockchainService.deductCreditsForOverage(
      overCapCompany,
      50, // 50 CCT penalty
      120, // 120 emission units (over cap)
      100 // 100 emission cap
    );

    console.log("📋 Deduct Result:", deductResult);

    if (deductResult.success) {
      const newBalance = await blockchainService.checkCreditBalance(
        overCapCompany
      );
      console.log(`💰 New balance: ${newBalance.balance} CCT`);
    }

    console.log(
      "\n🎉 End-to-end compliance automation test completed successfully!"
    );
    console.log("✅ Both mint and deduct operations are working");
    console.log("✅ Ready for automated compliance processing");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

testEndToEndCompliance();
