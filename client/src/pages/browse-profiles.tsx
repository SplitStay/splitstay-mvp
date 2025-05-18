import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitStayLogo } from "@/components/icons";
import RoommateCard from "@/components/roommate-card";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const BrowseProfiles: React.FC = () => {
  const [_, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dates, setDates] = useState("");

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

  // Fetch compatible profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['/api/matching', { userId, location: destination, startDate, endDate }],
    queryFn: async () => {
      // Only proceed with query if we have all the necessary data
      if (!destination || !startDate || !endDate) {
        return [];
      }
      
      // Format dates as ISO strings for the API
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const res = await fetch(
        `/api/matching?userId=${userId}&location=${encodeURIComponent(destination)}&startDate=${startDateStr}&endDate=${endDateStr}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch profiles');
      return res.json() as Promise<UserProfile[]>;
    },
    enabled: !!(destination && startDate && endDate) // Only run query when we have search criteria
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
        <Button variant="ghost" size="icon" className="text-gray-500">
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
    </div>
  );
};

export default BrowseProfiles;
