import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { defineString } from "firebase-functions/params";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin
initializeApp();

// Define configuration parameters for local Hardhat blockchain
const adminPrivateKey = defineString("ETH_ADMIN_PRIVATE_KEY", {
  default: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Hardhat account #0 private key
});
const rpcUrl = defineString("ETH_RPC_URL", {
  default: "http://127.0.0.1:8545", // Local Hardhat node
});
const contractAddress = defineString("CONTRACT_ADDRESS");

// Load contract deployment info
let deploymentInfo = null;
try {
  const deploymentPath = path.join(__dirname, "../contract-deployment.json");
  if (fs.existsSync(deploymentPath)) {
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  }
} catch (error) {
  console.log(
    "Contract deployment info not found, will use environment variables"
  );
}

// CarbonCredit contract ABI (essential functions only)
const CARBON_CREDIT_ABI = [
  "function owner() view returns (address)",
  "function capPerCompany() view returns (uint256)",
  "function registerCompany(address company) external",
  "function mint(address to, uint256 amount) external",
  "function isRegisteredCompany(address company) view returns (bool)",
  "function getRemainingCap(address company) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function getCompanyInfo(address company) view returns (bool registered, uint256 minted, uint256 remaining, uint256 lastMint)",
];

export const approveCompany = onRequest(
  {
    cors: true,
    secrets: [adminPrivateKey, rpcUrl, contractAddress],
  },
  async (req, res) => {
    try {
      // Validate HTTP method
      if (req.method !== "POST") {
        res.status(405).json({ success: false, error: "Method not allowed" });
        return;
      }

      // Extract parameters
      const { companyId, cap } = req.body;

      // Validate input parameters
      if (!companyId || !cap) {
        res.status(400).json({
          success: false,
          error: "Missing required parameters: companyId and cap",
        });
        return;
      }

      // Validate cap is a positive number
      if (typeof cap !== "number" || cap <= 0) {
        res.status(400).json({
          success: false,
          error: "Cap must be a positive number",
        });
        return;
      }

      console.log(
        `Starting approval process for company: ${companyId} with cap: ${cap}`
      );

      // Initialize Firestore
      const db = getFirestore();

      // Check if company exists
      const companyRef = db.collection("companies").doc(companyId);
      const companyDoc = await companyRef.get();

      if (!companyDoc.exists) {
        res.status(404).json({
          success: false,
          error: "Company not found",
        });
        return;
      }

      // Get configuration values
      const privateKey = adminPrivateKey.value();
      const rpcEndpoint = rpcUrl.value();
      let contractAddr = contractAddress.value();

      // Fallback to deployment info if contract address not in environment
      if (!contractAddr && deploymentInfo) {
        contractAddr = deploymentInfo.contractAddress;
      }

      if (!privateKey) {
        throw new Error("Admin private key not configured");
      }

      if (!contractAddr) {
        throw new Error(
          "Contract address not configured. Please deploy the contract first."
        );
      }

      // Connect to local Hardhat blockchain
      console.log("Connecting to local Hardhat blockchain...");
      const provider = new ethers.JsonRpcProvider(rpcEndpoint);

      // Verify connection
      try {
        const network = await provider.getNetwork();
        console.log(
          `Connected to network: ${network.name} (Chain ID: ${network.chainId})`
        );
      } catch (error) {
        throw new Error(`Failed to connect to blockchain: ${error.message}`);
      }

      // Create admin wallet
      const adminWallet = new ethers.Wallet(privateKey, provider);
      console.log(`Admin wallet address: ${adminWallet.address}`);

      // Check admin wallet balance
      const adminBalance = await provider.getBalance(adminWallet.address);
      const requiredAmount = ethers.parseEther("1.0"); // 1 ETH for local testing

      if (adminBalance < requiredAmount) {
        throw new Error(
          `Insufficient admin wallet balance. Required: 1 ETH, Available: ${ethers.formatEther(
            adminBalance
          )} ETH`
        );
      }

      // Create new company wallet
      console.log("Creating new company wallet...");
      const companyWallet = ethers.Wallet.createRandom();
      const companyAddress = companyWallet.address;
      const companyPrivateKey = companyWallet.privateKey;

      console.log(`Company wallet created: ${companyAddress}`);

      // Connect to CarbonCredit contract
      console.log("Connecting to CarbonCredit contract...");
      const carbonCreditContract = new ethers.Contract(
        contractAddr,
        CARBON_CREDIT_ABI,
        adminWallet
      );

      // Verify contract connection
      try {
        const contractOwner = await carbonCreditContract.owner();
        console.log(`Contract owner: ${contractOwner}`);

        if (contractOwner.toLowerCase() !== adminWallet.address.toLowerCase()) {
          throw new Error(
            `Admin wallet ${adminWallet.address} is not the contract owner ${contractOwner}`
          );
        }
      } catch (error) {
        throw new Error(`Failed to connect to contract: ${error.message}`);
      }

      // Register company in the contract
      console.log("Registering company in contract...");
      try {
        const registerTx = await carbonCreditContract.registerCompany(
          companyAddress
        );
        await registerTx.wait();
        console.log(`Company registered with tx: ${registerTx.hash}`);
      } catch (error) {
        console.log(`Company registration failed: ${error.message}`);
        // Continue if already registered
      }

      // Send ETH to company wallet
      console.log("Preparing transaction to fund company wallet...");
      const txRequest = {
        to: companyAddress,
        value: requiredAmount,
        gasLimit: 21000,
      };

      // Send transaction
      console.log("Sending funding transaction...");
      const tx = await adminWallet.sendTransaction(txRequest);
      console.log(`Funding transaction sent: ${tx.hash}`);

      // Wait for confirmation
      console.log("Waiting for transaction confirmation...");
      const receipt = await tx.wait(1);

      if (!receipt) {
        throw new Error("Transaction receipt not received");
      }

      if (receipt.status !== 1) {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }

      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Verify company wallet received funds
      const companyBalance = await provider.getBalance(companyAddress);
      if (companyBalance < requiredAmount) {
        throw new Error("Company wallet funding verification failed");
      }

      console.log(
        `Company wallet funded successfully: ${ethers.formatEther(
          companyBalance
        )} ETH`
      );

      // Mint initial carbon credits to the company
      console.log("Minting initial carbon credits...");
      const initialMintAmount = ethers.parseUnits(cap.toString(), 18); // Convert cap to token amount

      try {
        const mintTx = await carbonCreditContract.mint(
          companyAddress,
          initialMintAmount
        );
        await mintTx.wait();
        console.log(`Minted ${cap} CC tokens to company. Tx: ${mintTx.hash}`);
      } catch (error) {
        console.log(`Minting failed: ${error.message}`);
        // Continue without minting if there's an issue
      }

      // Get company's carbon credit balance
      const ccBalance = await carbonCreditContract.balanceOf(companyAddress);
      console.log(
        `Company CC balance: ${ethers.formatUnits(ccBalance, 18)} tokens`
      );

      // Update Firestore document
      console.log("Updating company document in Firestore...");
      const updateData = {
        status: "approved",
        wallet: companyAddress,
        funded: true,
        cap: cap,
        privateKey: companyPrivateKey, // TODO: Move to secure vault in production
        approvedAt: new Date(),
        fundingTxHash: tx.hash,
        fundingBlockNumber: receipt.blockNumber,
        contractAddress: contractAddr,
        carbonCreditBalance: ethers.formatUnits(ccBalance, 18),
        registrationStatus: "approved", // For consistency with existing frontend
      };

      await companyRef.update(updateData);
      console.log("Company document updated successfully");

      // Return success response
      res.status(200).json({
        success: true,
        wallet: companyAddress,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        contractAddress: contractAddr,
        carbonCreditBalance: ethers.formatUnits(ccBalance, 18),
        message: "Company approved and funded successfully",
      });
    } catch (error) {
      console.error("Error in approveCompany function:", error);

      // Return error response
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);
