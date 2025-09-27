import { ethers } from 'ethers';
import CONTRACT_ABI from '../src/CarbonCredit-ABI.json' with { type: 'json' };

const CONTRACT_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const RPC_URL = 'http://127.0.0.1:8545';

async function testWithFullABI() {
  try {
    console.log('🧪 Testing compliance functions with full contract ABI...');
    
    // Connect to provider and get owner signer
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const ownerSigner = await provider.getSigner(0); // Account 0 is the owner
    const ownerAddress = await ownerSigner.getAddress();
    
    console.log(`👤 Using owner account: ${ownerAddress}`);
    
    // Connect to contract with full ABI and owner signer
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ownerSigner);
    
    // Test company address (use Account 1)
    const companyAccount = await provider.getSigner(1);
    const companyAddress = await companyAccount.getAddress();
    console.log(`🏢 Test company address: ${companyAddress}`);
    
    // Verify contract owner
    const contractOwner = await contract.owner();
    console.log(`📋 Contract owner: ${contractOwner}`);
    console.log(`✅ Are we the owner? ${ownerAddress.toLowerCase() === contractOwner.toLowerCase()}`);
    
    // Check if company is registered
    const isRegistered = await contract.isRegisteredCompany(companyAddress);
    console.log(`📋 Company registered: ${isRegistered}`);
    
    // Check initial balance
    const initialBalance = await contract.balanceOf(companyAddress);
    console.log(`💰 Company initial balance: ${ethers.formatEther(initialBalance)} CCT`);
    
    // Test with smaller values to see if there's a cap issue
    console.log('\n🧪 Testing mintForCompliance with smaller values...');
    const mintAmount = ethers.parseEther('10'); // 10 CCT (smaller amount)
    const emissionValue = ethers.parseEther('8'); // 8 emission units (under cap)  
    const emissionCap = ethers.parseEther('10'); // 10 emission cap
    
    console.log(`📊 Parameters:`);
    console.log(`  Company: ${companyAddress}`);
    console.log(`  Amount: ${ethers.formatEther(mintAmount)} CCT`);
    console.log(`  Emission Value: ${ethers.formatEther(emissionValue)}`);
    console.log(`  Emission Cap: ${ethers.formatEther(emissionCap)}`);
    
    try {
      // Try to get gas estimate first
      console.log('🔍 Estimating gas...');
      const gasEstimate = await contract.mintForCompliance.estimateGas(
        companyAddress,
        mintAmount,
        emissionValue,
        emissionCap
      );
      console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
      
      const mintTx = await contract.mintForCompliance(
        companyAddress,
        mintAmount,
        emissionValue,
        emissionCap,
        { gasLimit: gasEstimate * 2n } // Double the gas estimate
      );
      
      const receipt = await mintTx.wait();
      console.log(`✅ Mint successful! Tx: ${receipt.hash}`);
      
      // Check new balance
      const newBalance = await contract.balanceOf(companyAddress);
      console.log(`💰 Company new balance: ${ethers.formatEther(newBalance)} CCT`);
      
    } catch (mintError) {
      console.error('❌ Mint failed:', mintError.message);
      if (mintError.reason) {
        console.error('   Reason:', mintError.reason);
      }
      
      // Try to decode the error data
      if (mintError.data) {
        console.error('   Error data:', mintError.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithFullABI();