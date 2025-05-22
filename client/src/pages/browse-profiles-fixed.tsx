import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, SlidersHorizontal, Moon, Sun, VolumeX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitStayLogo } from "@/components/icons";
import RoommateCard from "@/components/roommate-card";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BrowseProfiles: React.FC = () => {
  const [_, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dates, setDates] = useState("");
  
  // Filter dialog state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageRanges: {
      "18-25": false,
      "26-30": false,
      "31-40": false,
      "40+": false
    },
    languages: {
      "English": false,
      "French": false,
      "German": false
    },
    sleepingHabits: {
      "Early bird": false,
      "Night owl": false
    },
    noiseLevel: {
      "Quiet": false,
      "Social": false
    }
  });
  
  // Let's use custom profile type without schema restrictions for the demo
  interface DemoProfile {
    id: number;
    fullName: string;
    email: string;
    username: string;
    password: string;
    profilePicture: string;
    bio: string;
    age: string;
    gender: string;
    languages: string[];
    travelTraits: string[];
    isVerified: boolean;
    matchPercentage: number;
    matchLabel: string;
    positiveReviews: boolean;
    preferredAccommodation: {
      name: string;
      platform: string;
      url: string;
      isFlexible: boolean;
      roomType: string;
    };
  }

  // Demo profiles
  const defaultProfiles: DemoProfile[] = [
    {
      id: 1,
      fullName: "Maya",
      email: "maya@example.com",
      username: "maya",
      password: "password",
      profilePicture: "/images/maya-profile.png",
      bio: "Adventure seeker passionate about different cultures",
      age: "25",
      gender: "female",
      languages: ["English", "French", "Spanish"],
      travelTraits: ["Organized", "Early riser", "Social"],
      isVerified: true,
      matchPercentage: 98,
      matchLabel: "Perfect Match",
      positiveReviews: true,
      preferredAccommodation: {
        name: "Hilton Brussels Grand Place",
        platform: "booking",
        url: "https://www.booking.com/hotel/be/hilton-brussels.html",
        isFlexible: true,
        roomType: "Twin beds"
      }
    },
    {
      id: 2,
      fullName: "Hannah",
      email: "hannah@example.com",
      username: "hannah",
      password: "password",
      profilePicture: "https://i.pravatar.cc/150?img=32",
      bio: "Spontaneous traveler who enjoys quiet hikes",
      age: "28",
      gender: "female",
      languages: ["English", "Korean"],
      travelTraits: ["Nature lover", "Early riser", "Quiet"],
      isVerified: true,
      matchPercentage: 91,
      matchLabel: "Recommended Roommate",
      positiveReviews: true,
      preferredAccommodation: {
        name: "Park Plaza Westminster",
        platform: "booking",
        url: "https://www.booking.com/hotel/gb/park-plaza-westminster-bridge-london.html",
        isFlexible: true,
        roomType: "Twin beds"
      }
    },
    {
      id: 3,
      fullName: "Alina",
      email: "alina@example.com",
      username: "alina",
      password: "password",
      profilePicture: "https://i.pravatar.cc/150?img=47",
      bio: "Digital nomad who loves exploring new cuisines",
      age: "23",
      gender: "female",
      languages: ["English", "Mandarin"],
      travelTraits: ["Food lover", "Night owl", "Quiet"],
      isVerified: true,
      matchPercentage: 84,
      matchLabel: "Ideal Match",
      positiveReviews: true,
      preferredAccommodation: {
        name: "CitizenM Tower of London",
        platform: "airbnb",
        url: "https://www.airbnb.com/rooms/london",
        isFlexible: true,
        roomType: "Private room"
      }
    },
    {
      id: 4,
      fullName: "Sophie",
      email: "sophie@example.com",
      username: "sophie",
      password: "password",
      profilePicture: "https://i.pravatar.cc/150?img=5",
      bio: "I enjoy museums and cultural experiences",
      age: "27",
      gender: "female",
      languages: ["English", "German"],
      travelTraits: ["Organized", "Early riser", "Social"],
      isVerified: true,
      matchPercentage: 75,
      matchLabel: "Good Match",
      positiveReviews: true,
      preferredAccommodation: {
        name: "St. Pancras Renaissance",
        platform: "agoda",
        url: "https://www.agoda.com/st-pancras-renaissance-hotel-london/hotel/london-gb.html",
        isFlexible: false,
        roomType: "Separate beds"
      }
    }
  ];
  
  // State for filtered profiles
  const [filteredProfiles, setFilteredProfiles] = useState<DemoProfile[]>([]);
  
  // Fetch profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['/api/matching'],
    queryFn: async () => {
      try {
        if (destination && startDate && endDate) {
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];
          
          const res = await fetch(
            `/api/matching?userId=1&location=${encodeURIComponent(destination)}&startDate=${startDateStr}&endDate=${endDateStr}`
          );
          
          if (res.ok) {
            return res.json() as Promise<UserProfile[]>;
          }
        }
        
        console.log("Using default profiles for demo");
        return defaultProfiles;
      } catch (error) {
        console.error("Error fetching profiles:", error);
        return defaultProfiles;
      }
    }
  });
  
  // Load saved search data on mount
  useEffect(() => {
    const savedSearchData = sessionStorage.getItem("splitstay_search");
    
    if (savedSearchData) {
      console.log("Saved search data:", savedSearchData);
      try {
        const parsedData = JSON.parse(savedSearchData);
        console.log("Parsed search data:", parsedData);
        
        if (parsedData.destination) {
          console.log("Setting destination:", parsedData.destination);
          setDestination(parsedData.destination);
        }
        
        if (parsedData.startDate && parsedData.endDate) {
          console.log("Start date:", parsedData.startDate);
          console.log("End date:", parsedData.endDate);
          
          const start = new Date(parsedData.startDate);
          const end = new Date(parsedData.endDate);
          
          setStartDate(start);
          setEndDate(end);
          
          // Format dates for display
          try {
            const formattedDates = `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
            console.log("Formatted dates:", formattedDates);
            setDates(formattedDates);
          } catch (formatError) {
            console.error("Error formatting dates:", formatError);
            setDates("Select dates");
          }
        }
      } catch (error) {
        console.error("Error parsing saved search data:", error);
      }
    } else {
      // Provide fallback values for when no search data exists
      setDestination("Select destination");
      setDates("Select dates");
    }
  }, []);
  
  // Apply filters when filter state changes
  useEffect(() => {
    if (!profiles) return;
    
    // Check if any filters are active
    const hasActiveAgeFilters = Object.values(filters.ageRanges).some(value => value);
    const hasActiveLanguageFilters = Object.values(filters.languages).some(value => value);
    const hasActiveSleepFilters = Object.values(filters.sleepingHabits).some(value => value);
    const hasActiveNoiseFilters = Object.values(filters.noiseLevel).some(value => value);
    
    const isFilterActive = hasActiveAgeFilters || hasActiveLanguageFilters || 
                          hasActiveSleepFilters || hasActiveNoiseFilters;
    
    setActiveFilters(isFilterActive);
    
    if (!isFilterActive) {
      setFilteredProfiles(profiles);
      return;
    }
    
    // Apply filters
    const filtered = profiles.filter(profile => {
      // Age filter
      if (hasActiveAgeFilters) {
        const age = parseInt(profile.age || "0");
        let ageMatch = false;
        
        if (filters.ageRanges["18-25"] && age >= 18 && age <= 25) ageMatch = true;
        if (filters.ageRanges["26-30"] && age >= 26 && age <= 30) ageMatch = true;
        if (filters.ageRanges["31-40"] && age >= 31 && age <= 40) ageMatch = true;
        if (filters.ageRanges["40+"] && age > 40) ageMatch = true;
        
        if (!ageMatch) return false;
      }
      
      // Language filter
      if (hasActiveLanguageFilters) {
        const selectedLanguages = Object.entries(filters.languages)
          .filter(([_, selected]) => selected)
          .map(([language]) => language);
          
        const hasMatchingLanguage = selectedLanguages.some(language => 
          profile.languages && profile.languages.includes(language)
        );
        
        if (!hasMatchingLanguage) return false;
      }
      
      // Sleep habit filter
      if (hasActiveSleepFilters) {
        const isEarlyBird = profile.travelTraits && profile.travelTraits.some(
          trait => trait.toLowerCase().includes("early")
        );
        const isNightOwl = profile.travelTraits && profile.travelTraits.some(
          trait => trait.toLowerCase().includes("night")
        );
        
        if (filters.sleepingHabits["Early bird"] && !isEarlyBird) return false;
        if (filters.sleepingHabits["Night owl"] && !isNightOwl) return false;
      }
      
      // Noise level filter
      if (hasActiveNoiseFilters) {
        const isQuiet = profile.travelTraits && profile.travelTraits.some(
          trait => trait.toLowerCase().includes("quiet")
        );
        const isSocial = profile.travelTraits && profile.travelTraits.some(
          trait => trait.toLowerCase().includes("social")
        );
        
        if (filters.noiseLevel["Quiet"] && !isQuiet) return false;
        if (filters.noiseLevel["Social"] && !isSocial) return false;
      }
      
      return true;
    });
    
    setFilteredProfiles(filtered);
  }, [filters, profiles]);
  
  // Initialize filtered profiles when profiles load and store them in localStorage
  useEffect(() => {
    if (profiles) {
      // Store the profiles in sessionStorage for use on the request booking page
      sessionStorage.setItem('splitstay_browsed_profiles', JSON.stringify(profiles));
      
      setFilteredProfiles(profiles);
    }
  }, [profiles]);
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      ageRanges: {
        "18-25": false,
        "26-30": false,
        "31-40": false,
        "40+": false
      },
      languages: {
        "English": false,
        "French": false,
        "German": false
      },
      sleepingHabits: {
        "Early bird": false,
        "Night owl": false
      },
      noiseLevel: {
        "Quiet": false,
        "Social": false
      }
    });
    setActiveFilters(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate("/find-roommate")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center">
          <SplitStayLogo className="mx-auto" />
          <h1 className="text-2xl font-bold text-primary">SplitStay</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500"
          onClick={() => {
            console.log("Opening filter dialog");
            setFilterDialogOpen(true);
          }}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Location & Date */}
      <div className="mb-4 space-y-2">
        <Card className="border-2 border-gray-200 rounded-lg">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">Destination</div>
              <div className="text-gray-700">{destination}</div>
            </div>
            <ChevronRight className="text-gray-400 h-5 w-5" />
          </CardContent>
        </Card>
        
        <Card className="border-2 border-gray-200 rounded-lg">
          <CardContent className="p-4">
            <div className="font-medium">Dates</div>
            <div className="text-gray-700">{dates}</div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-bold text-primary mb-4">Browse Profiles</h2>
      
      {/* Profile Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Display filtered profiles when filters are active, otherwise show all profiles */}
          {(activeFilters ? filteredProfiles : profiles)?.map((profile) => {
            // Make sure profile has all required properties
            const profileWithFullName = {
              ...profile,
              fullName: profile.fullName || ""
            };
            
            return (
              <RoommateCard
                key={profile.id}
                profile={profileWithFullName}
                actionUrl={`/request-booking/${profile.id}`}
              />
            );
          })}
          
          {/* Show "no results" message if filters return no profiles */}
          {activeFilters && filteredProfiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No roommates match your filter criteria.
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
          
          {/* Show "no profiles" message if there are no profiles at all */}
          {!activeFilters && profiles?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No compatible roommates found for this destination and dates.
            </div>
          )}
        </div>
      )}
      
      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent 
          className="max-w-[90%] w-[320px] pt-3 pb-4 px-4" 
          aria-describedby="filter-dialog-description"
        >
          <DialogHeader className="pb-2">
            <div className="flex items-center justify-between mb-1">
              <DialogTitle className="text-lg">Filter</DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground" id="filter-dialog-description">
              Customize your roommate search
            </p>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Age Range */}
            <div>
              <h3 className="font-medium mb-2 text-sm">Age Range</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(filters.ageRanges).map(([range, checked]) => (
                  <div key={range} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`age-${range}`} 
                      checked={checked}
                      className="h-3.5 w-3.5"
                      onCheckedChange={(checked) => {
                        setFilters({
                          ...filters,
                          ageRanges: {
                            ...filters.ageRanges,
                            [range]: !!checked
                          }
                        });
                      }}
                    />
                    <Label htmlFor={`age-${range}`} className="text-sm">{range}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Languages */}
            <div>
              <h3 className="font-medium mb-2 text-sm">Languages</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(filters.languages).map(([language, checked]) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`lang-${language}`} 
                      checked={checked}
                      className="h-3.5 w-3.5"
                      onCheckedChange={(checked) => {
                        setFilters({
                          ...filters,
                          languages: {
                            ...filters.languages,
                            [language]: !!checked
                          }
                        });
                      }}
                    />
                    <Label htmlFor={`lang-${language}`} className="text-sm">{language}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sleep Habits */}
            <div>
              <h3 className="font-medium mb-2 text-sm">Sleep Habits</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(filters.sleepingHabits).map(([habit, checked]) => (
                  <div 
                    key={habit}
                    className={cn(
                      "flex items-center p-2 border-2 rounded-md cursor-pointer text-sm",
                      checked ? "border-primary bg-blue-50" : "border-gray-200"
                    )}
                    onClick={() => {
                      setFilters({
                        ...filters,
                        sleepingHabits: {
                          ...filters.sleepingHabits,
                          [habit]: !checked
                        }
                      });
                    }}
                  >
                    {habit === "Early bird" ? (
                      <Sun className="h-4 w-4 mr-1 text-orange-500" />
                    ) : (
                      <Moon className="h-4 w-4 mr-1 text-indigo-600" />
                    )}
                    <span>{habit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Noise Level */}
            <div>
              <h3 className="font-medium mb-2 text-sm">Noise Level</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(filters.noiseLevel).map(([level, checked]) => (
                  <div 
                    key={level}
                    className={cn(
                      "flex items-center p-2 border-2 rounded-md cursor-pointer text-sm",
                      checked ? "border-primary bg-blue-50" : "border-gray-200"
                    )}
                    onClick={() => {
                      setFilters({
                        ...filters,
                        noiseLevel: {
                          ...filters.noiseLevel,
                          [level]: !checked
                        }
                      });
                    }}
                  >
                    {level === "Quiet" ? (
                      <VolumeX className="h-4 w-4 mr-1 text-gray-600" />
                    ) : (
                      <Users className="h-4 w-4 mr-1 text-blue-500" />
                    )}
                    <span>{level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between mt-4 pt-2 gap-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 px-4 border-gray-300"
              onClick={resetFilters}
            >
              Reset All
            </Button>
            <Button 
              size="sm"
              className="text-xs h-9 px-6 navy-button font-medium"
              onClick={() => {
                // Track filter usage for analytics
                console.log("Filters applied:", filters);
                setFilterDialogOpen(false);
              }}
            >
              Apply Filters
              {activeFilters && 
                <span className="ml-1 bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                  {Object.values(filters).reduce((count, category) => 
                    count + Object.values(category).filter(Boolean).length, 0)
                  }
                </span>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrowseProfiles;