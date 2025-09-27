import React, { useState } from "react";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card.jsx";
import { approveCompany, rejectCompany } from "./firebase.js";

const CompanyVerificationPage = ({ onNavigate = () => {}, company }) => {
  const [carbonCap, setCarbonCap] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!company) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center">
        <p className="text-gray-400">Company data not found</p>
      </div>
    );
  }

  const handleApprove = async () => {
    setError("");

    if (!carbonCap || isNaN(carbonCap) || parseFloat(carbonCap) <= 0) {
      setError("Please enter a valid carbon emission cap (in tons CO2)");
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting to approve company with ID: ${company.id}`);
      const result = await approveCompany(company.id, parseFloat(carbonCap));

      if (result.success) {
        const message = result.fallback
          ? "Company approved in database (blockchain setup failed - check console for details)"
          : "Company approved successfully with blockchain integration!";
        alert(message);
        onNavigate("admin-dashboard");
      } else {
        const detailedError = `Failed to approve company: ${result.error}`;
        console.error(detailedError);
        setError(detailedError);
      }
    } catch (error) {
      const detailedError = `Error during approval process: ${error.message}`;
      console.error(detailedError);
      setError(detailedError);
    }

    setLoading(false);
  };

  const handleReject = async () => {
    setError("");

    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setLoading(true);

    try {
      const result = await rejectCompany(company.id, rejectionReason);
      if (result.success) {
        alert("Company rejected successfully!");
        onNavigate("admin-dashboard");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to reject company. Please try again.");
    }

    setLoading(false);
    setShowRejectModal(false);
  };

  const details = company.company_details || {};

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
              Company Verification
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              onClick={() => onNavigate("admin-dashboard")}
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Details */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-white/10 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">
                    {details.companyName || "Unknown Company"}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Registration Details for Verification
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Company Name
                        </Label>
                        <p className="text-white font-medium">
                          {details.companyName || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Industry Type
                        </Label>
                        <p className="text-white font-medium">
                          {details.industryType === "other"
                            ? details.otherIndustry
                            : details.industryType || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Registration Number
                        </Label>
                        <p className="text-white font-medium">
                          {details.businessRegistrationNumber || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Contact Person
                        </Label>
                        <p className="text-white font-medium">
                          {details.authorizedContactPerson || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Account Email
                        </Label>
                        <p className="text-white font-medium">
                          {company.email || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Official Email
                        </Label>
                        <p className="text-white font-medium">
                          {details.officialEmail || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Contact Number
                        </Label>
                        <p className="text-white font-medium">
                          {details.contactNumber || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Location
                        </Label>
                        <p className="text-white font-medium">
                          {details.city}, {details.state}, {details.country}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Registered Address
                        </Label>
                        <p className="text-white font-medium">
                          {details.registeredAddress || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-400">
                          Submitted Date
                        </Label>
                        <p className="text-white font-medium">
                          {company.detailsSubmittedAt
                            ? new Date(
                                company.detailsSubmittedAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verification Actions */}
            <div className="space-y-6">
              {/* Approve Section */}
              <Card className="glass-card border-emerald-500/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-emerald-400">
                    Approve Company
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Set carbon emission cap and approve registration
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">
                      Carbon Emission Cap (tons CO2/year) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10000"
                      value={carbonCap}
                      onChange={(e) => setCarbonCap(e.target.value)}
                      className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-400">
                      Annual carbon emission limit for this company
                    </p>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    {loading ? "Approving..." : "Approve Company"}
                  </Button>
                </CardContent>
              </Card>

              {/* Reject Section */}
              <Card className="glass-card border-red-500/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-400">
                    Reject Company
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Reject registration with reason
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 font-medium rounded-xl disabled:opacity-50"
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                  >
                    Reject Company
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-md glass-card border-red-500/20 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-400">
                Reject Company Registration
              </CardTitle>
              <CardDescription className="text-gray-400">
                Please provide a reason for rejection
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Rejection Reason *
                </Label>
                <textarea
                  className="w-full h-24 glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-red-500 rounded-xl p-3 bg-white/5 resize-none"
                  placeholder="Provide detailed reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-white/20 text-white hover:bg-white/10 rounded-xl"
                  onClick={() => setShowRejectModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl disabled:opacity-50"
                  onClick={handleReject}
                  disabled={loading}
                >
                  {loading ? "Rejecting..." : "Confirm Reject"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

export default CompanyVerificationPage;
