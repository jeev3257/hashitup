require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Hardhat local network
    hardhat: {
      chainId: 31337,
      accounts: {
        // Pre-fund accounts with 10000 ETH each
        accountsBalance: "10000000000000000000000", // 10000 ETH
        count: 10,
      },
    },
    // Localhost network (when running `hardhat node`)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: process.env.ADMIN_PRIVATE_KEY
        ? [process.env.ADMIN_PRIVATE_KEY]
        : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
