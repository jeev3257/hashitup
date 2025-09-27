import { BlockchainService } from "../src/blockchain.js";

// Test the blockchain integration
async function testBlockchainIntegration() {
  console.log("🧪 Testing Blockchain Integration...");

  try {
    // Initialize blockchain service
    const blockchainService = new BlockchainService();

    console.log("✅ Blockchain service initialized");

    // Test wallet creation
    const testCompanyId = "test-company-123";
    console.log(`🏢 Creating wallet for company: ${testCompanyId}`);

    const walletInfo = await blockchainService.createCompanyWallet(
      testCompanyId
    );
    console.log("💰 Wallet created:", walletInfo);

    // Test registration and minting
    console.log("📝 Registering company and minting tokens...");
    const mintResult = await blockchainService.registerAndMintTokens(
      walletInfo.address,
      "1000" // 1000 tokens
    );

    console.log("🪙 Tokens minted:", mintResult);

    // Test balance check
    const balance = await blockchainService.getTokenBalance(walletInfo.address);
    console.log(`💳 Company token balance: ${balance} CC`);

    console.log("🎉 All tests passed! Blockchain integration is working.");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBlockchainIntegration();
}

export { testBlockchainIntegration };
