import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bed, UserPlus, Eye, CheckCircle, ChevronRight } from "lucide-react";

const Home: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="p-6 flex flex-col items-center">
      {/* Removed extra spacing */}
      
      <p className="text-center text-gray-700 mb-10 mt-2 md:-mt-24">
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
          <ChevronRight />
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
          <ChevronRight />
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

export default Home;
