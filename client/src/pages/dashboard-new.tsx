import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  User, 
  Calendar, 
  MessageSquare, 
  Search,
  Inbox,
  UserCheck,
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import splitstayLogo from "@assets/Splitstay Logo Transparent.png";

const Dashboard: React.FC = () => {
  const [_, navigate] = useLocation();
  const [profileCreated, setProfileCreated] = useState<boolean | null>(null);
  const [showAlert, setShowAlert] = useState(true);
  const [userFirstName, setUserFirstName] = useState<string>("");

  useEffect(() => {
    // Check localStorage for profile completion status
    const profileStatus = localStorage.getItem('profileCreated');
    if (profileStatus !== null) {
      setProfileCreated(profileStatus === 'true');
    }

    // Get user's first name from localStorage or use "traveler" as default
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserFirstName(user.firstName || user.fullName?.split(' ')[0] || "traveler");
      } catch {
        setUserFirstName("traveler");
      }
    } else {
      setUserFirstName("traveler");
    }
  }, []);

  // Mock recommended matches data
  const recommendedMatches = [
    {
      id: 1,
      name: "Sofia Rodriguez",
      country: "Spain",
      languages: ["Spanish", "English"],
      dates: "July 15-20, 2025",
      destination: "Tokyo, Japan",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      name: "Emma Chen",
      country: "Canada",
      languages: ["English", "Mandarin"],
      dates: "August 5-10, 2025",
      destination: "Bangkok, Thailand",
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: 3,
      name: "Lucia Müller",
      country: "Germany",
      languages: ["German", "English"],
      dates: "June 22-28, 2025",
      destination: "Barcelona, Spain",
      avatar: "https://i.pravatar.cc/150?img=3"
    }
  ];

  const handleMessage = (matchId: number) => {
    navigate(`/chat/${matchId}`);
  };

  const handleProposeMatch = (matchId: number) => {
    navigate(`/request-booking/${matchId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img src={splitstayLogo} alt="SplitStay" className="h-8 w-auto" />
              <span className="text-xl font-bold text-navy">SplitStay</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <button className="text-navy font-medium border-b-2 border-navy pb-1">
                Dashboard
              </button>
              <button 
                onClick={() => navigate("/browse-profiles")}
                className="text-gray-600 hover:text-navy font-medium"
              >
                My Matches
              </button>
              <button 
                onClick={() => navigate("/find-roommate")}
                className="text-gray-600 hover:text-navy font-medium"
              >
                Explore
              </button>
              <button 
                onClick={() => navigate("/messages")}
                className="text-gray-600 hover:text-navy font-medium"
              >
                Inbox
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              
              {/* Profile Completion Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>50%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-navy h-2 rounded-full w-1/2"></div>
                    </div>
                    <Button 
                      onClick={() => navigate("/?profile=true")}
                      className="w-full bg-navy text-white hover:bg-navy/90"
                    >
                      Complete Your Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Not Verified</p>
                      <button 
                        onClick={() => navigate("/safety-verification")}
                        className="text-xs text-navy hover:underline"
                      >
                        Verify Account
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invite Friend */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // In a real app, this would open a referral modal
                      alert("Referral system coming soon!");
                    }}
                  >
                    Invite a Friend
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              
              {/* Welcome Header */}
              <div>
                <h1 className="text-3xl font-bold text-navy mb-2">
                  Welcome to SplitStay, {userFirstName}!
                </h1>
                <p className="text-gray-600">
                  Ready to discover your next travel adventure?
                </p>
              </div>

              {/* Profile Warning Alert */}
              {profileCreated === false && showAlert && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-orange-800">
                      Your profile is not complete — complete it now for better matches!
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => navigate("/?profile=true")}
                        className="bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Complete Profile
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowAlert(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* My Travel Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>My Travel Plans</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You don't have any upcoming trips.</p>
                    <Button 
                      onClick={() => navigate("/find-roommate")}
                      className="bg-navy text-white hover:bg-navy/90"
                    >
                      Plan Your First Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Matches */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Recommended Matches</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendedMatches.map((match) => (
                      <div key={match.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          {/* Profile Photo */}
                          <img 
                            src={match.avatar} 
                            alt={match.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          
                          {/* Match Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{match.name}</h3>
                            <p className="text-gray-600 text-sm">{match.country}</p>
                            <p className="text-gray-600 text-sm">
                              Languages: {match.languages.join(", ")}
                            </p>
                            <div className="mt-2">
                              <p className="text-sm font-medium text-navy">
                                {match.dates} • {match.destination}
                              </p>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleMessage(match.id)}
                              className="flex items-center space-x-1"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>Message</span>
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleProposeMatch(match.id)}
                              className="bg-navy text-white hover:bg-navy/90"
                            >
                              Propose Match
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;