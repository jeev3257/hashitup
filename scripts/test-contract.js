import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("🧪 SMART CONTRACT FUNCTIONALITY TEST");
  console.log("=====================================\n");

  // Get contract details - using the already deployed contract
  const contractAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const testCompany = signers[1]; // Use second account as test company

  console.log("📋 TEST SETUP:");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Owner Address: ${owner.address}`);
  console.log(`Test Company: ${testCompany.address}\n`);rs } = require("hardhat");

async function main() {
  console.log("🧪 Testing CarbonCredit contract functionality...");

  // Get accounts
  const [owner, company1, company2, user1] = await ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("🏢 Company1:", company1.address);
  console.log("🏢 Company2:", company2.address);
  console.log("👨‍💼 User1:", user

.address);

  // Deploy contract
  const capPerCompany = ethers.parseUnits("10000", 18);
  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  const carbonCredit = await CarbonCredit.deploy(capPerCompany);
  await carbonCredit.waitForDeployment();
  
  const contractAddress = await carbonCredit.getAddress();
  console.log("📝 Contract deployed at:", contractAddress);

  // Test 1: Register companies
  console.log("\n📋 Test 1: Registering companies...");
  await carbonCredit.registerCompany(company1.address);
  await carbonCredit.registerCompany(company2.address);
  
  console.log("✅ Company1 registered:", await carbonCredit.isRegisteredCompany(company1.address));
  console.log("✅ Company2 registered:", await carbonCredit.isRegisteredCompany(company2.address));

  // Test 2: Mint tokens within cap
  console.log("\n🪙 Test 2: Minting tokens within cap...");
  const mintAmount1 = ethers.parseUnits("5000", 18);
  await carbonCredit.mint(company1.address, mintAmount1);
  
  let balance1 = await carbonCredit.balanceOf(company1.address);
  console.log("💳 Company1 balance:", ethers.formatUnits(balance1, 18), "CC");
  
  let remaining1 = await carbonCredit.getRemainingCap(company1.address);
  console.log("📊 Company1 remaining cap:", ethers.formatUnits(remaining1, 18), "CC");

  // Test 3: Try to exceed cap
  console.log("\n⚠️  Test 3: Testing cap enforcement...");
  try {
    const exceedAmount = ethers.parseUnits("6000", 18); // This should fail (5000 + 6000 > 10000)
    await carbonCredit.mint(company1.address, exceedAmount);
    console.log("❌ ERROR: Should have failed but didn't!");
  } catch (error) {
    console.log("✅ Cap enforcement working - mint rejected as expected");
  }

  // Test 4: Mint to another company
  console.log("\n🏢 Test 4: Minting to second company...");
  const mintAmount2 = ethers.parseUnits("3000", 18);
  await carbonCredit.mint(company2.address, mintAmount2);
  
  let balance2 = await carbonCredit.balanceOf(company2.address);
  console.log("💳 Company2 balance:", ethers.formatUnits(balance2, 18), "CC");

  // Test 5: Transfer tokens
  console.log("\n💸 Test 5: Testing token transfers...");
  const transferAmount = ethers.parseUnits("100", 18);
  
  // Connect as company1 to transfer
  await carbonCredit.connect(company1).transfer(user1.address, transferAmount);
  
  let userBalance = await carbonCredit.balanceOf(user1.address);
  console.log("💳 User1 balance after transfer:", ethers.formatUnits(userBalance, 18), "CC");
  
  balance1 = await carbonCredit.balanceOf(company1.address);
  console.log("💳 Company1 balance after transfer:", ethers.formatUnits(balance1, 18), "CC");

  // Test 6: Company info
  console.log("\n📊 Test 6: Getting company information...");
  const [registered, minted, remaining, lastMint] = await carbonCredit.getCompanyInfo(company1.address);
  console.log("🏢 Company1 info:");
  console.log("   Registered:", registered);
  console.log("   Minted:", ethers.formatUnits(minted, 18), "CC");
  console.log("   Remaining:", ethers.formatUnits(remaining, 18), "CC");
  console.log("   Last mint time:", new Date(Number(lastMint) * 1000).toISOString());

  // Test 7: Cooldown check
  console.log("\n⏰ Test 7: Checking mint cooldown...");
  const [canMint, timeUntilNext] = await carbonCredit.canMintNow(company1.address);
  console.log("🕐 Can mint now:", canMint);
  console.log("⏳ Time until next mint:", timeUntilNext.toString(), "seconds");

  // Test 8: Update cap
  console.log("\n📈 Test 8: Updating company cap...");
  const newCap = ethers.parseUnits("15000", 18);
  await carbonCredit.updateCapPerCompany(newCap);
  
  const updatedCap = await carbonCredit.capPerCompany();
  console.log("📊 New cap per company:", ethers.formatUnits(updatedCap, 18), "CC");
  
  remaining1 = await carbonCredit.getRemainingCap(company1.address);
  console.log("📊 Company1 new remaining cap:", ethers.formatUnits(remaining1, 18), "CC");

  console.log("\n✅ All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });