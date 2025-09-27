# Backend Compliance Service Documentation

## 🏛️ Overview

The Backend Compliance Service is an automated, backend-only system that monitors all approved companies for emission compliance. This service runs independently and **cannot** be controlled by companies - only system administrators have control.

## 🔒 Security Model

- **Backend Only**: Runs as a separate Node.js process
- **Admin Only Control**: Companies cannot start/stop the service
- **24/7 Operation**: Runs continuously without company intervention
- **System Service**: Registered in Firebase as a system service

## ⏰ How It Works

### Automated Monitoring

- **Clock-Based Timing**: Runs exactly at 5-minute intervals (e.g., 3:05, 3:10, 3:15)
- **Auto-Discovery**: Automatically detects approved companies from Firebase
- **Real-Time Processing**: Executes smart contracts in real-time
- **Dual Updates**: Updates both blockchain and Firebase simultaneously

### Compliance Process

1. **Every 5 Minutes by Clock**:

   - Service checks all approved companies
   - Compares current emissions vs emission caps
   - Executes appropriate smart contract functions

2. **Under Cap (Compliant)**:

   - Mints carbon credits automatically
   - Credits = (Emission Cap - Current Emission)
   - Updates balance on blockchain and Firebase

3. **Over Cap (Non-Compliant)**:

   - Deducts credits from company wallet
   - Credits deducted = (Current Emission - Emission Cap)
   - If insufficient credits: flags company + starts 2-minute buy timer

4. **Exactly at Cap**:
   - No action taken (perfect compliance)

## 🚀 Starting the Service

### Production Start

```bash
node scripts/backend-compliance-service.js
```

### Service Features

- Auto-loads approved companies every hour
- Health monitoring every 30 seconds
- Service status logged to Firebase
- Graceful shutdown handling
- Error recovery and logging

## 📊 Monitoring

### Firebase Collections Used

- `system_services`: Service status and health
- `companies`: Company data and approval status
- `emissions`: Latest emission data
- `emission_caps`: Admin-set emission limits
- `blockchain_transactions`: All compliance transactions
- `compliance_flags`: Non-compliant companies
- `buy_credit_timers`: Purchase countdown timers

### Service Status

The service registers its status in Firebase:

```javascript
{
  serviceName: 'Compliance Monitoring Service',
  status: 'RUNNING', // 'RUNNING', 'STOPPED', 'ERROR'
  startTime: Date,
  lastHealthCheck: Date,
  companiesMonitored: Number,
  version: '1.0.0',
  canBeControlledByCompanies: false,
  adminOnly: true
}
```

## 🔧 Administration

### Admin Controls

- **Service Status**: View in admin dashboard
- **Start/Stop**: Only via server access (not through UI)
- **Monitoring**: Real-time health checks
- **Company Management**: Approve/disapprove companies

### Company View

Companies see a **read-only** status display showing:

- Service is running (green status)
- They are being monitored
- 24/7 automated compliance
- No control buttons (admin-only service)

## 🛡️ Why Backend-Only?

### Security Benefits

1. **Tamper-Proof**: Companies cannot disable compliance monitoring
2. **Reliable**: Runs independently of company dashboards
3. **Centralized**: Single service monitors all companies
4. **Auditable**: Complete transaction history

### Compliance Benefits

1. **Continuous**: Never stops monitoring
2. **Fair**: Same rules applied to all companies
3. **Transparent**: All actions logged and visible
4. **Automatic**: No manual intervention required

## 🔄 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Backend       │    │    Blockchain    │    │    Firebase     │
│   Service       │◄──►│   Smart Contract │◄──►│   Database      │
│   (Node.js)     │    │   (0x9A9f...)    │    │   (Firestore)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin         │    │   Credit Minting │    │   Transaction   │
│   Dashboard     │    │   Credit Deduct  │    │   Logging       │
│   (View Only)   │    │   Company Flag   │    │   Status Track  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📈 Benefits

### For Companies

- ✅ Automatic compliance monitoring
- ✅ Real-time credit allocation
- ✅ Transparent transaction history
- ✅ No manual intervention needed
- ✅ Fair and consistent enforcement

### For Administrators

- ✅ Centralized control
- ✅ Complete audit trail
- ✅ Health monitoring
- ✅ Tamper-proof operation
- ✅ Scalable to any number of companies

### For the System

- ✅ 24/7 reliability
- ✅ Blockchain integration
- ✅ Real-time execution
- ✅ Error handling and recovery
- ✅ Complete automation

## 🚨 Important Notes

1. **Never Stop the Service**: This would disable compliance monitoring for ALL companies
2. **Admin Only**: Only system administrators should manage this service
3. **Production Service**: This is a critical production system
4. **Blockchain Dependent**: Requires active blockchain connection
5. **Firebase Dependent**: Requires Firebase connectivity for data

## 📞 Support

If the service stops working:

1. Check blockchain connection (http://127.0.0.1:8545)
2. Check Firebase connectivity
3. Review service logs
4. Restart service if necessary
5. Contact system administrator

---

**Service ID**: `compliance-backend-001`
**Version**: `1.0.0`
**Type**: `Backend Production Service`
**Control Level**: `Admin Only`
