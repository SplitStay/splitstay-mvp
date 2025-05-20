import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Phone, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { HotelIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingDetails } from "@shared/schema";
import { daysUntilCheckIn } from "@/lib/utils";
import PaymentSplitCalculator from "@/components/payment-split-calculator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BookingConfirmationProps {
  params: {
    id: string;
  };
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ params }) => {
  const [_, navigate] = useLocation();
  const [showSplitCalculator, setShowSplitCalculator] = useState(false);
  const bookingId = parseInt(params.id, 10);
  
  const { data: bookingDetails, isLoading } = useQuery({
    queryKey: [`/api/bookings/${bookingId}/details`],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/details`);
      if (!res.ok) throw new Error('Failed to fetch booking details');
      return res.json() as Promise<BookingDetails>;
    }
  });
  
  const handleOpenChat = () => {
    if (bookingDetails?.participants[0]) {
      navigate(`/chat/${bookingDetails.participants[0].userId}`);
    }
  };
  
  const handleViewItinerary = () => {
    navigate(`/check-in/${bookingId}`);
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate(`/chat/${bookingDetails?.participants[0]?.userId || 1}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-primary">Your Stay</h1>
        <div className="w-5"></div> {/* Spacer for layout balance */}
      </div>
      
      {/* Hotel Info */}
      <div className="flex flex-col items-center mb-6">
        <HotelIcon className="text-primary text-4xl mb-2 h-12 w-12" />
        <h2 className="text-2xl font-bold text-primary mb-1 text-center">
          Your Stay at<br />
          {isLoading ? <Skeleton className="h-8 w-48" /> : bookingDetails?.hotel.name}
        </h2>
      </div>
      
      {/* Stay Info */}
      <Card className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-4">
            <div className="flex items-center mb-1">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              <span className="font-medium">
                {isLoading ? <Skeleton className="h-5 w-20" /> : bookingDetails?.hotel.location}
              </span>
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                bookingDetails && (
                  `${new Date(bookingDetails.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${new Date(bookingDetails.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                )
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="text-center">
              <div className="font-bold text-2xl text-primary">
                {isLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : daysUntilCheckIn(new Date(bookingDetails!.checkInDate))}
              </div>
              <div>days until<br />check-in</div>
            </div>
          </div>
        </div>
        {!isLoading && bookingDetails && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <div>
              <div className="flex items-center mb-1">
                <span className="font-medium flex items-center">
                  <Calculator className="mr-2 h-5 w-5 text-primary" />
                  Total Cost
                </span>
              </div>
              <div className="text-2xl font-bold text-primary">
                ${(bookingDetails.totalCost / 100).toFixed(2)}
              </div>
            </div>
            <Dialog open={showSplitCalculator} onOpenChange={setShowSplitCalculator}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  Split Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90%] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Payment Split Calculator</DialogTitle>
                  <DialogDescription>
                    Calculate how to divide the cost between roommates
                  </DialogDescription>
                </DialogHeader>
                <PaymentSplitCalculator 
                  bookingDetails={bookingDetails} 
                  onClose={() => setShowSplitCalculator(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </Card>
      
      {/* Roommates */}
      <h3 className="text-lg font-semibold text-primary mb-3">Roommates</h3>
      <Card className="bg-white border-2 border-gray-200 rounded-lg mb-6">
        {isLoading ? (
          <>
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-20 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-20 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </>
        ) : bookingDetails?.participants.map((participant, index) => (
          <div key={participant.id} className={index < bookingDetails.participants.length - 1 ? "p-3 border-b border-gray-200" : "p-3"}>
            <div className="flex items-center">
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
                <div className="text-gray-600 text-sm">
                  <span className="mr-2">
                    {participant.user.gender === "female" ? "♀" : participant.user.gender === "male" ? "♂" : "⚪"} {participant.user.age}
                  </span>
                  <span>{participant.user.languages.join(", ")}</span>
                </div>
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {participant.status === "confirmed" ? "Confirmed" : participant.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </Card>
      
      {/* Useful Info */}
      <h3 className="text-lg font-semibold text-primary mb-3">Useful for Your Arrival:</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <InfoCard icon={<Clock />} text="Check-in: 3:00 PM" />
        <InfoCard icon={<Train />} text="Closest Metro" />
        <InfoCard icon={<Phone className="h-5 w-5 text-primary" />} text="Hotel Contact" />
        <InfoCard icon={<Utensils />} text="Local Food Picks" />
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className="bg-primary text-white font-semibold py-6"
          onClick={handleOpenChat}
        >
          Open Chat
        </Button>
        <Button
          variant="outline"
          className="border-2 border-primary text-primary font-semibold py-6"
          onClick={handleViewItinerary}
        >
          View Itinerary
        </Button>
      </div>
    </div>
  );
};

// Helper components for info cards and icons
const InfoCard = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center bg-white p-3 border border-gray-200 rounded-lg">
    <div className="mr-2 text-primary">{icon}</div>
    <span>{text}</span>
  </div>
);

const Clock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const Train = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2" />
    <path d="M4 11h16" />
    <path d="M12 3v8" />
    <path d="M8 19l-4 4" />
    <path d="M16 19l4 4" />
  </svg>
);

const Utensils = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

export default BookingConfirmation;
