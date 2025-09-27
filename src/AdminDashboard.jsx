import React, { useState, useEffect } from "react";
import { Button } from "./ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card.jsx";
import {
  getAllPendingCompanies,
  getAllCompanies,
  setCompanyEmissionCap,
  processEmissionCompliance,
} from "./firebase.js";

const AdminDashboard = ({ onNavigate = () => {} }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasError, setHasError] = useState(false);
  const [capForm, setCapForm] = useState({ companyId: "", emissionCap: "" });
  const [capResult, setCapResult] = useState(null);

  useEffect(() => {
    try {
      loadPendingCompanies();
    } catch (err) {
      console.error("Error in useEffect:", err);
      setHasError(true);
      setError("Failed to initialize dashboard");
    }
  }, []);

  const loadPendingCompanies = async () => {
    console.log("Loading pending companies...");
    setLoading(true);
    setError("");
    try {
      console.log("Calling getAllPendingCompanies...");
      const result = await getAllPendingCompanies();
      console.log("Result from getAllPendingCompanies:", result);

      if (result.success) {
        console.log("Companies loaded successfully:", result.companies);
        setCompanies(result.companies || []);
      } else {
        console.error("Failed to load companies:", result.error);
        setError(result.error || "Failed to load companies");
      }
    } catch (error) {
      console.error("Exception while loading companies:", error);
      setError("Failed to load companies: " + error.message);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };

  // Emission cap management functions
  const handleSetEmissionCap = async () => {
    if (!capForm.companyId || !capForm.emissionCap) return;

    try {
      setCapResult(null);
      const result = await setCompanyEmissionCap(
        capForm.companyId,
        parseFloat(capForm.emissionCap),
        5
      );

      if (result.success) {
        setCapResult({
          success: true,
          message: `Emission cap set to ${capForm.emissionCap} tons per 5 minutes for company ${capForm.companyId}`,
        });
        setCapForm({ companyId: "", emissionCap: "" });
      } else {
        setCapResult({
          success: false,
          message: "Failed to set emission cap: " + result.error,
        });
      }
    } catch (error) {
      setCapResult({
        success: false,
        message: "Error setting emission cap: " + error.message,
      });
    }
  };

  const handleRunComplianceCheck = async () => {
    if (!capForm.companyId) return;

    try {
      setCapResult(null);
      const result = await processEmissionCompliance(capForm.companyId);

      if (result.success) {
        let message = "";
        if (result.action === "CREDITS_MINTED") {
          message = `✅ Company is compliant! Minted ${result.amount.toFixed(
            1
          )} carbon credits as reward.`;
        } else if (result.action === "CREDITS_DEDUCTED") {
          message = `⚠️ Company over cap! Deducted ${result.amount.toFixed(
            1
          )} carbon credits.`;
        } else if (result.action === "BUY_TIMER_STARTED") {
          message = `🚨 Company over cap with insufficient credits! 2-minute buy timer started. Required: ${result.creditsRequired.toFixed(
            1
          )} credits.`;
        }

        setCapResult({ success: true, message });
      } else {
        setCapResult({
          success: false,
          message: "Compliance check failed: " + result.error,
        });
      }
    } catch (error) {
      setCapResult({
        success: false,
        message: "Error running compliance check: " + error.message,
      });
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center">
        <Card className="glass-card border-red-500/20 shadow-2xl rounded-2xl max-w-md w-full mx-6">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Dashboard Error
            </h3>
            <p className="text-gray-400 mb-4">
              {error || "An unexpected error occurred"}
            </p>
            <div className="space-y-2">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl"
                onClick={() => {
                  setHasError(false);
                  setError("");
                  loadPendingCompanies();
                }}
              >
                Retry
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl"
                onClick={() => onNavigate("landing")}
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#0F1821] to-[#0B0F17]" />

        {/* Subtle Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 border border-emerald-400/10 bg-emerald-400/5 backdrop-blur-sm rounded-lg"
              style={{
                left: `${20 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
                animation: `float-${i % 3} ${
                  8 + (i % 2)
                }s infinite ease-in-out`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-400/25">
              <span className="text-white text-lg font-bold">E</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              EcoChain Admin
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              onClick={loadPendingCompanies}
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              className="text-yellow-300 hover:text-white hover:bg-white/10 border-0"
              onClick={async () => {
                console.log("Debug: Loading all companies...");
                const result = await getAllCompanies();
                if (result.success) {
                  console.log("All companies in database:", result.companies);
                  alert(
                    `Found ${result.companies.length} companies. Check console for details.`
                  );
                } else {
                  alert("Error loading companies: " + result.error);
                }
              }}
            >
              🐛 Debug
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              onClick={() => onNavigate("landing")}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Manage emission caps and verify company registrations
            </p>
          </div>

          {/* Emission Cap Management Section */}
          <Card className="glass-card border-white/10 shadow-2xl rounded-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Emission Cap Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Set and manage emission caps for companies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter company ID"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                    value={capForm.companyId}
                    onChange={(e) =>
                      setCapForm({ ...capForm, companyId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Emission Cap (tons per 5 min)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                    value={capForm.emissionCap}
                    onChange={(e) =>
                      setCapForm({ ...capForm, emissionCap: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleSetEmissionCap}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={!capForm.companyId || !capForm.emissionCap}
                >
                  Set Emission Cap
                </Button>
                <Button
                  onClick={handleRunComplianceCheck}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!capForm.companyId}
                >
                  Check Compliance
                </Button>
              </div>
              {capResult && (
                <div
                  className={`p-4 rounded-lg ${
                    capResult.success
                      ? "bg-green-900/20 border border-green-500/50"
                      : "bg-red-900/20 border border-red-500/50"
                  }`}
                >
                  <p
                    className={
                      capResult.success ? "text-green-300" : "text-red-300"
                    }
                  >
                    {capResult.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Company Verification
            </h2>
            <p className="text-gray-400">
              Review and verify pending company registrations
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6">
              <div className="font-medium">Error:</div>
              <div>{error}</div>
              <div className="mt-2 text-sm text-red-300">
                Check the browser console for more details.
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading pending companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <Card className="glass-card border-white/10 shadow-2xl rounded-2xl">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Pending Verifications
                </h3>
                <p className="text-gray-400">
                  All companies have been processed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies && companies.length > 0
                ? companies
                    .map((company, index) => {
                      // Safety check for company data
                      if (!company || !company.id) {
                        return null;
                      }

                      return (
                        <Card
                          key={company.id || `company-${index}`}
                          className="glass-card border-white/10 shadow-2xl rounded-2xl hover:shadow-emerald-600/10 transition-all duration-300"
                        >
                          <CardHeader>
                            <CardTitle className="text-xl font-bold text-white">
                              {company.company_details?.companyName ||
                                "Unknown Company"}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {company.company_details?.industryType === "other"
                                ? company.company_details?.otherIndustry ||
                                  "Other Industry"
                                : company.company_details?.industryType ||
                                  "Unknown Industry"}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Email:</span>
                                <span className="text-white">
                                  {company.email || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Location:</span>
                                <span className="text-white">
                                  {company.company_details?.city || "N/A"},{" "}
                                  {company.company_details?.country || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                  Submitted:
                                </span>
                                <span className="text-white">
                                  {company.detailsSubmittedAt
                                    ? formatDate(company.detailsSubmittedAt)
                                    : "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                              <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/25"
                                onClick={() =>
                                  onNavigate("company-verification", {
                                    company,
                                  })
                                }
                              >
                                Review Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                    .filter(Boolean)
                : null}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-6 text-gray-500 border-t border-white/10 glass-card">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span>© 2024 EcoChain Admin Portal. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
