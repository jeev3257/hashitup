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
import { adminLogin } from "./firebase.js";

const AdminLogin = ({ onNavigate = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        onNavigate("admin-dashboard");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Login failed. Please try again.");
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
              EcoChain Admin
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              onClick={() => onNavigate("login")}
            >
              Company Login
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] px-6 pt-24">
        <Card className="w-full max-w-md glass-card border-white/10 shadow-2xl rounded-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              Access the EcoChain admin verification portal.
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
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gmail.com"
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
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-xl text-sm">
              <strong>Demo Credentials:</strong>
              <br />
              Email: admin@gmail.com
              <br />
              Password: 123456
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 font-medium rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-50"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center pt-4">
              <button
                onClick={() => onNavigate("landing")}
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                disabled={loading}
              >
                ← Back to Home
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
          <span>© 2024 EcoChain Admin Portal. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
