import React, { useState, useEffect } from "react";
import { Button } from "./ui/button.jsx";
import { Card, CardContent } from "./ui/card.jsx";
import {
  Wifi,
  Brain,
  Shield,
  ShoppingCart,
  Coins,
  Link,
  Zap,
  Database,
  Globe,
  Lock,
  Blocks,
  Network,
  Binary,
  Hash,
  Key,
  Server,
  Cpu,
  HardDrive,
} from "lucide-react";

const LandingPage = ({ onNavigate = () => {} }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Wifi,
      title: "IoT Monitoring",
      description:
        "Real-time data collection from environmental sensors for accurate carbon footprint tracking.",
    },
    {
      icon: Brain,
      title: "AI Forecasting",
      description:
        "Predictive analytics to forecast carbon emissions and optimize reduction strategies.",
    },
    {
      icon: Shield,
      title: "Blockchain Credits",
      description:
        "Immutable and transparent carbon credits on a secure blockchain ledger.",
    },
    {
      icon: ShoppingCart,
      title: "Marketplace",
      description:
        "A decentralized marketplace for buying and selling verified carbon credits.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white relative overflow-hidden">
      {/* Scroll-Reactive 3D Blockchain Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#0F1821] to-[#0B0F17]" />

        {/* Optimized 3D Floating Blockchain Cubes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={`cube-${i}`}
              className="absolute w-6 h-6 border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-transparent backdrop-blur-sm will-change-transform"
              style={{
                left: `${10 + i * 7}%`,
                top: `${20 + (i % 4) * 20}%`,
                transform: `
                  rotateX(45deg) rotateY(45deg) rotateZ(${
                    scrollY * 0.05 + i * 30
                  }deg)
                  translate3d(${Math.sin(scrollY * 0.005 + i) * 8}px, ${
                  scrollY * (0.01 + i * 0.003)
                }px, 0)
                `,
                animation: `float-${i % 3} ${
                  8 + (i % 3)
                }s infinite ease-in-out`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.25 + (i % 3) * 0.1,
              }}
            />
          ))}
        </div>

        {/* Optimized Network Nodes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={`node-${i}`}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 will-change-transform"
              style={{
                left: `${15 + i * 9}%`,
                top: `${25 + (i % 5) * 15}%`,
                transform: `
                  scale(${1 + Math.sin(scrollY * 0.01 + i) * 0.2})
                  translate3d(0, ${scrollY * 0.02}px, 0)
                `,
                animation: `blockchain-pulse ${
                  3 + (i % 2)
                }s infinite ease-in-out`,
                animationDelay: `${i * 0.25}s`,
                opacity: 0.5 + (i % 2) * 0.2,
              }}
            />
          ))}
        </div>

        {/* Dynamic Network Connections */}
        <svg className="absolute inset-0 w-full h-full opacity-40">
          <defs>
            <linearGradient
              id="connectionGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <line
              key={`connection-${i}`}
              x1={`${15 + i * 10}%`}
              y1={`${25 + (i % 4) * 20}%`}
              x2={`${35 + i * 8}%`}
              y2={`${45 + (i % 3) * 15}%`}
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              strokeDasharray="4 4"
              style={{
                strokeDashoffset: -scrollY * 0.1,
                animation: `network-connect ${4 + (i % 3)}s infinite linear`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </svg>

        {/* Optimized Particle System */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400/40 to-blue-400/40 rounded-full will-change-transform"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `translate3d(0, ${
                  scrollY * (0.03 + i * 0.001)
                }px, 0)`,
                animation: `drift ${12 + (i % 6)}s infinite linear`,
                animationDelay: `${i * 0.4}s`,
                opacity: 0.3 + (i % 3) * 0.1,
              }}
            />
          ))}
        </div>

        {/* Falling Blockchain Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[Coins, Link, Zap, Database, Globe, Lock, Blocks, Network].map(
            (Icon, i) => (
              <Icon
                key={`falling-icon-${i}`}
                className="absolute text-emerald-400/40 will-change-transform"
                style={{
                  left: `${8 + i * 11}%`,
                  width: `${20 + (i % 3) * 4}px`,
                  height: `${20 + (i % 3) * 4}px`,
                  animation: `fall-smooth ${15 + (i % 4) * 3}s infinite linear`,
                  animationDelay: `${i * 2}s`,
                }}
              />
            )
          )}

          {/* Second layer with zigzag motion */}
          {[Binary, Hash, Key, Server].map((Icon, i) => (
            <Icon
              key={`falling-zigzag-${i}`}
              className="absolute text-blue-400/35 will-change-transform"
              style={{
                left: `${12 + i * 18}%`,
                width: `${18 + (i % 2) * 3}px`,
                height: `${18 + (i % 2) * 3}px`,
                animation: `fall-zigzag ${18 + (i % 3) * 2}s infinite linear`,
                animationDelay: `${5 + i * 3}s`,
              }}
            />
          ))}

          {/* Third layer with rotation */}
          {[Cpu, HardDrive, Shield, Wifi].map((Icon, i) => (
            <Icon
              key={`falling-rotate-${i}`}
              className="absolute text-purple-400/30 will-change-transform"
              style={{
                left: `${20 + i * 16}%`,
                width: `${16 + (i % 2) * 2}px`,
                height: `${16 + (i % 2) * 2}px`,
                animation: `fall-rotate ${20 + (i % 2) * 4}s infinite linear`,
                animationDelay: `${8 + i * 4}s`,
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

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
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
              onClick={() => onNavigate("admin-login")}
            >
              Admin
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              onClick={() => onNavigate("login")}
            >
              Company Login
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 shadow-lg shadow-emerald-600/25"
              onClick={() => onNavigate("signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white mb-2">
              Automating Carbon Credits
            </span>
            <span className="block text-white">
              with IoT, AI, and Blockchain
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            EcoChain leverages cutting-edge technologies to streamline carbon
            credit management, ensuring transparency and efficiency in
            environmental sustainability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-base lg:text-lg px-8 lg:px-12 py-3 lg:py-4 h-12 lg:h-14 font-medium shadow-xl shadow-emerald-600/25 rounded-xl w-full sm:w-auto"
              onClick={() => onNavigate("login")}
            >
              Company Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/20 text-white hover:bg-white/10 text-base lg:text-lg px-8 lg:px-12 py-3 lg:py-4 h-12 lg:h-14 font-medium rounded-xl backdrop-blur-sm w-full sm:w-auto"
              onClick={() => onNavigate("marketplace")}
            >
              Explore Marketplace
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Key Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light">
              Discover how our advanced technology stack revolutionizes carbon
              credit management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass-card hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-300 group border-white/10 rounded-2xl"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-emerald-400/20">
                    <feature.icon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 glass-card">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">E</span>
              </div>
              <span className="text-xl font-semibold">EcoChain</span>
              <span className="text-gray-400">© 2024 All rights reserved.</span>
            </div>

            <div className="flex space-x-8">
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors font-medium"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors font-medium"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
