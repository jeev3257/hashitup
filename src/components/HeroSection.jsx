import React, { useState } from 'react';

const HeroSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-green-300 rounded-full opacity-40 animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-green-500 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-green-400 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/6 w-2 h-2 bg-green-300 rounded-full opacity-40 animate-ping"></div>
        <div className="absolute top-1/6 left-1/6 w-1 h-1 bg-green-500 rounded-full opacity-30 animate-bounce"></div>
        
        {/* Abstract Chain Links */}
        <div className="absolute top-1/4 right-1/5 text-green-400 opacity-20 text-2xl rotate-45">⛓️</div>
        <div className="absolute bottom-1/4 left-1/5 text-green-300 opacity-15 text-xl rotate-12">🔗</div>
        <div className="absolute top-2/3 right-1/3 text-green-500 opacity-10 text-3xl -rotate-12">⚡</div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-white text-xl font-bold">EcoChain</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-green-400 transition-colors duration-200">Home</a>
            <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-200">Marketplace</a>
            <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-200">Solutions</a>
            <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-200">About</a>
            <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-200">Contact</a>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Login</a>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-green-400 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-gray-700">
            <div className="px-4 py-4 space-y-4">
              <a href="#" className="block text-white hover:text-green-400 transition-colors duration-200">Home</a>
              <a href="#" className="block text-gray-300 hover:text-green-400 transition-colors duration-200">Marketplace</a>
              <a href="#" className="block text-gray-300 hover:text-green-400 transition-colors duration-200">Solutions</a>
              <a href="#" className="block text-gray-300 hover:text-green-400 transition-colors duration-200">About</a>
              <a href="#" className="block text-gray-300 hover:text-green-400 transition-colors duration-200">Contact</a>
              <div className="pt-4 border-t border-gray-700 space-y-3">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">Login</a>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Automating Carbon Credits{' '}
            <span className="block">
              with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                IoT, AI, and Blockchain
              </span>
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 leading-relaxed mb-8 max-w-3xl mx-auto">
            EcoChain leverages cutting-edge technologies to streamline carbon credit 
            management, ensuring transparency and efficiency in environmental 
            sustainability.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-green-600/25">
              Get Started
            </button>
            <button className="w-full sm:w-auto bg-transparent border-2 border-gray-600 hover:border-green-400 text-white hover:text-green-400 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105">
              Explore Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default HeroSection;