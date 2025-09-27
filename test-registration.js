// Test script to verify company document creation during registration
import {
  createCompanyDocument,
  checkCompanyExists,
  getAllCompanies,
} from "./src/firebase.js";

async function testCompanyDocumentCreation() {
  console.log("🧪 Testing company document creation...");

  // Test creating a company document
  const testUid = "test-" + Date.now();
  const testEmail = `test${Date.now()}@example.com`;

  console.log("\n1. Creating test company document...");
  const createResult = await createCompanyDocument(testUid, testEmail);
  console.log("Create result:", createResult);

  // Verify it exists
  console.log("\n2. Verifying document exists...");
  const existsResult = await checkCompanyExists(testUid);
  console.log("Exists result:", existsResult);

  // Check all companies to see the test document
  console.log("\n3. Getting all companies to verify...");
  const allCompanies = await getAllCompanies();
  if (allCompanies.success) {
    const testCompany = allCompanies.companies.find((c) => c.id === testUid);
    console.log(
      "Test company found in database:",
      testCompany ? "✅ Yes" : "❌ No"
    );
    if (testCompany) {
      console.log("Test company data:", testCompany);
    }
  }

  console.log("\n✅ Test complete!");
}

// Auto-run if this script is executed
if (typeof window === "undefined") {
  testCompanyDocumentCreation().catch(console.error);
}

export { testCompanyDocumentCreation };
