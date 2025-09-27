// Contract deployment configuration
export const CONTRACT_CONFIG = {
  // CarbonCredit contract address on localhost
  CARBON_CREDIT_ADDRESS: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",

  // Network configuration
  NETWORK: {
    NAME: "localhost",
    RPC_URL: "http://127.0.0.1:8545",
    CHAIN_ID: 31337,
  },

  // Admin account (first account from Hardhat node)
  ADMIN_ACCOUNT: {
    ADDRESS: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    PRIVATE_KEY:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },

  // Token configuration
  TOKEN: {
    SYMBOL: "CC",
    NAME: "CarbonCredit",
    CAP_PER_COMPANY: "10000",
    INITIAL_MINT_AMOUNT: "1000",
  },
};
