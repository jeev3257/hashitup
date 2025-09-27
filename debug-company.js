// Debug script to check company document existence
import { checkCompanyExists, getAllCompanies } from "./src/firebase.js";

const problematicCompanyId = "d5oCpDEPaEhTyYTteljSTKRH3re2";

async function debugCompanyIssue() {
  console.log("🔍 Debugging company document issue...");

  // Check if the specific problematic company exists
  console.log("\n1. Checking problematic company ID:");
  const companyCheck = await checkCompanyExists(problematicCompanyId);
  console.log(`Company ${problematicCompanyId}:`, companyCheck);

  // Get all companies to see what's actually in the database
  console.log("\n2. Getting all companies in database:");
  const allCompanies = await getAllCompanies();
  if (allCompanies.success) {
    console.log(`Found ${allCompanies.companies.length} companies:`);
    allCompanies.companies.forEach((company, index) => {
      console.log(
        `${index + 1}. ID: ${company.id}, Name: ${
          company.company_details?.companyName || "Unknown"
        }, Status: ${company.registrationStatus || "Unknown"}`
      );
    });
  } else {
    console.log("Error getting companies:", allCompanies.error);
  }

  console.log("\n✅ Debug complete! Check the results above.");
}

// Auto-run if this script is executed directly
if (typeof window === "undefined") {
  debugCompanyIssue().catch(console.error);
}

export { debugCompanyIssue };
