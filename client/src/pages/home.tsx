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
      <div className="flex flex-col items-center mb-12 pt-4">
        <img 
          src={logoImage} 
          alt="SplitStay Logo" 
          className="h-24 w-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-primary text-center mb-6">SplitStay</h1>
        <p className="text-center text-gray-700 mt-2">
          Welcome to SplitStay — where<br />
          solo travelers connect, match,<br />
          and save.
        </p>
      </div>
      
      <h2 className="text-2xl font-semibold text-primary text-center mb-6">Ready to find your perfect roommate?</h2>
      
      {/* Action buttons */}
      <div className="w-full space-y-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-between border-2 border-primary text-primary py-6 rounded-full"
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
      <div className="mt-10 w-full text-gray-700">
        <ul className="space-y-2">
          <li className="flex items-start">
            <CheckCircle className="text-secondary mt-1 mr-2 h-5 w-5" />
            <span>All users verified before booking</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="text-secondary mt-1 mr-2 h-5 w-5" />
            <span>Book with safety and comfort</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="text-secondary mt-1 mr-2 h-5 w-5" />
            <span>No hidden fees. Ever</span>
          </li>
        </ul>
      </div>
      
      {/* Login */}
      <div className="mt-10 w-full">
        <Button
          type="button"
          className="navy-button"
          onClick={() => navigate("/login")} 
        >
          Log in
        </Button>
      </div>
    </div>
  );
};

export default Home;
