import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🚀 REAL-TIME BALANCE DEMONSTRATION");
  console.log("===================================\n");

  const contractAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
  const testWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Same as dashboard test wallet

  const signers = await ethers.getSigners();
  const owner = signers[0];

  console.log(`🎯 Testing with wallet: ${testWallet}`);
  console.log(`📍 Contract: ${contractAddress}\n`);

  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  const contract = CarbonCredit.attach(contractAddress);

  try {
    // Check current balance
    let balance = await contract.balanceOf(testWallet);
    console.log(`💰 Current balance: ${ethers.formatEther(balance)} CCT`);

    // Perform a series of operations to demonstrate balance changes
    console.log(
      "\n🔄 Performing balance changes (refresh dashboard to see updates):"
    );
    console.log(
      "----------------------------------------------------------------"
    );

    // Operation 1: Mint some tokens
    console.log("1️⃣ Minting 75 tokens...");
    const mintTx = await contract.mint(testWallet, ethers.parseEther("75"));
    await mintTx.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(
      `   ✅ New balance: ${ethers.formatEther(balance)} CCT (Tx: ${
        mintTx.hash
      })`
    );

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Operation 2: Compliance mint
    console.log(
      "\n2️⃣ Compliance minting 30 tokens (under emission cap reward)..."
    );
    const complianceTx = await contract.mintForCompliance(
      testWallet,
      ethers.parseEther("30")
    );
    await complianceTx.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(
      `   ✅ New balance: ${ethers.formatEther(balance)} CCT (Tx: ${
        complianceTx.hash
      })`
    );

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Operation 3: Deduct for overage
    console.log("\n3️⃣ Deducting 20 tokens (over emission cap penalty)...");
    const deductTx = await contract.deductForOverage(
      testWallet,
      ethers.parseEther("20")
    );
    await deductTx.wait();

    balance = await contract.balanceOf(testWallet);
    console.log(
      `   ✅ New balance: ${ethers.formatEther(balance)} CCT (Tx: ${
        deductTx.hash
      })`
    );

    // Final summary
    console.log("\n📊 FINAL SUMMARY:");
    console.log("==================");

    const finalBalance = await contract.balanceOf(testWallet);
    const totalSupply = await contract.totalSupply();
    const companyInfo = await contract.getCompanyInfo(testWallet);

    console.log(
      `✅ Final wallet balance: ${ethers.formatEther(finalBalance)} CCT`
    );
    console.log(`✅ Total supply: ${ethers.formatEther(totalSupply)} CCT`);
    console.log(
      `✅ Company total minted: ${ethers.formatEther(companyInfo[1])} CCT`
    );
    console.log(`✅ Remaining cap: ${ethers.formatEther(companyInfo[2])} CCT`);

    console.log("\n🎉 BALANCE CHANGES COMPLETED!");
    console.log("==============================");
    console.log(
      `💡 Go to the dashboard and click "Refresh" to see the updated balance: ${ethers.formatEther(
        finalBalance
      )} CCT`
    );
    console.log("🔄 The dashboard will also auto-refresh every 30 seconds");
    console.log(
      "📈 Check the Smart Contract Activity section for transaction history"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);
