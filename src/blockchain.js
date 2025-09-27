import { ethers } from 'ethers';

// Hardhat local blockchain configuration
const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';
const HARDHAT_CHAIN_ID = 31337;

// Get the deployed contract address and ABI
const CONTRACT_ADDRESS = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";

// Import contract ABI
import CONTRACT_ABI_ARTIFACT from './CarbonCredit-ABI.json' with { type: 'json' };
const CONTRACT_ABI = CONTRACT_ABI_ARTIFACT;

// Carbon Credit Contract ABI (simplified for key functions)
const CARBON_CREDIT_ABI = [
  "function registerCompany(address company) external",
  "function mint(address to, uint256 amount) external", 
  "function balanceOf(address account) external view returns (uint256)",
  "function getRemainingCap(address company) external view returns (uint256)",
  "function getCompanyInfo(address company) external view returns (bool isRegistered, uint256 minted, uint256 remaining, uint256 lastMint)",
  "function capPerCompany() external view returns (uint256)",
  "function mintedPerCompany(address) external view returns (uint256)",
  "function isRegisteredCompany(address) external view returns (bool)",
  "function mintForCompliance(address company, uint256 amount) external",
  "function deductForOverage(address company, uint256 amount) external returns (bool success, bool hasEnoughBalance)",
  "function purchaseCredits(uint256 amount) external payable",
  "function withdraw() external",
  "function getContractBalance() external view returns (uint256)",
  "event CompanyRegistered(address indexed company)",
  "event TokensMinted(address indexed to, uint256 amount, uint256 remainingCap)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.initialized = false;
  }

  async initialize(contractAddress = null) {
    try {
      console.log('🚀 Initializing blockchain service...');
      console.log('🌐 Connecting to Hardhat network:', HARDHAT_RPC_URL);
      
      // Connect to Hardhat local network
      this.provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
      
      // Test the connection
      const network = await this.provider.getNetwork();
      console.log('⛓️  Connected to network:', network.name, 'Chain ID:', network.chainId);
      
      // Use the first account as the admin signer (contract owner)
      this.signer = await this.provider.getSigner(0); // Use first account as admin
      const adminAddress = await this.signer.getAddress();
      console.log('🔑 Admin wallet:', adminAddress);
      
      // Set contract address if provided
      if (contractAddress) {
        CONTRACT_ADDRESS = contractAddress;
      }
      
      console.log('📍 Using contract address:', CONTRACT_ADDRESS);
      
      if (CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
        
        // Test contract connection
        try {
          const tokenName = await this.contract.name();
          const tokenSymbol = await this.contract.symbol();
          console.log('📄 Contract connected successfully:', tokenName, '(' + tokenSymbol + ')');
        } catch (contractError) {
          console.error('❌ Contract test failed:', contractError.message);
          throw new Error(`Contract at ${CONTRACT_ADDRESS} is not accessible: ${contractError.message}`);
        }
      }
      
      this.initialized = true;
      console.log('✅ Blockchain service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      console.error('❌ Error details:', error.message);
      this.initialized = false;
      return false;
    }
  }

  async createCompanyWallet() {
    try {
      // Generate a new wallet
      const wallet = ethers.Wallet.createRandom();
      const companyWallet = wallet.connect(this.provider);
      
      console.log('🏢 Created company wallet:', companyWallet.address);
      
      // Fund the wallet with test ETH (1 ETH)
      const fundingAmount = ethers.parseEther('1.0');
      const tx = await this.signer.sendTransaction({
        to: companyWallet.address,
        value: fundingAmount
      });
      
      await tx.wait();
      console.log('💰 Funded wallet with 1 ETH, tx:', tx.hash);
      
      return {
        address: companyWallet.address,
        privateKey: wallet.privateKey,
        fundingTx: tx.hash,
        balance: '1.0'
      };
    } catch (error) {
      console.error('❌ Failed to create company wallet:', error);
      throw error;
    }
  }

  async registerCompanyOnChain(companyAddress) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      console.log('📝 Registering company on blockchain:', companyAddress);
      
      const tx = await this.contract.registerCompany(companyAddress);
      const receipt = await tx.wait();
      
      console.log('✅ Company registered on blockchain, tx:', tx.hash);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Failed to register company on blockchain:', error);
      throw error;
    }
  }

  async mintInitialTokens(companyAddress, amount = '1000') {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      const mintAmount = ethers.parseUnits(amount, 18);
      console.log('🪙 Minting', amount, 'CC tokens for:', companyAddress);
      
      const tx = await this.contract.mint(companyAddress, mintAmount);
      const receipt = await tx.wait();
      
      console.log('✅ Tokens minted, tx:', tx.hash);
      
      return {
        success: true,
        txHash: tx.hash,
        amount: amount,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Failed to mint tokens:', error);
      throw error;
    }
  }

  async getCompanyInfo(companyAddress) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      const info = await this.contract.getCompanyInfo(companyAddress);
      const balance = await this.contract.balanceOf(companyAddress);
      
      return {
        isRegistered: info[0],
        minted: ethers.formatUnits(info[1], 18),
        remaining: ethers.formatUnits(info[2], 18),
        lastMint: Number(info[3]),
        balance: ethers.formatUnits(balance, 18)
      };
    } catch (error) {
      console.error('❌ Failed to get company info:', error);
      throw error;
    }
  }

  async getETHBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get ETH balance:', error);
      return '0';
    }
  }

  // New compliance functions for emission cap management

  async mintCreditsForCompliance(companyAddress, amount, emissionValue, emissionCap) {
    try {
      console.log(`🏆 Minting ${amount} credits for compliant company ${companyAddress}`);
      console.log(`📊 Emission: ${emissionValue}, Cap: ${emissionCap}`);

      const tx = await this.contract.mintForCompliance(
        companyAddress,
        ethers.parseUnits(amount.toString(), 18),
        ethers.parseUnits(emissionValue.toString(), 18),
        ethers.parseUnits(emissionCap.toString(), 18)
      );
      const receipt = await tx.wait();

      console.log(`✅ Credits minted successfully. Transaction: ${receipt.hash}`);
      return { success: true, txHash: receipt.hash, amount };
    } catch (error) {
      console.error('❌ Failed to mint compliance credits:', error);
      return { success: false, error: error.message };
    }
  }

  async deductCreditsForOverage(companyAddress, amount, emissionValue, emissionCap) {
    try {
      console.log(`⚠️ Deducting ${amount} credits from over-cap company ${companyAddress}`);
      console.log(`📊 Emission: ${emissionValue}, Cap: ${emissionCap}`);

      const tx = await this.contract.deductForOverage(
        companyAddress,
        ethers.parseUnits(amount.toString(), 18),
        ethers.parseUnits(emissionValue.toString(), 18),
        ethers.parseUnits(emissionCap.toString(), 18)
      );
      const receipt = await tx.wait();

      console.log(`✅ Credits deducted successfully. Transaction: ${receipt.hash}`);
      return { success: true, txHash: receipt.hash, amount };
    } catch (error) {
      console.error('❌ Failed to deduct overage credits:', error);
      return { success: false, error: error.message };
    }
  }

  async checkCreditBalance(companyAddress) {
    try {
      if (!this.contract) {
        console.error('❌ Contract not initialized');
        return { success: false, balance: 0, error: 'Contract not initialized' };
      }
      
      console.log(`🔍 Checking balance for address: ${companyAddress}`);
      console.log(`📍 Using contract address: ${CONTRACT_ADDRESS}`);
      
      // Try to call balanceOf with better error handling
      try {
        const balance = await this.contract.balanceOf(companyAddress);
        const formattedBalance = ethers.formatEther(balance);
        
        console.log(`💰 Credit balance for ${companyAddress}: ${formattedBalance} CCT`);
        return { success: true, balance: parseFloat(formattedBalance) };
      } catch (contractError) {
        console.warn('⚠️  Contract balanceOf call failed, trying alternative approach...');
        
        // Alternative: Try calling with explicit gas limit
        try {
          const balance = await this.contract.balanceOf(companyAddress, { gasLimit: 100000 });
          const formattedBalance = ethers.formatEther(balance);
          console.log(`💰 Credit balance (alt method): ${formattedBalance} CCT`);
          return { success: true, balance: parseFloat(formattedBalance) };
        } catch (altError) {
          console.warn('⚠️  Alternative contract call also failed, using fallback...');
          
          // Fallback: Return a reasonable default balance
          const fallbackBalance = 0;
          console.log(`💰 Using fallback balance: ${fallbackBalance} CCT`);
          return { 
            success: false, 
            balance: fallbackBalance, 
            error: 'Contract call failed, using fallback',
            contractError: contractError.message
          };
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to check credit balance:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        contractAddress: CONTRACT_ADDRESS,
        companyAddress
      });
      return { success: false, balance: 0, error: error.message };
    }
  }

  async purchaseCredits(companyAddress, creditAmount, ethAmount) {
    try {
      console.log(`💳 Company ${companyAddress} purchasing ${creditAmount} credits for ${ethAmount} ETH`);
      
      // Get a signer for the company address (in production, this would be the company's wallet)
      const companySigner = await this.provider.getSigner(companyAddress);
      const contractWithCompanySigner = this.contract.connect(companySigner);
      
      const tx = await contractWithCompanySigner.purchaseCredits(
        ethers.parseUnits(creditAmount.toString(), 18),
        { value: ethers.parseEther(ethAmount.toString()) }
      );
      
      const receipt = await tx.wait();
      
      console.log(`✅ Credits purchased successfully. Transaction: ${receipt.hash}`);
      return { success: true, txHash: receipt.hash, creditAmount, ethAmount };
    } catch (error) {
      console.error('❌ Failed to purchase credits:', error);
      return { success: false, error: error.message };
    }
  }

  setContractAddress(address) {
    CONTRACT_ADDRESS = address;
    if (this.initialized && this.signer) {
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

// Export utility functions
export const createCompanyWallet = async () => {
  if (!blockchainService.initialized) {
    await blockchainService.initialize();
  }
  return await blockchainService.createCompanyWallet();
};

export const registerAndMintTokens = async (companyAddress, initialTokens = '1000') => {
  if (!blockchainService.initialized) {
    await blockchainService.initialize();
  }
  
  // Register company on blockchain
  const registration = await blockchainService.registerCompanyOnChain(companyAddress);
  
  // Mint initial tokens
  const minting = await blockchainService.mintInitialTokens(companyAddress, initialTokens);
  
  return {
    registration,
    minting
  };
};

export default blockchainService;