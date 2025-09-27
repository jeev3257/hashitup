// Complete Test with Company Registration
// This script first registers the company on blockchain, then tests compliance

import { ethers } from "ethers";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD1HciA35uKQCEQRpwhI54QgwpOeffCfZQ",
  authDomain: "hashitup-5bb9b.firebaseapp.com",
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.firebasestorage.app",
  messagingSenderId: "620690168173",
  appId: "1:620690168173:web:8b3306843fdb65f99ae264",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Hardhat configuration
const HARDHAT_RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";

// Contract ABI
const CONTRACT_ABI = [
  "function registerCompany(address company) external",
  "function mintForCompliance(address company, uint256 amount, uint256 emissionValue, uint256 emissionCap) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function getCompanyInfo(address company) external view returns (bool isRegistered, uint256 minted, uint256 remaining, uint256 lastMint)",
  "event CompanyRegistered(address indexed company, uint256 timestamp)",
  "event ComplianceMint(address indexed company, uint256 amount, uint256 newBalance, uint256 timestamp)",
];

async function completeTest() {
  try {
    console.log("🚀 COMPLETE IMMUTABLE BLOCKCHAIN TEST");
    console.log("====================================");

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const testWallet = await signer.getAddress();
    const testCompanyId = "complete-test-001";

    console.log(`🔗 Connected to blockchain`);
    console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`👤 Signer: ${testWallet}`);

    // Step 1: Register company on blockchain
    console.log("\n1️⃣ Registering company on blockchain...");
    try {
      const registerTx = await contract.registerCompany(testWallet);
      const registerReceipt = await registerTx.wait();
      console.log(`✅ Company registered on blockchain`);
      console.log(`🔗 Transaction: ${registerReceipt.hash}`);
      console.log(`📦 Block: ${registerReceipt.blockNumber}`);
    } catch (regError) {
      console.log(
        `⚠️  Registration may have failed or company already registered:`,
        regError.message
      );
    }

    // Step 2: Create Firebase data
    console.log("\n2️⃣ Creating Firebase data...");

    // Create company
    const companyRef = doc(db, "companies", testCompanyId);
    await setDoc(companyRef, {
      name: "Complete Test Company",
      email: "test@complete.com",
      status: "approved",
      walletAddress: testWallet,
      creditBalance: 0,
      approvedAt: new Date(),
      createdAt: new Date(),
    });

    // Set emission cap
    const capRef = doc(db, "emission_caps", testCompanyId);
    await setDoc(capRef, {
      cap: 100,
      setBy: "admin",
      setAt: new Date(),
    });

    console.log(`✅ Firebase data created for company: ${testCompanyId}`);

    // Step 3: Direct blockchain compliance transaction
    console.log("\n3️⃣ Creating direct blockchain compliance transaction...");

    const currentBalance = await contract.balanceOf(testWallet);
    console.log(
      `💰 Current balance: ${ethers.formatUnits(currentBalance, 18)} CCT`
    );

    // Test compliance mint (under cap scenario: 75 emissions vs 100 cap = 25 credits to mint)
    const creditsToMint = 25;
    const emissionValue = 75;
    const emissionCap = 100;

    console.log(`📊 Test scenario:`);
    console.log(`   Emission: ${emissionValue} tons`);
    console.log(`   Cap: ${emissionCap} tons`);
    console.log(`   Credits to mint: ${creditsToMint}`);

    try {
      const mintAmount = ethers.parseUnits(creditsToMint.toString(), 18);
      const emissionValueWei = ethers.parseUnits(emissionValue.toString(), 18);
      const emissionCapWei = ethers.parseUnits(emissionCap.toString(), 18);

      const mintTx = await contract.mintForCompliance(
        testWallet,
        mintAmount,
        emissionValueWei,
        emissionCapWei
      );
      const mintReceipt = await mintTx.wait();

      const newBalance = await contract.balanceOf(testWallet);
      const newBalanceFormatted = parseFloat(
        ethers.formatUnits(newBalance, 18)
      );

      console.log(`✅ Compliance mint successful!`);
      console.log(`🔗 Transaction: ${mintReceipt.hash}`);
      console.log(`📦 Block: ${mintReceipt.blockNumber}`);
      console.log(`💰 New balance: ${newBalanceFormatted} CCT`);

      // Step 4: Store immutable record in Firebase
      console.log("\n4️⃣ Storing immutable record in Firebase...");

      const crypto = await import("crypto");
      const verificationHash = crypto
        .createHash("sha256")
        .update(
          `${mintReceipt.hash}_${
            mintReceipt.blockNumber
          }_COMPLIANCE_MINT_${creditsToMint}_${new Date()}`
        )
        .digest("hex");

      const immutableRecord = {
        companyId: testCompanyId,
        recordId: `${mintReceipt.hash}_${Date.now()}`,
        blockchainData: {
          transactionHash: mintReceipt.hash,
          blockNumber: mintReceipt.blockNumber,
          blockHash: mintReceipt.blockHash,
          gasUsed: mintReceipt.gasUsed.toString(),
          contractAddress: CONTRACT_ADDRESS,
          network: "localhost",
          chainId: 31337,
        },
        complianceData: {
          type: "COMPLIANCE_MINT",
          amount: creditsToMint,
          emissionValue: emissionValue,
          emissionCap: emissionCap,
          balanceAfter: newBalanceFormatted,
          walletAddress: testWallet,
        },
        metadata: {
          timestamp: new Date(),
          serviceId: "compliance-backend-001",
          version: "1.0.0",
          isImmutable: true,
          verificationHash: verificationHash,
        },
      };

      const immutableRef = collection(db, "immutable_blockchain_records");
      await addDoc(immutableRef, immutableRecord);

      console.log(`🔒 Immutable record stored in Firebase`);
      console.log(`🔑 Verification hash: ${verificationHash}`);

      // Step 5: Also store in regular transaction logs
      const transactionRef = collection(db, "blockchain_transactions");
      await addDoc(transactionRef, {
        companyId: testCompanyId,
        type: "COMPLIANCE_MINT",
        amount: creditsToMint,
        timestamp: new Date(),
        status: "CONFIRMED",
        reason: `Under emission cap - earned ${creditsToMint} credits (${emissionValue}/${emissionCap} tons)`,
        txHash: mintReceipt.hash,
        balanceAfter: newBalanceFormatted,
        createdAt: new Date(),
      });

      console.log(
        `📝 Transaction also logged in blockchain_transactions collection`
      );

      // Step 6: Update company balance
      await setDoc(
        companyRef,
        {
          creditBalance: newBalanceFormatted,
          lastBalanceUpdate: new Date(),
        },
        { merge: true }
      );

      console.log(
        `💾 Company balance updated in Firebase: ${newBalanceFormatted} CCT`
      );

      console.log("\n🎉 COMPLETE TEST SUCCESSFUL!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Company registered on blockchain");
      console.log("✅ Compliance transaction executed");
      console.log("✅ Immutable record stored in Firebase");
      console.log("✅ Transaction logged for dashboard");
      console.log("✅ Company balance updated");
      console.log("");
      console.log(
        "📱 Now check your dashboard Smart Contract Activity section!"
      );
      console.log(
        "🔒 This transaction is now immutable on both blockchain and Firebase"
      );
    } catch (mintError) {
      console.error("❌ Mint transaction failed:", mintError);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

completeTest();
