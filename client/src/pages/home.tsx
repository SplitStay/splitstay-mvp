import React from "react";
import { useLocation } from "wouter";
import { SplitStayLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Bed, UserPlus, Eye, CheckCircle } from "lucide-react";

const Home: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="p-6 flex flex-col items-center">
      {/* Logo */}
      <div className="mb-4 mt-8">
        <SplitStayLogo className="text-primary" />
      </div>
      
      <h1 className="text-4xl font-bold text-primary text-center mb-4">SplitStay</h1>
      
      <p className="text-center text-gray-700 mb-10">
        Welcome to SplitStay — where<br />
        solo travelers connect, match,<br />
        and save.
      </p>
      
      <h2 className="text-2xl font-semibold text-primary text-center mb-6">What brings you here?</h2>
      
      {/* Action buttons */}
      <div className="w-full space-y-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-between border-2 border-primary text-primary py-6 rounded-full"
          onClick={() => navigate("/create-profile")}
        >
          <div className="flex items-center">
            <Bed className="mr-3 h-5 w-5" />
            <span>Create Profile</span>
          </div>
          <ChevronRightIcon />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-between border-2 border-primary text-primary py-6 rounded-full"
          onClick={() => navigate("/browse-profiles")}
        >
          <div className="flex items-center">
            <UserPlus className="mr-3 h-5 w-5" />
            <span>Find Roommates</span>
          </div>
          <ChevronRightIcon />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-between border-2 border-primary text-primary py-6 rounded-full"
          onClick={() => navigate("/browse-profiles")}
        >
          <div className="flex items-center">
            <Eye className="mr-3 h-5 w-5" />
            <span>Just Browsing</span>
          </div>
          <ChevronRightIcon />
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
          variant="outline"
          size="lg"
          className="w-full border-2 border-primary text-primary py-6 rounded-full"
          onClick={() => navigate("/browse-profiles")} // For demo, navigate to profiles
        >
          Log in
        </Button>
      </div>
    </div>
  );
};

// Helper icon component
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default Home;
