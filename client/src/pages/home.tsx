import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bed, UserPlus, Eye, CheckCircle, ChevronRight } from "lucide-react";
// Import the logo directly
import logoImage from "../assets/LOGO_TP.png";

const Home: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <img 
            src={logoImage} 
            alt="SplitStay Logo" 
            className="h-20 md:h-24 lg:h-32 w-auto mb-6 mx-auto"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
            SplitStay
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-medium mb-8 max-w-2xl mx-auto">
            Find compatible roommates. Split hotel costs. Make new friends.
          </p>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-8">
            Ready to find your perfect roommate?
          </h2>
          
          {/* Action buttons */}
          <div className="max-w-md mx-auto space-y-4 mb-12">
            <Button
              className="navy-button flex justify-center items-center w-full text-lg py-4"
              onClick={() => navigate("/signup")}
            >
              <UserPlus className="mr-3 h-5 w-5" />
              <span>Create Profile</span>
            </Button>
            
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Button 
                  variant="link" 
                  className="text-navy p-0 h-auto font-semibold"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
              </p>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mb-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-primary text-center mb-12">
            Why travelers choose SplitStay:
          </h3>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
              <CheckCircle className="text-green-500 h-12 w-12 mx-auto mb-4" />
              <h4 className="font-semibold text-lg mb-3">Verified Safety</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                All users are ID verified with a secure review system
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
              <CheckCircle className="text-green-500 h-12 w-12 mx-auto mb-4" />
              <h4 className="font-semibold text-lg mb-3">Smart Matching</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Find roommates based on travel style and preferences
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
              <CheckCircle className="text-green-500 h-12 w-12 mx-auto mb-4" />
              <h4 className="font-semibold text-lg mb-3">Save 50% on Accommodation</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Split costs with a compatible roommate, no hidden fees
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Home;
