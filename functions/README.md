# Firebase Functions Configuration

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

Set the following Firebase Functions parameters:

```bash
firebase functions:config:set eth.admin_private_key="YOUR_ADMIN_PRIVATE_KEY"
firebase functions:config:set eth.rpc_url="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
```

### 3. Deploy Functions

```bash
firebase deploy --only functions
```

## Environment Variables Required

- `ETH_ADMIN_PRIVATE_KEY`: Private key of admin wallet (must have test ETH)
- `ETH_RPC_URL`: Sepolia testnet RPC URL (Infura/Alchemy/etc.)

## Security Notes

⚠️ **IMPORTANT**: The company private keys are temporarily stored in Firestore. In production, move them to:

- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- Hardware Security Module (HSM)

## Testing

Use Firebase Functions emulator for local testing:

```bash
cd functions
npm run serve
```

## API Usage

POST `/approveCompany`

```json
{
  "companyId": "company123",
  "cap": 10000
}
```

Response:

```json
{
  "success": true,
  "wallet": "0x...",
  "txHash": "0x...",
  "blockNumber": 123456
}
```
