import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🎬 LIVE BALANCE CHANGE DEMONSTRATION");
  console.log("=====================================");
  console.log("👀 Keep your dashboard open and watch the balance change!\n");

  const contractAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
  const testWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const signers = await ethers.getSigners();
  const owner = signers[0];

  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  const contract = CarbonCredit.attach(contractAddress);

  try {
    // Show current balance
    let balance = await contract.balanceOf(testWallet);
    console.log(
      `💰 Current dashboard balance should show: ${ethers.formatEther(
        balance
      )} CCT`
    );
    console.log("📱 Go to your dashboard now and note the current balance\n");

    // Wait for user to check
    console.log("⏳ Starting in 10 seconds... (check your dashboard now!)");
    for (let i = 10; i > 0; i--) {
      process.stdout.write(`\r⏰ ${i} seconds... `);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("\n");

    // Operation 1: Add tokens
    console.log("🚀 OPERATION 1: Adding 50 tokens...");
    const mintTx1 = await contract.mint(testWallet, ethers.parseEther("50"));
    await mintTx1.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(`✅ New balance: ${ethers.formatEther(balance)} CCT`);
    console.log(
      `📱 Dashboard should now show: ${ethers.formatEther(
        balance
      )} CCT (refresh or wait 30 seconds)`
    );
    console.log(`🔗 Transaction: ${mintTx1.hash}\n`);

    // Wait and do another operation
    console.log("⏳ Waiting 15 seconds before next operation...");
    for (let i = 15; i > 0; i--) {
      process.stdout.write(`\r⏰ ${i} seconds... `);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("\n");

    // Operation 2: Compliance mint
    console.log("🚀 OPERATION 2: Compliance reward (+40 tokens)...");
    const mintTx2 = await contract.mintForCompliance(
      testWallet,
      ethers.parseEther("40")
    );
    await mintTx2.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(`✅ New balance: ${ethers.formatEther(balance)} CCT`);
    console.log(
      `📱 Dashboard should now show: ${ethers.formatEther(balance)} CCT`
    );
    console.log(`🔗 Transaction: ${mintTx2.hash}\n`);

    // Wait and do final operation
    console.log("⏳ Waiting 15 seconds before final operation...");
    for (let i = 15; i > 0; i--) {
      process.stdout.write(`\r⏰ ${i} seconds... `);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("\n");

    // Operation 3: Deduction
    console.log("🚀 OPERATION 3: Overage penalty (-15 tokens)...");
    const deductTx = await contract.deductForOverage(
      testWallet,
      ethers.parseEther("15")
    );
    await deductTx.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(`✅ Final balance: ${ethers.formatEther(balance)} CCT`);
    console.log(
      `📱 Dashboard should now show: ${ethers.formatEther(balance)} CCT`
    );
    console.log(`🔗 Transaction: ${deductTx.hash}\n`);

    console.log("🎉 DEMONSTRATION COMPLETE!");
    console.log("==========================");
    console.log("✅ You should have seen 3 balance changes on your dashboard");
    console.log(
      "✅ Each transaction created a new entry in 'Smart Contract Activity'"
    );
    console.log(
      "✅ The balance updates either immediately (with refresh) or within 30 seconds"
    );
    console.log(
      "✅ This proves the smart contract is working and connected to your dashboard!"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);
