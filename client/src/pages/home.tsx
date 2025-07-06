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
      <div className="max-w-4xl mx-auto px-6 py-8 lg:py-16">
        
        {/* Hero Section - Always centered */}
        <div className="text-center mb-12">
          <img 
            src={logoImage} 
            alt="SplitStay Logo" 
            className="h-32 lg:h-40 w-auto mb-6 mx-auto"
          />
          <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-6">SplitStay</h1>
          <p className="text-xl lg:text-2xl text-gray-700 font-medium leading-relaxed mb-8">
            Find compatible roommates.<br />
            Split hotel costs.<br />
            Make new friends.
          </p>
          
          <h2 className="text-2xl lg:text-3xl font-semibold text-primary mb-8">
            Ready to find your perfect roommate?
          </h2>
          
          {/* Action buttons */}
          <div className="max-w-md mx-auto space-y-4 mb-16">
            <Button
              className="navy-button flex justify-center items-center w-full text-lg py-6"
              onClick={() => navigate("/signup")}
            >
              <UserPlus className="mr-3 h-6 w-6" />
              <span>Create Profile</span>
            </Button>
            
            <div className="text-center">
              <p className="text-gray-600 text-lg">
                Already have an account?{" "}
                <Button 
                  variant="link" 
                  className="text-navy p-0 h-auto font-semibold text-lg"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
              </p>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="text-center mb-8">
          <h3 className="text-2xl lg:text-3xl font-semibold text-primary mb-12">
            Why travelers choose SplitStay:
          </h3>
        </div>
        
        {/* Features Grid - Desktop: 3 columns, Mobile: 1 column */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <CheckCircle className="text-green-500 h-12 w-12 mx-auto mb-4" />
            <h4 className="font-semibold text-lg mb-3">Verified Safety</h4>
            <p className="text-gray-600">All users are ID verified with a secure review system</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <CheckCircle className="text-green-500 h-12 w-12 mx-auto mb-4" />
            <h4 className="font-semibold text-lg mb-3">Smart Matching</h4>
            <p className="text-gray-600">Find roommates based on travel style and preferences</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <CheckCircle className="text-green-500 h-12 w-12 mx-auto mb-4" />
            <h4 className="font-semibold text-lg mb-3">Save 50% on Accommodation</h4>
            <p className="text-gray-600">Split costs with a compatible roommate, no hidden fees</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Home;
