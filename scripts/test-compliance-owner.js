import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const RPC_URL = "http://127.0.0.1:8545";

const CONTRACT_ABI = [
  "function mintForCompliance(address company, uint256 amount, uint256 emissionValue, uint256 emissionCap) external",
  "function deductForOverage(address company, uint256 amount, uint256 emissionValue, uint256 emissionCap) external returns (bool success, bool hasEnoughBalance)",
  "function balanceOf(address account) external view returns (uint256)",
  "function owner() external view returns (address)",
];

async function testCompliance() {
  try {
    console.log("🧪 Testing compliance functions with owner account...");

    // Connect to provider and get owner signer
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const ownerSigner = await provider.getSigner(0); // Account 0 is the owner
    const ownerAddress = await ownerSigner.getAddress();

    console.log(`👤 Using owner account: ${ownerAddress}`);

    // Connect to contract with owner signer
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      ownerSigner
    );

    // Verify we are the owner
    const contractOwner = await contract.owner();
    console.log(`📋 Contract owner: ${contractOwner}`);
    console.log(
      `✅ Are we the owner? ${
        ownerAddress.toLowerCase() === contractOwner.toLowerCase()
      }`
    );

    // Test company address (use Account 1)
    const companyAccount = await provider.getSigner(1);
    const companyAddress = await companyAccount.getAddress();
    console.log(`🏢 Test company address: ${companyAddress}`);

    // Check initial balance
    const initialBalance = await contract.balanceOf(companyAddress);
    console.log(
      `💰 Company initial balance: ${ethers.formatEther(initialBalance)} CCT`
    );

    // Test mintForCompliance
    console.log("\n🧪 Testing mintForCompliance...");
    const mintAmount = ethers.parseEther("100"); // 100 CCT
    const emissionValue = ethers.parseEther("80"); // 80 emission units
    const emissionCap = ethers.parseEther("100"); // 100 emission cap

    try {
      const mintTx = await contract.mintForCompliance(
        companyAddress,
        mintAmount,
        emissionValue,
        emissionCap
      );

      const receipt = await mintTx.wait();
      console.log(`✅ Mint successful! Tx: ${receipt.hash}`);

      // Check new balance
      const newBalance = await contract.balanceOf(companyAddress);
      console.log(
        `💰 Company new balance: ${ethers.formatEther(newBalance)} CCT`
      );
    } catch (mintError) {
      console.error("❌ Mint failed:", mintError.message);
      if (mintError.reason) {
        console.error("   Reason:", mintError.reason);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

testCompliance();
