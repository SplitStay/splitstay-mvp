import React from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HotelIcon } from "@/components/icons";
import UserAvatar from "@/components/user-avatar";
import { BookingDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface PostStayProps {
  params: {
    id: string;
  };
}

const PostStay: React.FC<PostStayProps> = ({ params }) => {
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

  const handleRateRoommate = () => {
    if (bookingDetails?.participants[0]) {
      // Navigate to rate the first participant that isn't the current user
      const otherParticipant = bookingDetails.participants.find(p => p.userId !== 5);
      if (otherParticipant) {
        navigate(`/rate-roommate/${otherParticipant.userId}`);
      }
    }
  };

  const handleReferSplitStay = () => {
    // In a real app, this would open a share dialog
    alert("Thank you for referring SplitStay to your friends!");
  };

  const handleKeepInTouch = () => {
    // In a real app, this would add contact or open messaging
    handleRateRoommate();
  };

  const handleRebookInAnotherCity = () => {
    // In a real app, this would navigate to search page
    navigate("/find-roommate");
  };

  const handleReturnHome = () => {
    navigate("/");
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="space-y-3 mb-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }
  
  if (!bookingDetails) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">Failed to load booking details</div>
        <Button onClick={() => navigate("/")}>
          Return Home
        </Button>
      </div>
    );
  }
  
  // Get the other participant (not the current user - John Doe with ID 5)
  const roommate = bookingDetails.participants.find(p => p.userId !== 5)?.user;
  
  return (
    <div className="p-6">
      <div className="flex flex-col items-center mb-6">
        <HotelIcon className="text-primary text-4xl mb-3 h-12 w-12" />
        <h1 className="text-2xl font-bold text-primary text-center mb-1">Your Stay is Complete</h1>
        <h2 className="text-xl font-semibold text-primary text-center mb-2">{bookingDetails.hotel.name}</h2>
        <div className="flex text-accent mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-current" />
          ))}
        </div>
        <div className="text-gray-600 text-center">
          {bookingDetails.hotel.location}<br />
          {new Date(bookingDetails.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–
          {new Date(bookingDetails.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
      
      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button 
          variant="outline"
          className="flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg py-3 px-4 hover:bg-gray-50"
          onClick={handleRateRoommate}
        >
          <ThumbsUpIcon className="text-primary mr-2" />
          <span className="font-medium">Rate Stay</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg py-3 px-4 hover:bg-gray-50"
          onClick={handleReferSplitStay}
        >
          <ShareIcon className="text-primary mr-2" />
          <span className="font-medium">Refer SplitStay</span>
        </Button>
      </div>
      
      <h3 className="text-lg font-semibold text-primary mb-3">What's Next?</h3>
      
      {/* Next Actions */}
      <div className="space-y-3 mb-6">
        {roommate && (
          <Card 
            className="flex items-center justify-between w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            onClick={handleKeepInTouch}
          >
            <div className="flex items-center">
              <UserAvatar
                user={{
                  fullName: roommate.fullName,
                  profilePicture: roommate.profilePicture,
                  isVerified: roommate.isVerified
                }}
                size="sm"
                className="mr-3"
              />
              <span>Keep in Touch with {roommate.fullName}</span>
            </div>
            <ChevronRight className="text-gray-400 h-5 w-5" />
          </Card>
        )}
        
        <Card 
          className="flex items-center justify-between w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={handleRebookInAnotherCity}
        >
          <div className="flex items-center">
            <SuitcaseIcon className="text-primary mr-3" />
            <span>Rebook in Another City</span>
          </div>
          <ChevronRight className="text-gray-400 h-5 w-5" />
        </Card>
      </div>
      
      <Button
        className="w-full bg-primary text-white font-semibold py-6"
        onClick={handleReturnHome}
      >
        Return Home
      </Button>
    </div>
  );
};

// Helper Icon Components
const ThumbsUpIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const ShareIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const SuitcaseIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="7" width="18" height="14" rx="2" />
    <path d="M8 7V3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V7" />
    <path d="M12 12v4" />
    <path d="M8 12h8" />
  </svg>
);

export default PostStay;
