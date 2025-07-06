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
      {/* Full-width hero section */}
      <div className="relative">
        {/* Hero container - full width with proper spacing */}
        <div className="px-8 py-16 lg:px-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left side - Hero content */}
              <div className="text-center lg:text-left">
                <div className="mb-8">
                  <img 
                    src={logoImage} 
                    alt="SplitStay Logo" 
                    className="h-24 lg:h-32 w-auto mb-8 mx-auto lg:mx-0"
                  />
                  <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-primary mb-6">SplitStay</h1>
                  <p className="text-2xl lg:text-3xl text-gray-700 font-medium leading-relaxed mb-8">
                    Find compatible roommates.<br />
                    Split hotel costs.<br />
                    Make new friends.
                  </p>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-semibold text-primary mb-12">
                  Ready to find your perfect roommate?
                </h2>
                
                {/* Action buttons */}
                <div className="max-w-lg mx-auto lg:mx-0 space-y-6">
                  <Button
                    className="navy-button flex justify-center items-center w-full text-xl py-8 px-12"
                    onClick={() => navigate("/signup")}
                  >
                    <UserPlus className="mr-4 h-7 w-7" />
                    <span>Create Profile</span>
                  </Button>
                  
                  <div className="text-center lg:text-left">
                    <p className="text-gray-600 text-xl">
                      Already have an account?{" "}
                      <Button 
                        variant="link" 
                        className="text-navy p-0 h-auto font-semibold text-xl"
                        onClick={() => navigate("/login")}
                      >
                        Log In
                      </Button>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right side - Features */}
              <div className="lg:pl-8">
                <h3 className="text-3xl lg:text-4xl font-semibold text-primary mb-12 text-center lg:text-left">
                  Why travelers choose SplitStay:
                </h3>
                
                <div className="space-y-8">
                  <div className="flex items-start bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <CheckCircle className="text-green-500 mt-2 mr-6 h-8 w-8 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xl mb-3">Verified Safety</h4>
                      <p className="text-gray-600 text-lg">All users are ID verified with a secure review system</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <CheckCircle className="text-green-500 mt-2 mr-6 h-8 w-8 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xl mb-3">Smart Matching</h4>
                      <p className="text-gray-600 text-lg">Find roommates based on travel style and preferences</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <CheckCircle className="text-green-500 mt-2 mr-6 h-8 w-8 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xl mb-3">Save 50% on Accommodation</h4>
                      <p className="text-gray-600 text-lg">Split costs with a compatible roommate, no hidden fees</p>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
