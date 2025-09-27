import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, getCompanyDetails, recoverCompanyDocument } from "./firebase";
import Dashboard from "./NewDashboard";
import { PendingVerificationStatus } from "./PendingVerificationStatus";
import LoginPage from "./LoginPage";
import { Card, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";

export function CompanyLoginDashboard({ onNavigate }) {
  console.log("🔧 CompanyLoginDashboard component mounted");

  const [user, setUser] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log(
        "Auth state changed:",
        currentUser ? "User logged in" : "User not logged in"
      );
      setLoading(true);
      setError(null);

      if (currentUser) {
        setUser(currentUser);
        try {
          // Get company details from Firebase
          const companyDetails = await getCompanyDetails(currentUser.uid);
          if (companyDetails) {
            setCompanyData(companyDetails);
            console.log("Company data loaded:", companyDetails);
          } else {
            setError("No company data found. Please contact support.");
          }
        } catch (err) {
          console.error("Error fetching company data:", err);
          setError("Failed to load company data. Please try again.");
        }
      } else {
        setUser(null);
        setCompanyData(null);
      }

      setAuthInitialized(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Loading state - wait for auth initialization
  if (!authInitialized || loading) {
    console.log("🔄 CompanyLoginDashboard: Loading state", {
      authInitialized,
      loading,
    });
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center">
        <Card className="glass-card border-white/10 rounded-xl p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-gray-300">
              {!authInitialized
                ? "Checking authentication..."
                : "Loading your dashboard..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center">
        <Card className="glass-card border-white/10 rounded-xl p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in - redirect to login page
  if (!user) {
    console.log("🔒 CompanyLoginDashboard: No user, redirecting to login");
    onNavigate("login");
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center">
        <Card className="glass-card border-white/10 rounded-xl p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-gray-300">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Recovery function
  const handleRecover = async () => {
    if (!user) return;

    setRecovering(true);
    try {
      const result = await recoverCompanyDocument(user.uid, {
        email: user.email,
      });
      if (result.success) {
        setCompanyData(result.data);
        setError(null);
      } else {
        setError(`Recovery failed: ${result.error}`);
      }
    } catch (err) {
      setError(`Recovery error: ${err.message}`);
    } finally {
      setRecovering(false);
    }
  };

  // No company data
  if (!companyData) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center">
        <Card className="glass-card border-white/10 rounded-xl p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-yellow-400 text-2xl">ℹ</span>
            </div>
            <h2 className="text-xl font-bold text-white">No Company Profile</h2>
            <p className="text-gray-400">
              Your account exists but company profile is missing. This can
              happen if registration wasn't completed properly.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={handleRecover}
                disabled={recovering}
                className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
              >
                {recovering ? "Recovering..." : "🔧 Recover Profile"}
              </button>
              <button
                onClick={() => onNavigate("company-details", { user })}
                className="w-full px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                Complete Registration
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check company status and show appropriate component
  const isApproved = companyData.registrationStatus === "approved";
  console.log("🏢 CompanyLoginDashboard: Rendering component based on status", {
    status: companyData.registrationStatus,
    isApproved,
    companyData: companyData,
  });

  if (isApproved) {
    // Show full dashboard for approved companies
    console.log(
      "✅ CompanyLoginDashboard: Rendering Dashboard for approved company"
    );
    return <Dashboard company={companyData} onNavigate={onNavigate} />;
  } else {
    // Show pending verification status for non-approved companies
    console.log(
      "⏳ CompanyLoginDashboard: Rendering PendingVerificationStatus"
    );
    return (
      <PendingVerificationStatus
        companyData={companyData}
        onNavigate={onNavigate}
      />
    );
  }
}
