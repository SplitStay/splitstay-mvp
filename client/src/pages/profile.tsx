import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  User, 
  Edit, 
  Calendar,
  ArrowLeft,
  Check,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SplitStayLogo } from "@/components/icons";

const Profile: React.FC = () => {
  const [_, navigate] = useLocation();
  
  // Mock user data - in a real app this would come from the API/database
  const [user] = useState({
    fullName: "Alina Chen",
    profilePicture: "https://i.pravatar.cc/150?img=31",
    username: "alina_travels",
    age: "23",
    gender: "Female",
    location: "London, UK",
    bio: "Spontaneous traveler who enjoys quiet time. Love exploring new cities and making memories!",
    languages: ["English", "German"],
    interests: ["Photography", "Hiking", "Food", "Museums"],
    travelTraits: ["Early bird", "Quiet", "Clean", "Budget-conscious"],
    reviewsCount: 3,
    avgRating: 4.8,
    joinDate: "January 2025",
    isVerified: true,
    verifications: ["ID", "Email", "Phone", "Profile"]
  });

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center flex-1">
          <SplitStayLogo className="mx-auto" />
          <h1 className="text-2xl font-bold text-primary">Profile</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate("/profile/edit")}
        >
          <Edit className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img 
            src={user.profilePicture} 
            alt={user.fullName}
            className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md"
          />
          {user.isVerified && (
            <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold mt-3">{user.fullName}</h2>
        <p className="text-gray-500 text-sm">@{user.username}</p>
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <User className="h-3 w-3 mr-1" />
          <span>{user.age} • {user.gender}</span>
        </div>
        <div className="flex items-center mt-1 mb-2 text-sm">
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 mr-1 fill-yellow-500" />
            <span className="font-medium">{user.avgRating}</span>
          </div>
          <span className="mx-1 text-gray-400">•</span>
          <span className="text-gray-600">{user.reviewsCount} reviews</span>
        </div>
        <div className="flex space-x-1 mt-1">
          {user.verifications.map((verification) => (
            <Badge key={verification} variant="outline" className="text-xs">
              {verification} Verified
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Bio */}
      <Card className="mb-4 border-2 border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">About Me</h3>
          <p className="text-gray-700 text-sm">{user.bio}</p>
        </CardContent>
      </Card>
      
      {/* Languages */}
      <Card className="mb-4 border-2 border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {user.languages.map((language) => (
              <Badge key={language} variant="secondary">
                {language}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Travel Traits */}
      <Card className="mb-4 border-2 border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Travel Traits</h3>
          <div className="flex flex-wrap gap-2">
            {user.travelTraits.map((trait) => (
              <Badge key={trait} variant="secondary">
                {trait}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Interests */}
      <Card className="mb-4 border-2 border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <Badge key={interest} variant="outline">
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Reviews Preview */}
      <Card className="mb-4 border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Reviews</h3>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm text-primary"
              onClick={() => navigate("/profile/reviews")}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium text-sm">Emily</span>
                <span className="text-gray-500 text-xs">April 2025</span>
              </div>
              <div className="flex items-center mt-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < 5 ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-700">
                Great roommate! Very respectful of shared spaces and quiet hours.
              </p>
            </div>
            
            <div>
              <div className="flex justify-between">
                <span className="font-medium text-sm">Michael</span>
                <span className="text-gray-500 text-xs">March 2025</span>
              </div>
              <div className="flex items-center mt-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < 4 ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-700">
                We had a pleasant stay sharing a room in Paris. Very organized and friendly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Info */}
      <Card className="mb-4 border-2 border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Account Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Member since</span>
              <span>{user.joinDate}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Trips</span>
              <span>3</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Response Rate</span>
              <span>98%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs text-primary"
            onClick={() => {}}
          >
            <User className="h-5 w-5 mb-1" />
            <span>Profile</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => navigate("/dashboard")}
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
            <User className="h-5 w-5 mb-1" />
            <span>Explore</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;