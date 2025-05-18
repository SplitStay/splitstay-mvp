import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Calendar, Moon, Sun, VolumeX, Users, Bed, DoorOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";

const FindRoommate: React.FC = () => {
  const [_, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isFlexible, setIsFlexible] = useState(false);
  const [preferences, setPreferences] = useState({
    sleepHabits: "early_bird",
    noiseLevel: "quiet",
    roomType: "twin",
  });
  
  // Global locations list for search
  const globalLocations = [
    "Amsterdam", "Athens", "Barcelona", "Berlin", "Brussels", 
    "Budapest", "Copenhagen", "Dublin", "Florence", "Geneva", 
    "Istanbul", "Lisbon", "London", "Madrid", "Milan", 
    "Munich", "Oslo", "Paris", "Prague", "Rome", 
    "Stockholm", "Venice", "Vienna", "Zurich",
    "Bangkok", "Beijing", "Dubai", "Hong Kong", "Kyoto", 
    "Kuala Lumpur", "Seoul", "Shanghai", "Singapore", "Tokyo",
    "Cairo", "Cape Town", "Marrakech", "Nairobi",
    "Auckland", "Melbourne", "Sydney",
    "Cancun", "Havana", "Mexico City", "Rio de Janeiro", "San José",
    "Boston", "Chicago", "Las Vegas", "Los Angeles", "Miami", 
    "Montreal", "New York", "San Francisco", "Seattle", "Toronto", "Vancouver"
  ];

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
      startDate,
      endDate,
      isFlexible,
      preferences
    }));
    navigate("/browse-profiles");
  };
  
  // Format the date range for display
  const getDateRangeText = () => {
    if (!startDate || !endDate) return "";
    return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
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
            <Input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="Search any global destination"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary pr-10"
            />
            <Search className="absolute right-4 top-3.5 text-gray-400 h-5 w-5 pointer-events-none" />
            
            {locationSearch.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {globalLocations
                  .filter(location => location.toLowerCase().includes(locationSearch.toLowerCase()))
                  .map(location => (
                    <div
                      key={location}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setDestination(location);
                        setLocationSearch(location);
                      }}
                    >
                      {location}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Dates</label>
          <div className="grid grid-cols-2 gap-2 mb-1">
            <div>
              <label className="block text-sm text-gray-600 mb-1">From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-2 border-gray-300",
                      !startDate && "text-gray-500"
                    )}
                  >
                    {startDate ? format(startDate, "MMM d, yyyy") : "Choose date"}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Till</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-2 border-gray-300",
                      !endDate && "text-gray-500"
                    )}
                  >
                    {endDate ? format(endDate, "MMM d, yyyy") : "Choose date"}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => !startDate || date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="flexible-dates" 
              checked={isFlexible}
              onCheckedChange={(checked) => setIsFlexible(checked === true)}
            />
            <Label htmlFor="flexible-dates" className="text-sm text-gray-600">
              Flexible dates (±3 days)
            </Label>
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
            style={{
              backgroundColor: "#001F3F", 
              color: "white",
              width: "100%",
              padding: "1rem 1.5rem",
              borderRadius: "0.5rem",
              fontSize: "1.125rem",
              fontWeight: "600"
            }}
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
