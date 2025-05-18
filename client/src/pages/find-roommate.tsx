import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Moon, Sun, VolumeX, Users, Bed, DoorOpen, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";

// Define location interface
interface LocationItem {
  city: string;
  country: string;
}

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

const FindRoommate: React.FC = () => {
  const [_, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isFlexible, setIsFlexible] = useState(false);
  const [preferences, setPreferences] = useState({
    sleepHabits: "early_bird",
    noiseLevel: "quiet",
    roomType: "twin",
    budget: [20, 120]
  });
  
  // Reference to the dropdown menu
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Global locations list for search with countries
  const globalLocations: LocationItem[] = [
    { city: "Amsterdam", country: "Netherlands" },
    { city: "Athens", country: "Greece" },
    { city: "Barcelona", country: "Spain" },
    { city: "Berlin", country: "Germany" },
    { city: "Brussels", country: "Belgium" },
    { city: "Bucharest", country: "Romania" },
    { city: "Budapest", country: "Hungary" },
    { city: "Copenhagen", country: "Denmark" },
    { city: "Dublin", country: "Ireland" },
    { city: "Eindhoven", country: "Netherlands" },
    { city: "Florence", country: "Italy" },
    { city: "Frankfurt", country: "Germany" },
    { city: "Geneva", country: "Switzerland" },
    { city: "Istanbul", country: "Turkey" },
    { city: "Lisbon", country: "Portugal" },
    { city: "London", country: "United Kingdom" },
    { city: "Madrid", country: "Spain" },
    { city: "Maaseik", country: "Belgium" },
    { city: "Milan", country: "Italy" },
    { city: "Munich", country: "Germany" },
    { city: "Oslo", country: "Norway" },
    { city: "Paris", country: "France" },
    { city: "Prague", country: "Czech Republic" },
    { city: "Rome", country: "Italy" },
    { city: "Rotterdam", country: "Netherlands" },
    { city: "Santa Marta", country: "Colombia" },
    { city: "Santa Marta", country: "Mexico" },
    { city: "Santa Marta", country: "Spain" },
    { city: "Stockholm", country: "Sweden" },
    { city: "Utrecht", country: "Netherlands" },
    { city: "Venice", country: "Italy" },
    { city: "Vienna", country: "Austria" },
    { city: "Warsaw", country: "Poland" },
    { city: "Zurich", country: "Switzerland" },
    { city: "Bangkok", country: "Thailand" },
    { city: "Beijing", country: "China" },
    { city: "Dubai", country: "United Arab Emirates" },
    { city: "Hong Kong", country: "China" },
    { city: "Kyoto", country: "Japan" },
    { city: "Kuala Lumpur", country: "Malaysia" },
    { city: "Seoul", country: "South Korea" },
    { city: "Shanghai", country: "China" },
    { city: "Singapore", country: "Singapore" },
    { city: "Tokyo", country: "Japan" },
    { city: "Cairo", country: "Egypt" },
    { city: "Cape Town", country: "South Africa" },
    { city: "Marrakech", country: "Morocco" },
    { city: "Nairobi", country: "Kenya" },
    { city: "Auckland", country: "New Zealand" },
    { city: "Melbourne", country: "Australia" },
    { city: "Sydney", country: "Australia" },
    { city: "Cancun", country: "Mexico" },
    { city: "Havana", country: "Cuba" },
    { city: "Mexico City", country: "Mexico" },
    { city: "Rio de Janeiro", country: "Brazil" },
    { city: "San José", country: "Costa Rica" },
    { city: "Boston", country: "United States" },
    { city: "Chicago", country: "United States" },
    { city: "Las Vegas", country: "United States" },
    { city: "Los Angeles", country: "United States" },
    { city: "Miami", country: "United States" },
    { city: "Montreal", country: "Canada" },
    { city: "New York", country: "United States" },
    { city: "San Francisco", country: "United States" },
    { city: "Seattle", country: "United States" },
    { city: "Toronto", country: "Canada" },
    { city: "Vancouver", country: "Canada" }
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
    // Make sure we have a destination and dates before proceeding
    if (!destination) {
      alert("Please select a destination");
      return;
    }
    
    if (!startDate || !endDate) {
      alert("Please select your travel dates");
      return;
    }
    
    // Save the search criteria as serializable values
    localStorage.setItem('splitstay_search', JSON.stringify({
      destination,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      isFlexible,
      preferences
    }));
    
    // Navigate to browse profiles
    navigate("/browse-profiles");
  };

  // Handle document click to close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Find a Roommate</h1>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Destination</label>
          <div className="relative">
            <Input
              type="text"
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setShowDropdown(e.target.value.length > 1);
              }}
              onFocus={() => setShowDropdown(locationSearch.length > 1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  
                  // Auto-select current input text as destination
                  if (locationSearch.length > 0) {
                    // Check if this city exists in multiple countries
                    const matchingLocations = globalLocations.filter(
                      location => location.city.toLowerCase() === locationSearch.toLowerCase()
                    );
                    
                    if (matchingLocations.length > 1) {
                      // If multiple countries, keep dropdown open to let user choose
                      setShowDropdown(true);
                    } else if (matchingLocations.length === 1) {
                      // If exactly one match, use that city and country
                      const fullLocation = `${matchingLocations[0].city}, ${matchingLocations[0].country}`;
                      setDestination(fullLocation);
                      setLocationSearch(fullLocation);
                      setShowDropdown(false);
                    } else if (!locationSearch.includes(',')) {
                      // For custom locations, ask user to choose a country
                      setShowDropdown(true);
                    } else {
                      // Input already has a country specified
                      setDestination(locationSearch);
                      setShowDropdown(false);
                    }
                  }
                }
              }}
              onBlur={() => {
                // Small delay to allow for clicking on dropdown items
                setTimeout(() => {
                  if (!dropdownRef.current?.contains(document.activeElement)) {
                    setShowDropdown(false);
                  }
                }, 200);
              }}
              placeholder="Enter any destination worldwide"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary pr-10"
            />
            <Search className="absolute right-4 top-3.5 text-gray-400 h-5 w-5 pointer-events-none" />
            
            {/* Only show dropdown when showDropdown state is true */}
            {showDropdown && locationSearch.length > 1 && (
              <div 
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {/* Show header text explaining entry options */}
                <div className="p-2 bg-gray-50 border-b text-sm text-gray-500">
                  Search for any city or enter a custom location
                </div>
                
                {/* Show matching locations */}
                {globalLocations
                  .filter(location => 
                    location.city.toLowerCase().includes(locationSearch.toLowerCase()) ||
                    location.country.toLowerCase().includes(locationSearch.toLowerCase())
                  )
                  .slice(0, 8) // Limit to 8 results for better performance
                  .map(location => (
                    <div
                      key={`${location.city}-${location.country}`}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        const fullLocation = `${location.city}, ${location.country}`;
                        setDestination(fullLocation);
                        setLocationSearch(fullLocation);
                        setShowDropdown(false);
                      }}
                    >
                      <span className="font-medium">{location.city}</span>
                      <span className="text-gray-500">, {location.country}</span>
                    </div>
                  ))}
                  
                {/* Check if the city might exist in multiple countries */}
                {(() => {
                  // Get all matching cities by name (case insensitive)
                  const matchingLocations = globalLocations.filter(
                    location => location.city.toLowerCase() === locationSearch.toLowerCase()
                  );
                  
                  // If this city exists in our database in multiple countries
                  if (matchingLocations.length > 1) {
                    return (
                      <div className="border-t pt-2">
                        <div className="px-3 py-1 text-xs text-gray-500 font-medium">
                          This city exists in multiple countries:
                        </div>
                        {matchingLocations.map(location => (
                          <div
                            key={`${location.city}-${location.country}`}
                            className="p-3 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              const fullLocation = `${location.city}, ${location.country}`;
                              setDestination(fullLocation);
                              setLocationSearch(fullLocation);
                              setShowDropdown(false);
                            }}
                          >
                            <span className="font-medium">{location.city}</span>
                            <span className="text-gray-500">, {location.country}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  // Otherwise show custom entry option
                  return (
                    <div
                      className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer text-navy font-medium border-t"
                      onClick={() => {
                        // If user hasn't specified a country
                        if (!locationSearch.includes(',')) {
                          // List of common countries for suggestions
                          const commonCountries = ["Germany", "France", "Spain", "United Kingdom", "Italy", "Netherlands"];
                          
                          // Show country selection dialog
                          setShowDropdown(true);
                          setLocationSearch(`${locationSearch}, `);
                        } else {
                          // Keep location as is if already has comma
                          setDestination(locationSearch);
                          setShowDropdown(false);
                        }
                      }}
                    >
                      <span className="flex items-center">
                        <span className="mr-2 text-navy">+</span>
                        Use "{locationSearch}" as destination
                      </span>
                      <span className="text-xs text-gray-500">
                        {!locationSearch.includes(',') 
                          ? "Add a country (e.g. Frankfurt, Germany)" 
                          : "Use this custom location"}
                      </span>
                    </div>
                  );
                })()}
                
                {/* Suggest common countries if user is entering a custom city */}
                {!locationSearch.includes(',') && !globalLocations.some(
                  location => location.city.toLowerCase() === locationSearch.toLowerCase()
                ) && locationSearch.length > 1 && (
                  <div className="border-t">
                    <div className="px-3 py-1 text-xs text-gray-500 font-medium">
                      Suggested countries:
                    </div>
                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setLocationSearch(`${locationSearch}, `);
                        // Keep focus on input so user can type country
                        setTimeout(() => {
                          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                          if (input) {
                            input.focus();
                            // Position cursor at end of text
                            const length = input.value.length;
                            input.setSelectionRange(length, length);
                          }
                        }, 50);
                      }}
                    >
                      <span className="text-navy font-medium">Type a country for {locationSearch}</span>
                      <span className="block text-xs text-gray-500">
                        Enter the country where this city is located
                      </span>
                    </div>
                    
                    {/* Divider */}
                    <div className="px-3 py-1 text-xs text-gray-500 font-medium border-t mt-1">
                      Or select from common countries:
                    </div>
                    
                    {/* Common European countries */}
                    {["Romania", "Poland", "Germany", "France", "Spain", "Italy", "United Kingdom", "Netherlands"].map(country => (
                      <div
                        key={country}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          const fullLocation = `${locationSearch}, ${country}`;
                          setDestination(fullLocation);
                          setLocationSearch(fullLocation);
                          setShowDropdown(false);
                        }}
                      >
                        <span className="text-navy">{locationSearch}, {country}</span>
                      </div>
                    ))}
                    
                    {/* Custom location note */}
                    <div className="p-2 text-xs text-gray-500 border-t">
                      Note: For a more accurate location search, please specify both city and country.
                    </div>
                  </div>
                )}
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
        
        <div className="space-y-2 pt-2">
          <label className="block text-gray-700 font-medium">What's your ideal nightly rate?</label>
          <div className="px-1 pt-4 pb-2">
            <Slider
              defaultValue={preferences.budget}
              min={20}
              max={120}
              step={5}
              onValueChange={(value) => {
                setPreferences({
                  ...preferences,
                  budget: value
                });
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-sm">
            <div>
              <span className="text-xs text-gray-500">Min</span>
              <span className="font-medium"> ${preferences.budget[0]}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Max</span>
              <span className="font-medium"> ${preferences.budget[1]}+</span>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <Button
            type="button"
            className="navy-button"
            onClick={handleFindMatches}
          >
            Find Matches
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FindRoommate;