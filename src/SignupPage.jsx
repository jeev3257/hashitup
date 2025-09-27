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
import { registerCompany } from "./firebase.js";

const SignupPage = ({ onNavigate = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const result = await registerCompany(email, password);
      if (result.success) {
        // Navigate to company details form
        onNavigate("company-details", { user: result.user });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    }

    setLoading(false);
  };

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
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate("landing")}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-400/25">
              <span className="text-white text-lg font-bold">E</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              EcoChain
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              onClick={() => onNavigate("landing")}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Marketplace
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Solutions
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              onClick={() => onNavigate("login")}
            >
              Login
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 shadow-lg shadow-emerald-600/25 rounded-xl">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Signup Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] px-6 pt-24">
        <Card className="w-full max-w-md glass-card border-white/10 shadow-2xl rounded-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              Join EcoChain as a company to start your carbon credit journey.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="company@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                disabled={loading}
              />
              <p className="text-xs text-gray-400">
                Must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-white font-medium"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-500 rounded-xl h-12 bg-white/5"
                disabled={loading}
              />
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 font-medium rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-50"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center pt-4">
              <span className="text-gray-400">Already have an account? </span>
              <button
                onClick={() => onNavigate("login")}
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                disabled={loading}
              >
                Sign In
              </button>
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

export default SignupPage;
