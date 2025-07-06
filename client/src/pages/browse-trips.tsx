import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logoImage from "@assets/Splitstay Logo Transparent_1751765053004.png";

const BrowseTrips: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-navy hover:text-navy/80"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Button>
          <img 
            src={logoImage} 
            alt="SplitStay Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Main Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">
            Ready to Join Someone's Trip?
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Browse available stays and connect with hosts looking for roommates.
          </p>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold text-navy mb-4">
              What happens next?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-navy rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <p className="text-gray-600">
                  Browse available accommodations in your desired location
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-navy rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <p className="text-gray-600">
                  Connect with verified hosts and discuss trip details
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-navy rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <p className="text-gray-600">
                  Confirm your booking and split the costs
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/find-roommate")}
            size="lg"
            className="bg-navy text-white hover:bg-navy/90 transition-colors duration-300 text-lg px-8 py-6 rounded-lg font-semibold"
          >
            Browse Stays
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrowseTrips;