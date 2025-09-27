// Test Immutable Blockchain Records System
// This script tests the enhanced smart contract with comprehensive event logging

import NodeScheduler from "../src/node-scheduler.js";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD1HciA35uKQCEQRpwhI54QgwpOeffCfZQ",
  authDomain: "hashitup-5bb9b.firebaseapp.com",
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.firebasestorage.app",
  messagingSenderId: "620690168173",
  appId: "1:620690168173:web:8b3306843fdb65f99ae264",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testImmutableRecords() {
  try {
    console.log("🧪 TESTING IMMUTABLE BLOCKCHAIN RECORD SYSTEM");
    console.log("==============================================");

    const scheduler = new NodeScheduler();

    // Initialize blockchain
    console.log("🔗 Initializing blockchain connection...");
    await scheduler.initializeBlockchain();

    // Create test company in Firebase
    const testCompanyId = "test-company-immutable-001";
    const testWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    console.log(`🏢 Creating test company: ${testCompanyId}`);
    const companyRef = doc(db, "companies", testCompanyId);
    await setDoc(companyRef, {
      name: "Test Company for Immutable Records",
      email: "test@immutable.com",
      status: "approved",
      walletAddress: testWallet,
      creditBalance: 500,
      approvedAt: new Date(),
      createdAt: new Date(),
    });

    // Set emission cap
    const capRef = doc(db, "emission_caps", testCompanyId);
    await setDoc(capRef, {
      cap: 100,
      setBy: "admin",
      setAt: new Date(),
    });

    // Add emission data (under cap scenario)
    const emissionsRef = collection(db, "emissions");
    await addDoc(emissionsRef, {
      companyId: testCompanyId,
      emissionValue: 75, // Under cap of 100
      timestamp: new Date(),
      source: "automated_test",
    });

    console.log("📊 Test data created:");
    console.log(`   Company: ${testCompanyId}`);
    console.log(`   Wallet: ${testWallet}`);
    console.log(`   Emission: 75 tons (under cap of 100)`);
    console.log(`   Expected: Mint 25 credits`);

    // Register company with scheduler
    scheduler.registerCompany(testCompanyId);

    // Run compliance check
    console.log("\n⚡ Running compliance check...");
    await scheduler.runComplianceCheck(testCompanyId);

    console.log("\n✅ Test completed!");
    console.log("📋 Check the following to verify immutable records:");
    console.log('   1. Firebase "immutable_blockchain_records" collection');
    console.log("   2. Blockchain transaction on the network");
    console.log("   3. Company dashboard Smart Contract Activity section");

    // Wait a moment then run another test with over-cap scenario
    console.log("\n🔄 Running second test - over cap scenario...");

    // Add emission data (over cap scenario)
    await addDoc(emissionsRef, {
      companyId: testCompanyId,
      emissionValue: 120, // Over cap of 100
      timestamp: new Date(),
      source: "automated_test",
    });

    console.log("📊 Second test data:");
    console.log(`   Emission: 120 tons (over cap of 100)`);
    console.log(`   Expected: Deduct 20 credits or flag if insufficient`);

    // Run second compliance check
    await scheduler.runComplianceCheck(testCompanyId);

    console.log("\n🎉 ALL TESTS COMPLETED!");
    console.log("🔒 Immutable blockchain records have been created");
    console.log("📱 Check your dashboard to see real transaction activity");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testImmutableRecords();
