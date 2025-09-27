import React, { useState } from "react";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card.jsx";
import { saveCompanyDetails } from "./firebase.js";

const CompanyDetailsForm = ({ onNavigate = () => {}, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    industryType: "",
    otherIndustry: "",
    businessRegistrationNumber: "",
    registeredAddress: "",
    city: "",
    state: "",
    country: "",
    authorizedContactPerson: "",
    officialEmail: "",
    contactNumber: "",
  });

  const industryOptions = [
    { value: "cement", label: "Cement" },
    { value: "textile", label: "Textile" },
    { value: "chemical", label: "Chemical" },
    { value: "food", label: "Food" },
    { value: "other", label: "Other" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "companyName",
      "industryType",
      "businessRegistrationNumber",
      "registeredAddress",
      "city",
      "state",
      "country",
      "authorizedContactPerson",
      "officialEmail",
      "contactNumber",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        return false;
      }
    }

    if (formData.industryType === "other" && !formData.otherIndustry) {
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.officialEmail)) {
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const companyDetails = {
        ...formData,
        submittedAt: new Date().toISOString(),
      };

      const result = await saveCompanyDetails(user.uid, companyDetails);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onNavigate("verification-pending");
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to submit company details. Please try again.");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white relative overflow-hidden flex items-center justify-center">
        <Card className="w-full max-w-md glass-card border-white/10 shadow-2xl rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Details Submitted!
            </h2>
            <p className="text-gray-400">
              Your company details have been submitted for admin verification.
            </p>
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
              EcoChain
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Company Registration</span>
          </div>
        </div>
      </header>

      {/* Company Details Form */}
      <div className="relative z-10 pt-32 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-white/10 shadow-2xl rounded-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Company Details
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Please provide your company information for verification.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Company Name */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Company Name *</Label>
                <Input
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                  disabled={loading}
                />
              </div>

              {/* Industry Type */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Industry Type *
                </Label>
                <Select
                  value={formData.industryType}
                  onValueChange={(value) =>
                    handleInputChange("industryType", value)
                  }
                >
                  <SelectTrigger className="glass-card border-white/20 text-white focus:border-emerald-500 rounded-xl h-12 bg-white/5">
                    <SelectValue placeholder="Select industry type" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20 rounded-xl bg-[#0F1821] text-white">
                    {industryOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white hover:bg-white/10 rounded-lg"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Other Industry (conditional) */}
              {formData.industryType === "other" && (
                <div className="space-y-2">
                  <Label className="text-white font-medium">
                    Specify Other Industry *
                  </Label>
                  <Input
                    placeholder="Specify your industry"
                    value={formData.otherIndustry}
                    onChange={(e) =>
                      handleInputChange("otherIndustry", e.target.value)
                    }
                    className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Business Registration Number */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Business Registration / License No. *
                </Label>
                <Input
                  placeholder="Enter registration number"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) =>
                    handleInputChange(
                      "businessRegistrationNumber",
                      e.target.value
                    )
                  }
                  className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                  disabled={loading}
                />
              </div>

              {/* Registered Address */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Registered Address *
                </Label>
                <Input
                  placeholder="Enter complete address"
                  value={formData.registeredAddress}
                  onChange={(e) =>
                    handleInputChange("registeredAddress", e.target.value)
                  }
                  className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                  disabled={loading}
                />
              </div>

              {/* City, State, Country */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium">City *</Label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">
                    State / Province *
                  </Label>
                  <Input
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Country *</Label>
                  <Input
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Authorized Contact Person */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Authorized Contact Person *
                </Label>
                <Input
                  placeholder="Full name of contact person"
                  value={formData.authorizedContactPerson}
                  onChange={(e) =>
                    handleInputChange("authorizedContactPerson", e.target.value)
                  }
                  className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                  disabled={loading}
                />
              </div>

              {/* Official Email */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Official Email ID *
                </Label>
                <Input
                  type="email"
                  placeholder="official@company.com"
                  value={formData.officialEmail}
                  onChange={(e) =>
                    handleInputChange("officialEmail", e.target.value)
                  }
                  className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                  disabled={loading}
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Contact Number *
                </Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                  disabled={loading}
                />
              </div>

              <div className="pt-6">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 font-medium rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit for Verification"}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-400">
                * All fields are required. Your information will be reviewed by
                our admin team.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsForm;
