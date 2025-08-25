import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/amplitude";
import { EmailConfirmationHandler } from "@/components/EmailConfirmationHandler";
import logoImage from "@/assets/logo.jpg"
import logoImageWhite from "@/assets/logoWhite.jpeg"
type UserPath = "host" | "guest" | null;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<UserPath>(null);
  
  const { user, loading } = useAuth();
  
  // Check if this is an email confirmation redirect
  const urlParams = new URLSearchParams(window.location.search);
  const isEmailConfirmation = urlParams.get('type') === 'signup';

  useEffect(() => {
    trackEvent('Homepage_View')
  }, [])

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleCreateProfile = () => {
    navigate('/signup');
  };
  
  // Handle email confirmation redirect
  if (isEmailConfirmation) {
    return <EmailConfirmationHandler />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full h-full">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img src={logoImageWhite} alt="SplitStay" className="h-8 w-auto" />
              <span className="text-xl font-bold text-navy">SplitStay</span>
            </Link>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4 md:space-x-6">
                <a href="/" className="text-navy font-medium border-b-2 border-navy pb-1 text-sm md:text-base">
                  Home
                </a>
                <a href="/how-it-works" className="text-gray-700 hover:text-navy font-medium text-sm md:text-base">
                  How it Works
                </a>
              </nav>
              <button
                onClick={handleGetStarted}
                className="px-3 py-2 md:px-4 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors text-sm md:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full text-center px-4">
        
        {/* Logo */}
        <div className="mb-8 mt-2">
          <img 
            src={logoImage} 
            alt="SplitStay Logo" 
            className="h-36 lg:h-64 w-auto mx-auto mb-4"
          />
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">
          Share your accommodation. Save money. Meet travelers.
        </h2>
        
        {/* Subtitle */}
        <p className="text-lg text-navy mb-8 leading-relaxed max-w-4xl mx-auto">
          You're early — and that's exactly the point. SplitStay is just opening up. The first few travelers shape what this becomes. Want to be one of them?
        </p>
        
        {/* User Path Selection Cards */}
        <div className="w-full mb-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 px-4">
            
            {/* Host Card */}
            <div 
              className={`bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                selectedPath === "host" 
                  ? "border-navy bg-navy/5 shadow-lg" 
                  : "border-gray-200 hover:border-navy"
              }`}
              onClick={() => {
                setSelectedPath("host");
                navigate('/post-trip');
              }}
            >
              <h2 className="text-xl font-bold text-navy mb-3">
                Have an accommodation to share?
              </h2>
              <p className="text-gray-600">
                Already booked a place? Post your stay to find a roommate.
              </p>
            </div>
            
            {/* Guest Card */}
            <div 
              className={`bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                selectedPath === "guest" 
                  ? "border-navy bg-navy/5 shadow-lg" 
                  : "border-gray-200 hover:border-navy"
              }`}
              onClick={() => {
                setSelectedPath("guest");
                navigate('/find-partners');
              }}
            >
              <h2 className="text-xl font-bold text-navy mb-3">
                Looking to join someone else's trip?
              </h2>
              <p className="text-gray-600">
                Browse open stays and message the traveler.
              </p>
            </div>
            
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mb-4">
          <Button 
            onClick={handleCreateProfile}
            size="lg"
            className="bg-navy text-white hover:bg-navy/90 text-lg px-8 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Create My Profile
          </Button>
        </div>
        
        {/* Login Link */}
        {!user && (
          <div className="mb-16">
            <p className="text-gray-600">
              Already have a profile?{" "}
              <Link 
                to="/login"
                className="text-navy hover:text-navy/80 underline transition-colors duration-300"
              >
                Log in
              </Link>
            </p>
          </div>
        )}
        
        {/* Benefits Section */}
        <div className="mb-16 max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-navy mb-8 text-center">
            Why travelers love SplitStay
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cost Savings Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-navy mb-3">Cost Savings</h4>
              <p className="text-gray-600 leading-relaxed">
                Save up to 50% on your accommodation costs by sharing with verified travelers
              </p>
            </div>

            {/* Flexible Accommodations Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-navy mb-3">Flexible Options</h4>
              <p className="text-gray-600 leading-relaxed">
                Split hotel rooms or full apartments at any destination
              </p>
            </div>

            {/* Meaningful Matches Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-navy mb-3">Verified Matches</h4>
              <p className="text-gray-600 leading-relaxed">
                Connect with verified travelers for meaningful and safe experiences
              </p>
            </div>

          </div>
        </div>
        
        {/* Badges section */}
        <div className="mb-16 max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-navy mb-2">
              Earn your badge. Join the SplitStay movement.
            </h3>
            <p className="text-gray-600">
              Celebrate your contribution and unlock early perks with SplitStay.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ambassador Badge */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-xl hover:scale-[1.02] hover:border-green-300 transition-all duration-300">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h4 className="text-2xl font-extrabold text-navy mb-3">Ambassador</h4>
              <p className="text-gray-600 mb-4">
                Invited 3+ friends to SplitStay — help the community grow
              </p>
              {/* Progress Indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full w-2/3"></div>
              </div>
              <p className="text-sm text-gray-500">Invited 2 of 3 friends</p>
            </div>
            
            {/* Trip Host Badge */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-xl hover:scale-[1.02] hover:border-blue-300 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
              </div>
              <h4 className="text-2xl font-extrabold text-navy mb-3">Trip Host</h4>
              <p className="text-gray-600 mb-4">
                Post a stay and match with at least 1 traveler to earn this badge
              </p>
              {/* Progress Indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-blue-500 h-2 rounded-full w-full"></div>
              </div>
              <p className="text-sm text-gray-500">1 of 1 successful match</p>
            </div>
            
            {/* Pioneer Badge */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-xl hover:scale-[1.02] hover:border-purple-300 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-2xl font-extrabold text-navy mb-3">Pioneer</h4>
              <p className="text-gray-600 mb-4">
                One of the first 100 active users on the platform
              </p>
              {/* Progress Indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-purple-500 h-2 rounded-full w-4/5"></div>
              </div>
              <p className="text-sm text-gray-500">User #47 of 100</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center text-gray-500 py-8">
          <p>© 2025 SplitStay · Built with love by solo travelers</p>
        </footer>
        
      </div>
    </div>
  );
};

export { HomePage };