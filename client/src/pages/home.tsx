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
          Share your hotel room. Save money. Meet travelers.
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
        
        {/* Stats Section */}
        <div className="mb-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-navy mb-6 text-center">
            Top cities this month:
          </h3>
          <div className="space-y-4 text-center">
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-navy">Munich</span> – 18 travelers looking to share rooms
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-navy">Barcelona</span> – 7 shared trips posted this week
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-navy">New York</span> – 12 open stays available
            </p>
          </div>
        </div>
        
        {/* Incentives section */}
        <div className="mb-16 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 px-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
              <h4 className="text-xl font-bold text-navy mb-3">Ambassador</h4>
              <p className="text-gray-600">
                Shared their journey and invited 3 friends
              </p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
              <h4 className="text-xl font-bold text-navy mb-3">Room Sharer</h4>
              <p className="text-gray-600">
                Posted a hotel room and matched successfully
              </p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
              <h4 className="text-xl font-bold text-navy mb-3">Pioneer</h4>
              <p className="text-gray-600">
                One of the first 100 active users
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
