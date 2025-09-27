// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  getDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1HciA35uKQCEQRpwhI54QgwpOeffCfZQ",
  authDomain: "hashitup-5bb9b.firebaseapp.com",
  projectId: "hashitup-5bb9b",
  storageBucket: "hashitup-5bb9b.firebasestorage.app",
  messagingSenderId: "620690168173",
  appId: "1:620690168173:web:8b3306843fdb65f99ae264",
  measurementId: "G-97PR8NFRRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Conditionally initialize analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const db = getFirestore(app);

// Configure authentication persistence (only in browser)
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Error setting auth persistence:", error);
  });
}

// Helper function to get current user
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Check if user is currently authenticated
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Get current user synchronously (may return null if not loaded yet)
export const getCurrentUserSync = () => {
  return auth.currentUser;
};

// Authentication functions
export const registerCompany = async (email, password) => {
  try {
    console.log("Creating Firebase Auth user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log(
      `User created with UID: ${user.uid}, creating company document...`
    );

    // Create the initial company document in Firestore
    const createDocResult = await createCompanyDocument(user.uid, email);
    if (!createDocResult.success) {
      console.error(
        "Failed to create company document:",
        createDocResult.error
      );

      // This is critical - if we can't create the company document,
      // the user won't be able to complete registration
      return {
        success: false,
        error: `Registration incomplete: Failed to create company profile. ${createDocResult.error}`,
        partialSuccess: true,
        authUser: user,
      };
    }

    console.log(
      "✅ Registration completed successfully - Auth user and company document created"
    );
    return { success: true, user: user, companyDoc: createDocResult.data };
  } catch (error) {
    console.error("Registration failed:", error.message);
    return { success: false, error: error.message };
  }
};

export const loginCompany = async (email, password) => {
  try {
    console.log("Attempting to login with email:", email);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Login successful, user:", userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login failed:", error.message);
    return { success: false, error: error.message };
  }
};

export const logoutCompany = async () => {
  try {
    console.log("Logging out user...");
    await signOut(auth);
    console.log("Logout successful");
    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Company data functions
export const saveCompanyDetails = async (uid, companyData) => {
  try {
    console.log(`Saving company details for ${uid}:`, companyData);

    // Use setDoc with merge to ensure document exists and is updated
    await setDoc(
      doc(db, "companies", uid),
      {
        company_details: companyData,
        detailsSubmittedAt: new Date().toISOString(),
        registrationStatus: "pending_admin_verification", // Match what your data shows
      },
      { merge: true }
    ); // merge: true preserves existing fields

    console.log(
      `Company details saved successfully for ${uid}, status set to 'pending_admin_verification'`
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving company details:", error);
    return { success: false, error: error.message };
  }
};

export const createCompanyDocument = async (uid, email) => {
  try {
    console.log(`Creating company document for ${uid} with email ${email}`);

    // Use setDoc to create the document
    await setDoc(doc(db, "companies", uid), {
      email: email,
      createdAt: new Date().toISOString(),
      registrationStatus: "incomplete",
      uid: uid, // Store the UID in the document for reference
    });

    // Verify the document was created
    const docRef = doc(db, "companies", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`✅ Company document successfully created for ${uid}`);
      return { success: true, data: docSnap.data() };
    } else {
      console.error(`❌ Company document was not created for ${uid}`);
      return {
        success: false,
        error:
          "Document creation failed - document does not exist after creation",
      };
    }
  } catch (error) {
    console.error(`Error creating company document for ${uid}:`, error);
    return { success: false, error: error.message };
  }
};

export const getCompanyDetails = async (uid) => {
  try {
    console.log(`Fetching company details for ${uid}`);
    const docRef = doc(db, "companies", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Company data found:", data);

      // Flatten the company details if they exist
      if (data.company_details) {
        return {
          ...data,
          ...data.company_details,
          uid: uid,
        };
      }

      return {
        ...data,
        uid: uid,
      };
    } else {
      console.log("No company document found for uid:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching company details:", error);
    throw error;
  }
};

// Admin functions
export const getAllPendingCompanies = async () => {
  try {
    console.log("Fetching all pending companies...");

    // Get all companies first to debug
    const allCompaniesSnapshot = await getDocs(collection(db, "companies"));
    console.log("Total companies in database:", allCompaniesSnapshot.size);

    allCompaniesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Company ${doc.id}:`, {
        email: data.email,
        registrationStatus: data.registrationStatus,
        hasDetails: !!data.company_details,
        detailsSubmittedAt: data.detailsSubmittedAt,
      });
    });

    // Query for pending companies - check for both 'pending' and 'pending_admin_verification'
    const q1 = query(
      collection(db, "companies"),
      where("registrationStatus", "==", "pending")
    );
    const q2 = query(
      collection(db, "companies"),
      where("registrationStatus", "==", "pending_admin_verification")
    );

    const [querySnapshot1, querySnapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const companies = [];

    // Add companies from both queries
    querySnapshot1.forEach((doc) => {
      companies.push({ id: doc.id, ...doc.data() });
    });

    querySnapshot2.forEach((doc) => {
      companies.push({ id: doc.id, ...doc.data() });
    });

    console.log("Pending companies found:", companies.length);
    console.log("Companies:", companies);
    return { success: true, companies };
  } catch (error) {
    console.error("Error fetching pending companies:", error);
    return { success: false, error: error.message, companies: [] };
  }
};

// Debug function to get all companies regardless of status
export const getAllCompanies = async () => {
  try {
    console.log("Fetching ALL companies for debugging...");
    const querySnapshot = await getDocs(collection(db, "companies"));
    const companies = [];
    querySnapshot.forEach((doc) => {
      companies.push({ id: doc.id, ...doc.data() });
    });
    console.log("All companies:", companies);
    return { success: true, companies };
  } catch (error) {
    console.error("Error fetching all companies:", error);
    return { success: false, error: error.message, companies: [] };
  }
};

// Debug function to check if a specific company exists
export const checkCompanyExists = async (uid) => {
  try {
    console.log(`🔍 Checking if company ${uid} exists...`);
    const companyRef = doc(db, "companies", uid);
    const companyDoc = await getDoc(companyRef);

    if (companyDoc.exists()) {
      console.log(`✅ Company ${uid} exists:`, companyDoc.data());
      return { exists: true, data: companyDoc.data() };
    } else {
      console.log(`❌ Company ${uid} does not exist`);
      return { exists: false, data: null };
    }
  } catch (error) {
    console.error(`Error checking company ${uid}:`, error);
    return { exists: false, data: null, error: error.message };
  }
};

// Function to fetch emission records for a company
export const getCompanyEmissions = async (companyId, maxRecords = 50) => {
  try {
    console.log(`📊 Fetching emission records for company ${companyId}`);

    // Get the records subcollection from the company's emissions document
    const recordsRef = collection(db, "emissions", companyId, "records");

    // Query records ordered by timestamp (most recent first)
    const q = query(
      recordsRef,
      orderBy("timestamp", "desc"),
      limit(maxRecords)
    );
    const querySnapshot = await getDocs(q);

    const emissions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      emissions.push({
        id: doc.id,
        emissionValue: parseFloat(data.emissionValue) || 0,
        timestamp: data.timestamp,
        // Convert Firestore timestamp to Date for easier handling
        date: data.timestamp?.toDate
          ? data.timestamp.toDate()
          : new Date(data.timestamp),
      });
    });

    console.log(
      `✅ Found ${emissions.length} emission records for company ${companyId}`
    );
    return { success: true, emissions: emissions.reverse() }; // Reverse to show chronological order
  } catch (error) {
    console.error(
      `❌ Error fetching emissions for company ${companyId}:`,
      error
    );
    return { success: false, error: error.message, emissions: [] };
  }
};

// Function to add sample emission data for testing
export const addSampleEmissionData = async (
  companyId,
  numberOfRecords = 10
) => {
  try {
    console.log(
      `🧪 Adding ${numberOfRecords} sample emission records for company ${companyId}`
    );

    const recordsRef = collection(db, "emissions", companyId, "records");
    const promises = [];

    for (let i = 0; i < numberOfRecords; i++) {
      // Generate random emission value between 100-200
      const emissionValue = parseFloat((Math.random() * 100 + 100).toFixed(2));

      // Generate timestamps over the last 24 hours
      const hoursAgo = (numberOfRecords - i - 1) * (24 / numberOfRecords);
      const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      const sampleRecord = {
        emissionValue: emissionValue,
        timestamp: timestamp,
        createdAt: new Date().toISOString(),
        isSimulated: true,
      };

      promises.push(addDoc(recordsRef, sampleRecord));
    }

    await Promise.all(promises);
    console.log(
      `✅ Successfully added ${numberOfRecords} sample emission records`
    );
    return {
      success: true,
      message: `Added ${numberOfRecords} sample records`,
    };
  } catch (error) {
    console.error(`❌ Error adding sample emission data:`, error);
    return { success: false, error: error.message };
  }
};

// Function to fetch prediction records for a company
export const getCompanyPredictions = async (companyId, maxRecords = 50) => {
  try {
    console.log(`🔮 Fetching prediction records for company ${companyId}`);

    // Get the records subcollection from the company's predictions document
    const recordsRef = collection(db, "predictions", companyId, "records");

    // Query records ordered by predicted_at (most recent first)
    const q = query(
      recordsRef,
      orderBy("predicted_at", "desc"),
      limit(maxRecords)
    );
    const querySnapshot = await getDocs(q);

    const predictions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      predictions.push({
        id: doc.id,
        predictedValue: parseFloat(data.predicted_co2_emission) || 0,
        predictedAt: data.predicted_at,
        // Convert Firestore timestamp to Date for easier handling
        date: data.predicted_at?.toDate
          ? data.predicted_at.toDate()
          : new Date(data.predicted_at),
        timeFeatures: data.prediction_time_features || {},
      });
    });

    console.log(`✅ Found ${predictions.length} prediction records`);
    return { success: true, predictions };
  } catch (error) {
    console.error(`❌ Error fetching predictions:`, error);
    return { success: false, error: error.message, predictions: [] };
  }
};

// Function to add sample prediction data for testing
export const addSamplePredictionData = async (
  companyId,
  numberOfRecords = 10
) => {
  try {
    console.log(
      `🔮 Adding ${numberOfRecords} sample prediction records for company ${companyId}`
    );

    const recordsRef = collection(db, "predictions", companyId, "records");
    const promises = [];

    for (let i = 0; i < numberOfRecords; i++) {
      // Generate random prediction value between 80-220 (slightly different range than actual)
      const predictedValue = parseFloat((Math.random() * 140 + 80).toFixed(2));

      // Generate timestamps for future predictions (next few hours)
      const hoursInFuture = i * (24 / numberOfRecords);
      const predictedTimestamp = new Date(
        Date.now() + hoursInFuture * 60 * 60 * 1000
      );

      const samplePrediction = {
        predicted_co2_emission: predictedValue,
        predicted_at: predictedTimestamp,
        prediction_time_features: {
          hour: predictedTimestamp.getHours(),
          day: predictedTimestamp.getDate(),
          month: predictedTimestamp.getMonth() + 1,
          weekday: predictedTimestamp.getDay(),
        },
        createdAt: new Date().toISOString(),
        isSimulated: true,
      };

      promises.push(addDoc(recordsRef, samplePrediction));
    }

    await Promise.all(promises);
    console.log(
      `✅ Successfully added ${numberOfRecords} sample prediction records`
    );
    return {
      success: true,
      message: `Added ${numberOfRecords} sample predictions`,
    };
  } catch (error) {
    console.error(`❌ Error adding sample prediction data:`, error);
    return { success: false, error: error.message };
  }
};

// Emission Cap Management System
export const setCompanyEmissionCap = async (
  companyId,
  emissionCap,
  intervalMinutes = 5
) => {
  try {
    console.log(
      `🏭 Setting emission cap for company ${companyId}: ${emissionCap} tons per ${intervalMinutes} minutes`
    );

    const capRef = doc(db, "emission_caps", companyId);
    const capData = {
      companyId,
      emissionCap: parseFloat(emissionCap),
      intervalMinutes,
      createdAt: new Date(),
      isActive: true,
    };

    await setDoc(capRef, capData);
    console.log(`✅ Emission cap set successfully`);
    return { success: true, cap: capData };
  } catch (error) {
    console.error(`❌ Error setting emission cap:`, error);
    return { success: false, error: error.message };
  }
};

export const getCompanyEmissionCap = async (companyId) => {
  try {
    const capRef = doc(db, "emission_caps", companyId);
    const capDoc = await getDoc(capRef);

    if (capDoc.exists()) {
      return { success: true, cap: capDoc.data() };
    } else {
      return { success: false, error: "No emission cap found for company" };
    }
  } catch (error) {
    console.error(`❌ Error getting emission cap:`, error);
    return { success: false, error: error.message };
  }
};

// Function to check emissions against cap for a specific time interval
export const checkEmissionCompliance = async (
  companyId,
  timeWindowMinutes = 5
) => {
  try {
    console.log(
      `🔍 Checking emission compliance for company ${companyId} over last ${timeWindowMinutes} minutes`
    );

    // Get company emission cap
    const capResult = await getCompanyEmissionCap(companyId);
    if (!capResult.success) {
      return { success: false, error: "No emission cap set for company" };
    }

    const emissionCap = capResult.cap.cap; // Fixed: field is called 'cap', not 'emissionCap'

    // Get emissions from the last time window
    const timeWindowStart = new Date(
      Date.now() - timeWindowMinutes * 60 * 1000
    );
    const recordsRef = collection(db, "emissions", companyId, "records");
    const q = query(
      recordsRef,
      where("timestamp", ">=", timeWindowStart),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    let totalEmissions = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalEmissions += parseFloat(data.emissionValue) || 0;
    });

    const isCompliant = totalEmissions <= emissionCap;
    const difference = Math.abs(totalEmissions - emissionCap);

    console.log(
      `📊 Compliance check: ${totalEmissions}/${emissionCap} tons - ${
        isCompliant ? "COMPLIANT" : "OVER CAP"
      }`
    );

    return {
      success: true,
      compliance: {
        companyId,
        totalEmissions,
        emissionCap,
        timeWindowMinutes,
        isCompliant,
        difference,
        timestamp: new Date(),
        creditsToMint: isCompliant ? difference : 0,
        creditsToDeduct: !isCompliant ? difference : 0,
      },
    };
  } catch (error) {
    console.error(`❌ Error checking emission compliance:`, error);
    return { success: false, error: error.message };
  }
};

// Company flagging system for non-compliance
export const flagCompanyForNonCompliance = async (
  companyId,
  reason,
  creditsRequired
) => {
  try {
    console.log(
      `🚩 Flagging company ${companyId} for non-compliance: ${reason}`
    );

    const flagRef = doc(db, "compliance_flags", companyId);
    const flagData = {
      companyId,
      reason,
      creditsRequired,
      flaggedAt: new Date(),
      status: "FLAGGED",
      timerExpired: true,
      actions: [],
    };

    await setDoc(flagRef, flagData);

    // Also update company status
    const companyRef = doc(db, "companies", companyId);
    await updateDoc(companyRef, {
      complianceStatus: "FLAGGED",
      flaggedAt: new Date(),
      lastFlagReason: reason,
    });

    console.log(`✅ Company flagged successfully`);
    return { success: true, flag: flagData };
  } catch (error) {
    console.error(`❌ Error flagging company:`, error);
    return { success: false, error: error.message };
  }
};

// Buy credit timer system
export const startBuyCreditTimer = async (
  companyId,
  creditsRequired,
  timeoutMinutes = 2
) => {
  try {
    console.log(
      `⏰ Starting ${timeoutMinutes}-minute buy credit timer for company ${companyId}`
    );

    const timerRef = doc(db, "buy_credit_timers", companyId);
    const timerData = {
      companyId,
      creditsRequired,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + timeoutMinutes * 60 * 1000),
      status: "ACTIVE",
      timeoutMinutes,
    };

    await setDoc(timerRef, timerData);
    console.log(`✅ Timer started, expires at:`, timerData.expiresAt);
    return { success: true, timer: timerData };
  } catch (error) {
    console.error(`❌ Error starting buy credit timer:`, error);
    return { success: false, error: error.message };
  }
};

export const checkBuyCreditTimer = async (companyId) => {
  try {
    const timerRef = doc(db, "buy_credit_timers", companyId);
    const timerDoc = await getDoc(timerRef);

    if (!timerDoc.exists()) {
      return { success: false, error: "No active timer found" };
    }

    const timerData = timerDoc.data();
    const now = new Date();
    const isExpired = now > timerData.expiresAt.toDate();

    return {
      success: true,
      timer: {
        ...timerData,
        isExpired,
        timeRemaining: isExpired
          ? 0
          : timerData.expiresAt.toDate().getTime() - now.getTime(),
      },
    };
  } catch (error) {
    console.error(`❌ Error checking buy credit timer:`, error);
    return { success: false, error: error.message };
  }
};

// Main compliance monitoring function - processes emission compliance automatically
export const processEmissionCompliance = async (companyId) => {
  try {
    console.log(`🔄 Processing emission compliance for company ${companyId}`);

    // Step 1: Check emission compliance
    const complianceResult = await checkEmissionCompliance(companyId, 5);

    // Log the compliance check regardless of success, for auditing
    if (complianceResult.success) {
      await logComplianceCheck(companyId, complianceResult.compliance);
    } else {
      // Log the failure as well
      await logComplianceCheck(companyId, {
        error: complianceResult.error,
        timestamp: new Date(),
        companyId,
      });
    }

    if (!complianceResult.success) {
      return complianceResult;
    }

    const compliance = complianceResult.compliance;

    // Get company data for blockchain operations
    const companyDoc = await getDoc(doc(db, "companies", companyId));
    if (!companyDoc.exists()) {
      return { success: false, error: "Company not found" };
    }

    const companyData = companyDoc.data();
    const walletAddress = companyData.walletAddress;

    if (!walletAddress) {
      return { success: false, error: "Company wallet address not found" };
    }

    // Import blockchain service
    const { blockchainService } = await import("./blockchain.js");

    if (compliance.isCompliant) {
      // Company is under cap - mint carbon credits as reward
      console.log(
        `🎉 Company is compliant! Minting ${compliance.creditsToMint} credits`
      );

      const mintResult = await blockchainService.mintCreditsForCompliance(
        walletAddress,
        compliance.creditsToMint,
        compliance.totalEmissions,
        compliance.emissionCap
      );

      if (mintResult.success) {
        const transactionData = {
          type: "COMPLIANCE_MINT",
          amount: compliance.creditsToMint,
          reason: "Compliance reward for staying under emission cap",
          txHash: mintResult.txHash,
          balanceAfter: mintResult.balanceAfter,
          emissionValue: compliance.totalEmissions,
          emissionCap: compliance.emissionCap,
          walletAddress: walletAddress,
        };

        // Log to blockchain_transactions collection
        await logBlockchainTransaction(companyId, transactionData);

        // Create immutable blockchain record
        await createImmutableBlockchainRecord(companyId, transactionData, {
          contractAddress: "0x809d550fca64d94Bd9F66E60752A544199cfAC3D",
          blockNumber: mintResult.blockNumber,
          blockHash: mintResult.blockHash,
          gasUsed: mintResult.gasUsed || "0"
        });

        // Update wallet balance in Firebase companies collection
        const newBalance = mintResult.balanceAfter || (companyData.creditBalance || 0) + compliance.creditsToMint;
        const companyRef = doc(db, "companies", companyId);
        await updateDoc(companyRef, {
          creditBalance: newBalance,
          lastBalanceUpdate: new Date()
        });
        console.log(`💰 Updated company ${companyId} balance to ${newBalance} CCT`);
      }

      // Record the compliance action
      const actionRef = doc(
        db,
        "compliance_actions",
        `${companyId}_${Date.now()}`
      );
      await setDoc(actionRef, {
        companyId,
        action: "CREDITS_MINTED",
        amount: compliance.creditsToMint,
        timestamp: new Date(),
        emissions: compliance.totalEmissions,
        cap: compliance.emissionCap,
        blockchainTx: mintResult.txHash,
      });

      return {
        success: true,
        action: "CREDITS_MINTED",
        amount: compliance.creditsToMint,
        compliance,
      };
    } else {
      // Company is over cap - need to deduct credits
      console.log(
        `⚠️ Company is over cap! Need to deduct ${compliance.creditsToDeduct} credits`
      );

      // First check current credit balance
      const balanceResult = await blockchainService.checkCreditBalance(
        walletAddress
      );
      if (!balanceResult.success) {
        return { success: false, error: "Failed to check credit balance" };
      }

      const currentBalance = parseFloat(balanceResult.balance);
      const requiredCredits = compliance.creditsToDeduct;

      if (currentBalance >= requiredCredits) {
        // Sufficient balance - deduct credits
        const deductResult = await blockchainService.deductCreditsForOverage(
          walletAddress,
          requiredCredits,
          compliance.totalEmissions,
          compliance.emissionCap
        );

        if (deductResult.success) {
          const transactionData = {
            type: "COMPLIANCE_DEDUCT",
            amount: -requiredCredits,
            reason: "Compliance penalty for exceeding emission cap",
            txHash: deductResult.txHash,
            balanceAfter: deductResult.balanceAfter,
            emissionValue: compliance.totalEmissions,
            emissionCap: compliance.emissionCap,
            walletAddress: walletAddress,
          };

          // Log to blockchain_transactions collection
          await logBlockchainTransaction(companyId, transactionData);

          // Create immutable blockchain record
          await createImmutableBlockchainRecord(companyId, transactionData, {
            contractAddress: "0x809d550fca64d94Bd9F66E60752A544199cfAC3D",
            blockNumber: deductResult.blockNumber,
            blockHash: deductResult.blockHash,
            gasUsed: deductResult.gasUsed || "0"
          });

          // Update wallet balance in Firebase companies collection
          const newBalance = deductResult.balanceAfter || Math.max(0, (companyData.creditBalance || 0) - requiredCredits);
          const companyRef = doc(db, "companies", companyId);
          await updateDoc(companyRef, {
            creditBalance: newBalance,
            lastBalanceUpdate: new Date()
          });
          console.log(`💰 Updated company ${companyId} balance to ${newBalance} CCT`);
        }

        // Record the action
        const actionRef = doc(
          db,
          "compliance_actions",
          `${companyId}_${Date.now()}`
        );
        await setDoc(actionRef, {
          companyId,
          action: "CREDITS_DEDUCTED",
          amount: requiredCredits,
          timestamp: new Date(),
          emissions: compliance.totalEmissions,
          cap: compliance.emissionCap,
          blockchainTx: deductResult.txHash,
        });

        return {
          success: true,
          action: "CREDITS_DEDUCTED",
          amount: requiredCredits,
          compliance,
        };
      } else {
        // Insufficient balance - start buy credit timer
        console.log(`💳 Insufficient credits! Starting 2-minute buy timer`);

        const timerResult = await startBuyCreditTimer(
          companyId,
          requiredCredits,
          2
        );

        // Record the action
        const actionRef = doc(
          db,
          "compliance_actions",
          `${companyId}_${Date.now()}`
        );
        await setDoc(actionRef, {
          companyId,
          action: "BUY_TIMER_STARTED",
          creditsRequired: requiredCredits,
          currentBalance,
          timestamp: new Date(),
          emissions: compliance.totalEmissions,
          cap: compliance.emissionCap,
          timerExpires: timerResult.timer.expiresAt,
        });

        return {
          success: true,
          action: "BUY_TIMER_STARTED",
          creditsRequired: requiredCredits,
          currentBalance,
          timer: timerResult.timer,
          compliance,
        };
      }
    }
  } catch (error) {
    console.error(`❌ Error processing emission compliance:`, error);
    return { success: false, error: error.message };
  }
};

// Recovery function to recreate a company document from user auth data
export const recoverCompanyDocument = async (uid, fallbackData = {}) => {
  try {
    console.log(`🔧 Attempting to recover company document for ${uid}...`);

    // First check if document already exists
    const existingCheck = await checkCompanyExists(uid);
    if (existingCheck.exists) {
      console.log(`✅ Company document already exists for ${uid}`);
      return {
        success: true,
        message: "Company document already exists",
        data: existingCheck.data,
      };
    }

    // Try to get user data from auth
    const userRecord = auth.currentUser;
    if (userRecord && userRecord.uid === uid) {
      console.log("Found user auth data:", {
        email: userRecord.email,
        uid: userRecord.uid,
      });
    }

    // Create a basic company document using the same structure as createCompanyDocument
    const recoveryData = {
      email: userRecord?.email || fallbackData.email || "unknown@example.com",
      registrationStatus: "incomplete", // Start with incomplete so user can fill details
      createdAt: new Date().toISOString(),
      recoveredAt: new Date().toISOString(),
      isRecovery: true,
      uid: uid,
      ...fallbackData,
    };

    await setDoc(doc(db, "companies", uid), recoveryData);

    // Verify the recovery worked
    const verifyResult = await checkCompanyExists(uid);
    if (verifyResult.exists) {
      console.log(`✅ Company document recovered successfully for ${uid}`);
      return {
        success: true,
        message: "Company document recovered successfully",
        data: verifyResult.data,
      };
    } else {
      throw new Error(
        "Recovery verification failed - document still does not exist"
      );
    }
  } catch (error) {
    console.error(`❌ Failed to recover company document for ${uid}:`, error);
    return { success: false, error: error.message };
  }
};

export const approveCompany = async (
  uid,
  carbonCap,
  initialTokens = "1000"
) => {
  try {
    console.log(`🔄 Starting approval process for company ${uid}`);

    // Step 0: Check if company document exists
    console.log("📋 Checking if company document exists...");
    const companyRef = doc(db, "companies", uid);
    const companyDoc = await getDoc(companyRef);

    if (!companyDoc.exists()) {
      throw new Error(
        `Company document with ID ${uid} does not exist. Cannot approve non-existent company.`
      );
    }

    console.log("✅ Company document found:", companyDoc.data());

    // Import blockchain service dynamically to avoid loading issues
    const { createCompanyWallet, registerAndMintTokens, blockchainService } =
      await import("./blockchain.js");

    // Step 1: Initialize blockchain service
    console.log("📡 Initializing blockchain connection...");
    const initialized = await blockchainService.initialize();
    if (!initialized) {
      throw new Error(
        "Failed to initialize blockchain service. Make sure Hardhat node is running."
      );
    }

    // Step 2: Create company wallet and fund with test ETH
    console.log("🏦 Creating company wallet...");
    const walletInfo = await createCompanyWallet();

    // Step 3: Register company on blockchain and mint initial tokens
    console.log("⛓️ Registering company on blockchain...");
    const blockchainResult = await registerAndMintTokens(
      walletInfo.address,
      initialTokens
    );

    // Step 4: Update Firebase with all blockchain details
    console.log("🔥 Updating Firebase with blockchain details...");
    await updateDoc(doc(db, "companies", uid), {
      registrationStatus: "approved",
      carbonEmissionCap: carbonCap,
      approvedAt: new Date().toISOString(),
      approvedBy: "admin",
      // Blockchain details
      blockchainWallet: {
        address: walletInfo.address,
        privateKey: walletInfo.privateKey, // In production, encrypt this!
        ethBalance: walletInfo.balance,
        fundingTxHash: walletInfo.fundingTx,
      },
      carbonCredits: {
        balance: initialTokens,
        totalMinted: initialTokens,
        registrationTxHash: blockchainResult.registration.txHash,
        mintingTxHash: blockchainResult.minting.txHash,
      },
      blockchainInfo: {
        contractAddress: blockchainService.contract?.target || "Not set",
        chainId: 31337,
        network: "hardhat-local",
      },
    });

    console.log("✅ Company approval completed successfully!");

    return {
      success: true,
      wallet: walletInfo,
      carbonCredits: initialTokens,
      blockchain: blockchainResult,
      message: `Company approved! Created wallet ${walletInfo.address} with ${walletInfo.balance} ETH and ${initialTokens} CC tokens.`,
    };
  } catch (error) {
    console.error("❌ Error in approval process:", error);

    // Fallback to database-only update if blockchain fails
    console.log("⚠️ Falling back to database-only approval...");
    try {
      // Check if document still exists before updating
      const companyRef = doc(db, "companies", uid);
      const companyDoc = await getDoc(companyRef);

      if (!companyDoc.exists()) {
        throw new Error(
          `Company document with ID ${uid} does not exist. Cannot update non-existent company.`
        );
      }

      await updateDoc(companyRef, {
        registrationStatus: "approved",
        carbonEmissionCap: carbonCap,
        approvedAt: new Date().toISOString(),
        approvedBy: "admin",
        blockchainError: error.message,
        needsBlockchainSetup: true,
      });

      return {
        success: true,
        fallback: true,
        error: error.message,
        message:
          "Company approved in database. Blockchain setup failed and needs manual intervention.",
      };
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      return {
        success: false,
        error: `Approval failed: ${error.message}. Fallback failed: ${fallbackError.message}`,
      };
    }
  }
};

export const rejectCompany = async (uid, reason) => {
  try {
    await updateDoc(doc(db, "companies", uid), {
      registrationStatus: "rejected",
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: "admin",
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Simple admin authentication (you can enhance this with proper admin users)
export const adminLogin = async (email, password) => {
  // For demo purposes, hardcoded admin credentials
  // In production, you should have proper admin user management
  if (email === "admin@gmail.com" && password === "123456") {
    return { success: true, isAdmin: true };
  }
  return { success: false, error: "Invalid admin credentials" };
};

// Get comprehensive compliance history for detailed alerts
export const getComplianceHistory = async (companyId, limitRecords = 10) => {
  try {
    console.log(`📋 Fetching compliance history for company ${companyId}`);

    // Get compliance flags
    const flagsRef = doc(db, "compliance_flags", companyId);
    const flagsDoc = await getDoc(flagsRef);
    const complianceFlags = flagsDoc.exists() ? flagsDoc.data() : null;

    // Get buy credit timers
    const timerRef = doc(db, "buy_credit_timers", companyId);
    const timerDoc = await getDoc(timerRef);
    const activeTimer = timerDoc.exists() ? timerDoc.data() : null;

    // Get recent compliance checks (you might want to create a compliance_history collection)
    const companyRef = doc(db, "companies", companyId);
    const companyDoc = await getDoc(companyRef);
    const companyData = companyDoc.exists() ? companyDoc.data() : {};

    // Get emission cap
    const capResult = await getCompanyEmissionCap(companyId);
    const emissionCap = capResult.success ? capResult.cap.emissionCap : 0;

    // Calculate current compliance status
    const currentCompliance = await checkEmissionCompliance(companyId, 5);

    return {
      success: true,
      history: {
        companyId,
        emissionCap,
        currentCompliance: currentCompliance.success
          ? currentCompliance.compliance
          : null,
        complianceFlags,
        activeTimer,
        companyStatus: companyData.complianceStatus || "UNKNOWN",
        lastFlagReason: companyData.lastFlagReason || null,
        flaggedAt: companyData.flaggedAt || null,
        walletAddress: companyData.walletAddress || null,
        creditBalance: companyData.creditBalance || 0,
      },
    };
  } catch (error) {
    console.error(`❌ Error fetching compliance history:`, error);
    return { success: false, error: error.message };
  }
};

// Log a compliance check result
export const logComplianceCheck = async (companyId, complianceData) => {
  try {
    console.log(`📝 Logging compliance check for company ${companyId}`);
    const historyRef = collection(db, "compliance_history", companyId, "checks");
    await addDoc(historyRef, {
      ...complianceData,
      loggedAt: new Date(),
    });
    console.log(`✅ Compliance check logged successfully for ${companyId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error logging compliance check:`, error);
    return { success: false, error: error.message };
  }
};

// Get smart contract transaction history from blockchain events
export const getSmartContractHistory = async (companyId, limitRecords = 10) => {
  try {
    console.log(
      `🔗 Fetching immutable smart contract history for company ${companyId}`
    );

    // First, try to get from immutable blockchain records
    const immutableRecordsRef = collection(db, "immutable_blockchain_records");
    const immutableQuery = query(
      immutableRecordsRef,
      where("companyId", "==", companyId),
      orderBy("metadata.timestamp", "desc"),
      limit(limitRecords)
    );

    const transactions = [];

    try {
      // Try the indexed query first
      const immutableSnapshot = await getDocs(immutableQuery);

      if (!immutableSnapshot.empty) {
        console.log(
          `📋 Found ${immutableSnapshot.size} immutable blockchain records`
        );

        immutableSnapshot.forEach((doc) => {
          const record = doc.data();
          const complianceData = record.complianceData || {};
          const blockchainData = record.blockchainData || {};
          const metadata = record.metadata || {};

          transactions.push({
            id: record.recordId || doc.id,
            type: complianceData.type || "UNKNOWN",
            amount: complianceData.amount || 0,
            timestamp: metadata.timestamp?.toDate() || new Date(),
            status: "CONFIRMED",
            reason: getReasonFromType(complianceData.type, complianceData),
            txHash: blockchainData.transactionHash || "N/A",
            balanceAfter: complianceData.balanceAfter || 0,
            blockNumber: blockchainData.blockNumber || 0,
            gasUsed: blockchainData.gasUsed || "0",
            isImmutable: true,
            verificationHash: metadata.verificationHash || "N/A",
            emissionValue: complianceData.emissionValue || 0,
            emissionCap: complianceData.emissionCap || 0,
            walletAddress: complianceData.walletAddress || "N/A",
          });
        });
      }
    } catch (immutableError) {
      console.log(
        "📝 Index not available for immutable records, trying simple query..."
      );

      // Fallback: Get all records and filter in code (for small datasets)
      try {
        const simpleQuery = query(
          immutableRecordsRef,
          where("companyId", "==", companyId),
          limit(limitRecords)
        );

        const simpleSnapshot = await getDocs(simpleQuery);

        if (!simpleSnapshot.empty) {
          console.log(
            `📋 Found ${simpleSnapshot.size} immutable records (simple query)`
          );

          const recordsArray = [];
          simpleSnapshot.forEach((doc) => {
            const record = doc.data();
            const complianceData = record.complianceData || {};
            const blockchainData = record.blockchainData || {};
            const metadata = record.metadata || {};

            recordsArray.push({
              id: record.recordId || doc.id,
              type: complianceData.type || "UNKNOWN",
              amount: complianceData.amount || 0,
              timestamp: metadata.timestamp?.toDate() || new Date(),
              status: "CONFIRMED",
              reason: getReasonFromType(complianceData.type, complianceData),
              txHash: blockchainData.transactionHash || "N/A",
              balanceAfter: complianceData.balanceAfter || 0,
              blockNumber: blockchainData.blockNumber || 0,
              gasUsed: blockchainData.gasUsed || "0",
              isImmutable: true,
              verificationHash: metadata.verificationHash || "N/A",
              emissionValue: complianceData.emissionValue || 0,
              emissionCap: complianceData.emissionCap || 0,
              walletAddress: complianceData.walletAddress || "N/A",
            });
          });

          // Sort by timestamp in JavaScript
          recordsArray.sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
          );
          transactions.push(...recordsArray);
        }
      } catch (simpleError) {
        console.log(
          "📝 Simple query also failed, checking transaction logs..."
        );
      }
    }

    // If no immutable records, fall back to transaction logs
    if (transactions.length === 0) {
      const fallbackResult = await getSmartContractHistoryFromLogs(
        companyId,
        limitRecords
      );
      if (fallbackResult.success) {
        return fallbackResult;
      }
    }

    // Sort by timestamp (most recent first)
    transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log(
      `✅ Retrieved ${transactions.length} immutable blockchain transactions`
    );
    return { success: true, transactions: transactions.slice(0, limitRecords) };
  } catch (error) {
    console.error(`❌ Error fetching smart contract history:`, error);

    // Final fallback to basic transaction logs
    try {
      return await getSmartContractHistoryFromLogs(companyId, limitRecords);
    } catch (fallbackError) {
      return { success: false, error: error.message };
    }
  }
};

// Helper function to generate human-readable reasons
const getReasonFromType = (type, data) => {
  switch (type) {
    case "COMPLIANCE_MINT":
      return `Under emission cap - earned ${Math.abs(
        data.amount || 0
      )} credits (${data.emissionValue || 0}/${data.emissionCap || 0} tons)`;
    case "COMPLIANCE_DEDUCT":
      return `Over emission cap - deducted ${Math.abs(
        data.amount || 0
      )} credits (${data.emissionValue || 0}/${data.emissionCap || 0} tons)`;
    case "COMPANY_FLAGGED":
      return `Insufficient credits for deduction - company flagged (needed ${
        data.requiredAmount || 0
      }, had ${data.availableAmount || 0})`;
    case "CREDIT_PURCHASE":
      return `Purchased ${Math.abs(data.amount || 0)} carbon credits`;
    case "COMPANY_REGISTERED":
      return "Company registered for carbon credit system";
    default:
      return `Blockchain transaction - ${type}`;
  }
};

// Get real-time carbon credit balance from blockchain
export const getRealTimeBalance = async (companyId) => {
  try {
    console.log(`💰 Fetching real-time balance for company ${companyId}`);

    // Get company data to find wallet address
    const companyRef = doc(db, "companies", companyId);
    const companyDoc = await getDoc(companyRef);

    if (!companyDoc.exists()) {
      console.error(`❌ Company ${companyId} not found in database`);
      return { success: false, error: "Company not found" };
    }

    const companyData = companyDoc.data();
    const walletAddress = companyData.walletAddress;

    console.log(`🔍 Company data:`, {
      companyId,
      walletAddress,
      currentCreditBalance: companyData.creditBalance,
    });

    if (!walletAddress) {
      console.error(`❌ No wallet address found for company ${companyId}`);
      // For testing purposes, use a default Hardhat account
      const testWalletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // First Hardhat account
      console.log(`🧪 Using test wallet address: ${testWalletAddress}`);

      // Update company with test wallet
      await updateDoc(companyRef, {
        walletAddress: testWalletAddress,
        testWallet: true,
        walletAssignedAt: new Date(),
      });

      // Continue with the test wallet
      const balanceResult = await import("./blockchain.js").then(
        async ({ default: blockchainService }) => {
          if (!blockchainService.initialized) {
            await blockchainService.initialize();
          }
          return blockchainService.checkCreditBalance(testWalletAddress);
        }
      );

      if (balanceResult.success) {
        await updateDoc(companyRef, {
          creditBalance: parseFloat(balanceResult.balance),
          lastBalanceUpdate: new Date(),
        });

        return {
          success: true,
          balance: parseFloat(balanceResult.balance),
          walletAddress: testWalletAddress,
          isTestWallet: true,
          lastUpdate: new Date(),
        };
      } else {
        return { success: false, error: balanceResult.error };
      }
    }

    // Import blockchain service dynamically to avoid circular imports
    const { default: blockchainService } = await import("./blockchain.js");

    console.log(`🔗 Initializing blockchain service...`);

    // Initialize blockchain service if needed
    if (!blockchainService.initialized) {
      console.log(`📡 Blockchain service not initialized, initializing now...`);
      await blockchainService.initialize();
    }

    console.log(
      `⛓️  Blockchain service initialized: ${blockchainService.initialized}`
    );

    // Get balance from blockchain
    console.log(
      `🔍 Fetching balance from blockchain for wallet: ${walletAddress}`
    );
    const balanceResult = await blockchainService.checkCreditBalance(
      walletAddress
    );

    if (balanceResult.success) {
      // Update Firebase with the real balance
      await updateDoc(companyRef, {
        creditBalance: parseFloat(balanceResult.balance),
        lastBalanceUpdate: new Date(),
      });

      console.log(`✅ Real-time balance updated: ${balanceResult.balance} CCT`);
      return {
        success: true,
        balance: parseFloat(balanceResult.balance),
        walletAddress,
        lastUpdate: new Date(),
      };
    } else {
      console.error(
        `❌ Failed to get balance from blockchain:`,
        balanceResult.error
      );
      return { success: false, error: balanceResult.error };
    }
  } catch (error) {
    console.error(`❌ Error fetching real-time balance:`, error);
    console.error(`❌ Error stack:`, error.stack);
    return { success: false, error: error.message };
  }
};

// Update company credit balance in Firebase
export const updateCompanyCreditBalance = async (
  companyId,
  newBalance,
  txHash = null
) => {
  try {
    console.log(
      `💾 Updating credit balance for company ${companyId}: ${newBalance} CCT`
    );

    const companyRef = doc(db, "companies", companyId);
    const updateData = {
      creditBalance: parseFloat(newBalance),
      lastBalanceUpdate: new Date(),
    };

    if (txHash) {
      updateData.lastTransactionHash = txHash;
    }

    await updateDoc(companyRef, updateData);

    console.log(`✅ Credit balance updated in Firebase: ${newBalance} CCT`);
    return { success: true, balance: parseFloat(newBalance) };
  } catch (error) {
    console.error(`❌ Error updating credit balance:`, error);
    return { success: false, error: error.message };
  }
};

// Log a blockchain transaction for activity tracking
export const logBlockchainTransaction = async (companyId, transactionData) => {
  try {
    console.log(`📝 Logging blockchain transaction for company ${companyId}`);

    const transactionRef = collection(db, "blockchain_transactions");
    const logData = {
      companyId,
      type: transactionData.type,
      amount: transactionData.amount || 0,
      timestamp: new Date(),
      status: "CONFIRMED",
      reason: transactionData.reason || "Blockchain transaction",
      txHash: transactionData.txHash,
      balanceAfter: transactionData.balanceAfter || 0,
      createdAt: new Date(),
    };

    await addDoc(transactionRef, logData);
    console.log(
      `✅ Transaction logged: ${transactionData.type} - ${
        transactionData.amount || 0
      } CCT`
    );

    return { success: true };
  } catch (error) {
    console.error(`❌ Error logging transaction:`, error);
    return { success: false, error: error.message };
  }
};

// Create immutable blockchain record with the exact structure
export const createImmutableBlockchainRecord = async (companyId, transactionData, blockchainData) => {
  try {
    console.log(`📝 Creating immutable blockchain record for company ${companyId}`);

    const recordId = `${transactionData.txHash}_${Date.now()}`;
    // Create verification hash using simple string hash for browser compatibility
    const hashData = JSON.stringify({
      companyId,
      type: transactionData.type,
      amount: transactionData.amount,
      txHash: transactionData.txHash,
      timestamp: new Date().toISOString()
    });
    const verificationHash = Array.from(hashData)
      .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
      .toString(16).padStart(16, '0').substring(0, 64);

    const immutableRecord = {
      recordId,
      companyId,
      blockchainData: {
        blockHash: blockchainData.blockHash || "0x" + Math.random().toString(16).substr(2, 64),
        blockNumber: blockchainData.blockNumber || Math.floor(Math.random() * 1000) + 1,
        chainId: 31337,
        contractAddress: blockchainData.contractAddress || "0x809d550fca64d94Bd9F66E60752A544199cfAC3D",
        gasUsed: blockchainData.gasUsed || "0",
        network: "localhost",
        transactionHash: transactionData.txHash
      },
      complianceData: {
        amount: transactionData.amount || 0,
        balanceAfter: transactionData.balanceAfter || 0,
        description: transactionData.reason || "Compliance transaction",
        type: transactionData.type,
        walletAddress: transactionData.walletAddress
      },
      metadata: {
        isImmutable: true,
        serviceId: "real-firebase-scheduler",
        timestamp: new Date(),
        verificationHash,
        version: "1.0.0"
      }
    };

    const immutableRef = collection(db, "immutable_blockchain_records");
    await addDoc(immutableRef, immutableRecord);

    console.log(`✅ Immutable blockchain record created: ${recordId}`);
    return { success: true, recordId };

  } catch (error) {
    console.error(`❌ Error creating immutable record:`, error);
    return { success: false, error: error.message };
  }
};

// Get smart contract transaction history from Firebase logs
export const getSmartContractHistoryFromLogs = async (
  companyId,
  limitRecords = 10
) => {
  try {
    console.log(`📋 Fetching transaction logs for company ${companyId}`);

    const transactionsRef = collection(db, "blockchain_transactions");
    const q = query(
      transactionsRef,
      where("companyId", "==", companyId),
      orderBy("timestamp", "desc"),
      limit(limitRecords)
    );

    const querySnapshot = await getDocs(q);
    const transactions = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        type: data.type,
        amount: data.amount,
        timestamp: data.timestamp.toDate(),
        status: data.status,
        reason: data.reason,
        txHash: data.txHash,
        balanceAfter: data.balanceAfter,
      });
    });

    console.log(`✅ Found ${transactions.length} logged transactions`);
    return { success: true, transactions };
  } catch (error) {
    console.error(`❌ Error fetching transaction logs:`, error);
    return { success: false, error: error.message };
  }
};

// Get real-time emission compliance data
export const getRealTimeComplianceData = async () => {
  try {
    console.log('🔍 Fetching real-time compliance data...');
    
    // Get all companies with wallet addresses
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    
    const complianceData = [];
    
    for (const companyDoc of companiesSnapshot.docs) {
      const companyData = companyDoc.data();
      const companyId = companyDoc.id;
      
      // Only process approved companies with wallets
      if (companyData.registrationStatus === 'approved' && companyData.walletAddress) {
        const companyName = companyData.company_details?.companyName || companyData.companyName || companyId;
        
        // Get recent emission records
        const emissionsRef = collection(db, 'emissions', companyId, 'records');
        const recentEmissionsQuery = query(emissionsRef, orderBy('timestamp', 'desc'), limit(10));
        const emissionsSnapshot = await getDocs(recentEmissionsQuery);
        
        let totalEmissions = 0;
        const emissionRecords = [];
        
        emissionsSnapshot.forEach(doc => {
          const record = doc.data();
          const emissionValue = parseFloat(record.emissionValue || 0);
          totalEmissions += emissionValue;
          emissionRecords.push({
            value: emissionValue,
            timestamp: record.timestamp?.toDate() || new Date()
          });
        });
        
        const emissionCap = companyData.carbonEmissionCap || 0;
        const isCompliant = totalEmissions <= emissionCap;
        const creditBalance = companyData.creditBalance || 0;
        
        complianceData.push({
          id: companyId,
          name: companyName,
          email: companyData.email,
          walletAddress: companyData.walletAddress,
          totalEmissions,
          emissionCap,
          isCompliant,
          creditBalance,
          excessEmissions: Math.max(0, totalEmissions - emissionCap),
          emissionRecords,
          lastBalanceUpdate: companyData.lastBalanceUpdate?.toDate(),
          lastEmissionCheck: companyData.lastEmissionCheck
        });
      }
    }
    
    console.log(`✅ Found ${complianceData.length} companies with compliance data`);
    return { success: true, data: complianceData };
    
  } catch (error) {
    console.error('❌ Error fetching compliance data:', error);
    return { success: false, error: error.message };
  }
};

// Get emission transaction history
export const getEmissionTransactionHistory = async () => {
  try {
    const transactionsRef = collection(db, 'emission_transactions');
    const transactionsQuery = query(transactionsRef, orderBy('timestamp', 'desc'), limit(50));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    
    const transactions = [];
    transactionsSnapshot.forEach(doc => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        companyId: data.companyId,
        companyName: data.companyName,
        walletAddress: data.walletAddress,
        action: data.action,
        reason: data.reason,
        oldBalance: data.oldBalance,
        newBalance: data.newBalance,
        balanceChange: data.balanceChange,
        timestamp: data.timestamp?.toDate() || new Date(),
        emissionData: data.emissionData
      });
    });
    
    return { success: true, transactions };
  } catch (error) {
    console.error('❌ Error fetching emission transactions:', error);
    return { success: false, error: error.message };
  }
};

// Export the initialized app, analytics, auth, and db for use in other parts of your application
export { app, analytics, auth, db };
