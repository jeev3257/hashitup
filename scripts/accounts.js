import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const signers = await ethers.getSigners();
  console.log("Available Hardhat accounts:");
  for (let i = 0; i < Math.min(10, signers.length); i++) {
    const balance = await ethers.provider.getBalance(signers[i].address);
    console.log(
      `${i}: ${signers[i].address} (${ethers.formatEther(balance)} ETH)`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
