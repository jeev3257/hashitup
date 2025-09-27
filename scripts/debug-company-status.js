import { ethers } from 'ethers';
import CONTRACT_ABI from '../src/CarbonCredit-ABI.json' with { type: 'json' };

const CONTRACT_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const RPC_URL = 'http://127.0.0.1:8545';

async function debugCompanyStatus() {
  try {
    console.log('🔍 Debugging company status and contract state...');
    
    // Connect to provider and get owner signer
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const ownerSigner = await provider.getSigner(0);
    const ownerAddress = await ownerSigner.getAddress();
    
    console.log(`👤 Owner account: ${ownerAddress}`);
    
    // Connect to contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ownerSigner);
    
    // Test company address
    const companyAccount = await provider.getSigner(1);
    const companyAddress = await companyAccount.getAddress();
    console.log(`🏢 Company address: ${companyAddress}`);
    
    // Get detailed company info
    console.log('\n📊 Company Status:');
    const isRegistered = await contract.isRegisteredCompany(companyAddress);
    console.log(`  Registered: ${isRegistered}`);
    
    const balance = await contract.balanceOf(companyAddress);
    console.log(`  Balance: ${ethers.formatEther(balance)} CCT`);
    
    const capPerCompany = await contract.capPerCompany();
    console.log(`  Cap per company: ${ethers.formatEther(capPerCompany)} CCT`);
    
    const mintedPerCompany = await contract.mintedPerCompany(companyAddress);
    console.log(`  Already minted: ${ethers.formatEther(mintedPerCompany)} CCT`);
    
    const remainingCap = await contract.getRemainingCap(companyAddress);
    console.log(`  Remaining cap: ${ethers.formatEther(remainingCap)} CCT`);
    
    // Test the canMintNow function
    const [canMint, timeUntilNext] = await contract.canMintNow(companyAddress);
    console.log(`  Can mint now: ${canMint}`);
    console.log(`  Time until next mint: ${timeUntilNext} seconds`);
    
    // Try a very small mint amount that should definitely work
    console.log('\n🧪 Testing with minimal values...');
    const testMintAmount = ethers.parseEther('1'); // 1 CCT
    const testEmissionValue = ethers.parseEther('1'); // 1 emission unit
    const testEmissionCap = ethers.parseEther('2'); // 2 emission cap (clearly under)
    
    console.log(`📊 Test Parameters:`);
    console.log(`  Amount: ${ethers.formatEther(testMintAmount)} CCT`);
    console.log(`  Emission Value: ${ethers.formatEther(testEmissionValue)}`);
    console.log(`  Emission Cap: ${ethers.formatEther(testEmissionCap)}`);
    console.log(`  Under cap? ${testEmissionValue < testEmissionCap}`);
    
    // Check each requirement manually
    console.log('\n🔍 Checking requirements:');
    console.log(`  1. Company != 0x0: ${companyAddress !== ethers.ZeroAddress}`);
    console.log(`  2. Amount > 0: ${testMintAmount > 0n}`);
    console.log(`  3. Company registered: ${isRegistered}`);
    console.log(`  4. Emission < Cap: ${testEmissionValue < testEmissionCap}`);
    
    // Try the function call
    try {
      console.log('\n🚀 Attempting mintForCompliance...');
      const tx = await contract.mintForCompliance(
        companyAddress,
        testMintAmount,
        testEmissionValue,
        testEmissionCap
      );
      
      const receipt = await tx.wait();
      console.log(`✅ SUCCESS! Tx: ${receipt.hash}`);
      
    } catch (error) {
      console.error('❌ Failed:', error.message);
      
      // Let's try to decode the revert reason
      if (error.data && error.data !== '0x') {
        try {
          const decoded = ethers.toUtf8String(error.data);
          console.error('   Decoded reason:', decoded);
        } catch (decodeError) {
          console.error('   Could not decode error data:', error.data);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugCompanyStatus();