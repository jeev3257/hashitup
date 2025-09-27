import { ethers } from 'ethers';
import CONTRACT_ABI from '../src/CarbonCredit-ABI.json' with { type: 'json' };

const NEW_CONTRACT_ADDRESS = "0x809d550fca64d94Bd9F66E60752A544199cfAC3D";
const RPC_URL = 'http://127.0.0.1:8545';

async function testNewContract() {
  try {
    console.log('🧪 Testing compliance functions with newly deployed contract...');
    
    // Connect to provider and get owner signer
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const ownerSigner = await provider.getSigner(0);
    const ownerAddress = await ownerSigner.getAddress();
    
    console.log(`👤 Using owner account: ${ownerAddress}`);
    console.log(`📍 New contract address: ${NEW_CONTRACT_ADDRESS}`);
    
    // Connect to contract with full ABI and owner signer
    const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, ownerSigner);
    
    // Verify contract info
    const name = await contract.name();
    const symbol = await contract.symbol();
    const owner = await contract.owner();
    console.log(`📄 Contract: ${name} (${symbol}), Owner: ${owner}`);
    
    // Test company address (use Account 1)
    const companyAccount = await provider.getSigner(1);
    const companyAddress = await companyAccount.getAddress();
    console.log(`🏢 Test company address: ${companyAddress}`);
    
    // Check if company is registered (should be from deployment script)
    const isRegistered = await contract.isRegisteredCompany(companyAddress);
    console.log(`📋 Company registered: ${isRegistered}`);
    
    // Check initial balance
    const initialBalance = await contract.balanceOf(companyAddress);
    console.log(`💰 Company initial balance: ${ethers.formatEther(initialBalance)} CCT`);
    
    // Test compliance function - mintForCompliance
    console.log('\n🧪 Testing mintForCompliance...');
    const mintAmount = ethers.parseEther('50'); // 50 CCT
    const emissionValue = ethers.parseEther('80'); // 80 emission units (under cap)
    const emissionCap = ethers.parseEther('100'); // 100 emission cap
    
    console.log(`📊 Parameters:`);
    console.log(`  Amount: ${ethers.formatEther(mintAmount)} CCT`);
    console.log(`  Emission Value: ${ethers.formatEther(emissionValue)}`);
    console.log(`  Emission Cap: ${ethers.formatEther(emissionCap)}`);
    console.log(`  Under cap? ${emissionValue < emissionCap}`);
    
    try {
      const mintTx = await contract.mintForCompliance(
        companyAddress,
        mintAmount,
        emissionValue,
        emissionCap
      );
      
      const receipt = await mintTx.wait();
      console.log(`✅ Mint successful! Tx: ${receipt.hash}`);
      
      // Check new balance
      const newBalance = await contract.balanceOf(companyAddress);
      console.log(`💰 Company new balance: ${ethers.formatEther(newBalance)} CCT`);
      
    } catch (mintError) {
      console.error('❌ Mint failed:', mintError.message);
      return;
    }
    
    // Test compliance function - deductForOverage
    console.log('\n🧪 Testing deductForOverage...');
    const deductAmount = ethers.parseEther('25'); // 25 CCT
    const overageEmissionValue = ethers.parseEther('120'); // 120 emission units (over cap)
    const overageEmissionCap = ethers.parseEther('100'); // 100 emission cap
    
    console.log(`📊 Parameters:`);
    console.log(`  Amount: ${ethers.formatEther(deductAmount)} CCT`);
    console.log(`  Emission Value: ${ethers.formatEther(overageEmissionValue)}`);
    console.log(`  Emission Cap: ${ethers.formatEther(overageEmissionCap)}`);
    console.log(`  Over cap? ${overageEmissionValue > overageEmissionCap}`);
    
    try {
      const deductTx = await contract.deductForOverage(
        companyAddress,
        deductAmount,
        overageEmissionValue,
        overageEmissionCap
      );
      
      const receipt = await deductTx.wait();
      console.log(`✅ Deduct successful! Tx: ${receipt.hash}`);
      
      // Check final balance
      const finalBalance = await contract.balanceOf(companyAddress);
      console.log(`💰 Company final balance: ${ethers.formatEther(finalBalance)} CCT`);
      
    } catch (deductError) {
      console.error('❌ Deduct failed:', deductError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNewContract();