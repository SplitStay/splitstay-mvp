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
      <div className="w-full px-8 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section - Centered */}
          <div className="text-center mb-20">
            <img 
              src={logoImage} 
              alt="SplitStay Logo" 
              className="h-32 lg:h-48 w-auto mb-8 mx-auto"
            />
            <h1 className="text-6xl lg:text-8xl font-bold text-primary mb-8">SplitStay</h1>
            <p className="text-3xl lg:text-4xl text-gray-700 font-medium leading-relaxed mb-12">
              Find compatible roommates.<br />
              Split hotel costs.<br />
              Make new friends.
            </p>
            
            <h2 className="text-4xl lg:text-5xl font-semibold text-primary mb-16">
              Ready to find your perfect roommate?
            </h2>
            
            {/* Action buttons */}
            <div className="max-w-2xl mx-auto space-y-8">
              <Button
                className="navy-button flex justify-center items-center w-full text-2xl py-10 px-16"
                onClick={() => navigate("/signup")}
              >
                <UserPlus className="mr-6 h-8 w-8" />
                <span>Create Profile</span>
              </Button>
              
              <div className="text-center">
                <p className="text-gray-600 text-2xl">
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="text-navy p-0 h-auto font-semibold text-2xl"
                    onClick={() => navigate("/login")}
                  >
                    Log In
                  </Button>
                </p>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="text-center mb-16">
            <h3 className="text-4xl lg:text-5xl font-semibold text-primary mb-20">
              Why travelers choose SplitStay:
            </h3>
          </div>
          
          {/* Features Grid - Single row on desktop */}
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
              <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-6" />
              <h4 className="font-semibold text-2xl mb-6">Verified Safety</h4>
              <p className="text-gray-600 text-xl leading-relaxed">All users are ID verified with a secure review system</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
              <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-6" />
              <h4 className="font-semibold text-2xl mb-6">Smart Matching</h4>
              <p className="text-gray-600 text-xl leading-relaxed">Find roommates based on travel style and preferences</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
              <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-6" />
              <h4 className="font-semibold text-2xl mb-6">Save 50% on Accommodation</h4>
              <p className="text-gray-600 text-xl leading-relaxed">Split costs with a compatible roommate, no hidden fees</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Home;
