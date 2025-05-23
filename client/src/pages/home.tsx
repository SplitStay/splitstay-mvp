import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bed, UserPlus, Eye, CheckCircle, ChevronRight } from "lucide-react";
// Import the logo directly
import logoImage from "../assets/LOGO_TP.png";

const Home: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="p-6 flex flex-col items-center">
      {/* Logo section with proper spacing */}
      <div className="flex flex-col items-center mb-10 pt-4">
        <img 
          src={logoImage} 
          alt="SplitStay Logo" 
          className="h-28 w-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-primary text-center mb-4">SplitStay</h1>
        <p className="text-center text-gray-700 mt-2 font-medium text-lg">
          Find compatible roommates.<br />
          Split hotel costs.<br />
          Make new friends.
        </p>
      </div>
      
      <h2 className="text-2xl font-semibold text-primary text-center mb-6">Ready to find your perfect roommate?</h2>
      
      {/* Action buttons */}
      <div className="w-full space-y-4">
        <Button
          className="navy-button flex justify-between"
          onClick={() => navigate("/signup")}
        >
          <div className="flex items-center">
            <UserPlus className="mr-3 h-5 w-5" />
            <span>Create Profile</span>
          </div>
          <ChevronRight />
        </Button>
      </div>
      
      {/* Features */}
      <div className="mt-10 w-full">
        <h3 className="text-lg font-medium text-primary mb-4">Why travelers choose SplitStay:</h3>
        <ul className="space-y-4">
          <li className="flex items-start bg-gray-50 p-3 rounded-lg">
            <CheckCircle className="text-green-500 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-medium">Verified Safety</span>
              <p className="text-sm text-gray-600 mt-1">All users are ID verified with a secure review system</p>
            </div>
          </li>
          <li className="flex items-start bg-gray-50 p-3 rounded-lg">
            <CheckCircle className="text-green-500 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-medium">Smart Matching</span>
              <p className="text-sm text-gray-600 mt-1">Find roommates based on travel style and preferences</p>
            </div>
          </li>
          <li className="flex items-start bg-gray-50 p-3 rounded-lg">
            <CheckCircle className="text-green-500 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-medium">Save 50% on Accommodation</span>
              <p className="text-sm text-gray-600 mt-1">Split costs with a compatible roommate, no hidden fees</p>
            </div>
          </li>
        </ul>
      </div>
      
      {/* Login */}
      <div className="mt-10 w-full">
        <div className="flex flex-col space-y-3">
          <Button
            type="button"
            variant="outline"
            className="border-2"
            onClick={() => navigate("/login")} 
          >
            Already have an account? Log in
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
