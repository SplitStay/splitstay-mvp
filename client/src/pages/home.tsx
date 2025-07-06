import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bed, UserPlus, Eye, CheckCircle, ChevronRight } from "lucide-react";
// Import the SplitStay logo with transparent background
import logoImage from "@assets/Splitstay Logo Transparent_1751765053004.png";

const Home: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="w-full text-center">
        
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={logoImage} 
            alt="SplitStay Logo" 
            className="h-32 lg:h-40 w-auto mx-auto"
          />
        </div>
        
        {/* Subtitle */}
        <p className="text-2xl text-navy mb-16 leading-relaxed">
          You're early — and that's exactly the point.<br />
          SplitStay is just opening up. The first few travelers<br />
          shape what this becomes. Want to be one of<br />
          them?
        </p>
        
        {/* Two columns section */}
        <div className="w-full mb-16">
          <div className="flex justify-between items-start px-20">
            
            {/* Left column */}
            <div className="w-1/2 text-center pr-16">
              <h2 className="text-3xl font-bold text-navy mb-6">
                Have an accommodation<br />
                to share?
              </h2>
              <p className="text-xl text-navy opacity-80">
                Post your stay to<br />
                find a roommate
              </p>
            </div>
            
            {/* Right column */}
            <div className="w-1/2 text-center pl-16">
              <h2 className="text-3xl font-bold text-navy mb-6">
                Looking to join<br />
                someone else's trip?
              </h2>
              <p className="text-xl text-navy opacity-80">
                Browse open stays<br />
                and save money
              </p>
            </div>
            
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mb-20">
          <Button
            className="bg-navy hover:bg-navy-dark text-white px-12 py-4 text-xl font-semibold rounded-xl"
            onClick={() => navigate("/signup")}
          >
            Create your profile
          </Button>
        </div>
        
        {/* Location examples */}
        <div className="text-left mb-16 space-y-6 px-64">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🍺</span>
            <div>
              <span className="font-bold text-navy">Munich – Oktoberfest:</span>
              <span className="text-navy opacity-80 ml-2">18 travelers open to sharing a hotel room this September</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">🏰</span>
            <div>
              <span className="font-bold text-navy">Barcelona – August:</span>
              <span className="text-navy opacity-80 ml-2">7 shared trips posted this week</span>
            </div>
          </div>
        </div>
        
        {/* Incentives section */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-navy mb-12">
            Incentives to share:
          </h3>
          
          <div className="grid md:grid-cols-3 gap-12 px-64">
            <div className="bg-navy text-white p-8 rounded-2xl text-center">
              <div className="text-3xl mb-4">💫</div>
              <h4 className="text-xl font-bold mb-3">Ambassador</h4>
              <p className="text-cream opacity-90">
                Shared journey<br />
                + invited 3 friends
              </p>
            </div>
            
            <div className="bg-navy text-white p-8 rounded-2xl text-center">
              <div className="text-3xl mb-4">🏨</div>
              <h4 className="text-xl font-bold mb-3">Room Sharer</h4>
              <p className="text-cream opacity-90">
                Posted a hotel<br />
                room and matched
              </p>
            </div>
            
            <div className="bg-navy text-white p-8 rounded-2xl text-center">
              <div className="text-3xl mb-4">🚀</div>
              <h4 className="text-xl font-bold mb-3">Pioneer</h4>
              <p className="text-cream opacity-90">
                One of the first<br />
                100 active users
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Home;
