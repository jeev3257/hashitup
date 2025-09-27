// Node.js Compatible Smart Contract Scheduler
// Runs compliance checks at exact 5-minute intervals by clock time

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  getDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { ethers } from "ethers";

// Firebase configuration (Node.js compatible - no analytics)
const firebaseConfig = {
  apiKey: "AIzaSyD1HciA35uKQCEQRpwhI54QgwpOeffCfZQ",
  authDomain: "hashitup-5bb9b.firebaseapp.com",
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.firebasestorage.app",
  messagingSenderId: "620690168173",
  appId: "1:620690168173:web:8b3306843fdb65f99ae264",
};

// Initialize Firebase (Node.js compatible)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Blockchain configuration
const HARDHAT_RPC_URL = "http://127.0.0.1:8545";
// Get the deployed contract address and ABI
const CONTRACT_ADDRESS = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";

// Contract ABI for compliance functions
const CONTRACT_ABI = [
  "function mintForCompliance(address company, uint256 amount, uint256 emissionValue, uint256 emissionCap) external",
  "function deductForOverage(address company, uint256 amount, uint256 emissionValue, uint256 emissionCap) external returns (bool success, bool hasEnoughBalance)",
  "function purchaseCredits(uint256 amount) external payable",
  "function balanceOf(address account) external view returns (uint256)",
  "function getCompanyInfo(address company) external view returns (bool isRegistered, uint256 minted, uint256 remaining, uint256 lastMint)",
  "function registerCompany(address company) external",
  "event ComplianceCheck(address indexed company, uint256 emissionValue, uint256 emissionCap, string action, uint256 timestamp)",
  "event ComplianceMint(address indexed company, uint256 amount, uint256 newBalance, uint256 timestamp)",
  "event ComplianceDeduct(address indexed company, uint256 amount, uint256 newBalance, uint256 timestamp)",
  "event CreditPurchase(address indexed company, uint256 amount, uint256 newBalance, uint256 timestamp)",
  "event CompanyFlagged(address indexed company, uint256 requiredAmount, uint256 availableAmount, uint256 timestamp)",
  "event BuyTimerStarted(address indexed company, uint256 endTime, uint256 requiredAmount, uint256 timestamp)",
  "event CompanyRegistered(address indexed company, uint256 timestamp)",
  "event TokensMinted(address indexed company, uint256 amount, uint256 timestamp)",
];

class NodeScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.companies = new Set();
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  // Initialize blockchain connection
  async initializeBlockchain() {
    try {
      console.log("🔗 Connecting to blockchain...");
      this.provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);

      // Use the first account as signer
      const accounts = await this.provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error("No accounts available on the blockchain");
      }

      this.signer = await this.provider.getSigner(0);
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer
      );

      console.log("✅ Blockchain connection established");
      console.log(`📍 Contract address: ${CONTRACT_ADDRESS}`);
      console.log(`👤 Signer address: ${await this.signer.getAddress()}`);

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize blockchain:", error);
      return false;
    }
  }

  // Calculate time until next 5-minute mark
  getTimeUntilNext5MinuteMark() {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const nextMark = Math.ceil(minutes / 5) * 5;
    const targetMinutes = nextMark === 60 ? 0 : nextMark;
    const targetHour = nextMark === 60 ? now.getHours() + 1 : now.getHours();

    const target = new Date();
    target.setHours(targetHour);
    target.setMinutes(targetMinutes);
    target.setSeconds(0);
    target.setMilliseconds(0);

    if (target <= now) {
      target.setMinutes(target.getMinutes() + 5);
    }

    return target.getTime() - now.getTime();
  }

  // Register company for monitoring
  registerCompany(companyId) {
    this.companies.add(companyId);
    console.log(`🏢 Company ${companyId} registered for automated compliance`);
  }

  // Get company emission cap from Firebase
  async getEmissionCap(companyId) {
    try {
      const capRef = doc(db, "emission_caps", companyId);
      const capDoc = await getDoc(capRef);

      if (capDoc.exists()) {
        return capDoc.data().cap || 100;
      }
      return 100; // Default cap
    } catch (error) {
      console.error(`❌ Error getting emission cap:`, error);
      return 100;
    }
  }

  // Get latest emission data
  async getLatestEmission(companyId) {
    try {
      const emissionsRef = collection(db, "emissions");
      const q = query(
        emissionsRef,
        where("companyId", "==", companyId),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return data.emissionValue || 0;
      }
      return 0;
    } catch (error) {
      console.error(`❌ Error getting latest emission:`, error);
      return 0;
    }
  }

  // Log transaction to Firebase
  async logTransaction(companyId, type, amount, txHash, balanceAfter) {
    try {
      const transactionRef = collection(db, "blockchain_transactions");
      await addDoc(transactionRef, {
        companyId,
        type,
        amount,
        timestamp: new Date(),
        status: "CONFIRMED",
        reason: `Automated compliance check - ${type}`,
        txHash,
        balanceAfter: parseFloat(balanceAfter),
        createdAt: new Date(),
      });

      console.log(`📝 Transaction logged: ${type} - ${amount} CCT`);
    } catch (error) {
      console.error(`❌ Error logging transaction:`, error);
    }
  }

  // Update company balance in Firebase
  async updateFirebaseBalance(companyId, newBalance) {
    try {
      const companyRef = doc(db, "companies", companyId);
      await updateDoc(companyRef, {
        creditBalance: parseFloat(newBalance),
        lastBalanceUpdate: new Date(),
      });

      console.log(`💾 Firebase balance updated: ${newBalance} CCT`);
    } catch (error) {
      console.error(`❌ Error updating Firebase balance:`, error);
    }
  }

  // Store immutable blockchain record in Firebase
  async storeImmutableRecord(companyId, recordData) {
    try {
      const immutableRef = collection(db, "immutable_blockchain_records");

      // Create immutable record with blockchain proof
      const immutableRecord = {
        companyId,
        recordId: `${recordData.txHash}_${Date.now()}`,
        blockchainData: {
          transactionHash: recordData.txHash,
          blockNumber: recordData.blockNumber,
          blockHash: recordData.blockHash,
          gasUsed: recordData.gasUsed,
          contractAddress: CONTRACT_ADDRESS,
          network: "localhost",
          chainId: 31337,
        },
        complianceData: {
          type: recordData.type,
          amount: recordData.amount,
          emissionValue: recordData.emissionValue,
          emissionCap: recordData.emissionCap,
          balanceAfter: recordData.balanceAfter,
          walletAddress: recordData.walletAddress,
          requiredAmount: recordData.requiredAmount || null,
          availableAmount: recordData.availableAmount || null,
        },
        metadata: {
          timestamp: recordData.timestamp,
          serviceId: "compliance-backend-001",
          version: "1.0.0",
          isImmutable: true,
          verificationHash: this.generateVerificationHash(recordData),
        },
      };

      await addDoc(immutableRef, immutableRecord);

      console.log(
        `🔒 Immutable record stored: ${recordData.type} - ${recordData.txHash}`
      );
    } catch (error) {
      console.error(`❌ Error storing immutable record:`, error);
    }
  }

  // Generate verification hash for record integrity
  generateVerificationHash(data) {
    const crypto = require("crypto");
    const hashString = `${data.txHash}_${data.blockNumber}_${data.type}_${data.amount}_${data.timestamp}`;
    return crypto.createHash("sha256").update(hashString).digest("hex");
  }

  // Run compliance check for a company
  async runComplianceCheck(companyId) {
    try {
      const timestamp = new Date();
      const timeString = timestamp.toLocaleTimeString();

      console.log(
        `\n⏰ [${timeString}] Running compliance check for: ${companyId}`
      );

      // Get company data
      const companyRef = doc(db, "companies", companyId);
      const companyDoc = await getDoc(companyRef);

      if (!companyDoc.exists()) {
        console.log(`⚠️  Company ${companyId} not found`);
        return;
      }

      const companyData = companyDoc.data();
      const walletAddress =
        companyData.walletAddress ||
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

      // Get emission data
      const emissionCap = await this.getEmissionCap(companyId);
      const currentEmission = await this.getLatestEmission(companyId);

      console.log(`📊 Emission cap: ${emissionCap} tons`);
      console.log(`📈 Current emission: ${currentEmission} tons`);

      // Get current balance
      const currentBalance = await this.contract.balanceOf(walletAddress);
      const balanceInTokens = parseFloat(
        ethers.formatUnits(currentBalance, 18)
      );

      console.log(`💰 Current balance: ${balanceInTokens} CCT`);

      // Determine compliance action
      if (currentEmission < emissionCap) {
        // Under cap - mint credits
        const creditsToMint = emissionCap - currentEmission;

        console.log(`✅ Under cap by ${creditsToMint} tons - minting credits`);

        try {
          const mintAmount = ethers.parseUnits(creditsToMint.toString(), 18);
          const emissionValueWei = ethers.parseUnits(
            currentEmission.toString(),
            18
          );
          const emissionCapWei = ethers.parseUnits(emissionCap.toString(), 18);

          // Call enhanced smart contract function
          const tx = await this.contract.mintForCompliance(
            walletAddress,
            mintAmount,
            emissionValueWei,
            emissionCapWei
          );
          const receipt = await tx.wait();

          const newBalance = balanceInTokens + creditsToMint;

          console.log(
            `🎉 Minted ${creditsToMint} CCT - New balance: ${newBalance}`
          );
          console.log(`🔗 Transaction: ${receipt.hash}`);
          console.log(`📦 Block: ${receipt.blockNumber}`);

          // Store immutable record in Firebase with blockchain data
          await this.storeImmutableRecord(companyId, {
            type: "COMPLIANCE_MINT",
            amount: creditsToMint,
            emissionValue: currentEmission,
            emissionCap: emissionCap,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            balanceAfter: newBalance,
            timestamp: new Date(),
            walletAddress: walletAddress,
            gasUsed: receipt.gasUsed.toString(),
            blockHash: receipt.blockHash,
          });

          // Log to Firebase
          await this.logTransaction(
            companyId,
            "COMPLIANCE_MINT",
            creditsToMint,
            receipt.hash,
            newBalance
          );
          await this.updateFirebaseBalance(companyId, newBalance);
        } catch (error) {
          console.error(`❌ Failed to mint credits:`, error);
        }
      } else if (currentEmission > emissionCap) {
        // Over cap - deduct credits
        const creditsToDeduct = currentEmission - emissionCap;

        console.log(
          `🚨 Over cap by ${creditsToDeduct} tons - deducting credits`
        );

        try {
          const deductAmount = ethers.parseUnits(
            creditsToDeduct.toString(),
            18
          );
          const emissionValueWei = ethers.parseUnits(
            currentEmission.toString(),
            18
          );
          const emissionCapWei = ethers.parseUnits(emissionCap.toString(), 18);

          // Call enhanced smart contract function
          const tx = await this.contract.deductForOverage(
            walletAddress,
            deductAmount,
            emissionValueWei,
            emissionCapWei
          );
          const receipt = await tx.wait();

          // Parse transaction result (the function returns success and hasEnoughBalance)
          const logs = receipt.logs;
          let wasSuccessful = false;
          let newBalance = balanceInTokens;

          // Check if deduction was successful by looking for ComplianceDeduct event
          for (const log of logs) {
            try {
              const parsedLog = this.contract.interface.parseLog(log);
              if (parsedLog.name === "ComplianceDeduct") {
                wasSuccessful = true;
                newBalance = parseFloat(
                  ethers.formatUnits(parsedLog.args.newBalance, 18)
                );
                break;
              } else if (parsedLog.name === "CompanyFlagged") {
                wasSuccessful = false;
                break;
              }
            } catch (e) {
              // Skip unparseable logs
            }
          }

          if (wasSuccessful) {
            console.log(
              `⚖️  Deducted ${creditsToDeduct} CCT - New balance: ${newBalance}`
            );
            console.log(`🔗 Transaction: ${receipt.hash}`);
            console.log(`📦 Block: ${receipt.blockNumber}`);

            // Store immutable record in Firebase
            await this.storeImmutableRecord(companyId, {
              type: "COMPLIANCE_DEDUCT",
              amount: -creditsToDeduct,
              emissionValue: currentEmission,
              emissionCap: emissionCap,
              txHash: receipt.hash,
              blockNumber: receipt.blockNumber,
              balanceAfter: newBalance,
              timestamp: new Date(),
              walletAddress: walletAddress,
              gasUsed: receipt.gasUsed.toString(),
              blockHash: receipt.blockHash,
            });

            // Log to Firebase
            await this.logTransaction(
              companyId,
              "COMPLIANCE_DEDUCT",
              -creditsToDeduct,
              receipt.hash,
              newBalance
            );
            await this.updateFirebaseBalance(companyId, newBalance);
          } else {
            console.log(
              `💸 Insufficient balance for deduction - company flagged`
            );
            console.log(
              `🔗 Transaction: ${receipt.hash} (flagging transaction)`
            );
            console.log(`📦 Block: ${receipt.blockNumber}`);

            // Store immutable flagging record
            await this.storeImmutableRecord(companyId, {
              type: "COMPANY_FLAGGED",
              amount: 0,
              emissionValue: currentEmission,
              emissionCap: emissionCap,
              requiredAmount: creditsToDeduct,
              availableAmount: balanceInTokens,
              txHash: receipt.hash,
              blockNumber: receipt.blockNumber,
              balanceAfter: balanceInTokens,
              timestamp: new Date(),
              walletAddress: walletAddress,
              gasUsed: receipt.gasUsed.toString(),
              blockHash: receipt.blockHash,
            });

            // Additional Firebase flags and timers
            const flagRef = collection(db, "compliance_flags");
            await addDoc(flagRef, {
              companyId,
              reason: "INSUFFICIENT_CREDITS",
              timestamp: new Date(),
              requiredAmount: creditsToDeduct,
              availableAmount: balanceInTokens,
              status: "ACTIVE",
              blockchainTxHash: receipt.hash,
            });

            // Start 2-minute buy timer
            const timerRef = collection(db, "buy_credit_timers");
            await addDoc(timerRef, {
              companyId,
              startTime: new Date(),
              endTime: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
              requiredAmount: creditsToDeduct,
              status: "ACTIVE",
              blockchainTxHash: receipt.hash,
            });

            console.log(`⏰ 2-minute buy timer started`);
          }
        } catch (error) {
          console.error(`❌ Failed to process over-cap compliance:`, error);
        }
      } else {
        console.log(`✅ Exactly at cap - no action needed`);
      }
    } catch (error) {
      console.error(`❌ Compliance check failed for ${companyId}:`, error);
    }
  }

  // Run scheduled compliance for all companies
  async runScheduledCompliance() {
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString();

    console.log(`\n🕐 SCHEDULED COMPLIANCE RUN - ${timeString}`);
    console.log(`📋 Companies: ${this.companies.size}`);

    if (this.companies.size === 0) {
      console.log(`⚠️  No companies registered`);
      return;
    }

    for (const companyId of this.companies) {
      await this.runComplianceCheck(companyId);
    }

    console.log(`✅ Compliance run completed at ${timeString}`);
    console.log(`📊 Next run in 5 minutes\n`);
  }

  // Start scheduler
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Scheduler already running");
      return;
    }

    // Initialize blockchain
    const blockchainReady = await this.initializeBlockchain();
    if (!blockchainReady) {
      console.log(
        "❌ Cannot start scheduler - blockchain initialization failed"
      );
      return;
    }

    this.isRunning = true;

    const msUntilNext = this.getTimeUntilNext5MinuteMark();
    const nextTime = new Date(Date.now() + msUntilNext);

    console.log(`\n🚀 STARTING SMART CONTRACT SCHEDULER`);
    console.log(`⏰ Current time: ${new Date().toLocaleTimeString()}`);
    console.log(`🎯 Next run: ${nextTime.toLocaleTimeString()}`);
    console.log(`⏳ Waiting ${Math.round(msUntilNext / 1000)} seconds...\n`);

    // Initial timeout to sync with clock
    setTimeout(() => {
      this.runScheduledCompliance();

      // Then run every 5 minutes
      this.intervalId = setInterval(() => {
        this.runScheduledCompliance();
      }, 5 * 60 * 1000);
    }, msUntilNext);
  }

  // Stop scheduler
  stop() {
    if (!this.isRunning) {
      console.log("⚠️  Scheduler not running");
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log("🛑 Scheduler stopped");
  }
}

export default NodeScheduler;
