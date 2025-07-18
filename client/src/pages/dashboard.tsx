import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  User, 
  Calendar, 
  Compass, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Star,
  Users,
  Gift,
  Camera
} from "lucide-react";
import { SplitStayLogo } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";
import ReferralSystem from "@/components/referral-system";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import emilyProfilePic from "../assets/emily-profile-2025.png";

const Dashboard: React.FC = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data loading
  React.useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Error handling function
  const handleError = (error: Error, action: string) => {
    console.error(`Error ${action}:`, error);
    toast({
      title: "Something went wrong",
      description: `We couldn't ${action.toLowerCase()}. Please try again later.`,
      variant: "destructive",
    });
  };
  
  // Mock user data - in a real app this would come from the API
  const user = {
    fullName: "Emily",
    profilePicture: emilyProfilePic,
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
          {isLoading ? (
            <div className="flex items-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="ml-4 flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ) : (
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
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => navigate("/profile")}
                >
                  View Profile
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs flex items-center text-red-500 hover:text-red-700"
                  onClick={() => {
                    try {
                      // Clear all session data on logout
                      sessionStorage.clear();
                      navigate("/");
                    } catch (error) {
                      handleError(error as Error, "logging out");
                    }
                  }}
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Log Out
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="h-auto py-4 flex-col text-primary" 
              onClick={() => {
                try {
                  navigate("/find-roommate");
                } catch (error) {
                  handleError(error as Error, "navigating to find roommate");
                }
              }}
            >
              <Compass className="h-5 w-5 mb-1" />
              <span>Find a Roommate</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col text-primary" 
              onClick={() => {
                try {
                  navigate("/messages");
                } catch (error) {
                  handleError(error as Error, "navigating to messages");
                }
              }}
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              <span>Messages</span>
            </Button>
          </div>
        )}
      </div>
      
      {/* Referral Banner */}
      <div className="mb-6">
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-8 w-8 rounded-full mb-2" />
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-64 mb-3" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Gift className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-semibold mb-1">Refer & Earn $10</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Share SplitStay with friends and earn $10 when they book
                </p>
                <ReferralSystem />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Trips */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Upcoming Trips</h2>
        {isLoading ? (
          <div className="space-y-3">
            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-1/2">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-16 mr-2" />
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-36" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : upcomingTrips.length > 0 ? (
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
                      <div className="flex items-center">
                        <img 
                          src={trip.roommateImage} 
                          alt={trip.roommate}
                          className="h-8 w-8 rounded-full mr-2"
                          onError={(e) => {
                            // Handle image loading error
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://via.placeholder.com/150"; // Fallback image
                            
                            toast({
                              title: "Image couldn't load",
                              description: "We're having trouble loading profile images.",
                              variant: "destructive",
                            });
                          }}
                        />
                        <span className="text-sm font-medium">{trip.roommate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex-1 h-10"
                      onClick={() => {
                        try {
                          navigate(`/booking-confirmation/1`);
                        } catch (error) {
                          handleError(error as Error, "viewing trip details");
                        }
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="default"
                      size="sm" 
                      className="text-xs flex-1 h-10 bg-primary text-white hover:bg-primary/90"
                      onClick={() => {
                        try {
                          navigate(`/chat/1`);
                        } catch (error) {
                          handleError(error as Error, "opening chat");
                        }
                      }}
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
                onClick={() => {
                  try {
                    navigate("/find-roommate");
                  } catch (error) {
                    handleError(error as Error, "navigating to find roommate");
                  }
                }} 
                className="mt-2 navy-button"
              >
                Plan a Trip
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Travel Memories */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Travel Memories</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center"
            onClick={() => navigate("/souvenir-review")}
          >
            <Camera className="h-3 w-3 mr-1" />
            Add Memory
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Card className="overflow-hidden">
              <div className="aspect-square w-full">
                <img 
                  src="https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1974&auto=format&fit=crop" 
                  alt="Paris memory" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-3 w-3 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">2 months ago</span>
                </div>
                <p className="text-xs truncate">Amazing trip with Sophie in Paris!</p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="aspect-square w-full">
                <img 
                  src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop" 
                  alt="Paris memory" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-3 w-3 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">3 months ago</span>
                </div>
                <p className="text-xs truncate">Beautiful view from our hotel!</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Past Trips */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Past Trips</h2>
        {isLoading ? (
          <div className="space-y-3">
            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-1/2">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-16 mr-2" />
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-36" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : pastTrips.length > 0 ? (
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
                      <div className="flex items-center">
                        <img 
                          src={trip.roommateImage} 
                          alt={trip.roommate}
                          className="h-8 w-8 rounded-full mr-2"
                          onError={(e) => {
                            // Handle image loading error
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://via.placeholder.com/150"; // Fallback image
                            
                            toast({
                              title: "Image couldn't load",
                              description: "We're having trouble loading profile images.",
                              variant: "destructive",
                            });
                          }}
                        />
                        <span className="text-sm font-medium">{trip.roommate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex-1 h-10"
                      onClick={() => {
                        try {
                          navigate(`/souvenir-review`);
                        } catch (error) {
                          handleError(error as Error, "viewing souvenir page");
                        }
                      }}
                    >
                      Share Travel Memory
                    </Button>
                    <Button 
                      variant="default"
                      size="sm" 
                      className="text-xs flex-1 h-10 bg-primary text-white hover:bg-primary/90"
                      onClick={() => {
                        try {
                          navigate(`/chat/2`);
                        } catch (error) {
                          handleError(error as Error, "opening chat");
                        }
                      }}
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
            onClick={() => {
              try {
                navigate("/profile");
              } catch (error) {
                handleError(error as Error, "navigating to profile");
              }
            }}
          >
            <User className="h-5 w-5 mb-1" />
            <span>Profile</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs text-primary"
            onClick={() => {
              try {
                navigate("/dashboard");
              } catch (error) {
                handleError(error as Error, "refreshing dashboard");
              }
            }}
          >
            <Calendar className="h-5 w-5 mb-1" />
            <span>Trips</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => {
              try {
                navigate("/find-roommate");
              } catch (error) {
                handleError(error as Error, "navigating to explore");
              }
            }}
          >
            <Compass className="h-5 w-5 mb-1" />
            <span>Explore</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => {
              try {
                navigate("/messages");
              } catch (error) {
                handleError(error as Error, "navigating to messages");
              }
            }}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            <span>Messages</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs text-red-500"
            onClick={() => {
              try {
                // Clear all session data on logout
                sessionStorage.clear();
                navigate("/");
                
                toast({
                  title: "Logged out successfully",
                  description: "You've been logged out of your account."
                });
              } catch (error) {
                handleError(error as Error, "logging out");
              }
            }}
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;