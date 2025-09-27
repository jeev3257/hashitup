import React from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function PendingVerificationStatus({ companyData, onNavigate }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending_admin_verification":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "approved":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending_admin_verification":
        return <Clock className="w-5 h-5" />;
      case "approved":
        return <CheckCircle className="w-5 h-5" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending_admin_verification":
        return "Pending Admin Verification";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown Status";
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      {/* Header */}
      <div className="glass-card border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-400/25">
              <span className="text-white text-lg font-bold">E</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              EcoChain
            </span>
          </div>
          <Button
            variant="outline"
            className="border-white/20 text-gray-300 hover:bg-white/10"
            onClick={() => onNavigate("landing")}
          >
            Back to Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Status Banner */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/25">
                <Clock className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Verification in Progress
            </h1>
            <p className="text-xl text-gray-400 mb-6">
              Your company registration is being reviewed by our admin team.
            </p>
            <Badge
              className={`text-sm px-4 py-2 rounded-lg ${getStatusColor(
                companyData?.registrationStatus
              )}`}
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon(companyData?.registrationStatus)}
                <span>{getStatusText(companyData?.registrationStatus)}</span>
              </div>
            </Badge>
          </div>

          {/* Company Details Card */}
          <Card className="glass-card border-white/10 rounded-xl mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Review your submitted information below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Company Name
                    </label>
                    <p className="text-white font-semibold text-lg">
                      {companyData?.companyName || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Industry
                    </label>
                    <p className="text-white">
                      {companyData?.industry || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Company Size
                    </label>
                    <p className="text-white">
                      {companyData?.companySize || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Annual Emissions
                    </label>
                    <p className="text-white">
                      {companyData?.annualEmissions || "N/A"} tons CO₂
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-400">
                        Email
                      </label>
                      <p className="text-white">
                        {companyData?.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-400">
                        Phone
                      </label>
                      <p className="text-white">
                        {companyData?.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-400">
                        Address
                      </label>
                      <p className="text-white">
                        {companyData?.address || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-400">
                        Submitted
                      </label>
                      <p className="text-white">
                        {formatDate(companyData?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="glass-card border-white/10 rounded-xl mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Admin Review</h4>
                    <p className="text-gray-400 text-sm">
                      Our team will verify your company information and
                      documentation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Blockchain Setup
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Once approved, we'll create your blockchain wallet and set
                      emission caps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Dashboard Access
                    </h4>
                    <p className="text-gray-400 text-sm">
                      You'll gain access to your personalized carbon credit
                      management dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="text-center">
            <Card className="glass-card border-white/10 rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Need Help?
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  If you have any questions about the verification process, our
                  support team is here to help.
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/25">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
