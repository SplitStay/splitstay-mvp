import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Calendar, Moon, Sun, VolumeX, Users, Bed, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FindRoommate: React.FC = () => {
  const [_, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [preferences, setPreferences] = useState({
    sleepHabits: "early_bird",
    noiseLevel: "quiet",
    roomType: "twin",
  });

  const handlePreferenceClick = (category: "sleepHabits" | "noiseLevel", value: string) => {
    setPreferences({
      ...preferences,
      [category]: value,
    });
  };

  const handleRoomTypeClick = (value: string) => {
    setPreferences({
      ...preferences,
      roomType: value,
    });
  };

  const handleFindMatches = () => {
    // Save the search criteria if needed
    localStorage.setItem('splitstay_search', JSON.stringify({
      destination,
      dates,
      preferences
    }));
    navigate("/browse-profiles");
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Find a Roommate</h1>
      </div>
      
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleFindMatches(); }}>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Destination</label>
          <div className="relative">
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary appearance-none"
            >
              <option value="">Select a destination</option>
              <option value="Brussels">Brussels</option>
              <option value="Paris">Paris</option>
              <option value="Amsterdam">Amsterdam</option>
              <option value="Berlin">Berlin</option>
              <option value="London">London</option>
            </select>
            <MapPin className="absolute right-4 top-3.5 text-gray-400 h-5 w-5 pointer-events-none" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Dates</label>
          <div className="relative">
            <select
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary appearance-none"
            >
              <option value="">Select travel dates</option>
              <option value="May 12 - 15, 2025">May 12 - 15, 2025</option>
              <option value="May 20 - 24, 2025">May 20 - 24, 2025</option>
              <option value="June 5 - 10, 2025">June 5 - 10, 2025</option>
              <option value="June 15 - 20, 2025">June 15 - 20, 2025</option>
              <option value="July 1 - 7, 2025">July 1 - 7, 2025</option>
            </select>
            <Calendar className="absolute right-4 top-3.5 text-gray-400 h-5 w-5 pointer-events-none" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Your Travel Preferences</label>
          <div className="grid grid-cols-2 gap-2">
            <PreferenceOption 
              icon={<Moon className="mr-2 h-5 w-5" />}
              label="Night owl"
              isSelected={preferences.sleepHabits === "night_owl"}
              onClick={() => handlePreferenceClick("sleepHabits", "night_owl")}
            />
            
            <PreferenceOption 
              icon={<Sun className="mr-2 h-5 w-5" />}
              label="Early bird"
              isSelected={preferences.sleepHabits === "early_bird"}
              onClick={() => handlePreferenceClick("sleepHabits", "early_bird")}
            />
            
            <PreferenceOption 
              icon={<VolumeX className="mr-2 h-5 w-5" />}
              label="Quiet"
              isSelected={preferences.noiseLevel === "quiet"}
              onClick={() => handlePreferenceClick("noiseLevel", "quiet")}
            />
            
            <PreferenceOption 
              icon={<Users className="mr-2 h-5 w-5" />}
              label="Social"
              isSelected={preferences.noiseLevel === "social"}
              onClick={() => handlePreferenceClick("noiseLevel", "social")}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Room Type</label>
          <div className="flex space-x-2">
            <PreferenceOption 
              icon={<Bed className="mr-2 h-5 w-5" />}
              label="Twin beds"
              isSelected={preferences.roomType === "twin"}
              onClick={() => handleRoomTypeClick("twin")}
              className="flex-1 justify-center"
            />
            
            <PreferenceOption 
              icon={<DoorOpen className="mr-2 h-5 w-5" />}
              label="Separate rooms"
              isSelected={preferences.roomType === "separate"}
              onClick={() => handleRoomTypeClick("separate")}
              className="flex-1 justify-center"
            />
          </div>
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg"
          >
            Find Matches
          </Button>
        </div>
      </form>
    </div>
  );
};

// Helper component for preference options
interface PreferenceOptionProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const PreferenceOption: React.FC<PreferenceOptionProps> = ({
  icon,
  label,
  isSelected,
  onClick,
  className = "",
}) => (
  <Card 
    className={cn(
      "border-2 p-3 cursor-pointer flex items-center",
      isSelected ? "border-primary bg-blue-50" : "border-gray-300 hover:border-primary",
      className
    )}
    onClick={onClick}
  >
    <div className={cn("flex items-center", isSelected ? "text-primary" : "text-gray-500")}>
      {icon}
      <span>{label}</span>
    </div>
  </Card>
);

export default FindRoommate;
