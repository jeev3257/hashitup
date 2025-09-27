import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const RPC_URL = "http://127.0.0.1:8545";

const CONTRACT_ABI = [
  "function owner() external view returns (address)",
  "function balanceOf(address account) external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
];

async function checkOwner() {
  try {
    console.log("🔍 Checking contract owner and account details...");

    // Connect to provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Get all signers
    const signers = await provider.listAccounts();
    console.log("\n📋 Available accounts:");
    for (let i = 0; i < Math.min(signers.length, 5); i++) {
      const signer = await provider.getSigner(i);
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      console.log(
        `  Account ${i}: ${address} | ${ethers.formatEther(balance)} ETH`
      );
    }

    // Connect to contract
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    // Get contract info
    const owner = await contract.owner();
    const name = await contract.name();
    const symbol = await contract.symbol();

    console.log("\n📄 Contract Details:");
    console.log(`  Address: ${CONTRACT_ADDRESS}`);
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Owner: ${owner}`);

    // Check which account is the owner
    for (let i = 0; i < Math.min(signers.length, 5); i++) {
      const signer = await provider.getSigner(i);
      const address = await signer.getAddress();
      if (address.toLowerCase() === owner.toLowerCase()) {
        console.log(`\n✅ Owner is Account ${i}: ${address}`);
        break;
      }
    }

    // Test balance check with Account 0
    const account0Signer = await provider.getSigner(0);
    const account0Address = await account0Signer.getAddress();
    const balance = await contract.balanceOf(account0Address);
    console.log(
      `\n💰 Account 0 token balance: ${ethers.formatEther(balance)} CCT`
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkOwner();
