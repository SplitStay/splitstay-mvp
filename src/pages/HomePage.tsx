import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/amplitude";
import { EmailConfirmationHandler } from "@/components/EmailConfirmationHandler";
import logoImage from "@/assets/logo.jpg"
import logoImageWhite from "@/assets/logoWhite.jpeg"
import heroImage from "@/assets/hero-2.png"

// Trustpilot global type
declare global {
  interface Window {
    Trustpilot: {
      loadFromElement: (element: Element | null) => void;
    };
  }
}

type UserPath = "host" | "guest" | null;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<UserPath>(null);
  
  const { user, loading } = useAuth();
  
  // Check if this is an email confirmation or OAuth redirect
  const urlParams = new URLSearchParams(window.location.search);
  const isEmailConfirmation = urlParams.get('type') === 'signup';
  // Only show OAuth loading if we have actual auth tokens to process
  const isOAuthCallback = window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token');

  useEffect(() => {
    trackEvent('Homepage_View')
    
    // Check if Trustpilot script already exists
    const existingScript = document.querySelector('script[src*="tp.widget.bootstrap"]');
    
    if (!existingScript) {
      // Load Trustpilot script
      const trustpilotScript = document.createElement('script');
      trustpilotScript.type = 'text/javascript';
      trustpilotScript.src = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
      trustpilotScript.async = true;
      
      // Initialize widgets after script loads
      trustpilotScript.onload = () => {
        setTimeout(() => {
          if (window.Trustpilot) {
            window.Trustpilot.loadFromElement(document.querySelector('.trustpilot-widget'));
          }
        }, 200);
      };
      
      document.head.appendChild(trustpilotScript);
    } else {
      // Script already exists, just initialize
      setTimeout(() => {
        if (window.Trustpilot) {
          window.Trustpilot.loadFromElement(document.querySelector('.trustpilot-widget'));
        }
      }, 200);
    }
  }, [])

  const handleGetStarted = () => {
    navigate('/dashboard');
  };
  
  // Handle email confirmation redirect
  if (isEmailConfirmation) {
    return <EmailConfirmationHandler />;
  }
  
  // Handle OAuth callback redirect - only show loading if we have tokens to process
  if (isOAuthCallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img src={logoImageWhite} alt="SplitStay" className="h-8 w-auto" />
              <span className="text-xl font-bold text-blue-600">SplitStay</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-6">
                <a href="/" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                  Home
                </a>
                <a href="/how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  How it Works
                </a>
              </nav>
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-3">
              <a href="/how-it-works" className="text-gray-700 hover:text-blue-600 font-medium text-sm">
                How it Works
              </a>
              <button
                onClick={handleGetStarted}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gray-100">
        {/* Hero Image Background */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Travel together, save money" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Card Overlay */}
        <div className="relative z-10 flex items-center min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              {/* Gray Content Card with Opacity */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10 lg:p-12">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Share your<br />
                  accommodation.<br />
                  Save money.<br />
                  Meet travelers.
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
                  You're early — and that's exactly the point. SplitStay is just opening up. The 
                  first few travelers shape what this becomes. Want to be one of them?
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 text-base px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Post Your Trip
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup')}
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 text-base px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Create Profile
                  </Button>
                </div>
                
                {/* Login Link */}
                {!user && (
                  <p className="text-gray-300 mt-6 text-sm">
                    Already have a profile?{" "}
                    <Link 
                      to="/login"
                      className="text-white hover:text-gray-100 underline transition-colors duration-300 font-medium"
                    >
                      Log in
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* User Path Selection Cards */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              How do you want to travel?
            </h2>
            <p className="text-lg text-gray-600">
              Choose your path and start your journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Host Card */}
            <div 
              className={`bg-white border-2 rounded-xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                selectedPath === "host" 
                  ? "border-blue-600 bg-blue-50 shadow-xl" 
                  : "border-gray-200 hover:border-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => {
                setSelectedPath("host");
                navigate('/post-trip');
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Have an accommodation to share?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Already booked a place? Post your stay to find a roommate.
              </p>
            </div>
            
            {/* Guest Card */}
            <div 
              className={`bg-white border-2 rounded-xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                selectedPath === "guest" 
                  ? "border-purple-600 bg-purple-50 shadow-xl" 
                  : "border-gray-200 hover:border-purple-600 hover:bg-purple-50"
              }`}
              onClick={() => {
                setSelectedPath("guest");
                navigate('/find-partners');
              }}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Looking to join someone else's trip?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Browse open stays and message the traveler.
              </p>
            </div>
            
          </div>
        </div>
      </section>
        
      {/* Benefits Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Why travelers love SplitStay
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of travelers saving money and making connections
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Cost Savings Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Cost Savings</h4>
              <p className="text-gray-600 leading-relaxed">
                Save up to 50% on your accommodation costs by sharing with verified travelers
              </p>
            </div>

            {/* Flexible Accommodations Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Flexible Options</h4>
              <p className="text-gray-600 leading-relaxed">
                Split hotel rooms or full apartments at any destination
              </p>
            </div>

            {/* Meaningful Matches Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Verified Matches</h4>
              <p className="text-gray-600 leading-relaxed">
                Connect with verified travelers for meaningful and safe experiences
              </p>
            </div>

          </div>
          
          {/* Trustpilot Section */}
          <div className="mt-12 sm:mt-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Trusted by Travelers Worldwide
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              See what our community says about their SplitStay experiences
            </p>
            
            <div className="trustpilot-widget" 
                 data-locale="fr-FR" 
                 data-template-id="56278e9abfbbba0bdcd568bc" 
                 data-businessunit-id="68c2e6929c48f935dec54d57" 
                 data-style-height="52px" 
                 data-style-width="100%" 
                 data-token="ca6782ba-27ae-4953-8e1c-277fd41b135b">
              <a href="https://fr.trustpilot.com/review/splitstay.travel" 
                 target="_blank" 
                 rel="noopener">
                Trustpilot
              </a>
            </div>
          </div>
        </div>
      </section>
        
      {/* Badges section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Earn your badge. Join the SplitStay movement.
            </h2>
            <p className="text-lg text-gray-600">
              Celebrate your contribution and unlock early perks with SplitStay.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Ambassador Badge */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8 text-center hover:shadow-xl hover:scale-[1.02] hover:border-green-400 transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Ambassador</h4>
              <p className="text-gray-600 mb-4">
                Invited 3+ friends to SplitStay — help the community grow
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-green-500 h-3 rounded-full w-2/3"></div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Invited 2 of 3 friends</p>
            </div>
            
            {/* Trip Host Badge */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8 text-center hover:shadow-xl hover:scale-[1.02] hover:border-blue-400 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Trip Host</h4>
              <p className="text-gray-600 mb-4">
                Post a stay and match with at least 1 traveler to earn this badge
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-blue-500 h-3 rounded-full w-full"></div>
              </div>
              <p className="text-sm text-gray-500 font-medium">1 of 1 successful match</p>
            </div>
            
            {/* Pioneer Badge */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8 text-center hover:shadow-xl hover:scale-[1.02] hover:border-purple-400 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Pioneer</h4>
              <p className="text-gray-600 mb-4">
                One of the first 100 active users on the platform
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-purple-500 h-3 rounded-full w-4/5"></div>
              </div>
              <p className="text-sm text-gray-500 font-medium">User #47 of 100</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-300">© 2025 SplitStay · Built with love by solo travelers</p>
        </div>
      </footer>
    </div>
  );
};

export { HomePage };