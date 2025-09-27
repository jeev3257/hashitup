// Automated Smart Contract Scheduler
// Runs compliance checks at exact 5-minute intervals by clock time

import {
  processEmissionCompliance,
  logBlockchainTransaction,
  updateCompanyCreditBalance,
} from "./firebase.js";
import blockchainService from "./blockchain.js";

class SmartContractScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.companies = new Set(); // Track registered companies
  }

  // Calculate milliseconds until next 5-minute mark
  getTimeUntilNext5MinuteMark() {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // Find next 5-minute mark (5, 10, 15, 20, etc.)
    const nextMark = Math.ceil(minutes / 5) * 5;
    const targetMinutes = nextMark === 60 ? 0 : nextMark;
    const targetHour = nextMark === 60 ? now.getHours() + 1 : now.getHours();

    const target = new Date();
    target.setHours(targetHour);
    target.setMinutes(targetMinutes);
    target.setSeconds(0);
    target.setMilliseconds(0);

    // If target is in the past (edge case), add 5 minutes
    if (target <= now) {
      target.setMinutes(target.getMinutes() + 5);
    }

    return target.getTime() - now.getTime();
  }

  // Register a company for compliance monitoring
  registerCompany(companyId) {
    this.companies.add(companyId);
    console.log(
      `🏢 Company ${companyId} registered for automated compliance checks`
    );
  }

  // Unregister a company
  unregisterCompany(companyId) {
    this.companies.delete(companyId);
    console.log(`🏢 Company ${companyId} unregistered from compliance checks`);
  }

  // Run compliance check for a specific company
  async runComplianceCheck(companyId) {
    try {
      const timestamp = new Date();
      const timeString = timestamp.toLocaleTimeString();

      console.log(
        `\n⏰ [${timeString}] Running compliance check for company: ${companyId}`
      );
      console.log(
        `🔗 Blockchain contract: ${blockchainService.getContractAddress()}`
      );

      // Initialize blockchain service if needed
      if (!blockchainService.initialized) {
        console.log("🚀 Initializing blockchain service...");
        await blockchainService.initialize();
      }

      // Process emission compliance (this handles the smart contract logic)
      const complianceResult = await processEmissionCompliance(companyId);

      if (complianceResult.success) {
        console.log(`✅ Compliance processed for ${companyId}:`);
        console.log(`   📊 Status: ${complianceResult.status}`);
        console.log(`   💰 Action: ${complianceResult.action}`);

        if (complianceResult.transactionHash) {
          console.log(
            `   🔗 Transaction Hash: ${complianceResult.transactionHash}`
          );
          console.log(
            `   🏦 Balance After: ${complianceResult.balanceAfter} CCT`
          );

          // Log the transaction for activity tracking
          await logBlockchainTransaction(companyId, {
            type:
              complianceResult.action === "MINTED_CREDITS"
                ? "COMPLIANCE_MINT"
                : complianceResult.action === "DEDUCTED_CREDITS"
                ? "COMPLIANCE_DEDUCT"
                : "COMPLIANCE_CHECK",
            amount: complianceResult.amount || 0,
            reason: `Automated compliance check - ${complianceResult.status}`,
            txHash: complianceResult.transactionHash,
            balanceAfter: complianceResult.balanceAfter,
          });

          // Update Firebase balance to match blockchain
          await updateCompanyCreditBalance(
            companyId,
            complianceResult.balanceAfter
          );
        }
      } else {
        console.log(
          `❌ Compliance check failed for ${companyId}: ${complianceResult.error}`
        );
      }
    } catch (error) {
      console.error(`❌ Error in compliance check for ${companyId}:`, error);
    }
  }

  // Run compliance checks for all registered companies
  async runScheduledCompliance() {
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString();

    console.log(`\n🕐 SCHEDULED COMPLIANCE RUN - ${timeString}`);
    console.log(`📋 Companies registered: ${this.companies.size}`);
    console.log(`🔗 Running checks at 5-minute intervals by clock`);

    if (this.companies.size === 0) {
      console.log(`⚠️  No companies registered for compliance monitoring`);
      return;
    }

    // Run compliance for all registered companies
    const promises = Array.from(this.companies).map((companyId) =>
      this.runComplianceCheck(companyId)
    );

    await Promise.all(promises);

    console.log(`✅ Scheduled compliance run completed at ${timeString}`);
    console.log(
      `📊 Next run at: ${new Date(
        Date.now() + 5 * 60 * 1000
      ).toLocaleTimeString()}`
    );
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log("⚠️  Scheduler is already running");
      return;
    }

    this.isRunning = true;

    // Calculate time until next 5-minute mark
    const msUntilNext = this.getTimeUntilNext5MinuteMark();
    const nextTime = new Date(Date.now() + msUntilNext);

    console.log(`\n🚀 STARTING SMART CONTRACT SCHEDULER`);
    console.log(`⏰ Current time: ${new Date().toLocaleTimeString()}`);
    console.log(`🎯 Next run at: ${nextTime.toLocaleTimeString()}`);
    console.log(`⏳ Waiting ${Math.round(msUntilNext / 1000)} seconds...`);

    // Set initial timeout to sync with clock
    setTimeout(() => {
      // Run first compliance check
      this.runScheduledCompliance();

      // Then set interval for every 5 minutes (300,000 ms)
      this.intervalId = setInterval(() => {
        this.runScheduledCompliance();
      }, 5 * 60 * 1000);
    }, msUntilNext);
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log("⚠️  Scheduler is not running");
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log("🛑 Smart contract scheduler stopped");
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      companiesCount: this.companies.size,
      companies: Array.from(this.companies),
      nextRun: this.isRunning
        ? new Date(Date.now() + this.getTimeUntilNext5MinuteMark())
        : null,
    };
  }
}

// Create singleton instance
const scheduler = new SmartContractScheduler();

export default scheduler;
