# 🚀 Firebase Cloud Functions Deployment Guide

## 📋 What You Need to Do Next

### 1. **Set Up Your Ethereum Wallet**

```bash
# You need a wallet with Sepolia testnet ETH for funding company wallets
# Get testnet ETH from: https://sepoliafaucet.com/
```

### 2. **Get Infura/Alchemy RPC URL**

```bash
# Go to https://infura.io/ or https://alchemy.com/
# Create a project and get your Sepolia testnet RPC URL
# Format: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### 3. **Deploy Firebase Functions**

```bash
cd /Users/jeevansmac/Desktop/hashit

# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project (if not done)
firebase use hashitup-5bb9b

# Set environment variables
firebase functions:config:set eth.admin_private_key="YOUR_PRIVATE_KEY_HERE"
firebase functions:config:set eth.rpc_url="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"

# Build and deploy functions
cd functions
npm run build
firebase deploy --only functions
```

### 4. **Update Frontend Configuration**

The `approveCompany` function in `firebase.js` is already configured to call:

```
https://us-central1-hashitup-5bb9b.cloudfunctions.net/approveCompany
```

### 5. **Test the Integration**

1. **Register a company** through your app
2. **Login as admin** (admin@gmail.com / 123456)
3. **Approve a company** with carbon emission cap
4. **Check Firestore** - company should have:
   - `status: "approved"`
   - `wallet: "0x..."`
   - `funded: true`
   - `cap: <your_value>`
   - `txHash: "0x..."`

## 🔒 Security Configuration Required

### Environment Variables Needed:

- `ETH_ADMIN_PRIVATE_KEY`: Your admin wallet private key (must have Sepolia ETH)
- `ETH_RPC_URL`: Sepolia testnet RPC endpoint

### Get Your Private Key:

```bash
# If you have MetaMask, go to Account Details → Export Private Key
# Or create a new wallet: https://vanity-eth.tk/
```

### Get Sepolia Testnet ETH:

```bash
# Faucets for test ETH:
# - https://sepoliafaucet.com/
# - https://faucet.sepolia.dev/
# - https://sepolia-faucet.pk910.de/
```

## ⚡ What Happens When Admin Approves:

1. **Cloud Function Triggered** → `approveCompany(companyId, cap)`
2. **Creates Company Wallet** → New Ethereum address generated
3. **Funds Wallet** → Sends 0.1 ETH from admin to company wallet
4. **Updates Database** → Stores wallet address, funding status, carbon cap
5. **Returns Success** → Frontend gets wallet address and transaction hash

## 🛠 Troubleshooting

### Function Deployment Issues:

```bash
# Check functions logs
firebase functions:log

# Test locally
cd functions
npm run serve
```

### Blockchain Issues:

- Ensure admin wallet has sufficient Sepolia ETH
- Check RPC URL is working
- Verify private key format (should start with 0x)

### Database Issues:

- Check Firestore rules allow admin operations
- Verify company document exists before approval

## 📱 Ready to Test!

Once deployed, your app will have **full blockchain integration**:

- ✅ Company registration with Firestore
- ✅ Admin approval with Ethereum wallet creation
- ✅ Automatic funding of company wallets
- ✅ Carbon emission cap management
- ✅ Transaction tracking and verification

The system is production-ready except for the security note about moving private keys to a secure vault! 🌱✨
