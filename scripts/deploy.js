import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting CarbonCredit deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Set carbon credit cap per company (10,000 tokens)
  const capPerCompany = ethers.parseUnits("10000", 18); // 10,000 CC tokens with 18 decimals

  console.log(
    "📊 Cap per company:",
    ethers.formatUnits(capPerCompany, 18),
    "CC tokens"
  );

  // Deploy CarbonCredit contract
  console.log("📝 Deploying CarbonCredit contract...");
  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  const carbonCredit = await CarbonCredit.deploy(capPerCompany);

  await carbonCredit.waitForDeployment();
  const contractAddress = await carbonCredit.getAddress();

  console.log("✅ CarbonCredit deployed to:", contractAddress);
  console.log("👤 Contract owner:", await carbonCredit.owner());
  console.log("🏷️  Token name:", await carbonCredit.name());
  console.log("🔤 Token symbol:", await carbonCredit.symbol());
  console.log(
    "📊 Cap per company:",
    ethers.formatUnits(await carbonCredit.capPerCompany(), 18)
  );

  // Save deployment information for Firebase Functions
  const deploymentInfo = {
    network: "localhost",
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    capPerCompany: capPerCompany.toString(),
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  // Save to functions directory for Cloud Functions to use
  const functionsDir = path.join(__dirname, "../functions");
  const deploymentPath = path.join(functionsDir, "contract-deployment.json");

  // Create functions directory if it doesn't exist
  if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);

  // Save contract ABI for frontend
  const artifacts = await hre.artifacts.readArtifact("CarbonCredit");
  const abiPath = path.join(__dirname, "../src/CarbonCredit-ABI.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifacts.abi, null, 2));
  console.log("📄 Contract ABI saved to:", abiPath);

  // Test basic functionality
  console.log("\n🧪 Testing basic contract functionality...");

  // Test 1: Check initial state
  const totalSupply = await carbonCredit.totalSupply();
  console.log("📈 Initial total supply:", ethers.formatUnits(totalSupply, 18));

  // Test 2: Register a test company
  const testCompanyAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat account #1
  console.log("🏢 Registering test company:", testCompanyAddress);

  const registerTx = await carbonCredit.registerCompany(testCompanyAddress);
  await registerTx.wait();

  const isRegistered = await carbonCredit.isRegisteredCompany(
    testCompanyAddress
  );
  console.log("✅ Test company registered:", isRegistered);

  // Test 3: Mint some tokens to test company
  const mintAmount = ethers.parseUnits("1000", 18); // 1000 CC tokens
  console.log(
    "🪙 Minting",
    ethers.formatUnits(mintAmount, 18),
    "tokens to test company..."
  );

  const mintTx = await carbonCredit.mint(testCompanyAddress, mintAmount);
  await mintTx.wait();

  const companyBalance = await carbonCredit.balanceOf(testCompanyAddress);
  console.log(
    "💳 Test company balance:",
    ethers.formatUnits(companyBalance, 18),
    "CC"
  );

  const remainingCap = await carbonCredit.getRemainingCap(testCompanyAddress);
  console.log(
    "📊 Remaining cap for test company:",
    ethers.formatUnits(remainingCap, 18),
    "CC"
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("🔗 Contract Address:", contractAddress);
  console.log("🌐 Network: http://127.0.0.1:8545");
  console.log("⛓️  Chain ID: 31337");

  console.log("\n📋 Next steps:");
  console.log("1. Update your .env file with the contract address");
  console.log("2. Start your Firebase Functions with the deployment info");
  console.log("3. Test the frontend integration");

  return {
    contractAddress,
    deployerAddress: deployer.address,
    capPerCompany: capPerCompany.toString(),
  };
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
