// Create Firebase records from blockchain transactions for dashboard display
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ethers } from 'ethers';
import CONTRACT_ABI from '../src/CarbonCredit-ABI.json' with { type: 'json' };

const firebaseConfig = {
  apiKey: "AIzaSyD1HciA35uKQCEQRpwhI54QgwpOeffCfZQ",
  authDomain: "hashitup-5bb9b.firebaseapp.com",
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.firebasestorage.app",
  messagingSenderId: "620690168173",
  appId: "1:620690168173:web:8b3306843fdb65f99ae264",
  measurementId: "G-97PR8NFRRQ"
};

const app = initializeApp(firebaseConfig, 'blockchain-logger');
const db = getFirestore(app);

const CONTRACT_ADDRESS = "0x809d550fca64d94Bd9F66E60752A544199cfAC3D";
const RPC_URL = 'http://127.0.0.1:8545';

// Company address to ID mapping
const COMPANY_MAPPING = {
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': 'green-tech-corp',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC': 'heavy-industry-inc'
};

async function processBlockchainEventsToFirebase() {
  try {
    console.log('🔍 Processing blockchain events to Firebase...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // Get recent blocks (last 20 blocks)
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 20);
    
    console.log(`📦 Checking blocks ${fromBlock} to ${latestBlock}`);
    
    // Get compliance events
    const complianceMintFilter = contract.filters.ComplianceMint();
    const complianceDeductFilter = contract.filters.ComplianceDeduct();
    const complianceCheckFilter = contract.filters.ComplianceCheck();
    
    // Fetch events
    const mintEvents = await contract.queryFilter(complianceMintFilter, fromBlock, latestBlock);
    const deductEvents = await contract.queryFilter(complianceDeductFilter, fromBlock, latestBlock);
    const checkEvents = await contract.queryFilter(complianceCheckFilter, fromBlock, latestBlock);
    
    console.log(`📋 Found events: ${mintEvents.length} mints, ${deductEvents.length} deducts, ${checkEvents.length} checks`);
    
    // Process mint events
    for (const event of mintEvents) {
      const companyAddress = event.args.company.toLowerCase();
      const companyId = COMPANY_MAPPING[companyAddress] || companyAddress;
      const amount = ethers.formatEther(event.args.amount);
      const newBalance = ethers.formatEther(event.args.newBalance);
      
      // Get block timestamp
      const block = await provider.getBlock(event.blockNumber);
      const timestamp = new Date(block.timestamp * 1000);
      
      console.log(`🌱 Processing mint event: ${amount} CCT to ${companyId} at ${timestamp.toLocaleTimeString()}`);
      
      // Add to Firebase blockchain_transactions collection
      await addDoc(collection(db, 'blockchain_transactions'), {
        companyId: companyId,
        type: 'COMPLIANCE_MINT',
        amount: parseFloat(amount),
        timestamp: serverTimestamp(),
        status: 'completed',
        reason: 'Automated compliance check - Under emission cap',
        txHash: event.transactionHash,
        balanceAfter: parseFloat(newBalance),
        eventType: 'ComplianceMint',
        blockNumber: event.blockNumber
      });
      
      // Add to immutable_blockchain_records collection
      await addDoc(collection(db, 'immutable_blockchain_records'), {
        companyId: companyId,
        transactionHash: event.transactionHash,
        eventType: 'ComplianceMint',
        amount: parseFloat(amount),
        timestamp: serverTimestamp(),
        blockNumber: event.blockNumber,
        data: {
          company: companyAddress,
          amount: amount,
          newBalance: newBalance
        }
      });
    }
    
    // Process deduct events
    for (const event of deductEvents) {
      const companyAddress = event.args.company.toLowerCase();
      const companyId = COMPANY_MAPPING[companyAddress] || companyAddress;
      const amount = ethers.formatEther(event.args.amount);
      const newBalance = ethers.formatEther(event.args.newBalance);
      
      // Get block timestamp
      const block = await provider.getBlock(event.blockNumber);
      const timestamp = new Date(block.timestamp * 1000);
      
      console.log(`🚨 Processing deduct event: ${amount} CCT from ${companyId} at ${timestamp.toLocaleTimeString()}`);
      
      // Add to Firebase blockchain_transactions collection
      await addDoc(collection(db, 'blockchain_transactions'), {
        companyId: companyId,
        type: 'COMPLIANCE_DEDUCT',
        amount: parseFloat(amount),
        timestamp: serverTimestamp(),
        status: 'completed',
        reason: 'Automated compliance check - Over emission cap',
        txHash: event.transactionHash,
        balanceAfter: parseFloat(newBalance),
        eventType: 'ComplianceDeduct',
        blockNumber: event.blockNumber
      });
      
      // Add to immutable_blockchain_records collection
      await addDoc(collection(db, 'immutable_blockchain_records'), {
        companyId: companyId,
        transactionHash: event.transactionHash,
        eventType: 'ComplianceDeduct',
        amount: parseFloat(amount),
        timestamp: serverTimestamp(),
        blockNumber: event.blockNumber,
        data: {
          company: companyAddress,
          amount: amount,
          newBalance: newBalance
        }
      });
    }
    
    console.log(`✅ Successfully processed ${mintEvents.length + deductEvents.length} blockchain events to Firebase`);
    console.log('📱 Dashboard should now show the new compliance transactions!');
    
  } catch (error) {
    console.error('❌ Error processing blockchain events:', error.message);
  }
}

processBlockchainEventsToFirebase();