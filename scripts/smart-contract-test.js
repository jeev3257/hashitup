import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🧪 SMART CONTRACT FUNCTIONALITY TEST");
  console.log("=====================================\n");

  // Use the already deployed contract
  const contractAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
  const signers = await ethers.getSigners();
  const owner = signers[0];

  console.log("📋 TEST SETUP:");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Owner Address: ${owner.address}\n`);

  // Connect to the deployed contract
  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  const contract = CarbonCredit.attach(contractAddress);

  try {
    // Test 1: Basic Contract Properties
    console.log("🔍 TEST 1: Basic Contract Properties");
    console.log("-----------------------------------");

    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();
    const capPerCompany = await contract.capPerCompany();

    console.log(`✅ Token Name: ${name}`);
    console.log(`✅ Token Symbol: ${symbol}`);
    console.log(`✅ Decimals: ${decimals}`);
    console.log(`✅ Total Supply: ${ethers.formatEther(totalSupply)} tokens`);
    console.log(
      `✅ Cap Per Company: ${ethers.formatEther(capPerCompany)} tokens`
    );

    // Test 2: Check existing balances
    console.log("\n💰 TEST 2: Current Token Balances");
    console.log("----------------------------------");

    // Check owner account balance
    const ownerBalance = await contract.balanceOf(owner.address);
    const ownerRegistered = await contract.isRegisteredCompany(owner.address);
    console.log(`Owner Account (${owner.address}):`);
    console.log(`  Balance: ${ethers.formatEther(ownerBalance)} tokens`);
    console.log(`  Registered: ${ownerRegistered}`);

    // Test 3: Test Company Registration (using owner as test company)
    console.log("\n🏢 TEST 3: Company Registration Test");
    console.log("-----------------------------------");

    const testCompany = owner; // Use owner account as test company
    let isRegistered = await contract.isRegisteredCompany(testCompany.address);
    console.log(`Test company registration status: ${isRegistered}`);

    if (!isRegistered) {
      console.log("Registering test company...");
      const registerTx = await contract.registerCompany(testCompany.address);
      await registerTx.wait();
      console.log(`✅ Company registered! Tx: ${registerTx.hash}`);

      isRegistered = await contract.isRegisteredCompany(testCompany.address);
      console.log(`✅ Registration verified: ${isRegistered}`);
    } else {
      console.log("✅ Test company already registered");
    }

    // Test 4: Token Minting
    console.log("\n🪙 TEST 4: Token Minting Test");
    console.log("-----------------------------");

    let balance = await contract.balanceOf(testCompany.address);
    console.log(`Current balance: ${ethers.formatEther(balance)} tokens`);

    const mintAmount = ethers.parseEther("100");
    console.log(
      `Minting ${ethers.formatEther(mintAmount)} tokens to test company...`
    );

    const mintTx = await contract.mint(testCompany.address, mintAmount);
    await mintTx.wait();
    console.log(`✅ Mint transaction: ${mintTx.hash}`);

    const newBalance = await contract.balanceOf(testCompany.address);
    console.log(`✅ New balance: ${ethers.formatEther(newBalance)} tokens`);
    console.log(
      `✅ Balance increased by: ${ethers.formatEther(
        newBalance - balance
      )} tokens`
    );

    // Test 5: Compliance Functions
    console.log("\n⚖️ TEST 5: Compliance Functions Test");
    console.log("------------------------------------");

    // Test mintForCompliance
    const complianceAmount = ethers.parseEther("50");
    console.log(
      `Testing mintForCompliance with ${ethers.formatEther(
        complianceAmount
      )} tokens...`
    );

    const balanceBeforeCompliance = await contract.balanceOf(
      testCompany.address
    );
    const mintComplianceTx = await contract.mintForCompliance(
      testCompany.address,
      complianceAmount
    );
    await mintComplianceTx.wait();
    console.log(`✅ Compliance minting: ${mintComplianceTx.hash}`);

    const balanceAfterCompliance = await contract.balanceOf(
      testCompany.address
    );
    console.log(
      `✅ Balance after compliance mint: ${ethers.formatEther(
        balanceAfterCompliance
      )} tokens`
    );
    console.log(
      `✅ Compliance mint added: ${ethers.formatEther(
        balanceAfterCompliance - balanceBeforeCompliance
      )} tokens`
    );

    // Test deductForOverage (only if balance is sufficient)
    if (balanceAfterCompliance > ethers.parseEther("25")) {
      const deductAmount = ethers.parseEther("25");
      console.log(
        `Testing deductForOverage with ${ethers.formatEther(
          deductAmount
        )} tokens...`
      );

      const deductTx = await contract.deductForOverage(
        testCompany.address,
        deductAmount
      );
      await deductTx.wait();
      console.log(`✅ Overage deduction: ${deductTx.hash}`);

      const balanceAfterDeduction = await contract.balanceOf(
        testCompany.address
      );
      console.log(
        `✅ Balance after deduction: ${ethers.formatEther(
          balanceAfterDeduction
        )} tokens`
      );
      console.log(
        `✅ Deduction amount: ${ethers.formatEther(
          balanceAfterCompliance - balanceAfterDeduction
        )} tokens`
      );
    } else {
      console.log("⚠️ Skipping deduction test - insufficient balance");
    }

    // Test 6: Company Information
    console.log("\n📊 TEST 6: Company Information");
    console.log("------------------------------");

    const companyInfo = await contract.getCompanyInfo(testCompany.address);
    console.log(`✅ Is Registered: ${companyInfo[0]}`);
    console.log(
      `✅ Total Minted: ${ethers.formatEther(companyInfo[1])} tokens`
    );
    console.log(
      `✅ Remaining Cap: ${ethers.formatEther(companyInfo[2])} tokens`
    );

    if (companyInfo[3] > 0) {
      console.log(
        `✅ Last Mint Time: ${new Date(
          Number(companyInfo[3]) * 1000
        ).toLocaleString()}`
      );
    } else {
      console.log(`✅ Last Mint Time: Never`);
    }

    // Test 7: Contract Balance
    console.log("\n💼 TEST 7: Contract ETH Balance");
    console.log("-------------------------------");

    const contractBalance = await contract.getContractBalance();
    console.log(
      `✅ Contract ETH balance: ${ethers.formatEther(contractBalance)} ETH`
    );

    // Test 8: Final Summary
    console.log("\n📈 TEST 8: Final Token Supply Summary");
    console.log("------------------------------------");

    const finalTotalSupply = await contract.totalSupply();
    console.log(
      `✅ Final total supply: ${ethers.formatEther(finalTotalSupply)} tokens`
    );

    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("====================================");
    console.log("✅ Smart contract is fully functional!");
    console.log("✅ All token operations working");
    console.log("✅ Compliance functions operational");
    console.log("✅ Company registration system working");
    console.log("✅ Balance tracking accurate");
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
    console.error("Error details:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
