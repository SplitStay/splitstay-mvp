import React from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Wifi, Thermometer, Bed, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { UserProfile } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestBookingProps {
  params: {
    id: string;
  };
}

const RequestBooking: React.FC<RequestBookingProps> = ({ params }) => {
  const [_, navigate] = useLocation();
  const userId = parseInt(params.id, 10);
  
  // First try to get the profile from the browse profiles data
  const getProfileFromSessionStorage = (): UserProfile | null => {
    try {
      const savedSearchData = sessionStorage.getItem("splitstay_search");
      if (savedSearchData) {
        // Get the browse profiles data that was loaded
        const browsedProfiles = JSON.parse(sessionStorage.getItem("splitstay_browsed_profiles") || "[]");
        // Find the profile matching the user ID (comparing as strings to handle potential type differences)
        return browsedProfiles.find((p: UserProfile) => String(p.id) === params.id) || null;
      }
    } catch (error) {
      console.error("Error retrieving profile from sessionStorage:", error);
    }
    return null;
  };

  const localProfile = getProfileFromSessionStorage();

  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      // If we have the profile in sessionStorage, use that one immediately
      if (localProfile) {
        console.log("Using profile from sessionStorage:", localProfile);
        
        // Ensure the profile has fullName when using sessionStorage data
        const profileWithFullName = {
          ...localProfile,
          fullName: localProfile.fullName || `${localProfile.firstName || ''} ${localProfile.lastName || ''}`.trim()
        };
        
        return profileWithFullName;
      }
      
      // Otherwise fetch from API
      console.log("Fetching profile from API");
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user profile');
      const apiProfile = await res.json() as UserProfile;
      
      // Also ensure API profile has fullName
      return {
        ...apiProfile,
        fullName: apiProfile.fullName || `${apiProfile.firstName || ''} ${apiProfile.lastName || ''}`.trim()
      };
    },
    // Skip refetching if we already have the data
    refetchOnWindowFocus: !localProfile,
    initialData: localProfile ? {
      ...localProfile,
      fullName: localProfile.fullName || `${localProfile.firstName || ''} ${localProfile.lastName || ''}`.trim()
    } : undefined
  });

  const handleSendRequest = () => {
    // In a real app, this would create a booking request
    navigate(`/request-sent/${userId}`);
  };

  const handleMessageFirst = () => {
    // In a real app, this would create a conversation
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500"
          onClick={() => navigate("/browse-profiles")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Request to Book</h1>
      </div>
      
      {/* Profile */}
      {isLoading ? (
        <Card className="border-2 border-gray-200 rounded-lg mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mt-4" />
          </CardContent>
        </Card>
      ) : profile ? (
        <Card className="border-2 border-gray-200 rounded-lg mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <UserAvatar
                user={{
                  fullName: profile.fullName,
                  profilePicture: profile.profilePicture,
                  isVerified: profile.isVerified
                }}
                size="lg"
                showVerified={false}
              />
              <div>
                <h3 className="text-lg font-semibold">{profile.fullName}</h3>
                <div className="text-gray-600 text-sm">
                  <span className="mr-2">
                    {profile.gender === "female" ? "♀" : profile.gender === "male" ? "♂" : "⚪"} {profile.age}
                  </span>
                  <span>{profile.languages.join(", ")}</span>
                </div>
                <div className="mt-1 flex space-x-2">
                  {profile.isVerified && (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      ID Verified
                    </span>
                  )}
                  <span className="inline-flex items-center text-xs text-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Positive reviews
                  </span>
                </div>
              </div>
            </div>
            {profile.bio && (
              <div className="mt-2 text-gray-700">"{profile.bio}"</div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-4 text-red-500">Failed to load profile</div>
      )}
      
      {/* Hotel Details */}
      <Card className="border-2 border-gray-200 rounded-lg mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">MEININGER Hotel</h3>
              <div className="mt-1">
                <div>2 Single Beds</div>
                <div>May 12–15 • 3 nights</div>
                <div className="font-medium">€ 100 / night • Split € 50 each</div>
              </div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          
          {/* Amenities */}
          <div className="flex space-x-2 mt-3">
            <div className="p-2 border border-gray-200 rounded">
              <Wifi className="h-5 w-5" />
            </div>
            <div className="p-2 border border-gray-200 rounded">
              <Thermometer className="h-5 w-5" />
            </div>
            <div className="p-2 border border-gray-200 rounded">
              <Bed className="h-5 w-5" />
            </div>
          </div>
          
          {/* Notes */}
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            <li className="flex items-start">
              <Check className="text-green-500 mt-1 mr-2 h-4 w-4" />
              <span>Flexible cancellation</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mt-1 mr-2 h-4 w-4" />
              <span>Only pay once confirmed</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mt-1 mr-2 h-4 w-4" />
              <span>All guests are ID verified</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-primary text-white font-semibold py-6"
          onClick={handleSendRequest}
        >
          Send Request to Share Room
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-6"
          onClick={handleMessageFirst}
        >
          Message First
        </Button>
      </div>
    </div>
  );
};

export default RequestBooking;
