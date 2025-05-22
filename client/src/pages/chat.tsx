import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/user-avatar";
import StayDetails from "@/components/stay-details";
import { User, Message, BookingDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface ChatProps {
  params: {
    id: string;
  };
}

const Chat: React.FC<ChatProps> = ({ params }) => {
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const bookingId = 1; // In a real app, this would be from the URL or context
  const userId = parseInt(params.id, 10);
  
  // Use hardcoded Amara profile instead of fetching from API
  const { isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json() as Promise<User>;
    },
    enabled: false // Disable this query as we're using a hardcoded profile
  });
  
  // Force refresh to load new images
  React.useEffect(() => {
    // Clear browser cache for images
    const timestamp = new Date().getTime();
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.includes('amara')) {
        img.src = img.src.split('?')[0] + '?t=' + timestamp;
      }
    });
  }, []);
  
  // Hardcoded Amara profile for the promovideo
  const otherUser = {
    id: 1,
    fullName: "Amara",
    profilePicture: null, // We'll use initials instead of a photo
    isVerified: true,
    gender: "female",
    age: 28,
    languages: ["English", "French"],
    bio: "Travel enthusiast passionate about discovering new cultures.",
    occupation: "Marketing Specialist",
    travelStyle: "Budget-friendly exploration"
  };
  
  // Fetch booking details
  const { data: bookingDetails, isLoading: isLoadingBooking } = useQuery({
    queryKey: [`/api/bookings/${bookingId}/details`],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/details`);
      if (!res.ok) throw new Error('Failed to fetch booking details');
      return res.json() as Promise<BookingDetails>;
    }
  });
  
  // Use custom message data instead of fetching from API
  const { isLoading: isLoadingMessages } = useQuery({
    queryKey: [`/api/messages/booking/${bookingId}`],
    queryFn: async () => {
      const res = await fetch(`/api/messages/booking/${bookingId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json() as Promise<Message[]>;
    },
    enabled: false // Disable this query as we're using custom messages
  });
  
  // Custom messages for the promovideo storyboard
  const messages = [
    {
      id: 1,
      bookingId: 1,
      senderId: 1, // Amara
      content: "Hi Emily! Looking forward to our trip! 😊 Would you like to coordinate arrival times?",
      createdAt: new Date(Date.now() - 3600000) // 1 hour ago
    }
  ];
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        bookingId,
        senderId: 5, // Current user ID (John Doe)
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/booking/${bookingId}`] });
      setMessage("");
    }
  });
  
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };
  
  const handleViewBookingDetails = () => {
    navigate(`/booking-confirmation/${bookingId}`);
  };
  
  const handleDownloadConfirmation = () => {
    navigate(`/booking-confirmation/${bookingId}`);
  };
  
  const isLoading = isLoadingUser || isLoadingBooking || isLoadingMessages;
  
  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500"
          onClick={() => navigate(`/request-sent/${userId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {isLoadingUser ? (
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : otherUser ? (
          <div className="flex items-center">
            <UserAvatar
              user={{
                fullName: otherUser.fullName,
                profilePicture: otherUser.profilePicture,
                isVerified: otherUser.isVerified
              }}
              size="sm"
              className="mr-3"
            />
            <div>
              <h2 className="text-lg font-semibold text-primary">Chat with {otherUser.fullName}</h2>
              <div className="text-sm text-gray-600">MEININGER Hotel</div>
            </div>
          </div>
        ) : (
          <div className="text-red-500">Failed to load user</div>
        )}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isLoadingMessages ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-3/4 ml-auto" />
            <Skeleton className="h-12 w-2/4" />
          </div>
        ) : messages?.length ? (
          <>
            {messages.map((msg) => {
              const isCurrentUser = msg.senderId === 5; // Current user ID (John Doe)
              
              return (
                <div key={msg.id} className={`flex mb-4 ${isCurrentUser ? 'justify-end' : ''}`}>
                  {!isCurrentUser && (
                    <div className="mr-2 flex-shrink-0">
                      <UserAvatar
                        user={{
                          fullName: otherUser?.fullName || "",
                          profilePicture: otherUser?.profilePicture
                        }}
                        size="sm"
                      />
                    </div>
                  )}
                  <div className={`${
                    isCurrentUser 
                      ? 'bg-primary text-white rounded-lg rounded-tr-none' 
                      : 'bg-white rounded-lg rounded-tl-none'
                  } p-3 shadow-sm max-w-xs`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}
            
            {/* System message */}
            <div className="flex justify-center mb-4">
              <div className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                {otherUser?.fullName} confirmed the stay
              </div>
            </div>
            
            {/* Check-in message for promovideo */}
            <div className="flex justify-center mb-4 mt-4">
              <div className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                Today
              </div>
            </div>
            
            <div className="flex mb-4">
              <div className="mr-2 flex-shrink-0">
                <UserAvatar
                  user={{
                    fullName: otherUser?.fullName || "",
                    profilePicture: otherUser?.profilePicture
                  }}
                  size="sm"
                />
              </div>
              <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-xs">
                <p>Just checked in! Got our room keys. The hotel is beautiful! 😊</p>
              </div>
            </div>
            
            <div className="flex mb-4 justify-end">
              <div className="bg-primary text-white rounded-lg rounded-tr-none p-3 shadow-sm max-w-xs">
                <p>Perfect! I'm almost there with my suitcase. See you in 5 minutes!</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {/* Trip details */}
        {bookingDetails && (
          <StayDetails
            hotelName={bookingDetails.hotel.name}
            roomType="Twin Room"
            checkInDate={new Date(bookingDetails.checkInDate)}
            checkOutDate={new Date(bookingDetails.checkOutDate)}
            totalCost={bookingDetails.totalCost}
            cancellationDate={new Date("2023-05-10")}
            isIdVerified={true}
            hasPositiveReviews={true}
            showButtons={true}
            onViewBooking={handleViewBookingDetails}
            onDownloadConfirmation={handleDownloadConfirmation}
          />
        )}
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border-2 border-gray-300 rounded-l-lg px-4 py-2"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            className="bg-primary text-white px-4 py-2 rounded-r-lg"
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-between mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary font-medium text-sm"
            onClick={handleDownloadConfirmation}
          >
            <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Confirmation
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary font-medium text-sm"
            onClick={handleViewBookingDetails}
          >
            <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View Booking Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
