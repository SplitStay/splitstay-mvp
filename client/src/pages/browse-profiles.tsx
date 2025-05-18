import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitStayLogo } from "@/components/icons";
import RoommateCard from "@/components/roommate-card";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const BrowseProfiles: React.FC = () => {
  const [_, navigate] = useLocation();
  const [destination] = useState("Brussels");
  const [dates] = useState("May 12 – 15");

  // In a real app, this would use the actual logged-in user ID
  // For demo purposes we'll use a fixed ID
  const userId = 5; // John Doe

  // Fetch compatible profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['/api/matching', { userId, location: destination }],
    queryFn: async () => {
      const res = await fetch(`/api/matching?userId=${userId}&location=${destination}&startDate=2023-05-12&endDate=2023-05-15`);
      if (!res.ok) throw new Error('Failed to fetch profiles');
      return res.json() as Promise<UserProfile[]>;
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
