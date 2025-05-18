import React from "react";
import { Link, useLocation } from "wouter";
import { 
  User, 
  Calendar, 
  Compass, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Star,
  Users
} from "lucide-react";
import { SplitStayLogo } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";

const Dashboard: React.FC = () => {
  const [_, navigate] = useLocation();
  
  // Mock user data - in a real app this would come from the API
  const user = {
    fullName: "Alina Chen",
    profilePicture: "https://i.pravatar.cc/150?img=31",
    isVerified: true
  };
  
  // Mock upcoming trips data
  const upcomingTrips = [
    {
      id: "1",
      destination: "London, UK",
      dates: "May 21 - May 23, 2025",
      hotel: "The Grand Hotel",
      roommate: "Hannah Kim",
      roommateImage: "https://i.pravatar.cc/150?img=29"
    }
  ];
  
  // Mock past trips data
  const pastTrips = [
    {
      id: "2",
      destination: "Paris, France", 
      dates: "March 10 - March 15, 2025",
      hotel: "Le Petit Hotel",
      roommate: "Sophie Müller",
      roommateImage: "https://i.pravatar.cc/150?img=5"
    }
  ];

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-center mb-6">
        <div className="text-center">
          <SplitStayLogo className="mx-auto" />
          <h1 className="text-2xl font-bold text-primary">SplitStay</h1>
        </div>
      </div>
      
      {/* User Profile Card */}
      <Card className="border-2 border-gray-200 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center">
            <UserAvatar 
              user={user}
              size="lg"
              showVerified
            />
            <div className="ml-4 flex-1">
              <h2 className="font-semibold text-lg">{user.fullName}</h2>
              <p className="text-sm text-gray-500">Verified Member</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="navy-button h-auto py-4 flex-col" 
            onClick={() => navigate("/find-roommate")}
          >
            <Compass className="h-5 w-5 mb-1" />
            <span>Find a Roommate</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col text-primary" 
            onClick={() => navigate("/messages")}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            <span>Messages</span>
          </Button>
        </div>
      </div>
      
      {/* Upcoming Trips */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Upcoming Trips</h2>
        {upcomingTrips.length > 0 ? (
          <div className="space-y-3">
            {upcomingTrips.map(trip => (
              <Card key={trip.id} className="border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{trip.destination}</h3>
                      <p className="text-sm text-gray-600">{trip.dates}</p>
                      <p className="text-sm text-gray-500">{trip.hotel}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs mr-2">Roommate:</span>
                      <img 
                        src={trip.roommateImage} 
                        alt={trip.roommate}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => navigate(`/booking-confirmation/1`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-xs navy-button"
                      onClick={() => navigate(`/chat/1`)}
                    >
                      Message Roommate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-gray-500">No upcoming trips</p>
              <Button 
                onClick={() => navigate("/find-roommate")} 
                className="mt-2 navy-button"
              >
                Plan a Trip
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Past Trips */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Past Trips</h2>
        {pastTrips.length > 0 ? (
          <div className="space-y-3">
            {pastTrips.map(trip => (
              <Card key={trip.id} className="border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{trip.destination}</h3>
                      <p className="text-sm text-gray-600">{trip.dates}</p>
                      <p className="text-sm text-gray-500">{trip.hotel}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs mr-2">Roommate:</span>
                      <img 
                        src={trip.roommateImage} 
                        alt={trip.roommate}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => navigate(`/leave-review/2`)}
                    >
                      Leave Review
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-xs navy-button"
                      onClick={() => navigate(`/chat/2`)}
                    >
                      Message Roommate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-gray-500">No past trips</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => {}}
          >
            <User className="h-5 w-5 mb-1" />
            <span>Profile</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs text-primary"
            onClick={() => {}}
          >
            <Calendar className="h-5 w-5 mb-1" />
            <span>Trips</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => navigate("/find-roommate")}
          >
            <Compass className="h-5 w-5 mb-1" />
            <span>Explore</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => navigate("/messages")}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            <span>Messages</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => {}}
          >
            <Settings className="h-5 w-5 mb-1" />
            <span>Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;