// Backend Compliance Service
// This service runs independently and cannot be controlled by companies
// Only admin can manage this service

import NodeScheduler from "../src/node-scheduler.js";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
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

class ComplianceBackendService {
  constructor() {
    this.scheduler = new NodeScheduler();
    this.serviceId = "compliance-backend-001";
    this.startTime = new Date();
    this.isHealthy = true;
    this.lastHealthCheck = new Date();
    this.companiesMonitored = 0;
  }

  // Register service status in Firebase (admin can monitor this)
  async registerServiceStatus() {
    try {
      const serviceRef = doc(db, "system_services", this.serviceId);
      await setDoc(serviceRef, {
        serviceName: "Compliance Monitoring Service",
        status: "RUNNING",
        startTime: this.startTime,
        lastHealthCheck: this.lastHealthCheck,
        companiesMonitored: this.companiesMonitored,
        version: "1.0.0",
        description:
          "Automated compliance monitoring for all approved companies",
        canBeControlledByCompanies: false,
        adminOnly: true,
      });

      console.log("📋 Service status registered in Firebase");
    } catch (error) {
      console.error("❌ Failed to register service status:", error);
    }
  }

  // Update health check
  async updateHealthCheck() {
    try {
      this.lastHealthCheck = new Date();
      const serviceRef = doc(db, "system_services", this.serviceId);
      await setDoc(
        serviceRef,
        {
          lastHealthCheck: this.lastHealthCheck,
          status: this.isHealthy ? "RUNNING" : "ERROR",
          companiesMonitored: this.companiesMonitored,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("❌ Health check update failed:", error);
      this.isHealthy = false;
    }
  }

  // Load all approved companies automatically
  async loadApprovedCompanies() {
    try {
      console.log("🔍 Loading all approved companies...");
      const companiesRef = collection(db, "companies");
      const approvedQuery = query(
        companiesRef,
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(approvedQuery);

      this.companiesMonitored = 0;
      querySnapshot.forEach((doc) => {
        const companyData = doc.data();
        this.scheduler.registerCompany(doc.id);
        this.companiesMonitored++;
        console.log(
          `✅ Monitoring: ${companyData.name || doc.id} (${companyData.email})`
        );
      });

      console.log(
        `📊 Total companies under compliance monitoring: ${this.companiesMonitored}`
      );

      // Update service status
      await this.registerServiceStatus();

      return this.companiesMonitored;
    } catch (error) {
      console.error("❌ Failed to load companies:", error);
      this.isHealthy = false;
      return 0;
    }
  }

  // Start the backend service
  async start() {
    try {
      console.log("🚀 STARTING COMPLIANCE BACKEND SERVICE");
      console.log("=====================================");
      console.log("🏛️  This is a BACKEND SERVICE");
      console.log("🔒 Companies CANNOT start/stop this service");
      console.log("👤 Only admin can control this service");
      console.log("⚡ Runs automatically 24/7");
      console.log("");

      // Load companies
      const companiesLoaded = await this.loadApprovedCompanies();

      if (companiesLoaded === 0) {
        console.log("⚠️  No approved companies found.");
        console.log(
          "💡 Service will continue running and auto-detect new approvals"
        );
      }

      // Start the scheduler
      console.log("\n🕐 STARTING AUTOMATED COMPLIANCE SCHEDULER...");
      await this.scheduler.start();

      // Start health monitoring
      this.startHealthMonitoring();

      // Auto-reload companies every hour
      this.startCompanyReloader();

      console.log("\n✅ BACKEND COMPLIANCE SERVICE IS RUNNING");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔄 Compliance checks: Every 5 minutes by clock");
      console.log("🏢 Companies monitored: Auto-detected from Firebase");
      console.log("💻 Service health: Monitored and logged");
      console.log("🔒 Control level: ADMIN ONLY");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n📊 Service running in production mode");
      console.log("⚠️  DO NOT STOP unless you are an admin");
      console.log("🆔 Service ID:", this.serviceId);
    } catch (error) {
      console.error("❌ Failed to start backend service:", error);
      this.isHealthy = false;
      process.exit(1);
    }
  }

  // Start health monitoring (every 30 seconds)
  startHealthMonitoring() {
    setInterval(async () => {
      await this.updateHealthCheck();

      // Log health status every 5 minutes
      const now = new Date();
      if (now.getMinutes() % 5 === 0 && now.getSeconds() < 30) {
        console.log(
          `💚 Health Check: ${now.toLocaleTimeString()} - Service healthy, monitoring ${
            this.companiesMonitored
          } companies`
        );
      }
    }, 30000);
  }

  // Auto-reload companies every hour
  startCompanyReloader() {
    setInterval(async () => {
      console.log("\n🔄 Auto-reloading approved companies...");
      const previousCount = this.companiesMonitored;
      await this.loadApprovedCompanies();

      if (this.companiesMonitored !== previousCount) {
        console.log(
          `📈 Companies monitoring changed: ${previousCount} → ${this.companiesMonitored}`
        );
      } else {
        console.log(
          `✅ Companies monitoring unchanged: ${this.companiesMonitored}`
        );
      }
    }, 60 * 60 * 1000); // Every hour
  }

  // Graceful shutdown (admin only)
  async shutdown(reason = "Manual shutdown") {
    try {
      console.log(`\n🛑 SHUTTING DOWN COMPLIANCE SERVICE`);
      console.log(`📋 Reason: ${reason}`);

      // Update service status
      const serviceRef = doc(db, "system_services", this.serviceId);
      await setDoc(
        serviceRef,
        {
          status: "STOPPED",
          shutdownTime: new Date(),
          shutdownReason: reason,
        },
        { merge: true }
      );

      // Stop scheduler
      this.scheduler.stop();

      console.log("✅ Service stopped successfully");
      console.log(
        "⚠️  Companies are no longer under automated compliance monitoring"
      );

      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  }
}

// Start the backend service
async function startBackendService() {
  const service = new ComplianceBackendService();

  // Handle graceful shutdown (admin only)
  process.on("SIGINT", async () => {
    await service.shutdown("SIGINT received (Ctrl+C)");
  });

  process.on("SIGTERM", async () => {
    await service.shutdown("SIGTERM received");
  });

  // Start the service
  await service.start();
}

startBackendService();
