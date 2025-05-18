import React from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, DoorOpen, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { BookingDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentDayOfStay, getTotalStayDuration } from "@/lib/utils";

interface GuestInfoProps {
  params: {
    id: string;
  };
}

const GuestInfo: React.FC<GuestInfoProps> = ({ params }) => {
  const [_, navigate] = useLocation();
  const bookingId = parseInt(params.id, 10);
  
  const { data: bookingDetails, isLoading } = useQuery({
    queryKey: [`/api/bookings/${bookingId}/details`],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/details`);
      if (!res.ok) throw new Error('Failed to fetch booking details');
      return res.json() as Promise<BookingDetails>;
    }
  });

  const handleRoomChat = () => {
    if (bookingDetails?.participants[0]) {
      // Navigate to chat with the first participant that isn't the current user
      const otherParticipant = bookingDetails.participants.find(p => p.userId !== 5);
      if (otherParticipant) {
        navigate(`/chat/${otherParticipant.userId}`);
      }
    }
  };

  const handleExploreNearby = () => {
    // In a real app, this would navigate to a map or attractions page
    // For demo purposes, navigate to post-stay page
    navigate(`/post-stay/${bookingId}`);
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-7 w-24" />
          <div className="w-5"></div>
        </div>
        
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-16 w-full mb-6" />
        
        <Skeleton className="h-6 w-32 mb-3" />
        <Skeleton className="h-24 w-full mb-6" />
        
        <Skeleton className="h-6 w-32 mb-3" />
        <Skeleton className="h-16 w-full mb-6" />
        
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    );
  }
  
  if (!bookingDetails) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">Failed to load guest information</div>
        <Button onClick={() => navigate(`/check-in/${bookingId}`)}>
          Go Back
        </Button>
      </div>
    );
  }
  
  // Get the other participant (not the current user - John Doe with ID 5)
  const roommate = bookingDetails.participants.find(p => p.userId !== 5)?.user;
  
  // Calculate which day of the stay it is
  const currentDay = getCurrentDayOfStay(
    new Date(bookingDetails.checkInDate),
    new Date(bookingDetails.checkOutDate)
  );
  
  const totalDays = getTotalStayDuration(
    new Date(bookingDetails.checkInDate),
    new Date(bookingDetails.checkOutDate)
  );
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate(`/check-in/${bookingId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-primary">Guest Info</h1>
        <div className="w-5"></div> {/* Spacer for layout balance */}
      </div>
      
      <Card className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden mb-4">
        <CardContent className="flex items-center justify-between p-4">
          <div className="text-primary">
            <DoorOpen className="h-6 w-6" />
          </div>
          <div className="flex-1 mx-4">
            <h3 className="font-medium">Stay Details</h3>
            <div className="text-gray-600">Day {currentDay} of {totalDays}</div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            onClick={() => navigate(`/booking-confirmation/${bookingId}`)}
          >
            Tap to View
          </Button>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="font-medium">Room No.</div>
          <div className="font-bold text-xl">101</div>
        </div>
      </Card>
      
      {/* Roommate */}
      {roommate && (
        <>
          <h3 className="text-lg font-semibold text-primary mb-3">Roommate</h3>
          <Card className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <UserAvatar
                user={{
                  fullName: roommate.fullName,
                  profilePicture: roommate.profilePicture,
                  isVerified: roommate.isVerified
                }}
                size="md"
              />
              <div>
                <h3 className="font-semibold">{roommate.fullName}</h3>
                <div className="text-gray-600 text-sm">
                  <span>
                    {roommate.gender === "female" ? "♀" : roommate.gender === "male" ? "♂" : "⚪"} {roommate.age}
                  </span>
                  <span className="ml-2">Susan Corey Band</span>
                </div>
                <div className="mt-1">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Susan Corey Band
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
      
      {/* Nearby Events */}
      <h3 className="text-lg font-semibold text-primary mb-3">Nearby Events</h3>
      <Card className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Calendar className="text-primary mr-3 h-5 w-5" />
          <div>
            <div className="font-medium">04/28 Food Truck Festival</div>
          </div>
        </div>
      </Card>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className="bg-primary text-white font-semibold py-6"
          onClick={handleRoomChat}
        >
          Room Chat
        </Button>
        <Button
          variant="outline"
          className="border-2 border-primary text-primary font-semibold py-6"
          onClick={handleExploreNearby}
        >
          Explore Nearby
        </Button>
      </div>
    </div>
  );
};

export default GuestInfo;
