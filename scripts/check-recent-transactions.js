import { ethers } from "ethers";
import blockchainService from "../src/blockchain.js";

async function checkRecentTransactions() {
  try {
    console.log("🔍 Checking recent blockchain transactions...");

    await blockchainService.initialize();

    // Get recent transactions from the blockchain
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Get latest block number
    const latestBlock = await provider.getBlockNumber();
    console.log(`📦 Latest block: ${latestBlock}`);

    // Check last 10 blocks for transactions
    console.log("\n📋 Recent blocks and transactions:");
    for (let i = Math.max(0, latestBlock - 9); i <= latestBlock; i++) {
      const block = await provider.getBlock(i, true);
      if (block && block.transactions.length > 0) {
        console.log(
          `\n🧱 Block ${i} (${new Date(
            block.timestamp * 1000
          ).toLocaleTimeString()}):`
        );

        for (const tx of block.transactions) {
          if (
            tx.to &&
            tx.to.toLowerCase() ===
              "0x809d550fca64d94Bd9F66E60752A544199cfAC3D".toLowerCase()
          ) {
            console.log(`  📝 Transaction: ${tx.hash}`);
            console.log(`    From: ${tx.from}`);
            console.log(`    To: ${tx.to}`);
            console.log(`    Gas Used: ${tx.gasLimit}`);

            // Try to get receipt for more details
            try {
              const receipt = await provider.getTransactionReceipt(tx.hash);
              if (receipt && receipt.logs.length > 0) {
                console.log(
                  `    📄 Events: ${receipt.logs.length} events logged`
                );
              }
            } catch (receiptError) {
              console.log(`    ⚠️  Receipt not available`);
            }
          }
        }
      }
    }

    // Check balances after recent transactions
    console.log("\n💰 Current balances:");
    const underCapBalance = await blockchainService.checkCreditBalance(
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );
    const overCapBalance = await blockchainService.checkCreditBalance(
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    );

    console.log(
      `  Green Tech Corp (Under Cap): ${underCapBalance.balance} CCT`
    );
    console.log(
      `  Heavy Industry Inc (Over Cap): ${overCapBalance.balance} CCT`
    );
  } catch (error) {
    console.error("❌ Error checking transactions:", error.message);
  }
}

checkRecentTransactions();
