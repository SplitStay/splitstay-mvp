import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, SlidersHorizontal, X, Moon, Sun, VolumeX, Users, Check } from "lucide-react";
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
      "German": false,
      "Spanish": false
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

  // In a real app, this would use the actual logged-in user ID
  // For demo purposes we'll use a fixed ID
  const userId = 5; // John Doe
  
  // Load search criteria from localStorage when component mounts
  useEffect(() => {
    const savedSearch = localStorage.getItem('splitstay_search');
    console.log("Saved search data:", savedSearch);
    
    if (savedSearch) {
      try {
        const searchData = JSON.parse(savedSearch);
        console.log("Parsed search data:", searchData);
        
        if (searchData.destination) {
          console.log("Setting destination:", searchData.destination);
          setDestination(searchData.destination);
        }
        
        if (searchData.startDate && searchData.endDate) {
          // Handle both string dates and Date objects
          const start = typeof searchData.startDate === 'string' 
            ? new Date(searchData.startDate) 
            : searchData.startDate;
          
          const end = typeof searchData.endDate === 'string'
            ? new Date(searchData.endDate)
            : searchData.endDate;
            
          console.log("Start date:", start);
          console.log("End date:", end);
          
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

  // Define some hardcoded profiles for demo purposes
  const defaultProfiles: UserProfile[] = [
    {
      id: "1",
      firstName: "Hannah",
      lastName: "Kim",
      email: "hannah@example.com",
      username: "hannah",
      password: "password",
      profilePicture: "https://i.pravatar.cc/150?img=29",
      bio: "Spontaneous traveler who enjoys quiet hikes",
      age: "28",
      gender: "female",
      languages: ["English", "French"],
      travelTraits: ["Nature lover", "Early riser", "Quiet"],
      isVerified: true,
      matchPercentage: 91,
      matchLabel: "Recommended Roommate",
      positiveReviews: true
    },
    {
      id: "2",
      firstName: "Alina",
      lastName: "Chen",
      email: "alina@example.com",
      username: "alina",
      password: "password",
      profilePicture: "https://i.pravatar.cc/150?img=31",
      bio: "Spontaneous traveler who enjoys quiet time",
      age: "23",
      gender: "female",
      languages: ["English", "German"],
      travelTraits: ["Food lover", "Night owl", "Quiet"],
      isVerified: true,
      matchPercentage: 84,
      matchLabel: "Ideal Match",
      positiveReviews: true
    },
    {
      id: "3",
      firstName: "Sophie",
      lastName: "Müller",
      email: "sophie@example.com",
      username: "sophie",
      password: "password",
      profilePicture: "https://i.pravatar.cc/150?img=5",
      bio: "Looking for a travel partner to split costs",
      age: "27",
      gender: "female",
      languages: ["English", "French"],
      travelTraits: ["Shopper", "Foodie", "Social"],
      isVerified: true,
      matchPercentage: 75,
      matchLabel: "Good Match",
      positiveReviews: true
    }
  ];

  // Fetch compatible profiles - with fallback to demo profiles if the API fails
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['/api/matching', { userId, location: destination, startDate, endDate }],
    queryFn: async () => {
      try {
        // Try to get data from API if we have search criteria
        if (destination && startDate && endDate) {
          // Format dates as ISO strings for the API
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];
          
          const res = await fetch(
            `/api/matching?userId=${userId}&location=${encodeURIComponent(destination)}&startDate=${startDateStr}&endDate=${endDateStr}`
          );
          
          if (res.ok) {
            return res.json() as Promise<UserProfile[]>;
          }
        }
        
        // For demo purposes, return default profiles
        console.log("Using default profiles for demo");
        return defaultProfiles;
      } catch (error) {
        console.error("Error fetching profiles:", error);
        return defaultProfiles;
      }
    }
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate("/")}
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
          {profiles?.map((profile) => (
            <RoommateCard
              key={profile.id}
              profile={profile}
              actionUrl={`/request-booking/${profile.id}`}
            />
          ))}
          
          {profiles?.length === 0 && (
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
            
            {/* No verified filter needed since all users are verified */}
          </div>
          
          <DialogFooter className="flex justify-between mt-1 pt-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-3"
              onClick={() => {
                // Reset to initial filter state
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
                    "German": false,
                    "Spanish": false
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
              }}
            >
              Reset
            </Button>
            <Button 
              size="sm"
              className="text-xs h-8 px-3 navy-button"
              onClick={() => setFilterDialogOpen(false)}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrowseProfiles;
