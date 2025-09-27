# 🚀 Complete Carbon Credit System Setup Guide

## 📋 System Overview

This is a full-stack Carbon Credit management system with:

- **Frontend**: React app with Firebase integration
- **Backend**: Firebase Cloud Functions
- **Blockchain**: Hardhat local blockchain with ERC-20 token
- **Database**: Firebase Firestore

## 🛠 Prerequisites

- Node.js 18+ installed
- Git installed
- Firebase CLI installed (`npm install -g firebase-tools`)

## 📁 Project Structure

```
/Users/jeevansmac/Desktop/hashit/
├── src/                     # React frontend
├── functions/               # Firebase Cloud Functions
├── contracts/               # Solidity smart contracts
├── scripts/                 # Deployment scripts
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Root dependencies
└── .env                     # Environment variables
```

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
cd /Users/jeevansmac/Desktop/hashit

# Install root dependencies (Hardhat + blockchain tools)
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..

# Install frontend dependencies (already done)
```

### Step 2: Start Hardhat Local Blockchain

```bash
# Terminal 1: Start local blockchain
npm run node
```

This will start a local blockchain at `http://127.0.0.1:8545` with pre-funded accounts.

**Important**: Keep this terminal running! It's your local blockchain.

### Step 3: Deploy Smart Contract

```bash
# Terminal 2: Deploy the CarbonCredit contract
npm run deploy
```

This will:

- Deploy the CarbonCredit ERC-20 token
- Set cap to 10,000 tokens per company
- Save contract address for Firebase Functions
- Create a test company and mint tokens

### Step 4: Configure Firebase Functions

```bash
# Set environment variables for Firebase Functions
firebase functions:config:set \
  eth.admin_private_key="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" \
  eth.rpc_url="http://127.0.0.1:8545" \
  contract.address="DEPLOYED_CONTRACT_ADDRESS_FROM_STEP_3"

# Start Firebase Functions locally
cd functions
npm run serve
```

### Step 5: Start React Frontend

```bash
# Terminal 4: Start React app
npm run dev
```

## 🎯 Testing the Complete System

### 1. Register a Company

1. Go to `http://localhost:5176/`
2. Click "Get Started" → Sign up with email/password
3. Fill out company details form
4. Submit → Status shows "Pending Verification"

### 2. Admin Approval (Blockchain Integration)

1. Click "Admin" → Login with `admin@gmail.com` / `123456`
2. See pending company in dashboard
3. Click "Review Details"
4. Set carbon emission cap (e.g., 5000)
5. Click "Approve Company"

**What happens**:

- Cloud Function creates Ethereum wallet
- Sends 1 ETH to company wallet
- Registers company in smart contract
- Mints carbon credits to company
- Updates Firestore with blockchain data

### 3. Verify Blockchain Integration

Check the Firebase Functions logs to see:

```
Company wallet created: 0x...
Funding transaction sent: 0x...
Company registered with tx: 0x...
Minted 5000 CC tokens to company
```

## 🔧 Development Commands

```bash
# Blockchain commands
npm run node          # Start local blockchain
npm run compile       # Compile contracts
npm run deploy        # Deploy to local blockchain
npm run test          # Run contract tests
npm run clean         # Clean artifacts

# Frontend commands
npm run dev           # Start React app
npm run build         # Build for production

# Firebase commands
cd functions
npm run serve         # Start Functions locally
npm run deploy        # Deploy to Firebase
```

## 📊 Smart Contract Features

### CarbonCredit.sol

- **ERC-20 Token**: Standard token with 18 decimals
- **Company Registration**: Admin registers companies
- **Minting with Caps**: Max tokens per company
- **Cooldown Period**: 5-minute restriction (optional)
- **Transfer Support**: Companies can transfer tokens

### Key Functions:

```solidity
registerCompany(address company)      // Register company
mint(address to, uint256 amount)      // Mint tokens (admin only)
getRemainingCap(address company)      // Check remaining cap
getCompanyInfo(address company)       // Get company details
```

## 🌐 Network Information

- **Local Blockchain**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Admin Address**: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- **Admin Balance**: 10,000 ETH (pre-funded)

## 🛡 Security Notes

⚠️ **Development Only**:

- Private keys are hardcoded for local development
- Never use these keys in production
- Company private keys stored in Firestore (move to secure vault in production)

## 🐛 Troubleshooting

### Issue: "Failed to connect to blockchain"

- Ensure `npm run node` is running
- Check `http://127.0.0.1:8545` is accessible

### Issue: "Contract address not configured"

- Run `npm run deploy` first
- Update Firebase config with contract address

### Issue: "Insufficient admin wallet balance"

- Restart `npm run node` to reset balances
- Admin wallet should have 10,000 ETH

### Issue: Firebase Functions timeout

- Functions connecting to local blockchain may take time
- Check Firebase Functions logs for details

## 🎉 Success Indicators

✅ **Blockchain**: `npm run node` shows "Started HTTP and WebSocket JSON-RPC server"

✅ **Contract**: `npm run deploy` shows "Deployment completed successfully!"

✅ **Functions**: Firebase Functions show "approveCompany" in serve output

✅ **Frontend**: Company approval creates wallet and shows blockchain data

✅ **Integration**: Firestore document includes wallet address and transaction hash

## 📈 Next Steps

1. **Production Deployment**: Use real Ethereum network
2. **Security**: Move private keys to secure vaults
3. **Features**: Add carbon credit trading functionality
4. **Monitoring**: Add blockchain event monitoring
5. **Testing**: Add comprehensive test suite

Your Carbon Credit system is now ready for development and testing! 🌱⛓️✨
