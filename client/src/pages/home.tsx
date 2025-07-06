import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bed, UserPlus, Eye, CheckCircle, ChevronRight } from "lucide-react";
// Import the SplitStay logo with transparent background
import logoImage from "@assets/Splitstay Logo Transparent_1751765053004.png";

const Home: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-cream py-2">
      <div className="w-full text-center">
        
        {/* Logo */}
        <div className="mb-2">
          <img 
            src={logoImage} 
            alt="SplitStay Logo" 
            className="h-48 lg:h-64 w-auto mx-auto"
          />
        </div>
        
        {/* Headline */}
        <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
          Share your accommodation. Save money. Meet travelers.
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-navy mb-8 leading-relaxed max-w-4xl mx-auto">
          You're early — and that's exactly the point. SplitStay is just opening up. The first few travelers shape what this becomes. Want to be one of them?
        </p>
        
        {/* User Path CTA Section - Two Cards */}
        <div className="w-full mb-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 px-4">
            
            {/* Card 1 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-navy transition-all duration-300 cursor-pointer"
                 onClick={() => navigate("/create-profile")}>
              <h2 className="text-xl font-bold text-navy mb-3">
                Have an accommodation to share?
              </h2>
              <p className="text-gray-600">
                Already booked a place? Post your stay to find a roommate.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-navy transition-all duration-300 cursor-pointer"
                 onClick={() => navigate("/find-roommate")}>
              <h2 className="text-xl font-bold text-navy mb-3">
                Looking to join someone else's trip?
              </h2>
              <p className="text-gray-600">
                Browse open stays and message the traveler.
              </p>
            </div>
            
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mb-12">
          <Button
            className="bg-navy hover:bg-navy-dark text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors"
            onClick={() => navigate("/find-roommate")}
          >
            Find Your Roommate
          </Button>
        </div>
        
        {/* Benefits Section */}
        <div className="mb-16 max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-navy mb-8 text-center">
            Why travelers love SplitStay
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cost Savings Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
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
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-navy mb-3">Flexible Options</h4>
              <p className="text-gray-600 leading-relaxed">
                Split rooms, apartments, or weekend stays across any destination
              </p>
            </div>

            {/* Meaningful Matches Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
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
              🏅 Earn your badge. Join the SplitStay movement.
            </h3>
            <p className="text-gray-600">
              Celebrate your contribution and unlock early perks with SplitStay.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-navy transition-all duration-300">
              <h4 className="text-xl font-bold text-navy mb-3">Ambassador</h4>
              <p className="text-gray-600">
                Invited 3+ friends to SplitStay — help the community grow
              </p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-navy transition-all duration-300">
              <h4 className="text-xl font-bold text-navy mb-3">Trip Host</h4>
              <p className="text-gray-600">
                Posted accommodation and successfully matched with a traveler
              </p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-navy transition-all duration-300">
              <h4 className="text-xl font-bold text-navy mb-3">Pioneer</h4>
              <p className="text-gray-600">
                One of the first 100 active users on the platform
              </p>
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

export default Home;
