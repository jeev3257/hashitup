// Simple Compliance Trigger - Direct blockchain test

import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

const CONTRACT_ABI = [
  "function mintForCompliance(address company, uint256 amount, uint256 emissionValue, uint256 emissionCap) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function isRegisteredCompany(address) external view returns (bool)",
];

async function directComplianceTest() {
  try {
    console.log("🔍 DIRECT SMART CONTRACT TEST");
    console.log("==============================");

    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const testWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    console.log("1️⃣ Checking current balance...");
    const currentBalance = await contract.balanceOf(testWallet);
    console.log(
      "   Current balance:",
      ethers.formatEther(currentBalance),
      "CCT"
    );

    console.log("2️⃣ Checking if company is registered...");
    const isRegistered = await contract.isRegisteredCompany(testWallet);
    console.log("   Company registered:", isRegistered);

    if (!isRegistered) {
      console.log("❌ Company not registered on blockchain");
      return;
    }

    console.log("3️⃣ Attempting direct compliance mint...");

    // Try to mint 25 credits for compliance (75 emissions vs 100 cap)
    const creditsToMint = 25;
    const emissionValue = 75;
    const emissionCap = 100;

    const mintTx = await contract.mintForCompliance(
      testWallet,
      ethers.parseEther(creditsToMint.toString()),
      ethers.parseEther(emissionValue.toString()),
      ethers.parseEther(emissionCap.toString())
    );

    console.log("⏳ Transaction submitted:", mintTx.hash);
    const receipt = await mintTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    console.log("4️⃣ Checking new balance...");
    const newBalance = await contract.balanceOf(testWallet);
    console.log("   New balance:", ethers.formatEther(newBalance), "CCT");
    console.log(
      "   Credits added:",
      ethers.formatEther(
        newBalance.sub
          ? newBalance.sub(currentBalance)
          : newBalance - currentBalance
      )
    );

    console.log("\n🎉 DIRECT SMART CONTRACT TEST SUCCESSFUL!");
    console.log(
      "The smart contract IS working - problem is in the automation system"
    );
  } catch (error) {
    console.error("❌ Direct smart contract test failed:", error.message);

    if (error.message.includes("Company not registered")) {
      console.log("💡 Need to register company first");
    } else if (error.message.includes("Emission not under cap")) {
      console.log("💡 Emission value must be less than cap for minting");
    } else if (error.message.includes("onlyOwner")) {
      console.log("💡 Only contract owner can call this function");
    }
  }
}

directComplianceTest().then(() => process.exit(0));
