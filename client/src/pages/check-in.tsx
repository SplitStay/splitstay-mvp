import React from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Clock, TrainFront, Phone, Utensils, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { BookingDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface CheckInProps {
  params: {
    id: string;
  };
}

const CheckIn: React.FC<CheckInProps> = ({ params }) => {
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

  const markAsCheckedInMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would make an actual API call
      // For demo purposes, we'll use a simulated success
      
      // Simulating an API call success after a brief delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    },
    onSuccess: () => {
      // Navigate to the guest info page
      navigate(`/guest-info/${bookingId}`);
    }
  });
  
  const handleMarkAsCheckedIn = () => {
    markAsCheckedInMutation.mutate();
  };
  
  const handleContactHotel = () => {
    // In a real app, this would open the phone dialer or show contact info
    navigate(`/chat/${bookingId}`);
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
            onClick={() => navigate(`/booking-confirmation/${bookingId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-7 w-48" />
          <div className="w-5"></div>
        </div>
        
        <Skeleton className="h-16 w-full mb-6" />
        
        <Skeleton className="h-32 w-full mb-6" />
        
        <Skeleton className="h-6 w-40 mb-3" />
        <Skeleton className="h-32 w-full mb-6" />
        
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        
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
        <div className="text-red-500 mb-4">Failed to load booking details</div>
        <Button onClick={() => navigate(`/booking-confirmation/${bookingId}`)}>
          Go Back
        </Button>
      </div>
    );
  }
  
  const hotelName = bookingDetails.hotel.name;
  const hotelAddress = bookingDetails.hotel.address;
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate(`/booking-confirmation/${bookingId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-primary">Welcome to Brussels!</h1>
        <div className="w-5"></div> {/* Spacer for layout balance */}
      </div>
      
      <p className="text-center text-gray-700 mb-6">
        Hope your journey went well! Your room will be ready at 3:00 PM. Need anything? We're here.
      </p>
      
      {/* Hotel Card */}
      <Card className="bg-white border-2 border-gray-200 rounded-lg mb-6 overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded mr-3">
              <span className="font-bold">{hotelName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold">{hotelName}</h3>
              <div className="text-sm text-gray-600">
                <CheckCircle className="inline-block text-green-500 mr-1 h-3 w-3" />
                {hotelAddress}
              </div>
            </div>
          </div>
          <div className="p-2 bg-gray-100 rounded">
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M7 7h.01" />
              <path d="M12 7h.01" />
              <path d="M17 7h.01" />
              <path d="M7 12h.01" />
              <path d="M12 12h.01" />
              <path d="M17 12h.01" />
              <path d="M7 17h.01" />
              <path d="M12 17h.01" />
              <path d="M17 17h.01" />
            </svg>
          </div>
        </CardContent>
        <div className="bg-gray-50 p-3 border-t border-gray-200">
          <Button 
            variant="ghost"
            className="text-primary font-medium flex items-center"
            onClick={handleContactHotel}
          >
            <Phone className="mr-2 h-4 w-4" />
            <span>Hotel Contact</span>
          </Button>
        </div>
      </Card>
      
      {/* Roommates */}
      <h3 className="text-lg font-semibold text-primary mb-3">Roommates</h3>
      <Card className="bg-white border-2 border-gray-200 rounded-lg mb-6">
        {bookingDetails.participants.map((participant, index) => {
          const isCurrentUser = participant.userId === 5; // John Doe is the current user
          const otherParticipant = !isCurrentUser;
          const checkedIn = participant.status === "checked_in";
          
          return (
            <div 
              key={participant.id} 
              className={index < bookingDetails.participants.length - 1 ? "p-3 border-b border-gray-200 flex items-center" : "p-3 flex items-center"}
            >
              <UserAvatar
                user={{
                  fullName: participant.user.fullName,
                  profilePicture: participant.user.profilePicture,
                  isVerified: participant.user.isVerified
                }}
                size="md"
                className="mr-3"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{participant.user.fullName}</h3>
                <div className={`flex items-center text-sm ${checkedIn ? 'text-green-600' : 'text-primary'}`}>
                  {checkedIn ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      <span>Checked In</span>
                    </>
                  ) : (
                    <>
                      <Clock className="mr-1 h-3 w-3" />
                      <span>On the way</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                {checkedIn ? (
                  <>
                    <CheckCircle className="text-green-500 text-lg h-5 w-5" />
                    <div className="text-xs text-green-600">Checked In</div>
                  </>
                ) : (
                  <>
                    <Clock className="text-gray-500 text-lg h-5 w-5" />
                    <div className="text-xs text-gray-500">On the way</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </Card>
      
      {/* Useful Info */}
      <h3 className="text-lg font-semibold text-primary mb-3">Useful information</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="flex items-center bg-white p-3 border border-gray-200">
          <TrainFront className="text-primary mr-2 h-5 w-5" />
          <span>Nearest Metro</span>
        </Card>
        <Card className="flex items-center bg-white p-3 border border-gray-200">
          <Briefcase className="text-primary mr-2 h-5 w-5" />
          <span>Luggage storage</span>
        </Card>
        <Card className="flex items-center bg-white p-3 border border-gray-200">
          <Phone className="text-primary mr-2 h-5 w-5" />
          <span>Hotel Contact</span>
        </Card>
        <Card className="flex items-center bg-white p-3 border border-gray-200">
          <Utensils className="text-primary mr-2 h-5 w-5" />
          <span>Try Be Burger dinner</span>
        </Card>
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className="bg-primary text-white font-semibold py-6"
          onClick={handleMarkAsCheckedIn}
          disabled={markAsCheckedInMutation.isPending}
        >
          Mark as Checked In
        </Button>
        <Button
          variant="outline"
          className="border-2 border-primary text-primary font-semibold py-6"
          onClick={handleContactHotel}
        >
          Contact Hotel
        </Button>
      </div>
    </div>
  );
};

export default CheckIn;
