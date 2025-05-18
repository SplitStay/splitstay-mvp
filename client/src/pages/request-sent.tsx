import React from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import UserAvatar from "@/components/user-avatar";
import { UserProfile } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestSentProps {
  params: {
    id: string;
  };
}

const RequestSent: React.FC<RequestSentProps> = ({ params }) => {
  const [_, navigate] = useLocation();
  const userId = parseInt(params.id, 10);
  
  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json() as Promise<UserProfile>;
    }
  });

  const handleMessageNow = () => {
    navigate(`/chat/${userId}`);
  };

  const handleCancelRequest = () => {
    navigate("/browse-profiles");
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
        <h1 className="text-2xl font-bold text-primary">Your Roommate Request</h1>
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
                <Skeleton className="h-6 w-32" />
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
                <div className="mt-1">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Request Sent
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-gray-700">
              Looking forward to our trip! 😊
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-4 text-red-500">Failed to load profile</div>
      )}
      
      {/* Booking Details */}
      <Card className="border-2 border-gray-200 rounded-lg mb-4">
        <CardContent className="p-4">
          <h3 className="font-semibold">MEININGER Hotel Bruxelles</h3>
          <div className="text-gray-700">
            <div>May 12–15</div>
            <div>Twin Room • €63 per night each</div>
            <div className="italic text-gray-500">Pending confirmation</div>
          </div>
          
          {/* Status */}
          <div className="mt-3">
            <div className="relative pt-1">
              <Progress value={33} className="h-2" />
              <div className="flex text-xs justify-between mt-1">
                <div className="font-semibold text-primary">Sent</div>
                <div className="text-gray-500">Viewed</div>
                <div className="text-gray-500">Accepted</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-primary text-white font-semibold py-6"
          onClick={handleMessageNow}
        >
          Message Now
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-6"
          onClick={handleCancelRequest}
        >
          Cancel Request
        </Button>
      </div>
      
      {/* Safety Reminder */}
      <div className="mt-6 p-3 bg-gray-100 rounded-lg flex items-center text-sm text-gray-700">
        <Lock className="mr-2 text-primary h-4 w-4" />
        <span>Remember: always communicate &amp; pay within our platform</span>
      </div>
    </div>
  );
};

export default RequestSent;
