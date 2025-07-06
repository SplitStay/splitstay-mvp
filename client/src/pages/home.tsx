import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bed, UserPlus, Eye, CheckCircle, ChevronRight } from "lucide-react";
// Import the logo directly
import logoImage from "../assets/LOGO_TP.png";

const Home: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="w-full text-center">
        
        {/* Main Title */}
        <h1 className="text-7xl font-bold text-black mb-12">
          SplitStay
        </h1>
        
        {/* Subtitle */}
        <p className="text-2xl text-gray-700 mb-16 leading-relaxed">
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
              <h2 className="text-3xl font-bold text-black mb-6">
                Have an accommodation<br />
                to share?
              </h2>
              <p className="text-xl text-gray-700">
                Post your stay to<br />
                find a roommate
              </p>
            </div>
            
            {/* Right column */}
            <div className="w-1/2 text-center pl-16">
              <h2 className="text-3xl font-bold text-black mb-6">
                Looking to join<br />
                someone else's trip?
              </h2>
              <p className="text-xl text-gray-700">
                Browse open stays<br />
                and save money
              </p>
            </div>
            
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mb-20">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-xl"
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
              <span className="font-bold text-black">Munich – Oktoberfest:</span>
              <span className="text-gray-700 ml-2">18 travelers open to sharing a hotel room this September</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">🏰</span>
            <div>
              <span className="font-bold text-black">Barcelona – August:</span>
              <span className="text-gray-700 ml-2">7 shared trips posted this week</span>
            </div>
          </div>
        </div>
        
        {/* Incentives section */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-black mb-12">
            Incentives to share:
          </h3>
          
          <div className="grid md:grid-cols-3 gap-12 px-64">
            <div className="bg-purple-600 text-white p-8 rounded-2xl text-center">
              <div className="text-3xl mb-4">💫</div>
              <h4 className="text-xl font-bold mb-3">Ambassador</h4>
              <p className="text-purple-100">
                Shared journey<br />
                + invited 3 friends
              </p>
            </div>
            
            <div className="bg-purple-600 text-white p-8 rounded-2xl text-center">
              <div className="text-3xl mb-4">🏨</div>
              <h4 className="text-xl font-bold mb-3">Room Sharer</h4>
              <p className="text-purple-100">
                Posted a hotel<br />
                room and matched
              </p>
            </div>
            
            <div className="bg-purple-600 text-white p-8 rounded-2xl text-center">
              <div className="text-3xl mb-4">🚀</div>
              <h4 className="text-xl font-bold mb-3">Pioneer</h4>
              <p className="text-purple-100">
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
