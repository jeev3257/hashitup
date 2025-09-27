import pkg from "hardhat";
const { ethers } = pkg;

// We need to simulate the Firebase functions since we can't import them directly in Node.js
// This script will perform blockchain transactions and show you how to see them in the dashboard

async function main() {
  console.log("🎬 CREATING REAL BLOCKCHAIN TRANSACTIONS");
  console.log("=========================================");
  console.log(
    "📱 Keep your dashboard open to see these transactions appear!\n"
  );

  const contractAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
  const testWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const signers = await ethers.getSigners();
  const owner = signers[0];

  console.log(`🎯 Target wallet: ${testWallet}`);
  console.log(`📍 Contract: ${contractAddress}\n`);

  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  const contract = CarbonCredit.attach(contractAddress);

  try {
    // Get current balance
    let balance = await contract.balanceOf(testWallet);
    console.log(`💰 Current balance: ${ethers.formatEther(balance)} CCT\n`);

    console.log("🚀 CREATING TRANSACTIONS (watch your dashboard!):");
    console.log("--------------------------------------------------");

    // Transaction 1: Regular mint
    console.log("1️⃣ Creating mint transaction...");
    const mintTx = await contract.mint(testWallet, ethers.parseEther("60"));
    const mintReceipt = await mintTx.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(
      `   ✅ Mint: +60 CCT | New balance: ${ethers.formatEther(balance)} CCT`
    );
    console.log(`   🔗 Transaction hash: ${mintTx.hash}`);
    console.log(`   ⏰ Block: ${mintReceipt.blockNumber}\n`);

    // Wait 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Transaction 2: Compliance mint
    console.log("2️⃣ Creating compliance mint transaction...");
    const complianceTx = await contract.mintForCompliance(
      testWallet,
      ethers.parseEther("35")
    );
    const complianceReceipt = await complianceTx.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(
      `   ✅ Compliance mint: +35 CCT | New balance: ${ethers.formatEther(
        balance
      )} CCT`
    );
    console.log(`   🔗 Transaction hash: ${complianceTx.hash}`);
    console.log(`   ⏰ Block: ${complianceReceipt.blockNumber}\n`);

    // Wait 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Transaction 3: Deduction
    console.log("3️⃣ Creating deduction transaction...");
    const deductTx = await contract.deductForOverage(
      testWallet,
      ethers.parseEther("20")
    );
    const deductReceipt = await deductTx.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(
      `   ✅ Deduction: -20 CCT | New balance: ${ethers.formatEther(
        balance
      )} CCT`
    );
    console.log(`   🔗 Transaction hash: ${deductTx.hash}`);
    console.log(`   ⏰ Block: ${deductReceipt.blockNumber}\n`);

    // Show final summary
    console.log("📊 TRANSACTION SUMMARY:");
    console.log("=======================");
    console.log(`✅ 3 blockchain transactions created`);
    console.log(`✅ Final balance: ${ethers.formatEther(balance)} CCT`);
    console.log(`✅ All transactions are on the blockchain with real hashes`);

    console.log("\n🔍 HOW TO SEE THESE TRANSACTIONS:");
    console.log("==================================");
    console.log("1. 📱 Go to your dashboard (http://localhost:5184)");
    console.log("2. 🔄 Click the 'Refresh' button next to your balance");
    console.log("3. 👀 Check the 'Smart Contract Activity' section");
    console.log("4. ⏰ Wait up to 30 seconds for auto-refresh");
    console.log("5. 📈 Your balance should now show the updated amount");

    console.log("\n✨ These are REAL blockchain transactions!");
    console.log("✨ The hashes above are verifiable on the blockchain!");
    console.log("✨ Your dashboard is connected to the live blockchain!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);
