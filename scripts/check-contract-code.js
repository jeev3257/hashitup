import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
const RPC_URL = "http://127.0.0.1:8545";

async function checkContractCode() {
  try {
    console.log("🔍 Checking deployed contract code...");

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Get the deployed bytecode
    const deployedCode = await provider.getCode(CONTRACT_ADDRESS);
    console.log(`📄 Contract has deployed code: ${deployedCode.length > 2}`);
    console.log(`📏 Bytecode length: ${deployedCode.length} chars`);

    // Check if specific function selectors exist in the bytecode
    const mintForComplianceSelector = "0x3e7817a5"; // Function selector for mintForCompliance(address,uint256,uint256,uint256)
    const deductForOverageSelector = "0x1b12e410"; // Function selector for deductForOverage(address,uint256,uint256,uint256)

    console.log(`\n🔍 Checking function selectors in bytecode:`);
    console.log(
      `  mintForCompliance (${mintForComplianceSelector}): ${deployedCode.includes(
        mintForComplianceSelector.slice(2)
      )}`
    );
    console.log(
      `  deductForOverage (${deductForOverageSelector}): ${deployedCode.includes(
        deductForOverageSelector.slice(2)
      )}`
    );

    // Let's also check what functions the contract actually supports
    const basicABI = [
      "function name() external view returns (string)",
      "function symbol() external view returns (string)",
      "function owner() external view returns (address)",
      "function balanceOf(address) external view returns (uint256)",
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, basicABI, provider);

    console.log(`\n📋 Basic contract info:`);
    console.log(`  Name: ${await contract.name()}`);
    console.log(`  Symbol: ${await contract.symbol()}`);
    console.log(`  Owner: ${await contract.owner()}`);

    // Try to call mintForCompliance with the raw function selector
    console.log(`\n🧪 Testing raw function call...`);

    const ownerSigner = await provider.getSigner(0);
    const companyAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    // Encode the function call manually
    const abiCoder = new ethers.AbiCoder();
    const encodedParams = abiCoder.encode(
      ["address", "uint256", "uint256", "uint256"],
      [
        companyAddress,
        ethers.parseEther("1"),
        ethers.parseEther("1"),
        ethers.parseEther("2"),
      ]
    );

    const callData = mintForComplianceSelector + encodedParams.slice(2);
    console.log(`📞 Call data: ${callData}`);

    try {
      const result = await provider.call({
        to: CONTRACT_ADDRESS,
        data: callData,
        from: await ownerSigner.getAddress(),
      });
      console.log(`✅ Raw call succeeded: ${result}`);
    } catch (rawError) {
      console.error(`❌ Raw call failed: ${rawError.message}`);
    }
  } catch (error) {
    console.error("❌ Code check failed:", error.message);
  }
}

checkContractCode();
