import React from "react";
import { Button } from "./ui/button.jsx";
import { Card, CardContent } from "./ui/card.jsx";

const VerificationPendingPage = ({ onNavigate = () => {} }) => {
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
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <Card className="w-full max-w-2xl glass-card border-white/10 shadow-2xl rounded-2xl">
          <CardContent className="p-12 text-center">
            {/* Icon */}
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              Verification Pending
            </h1>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Thank you for submitting your company details! Your information is
              currently being reviewed by our admin team.
            </p>

            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                What happens next?
              </h3>
              <ul className="text-gray-300 space-y-2 text-left">
                <li>• Our admin team will review your company information</li>
                <li>• Verification typically takes 2-3 business days</li>
                <li>• You'll receive an email notification once approved</li>
                <li>
                  • After approval, you can access the full EcoChain platform
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-emerald-600/25"
                onClick={() => onNavigate("landing")}
              >
                Return to Home
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-xl backdrop-blur-sm"
                onClick={() => onNavigate("login")}
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-6 text-gray-500 border-t border-white/10 glass-card">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span>© 2024 EcoChain. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default VerificationPendingPage;
