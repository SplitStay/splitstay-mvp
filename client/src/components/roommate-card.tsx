import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, ChevronDown, ChevronUp, ExternalLink, Home, Lock, Check, Bed } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { UserProfile } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FaAirbnb, FaHotel } from "react-icons/fa";
import { BiHotel } from "react-icons/bi";
import { MdHotel } from "react-icons/md";

interface RoommateCardProps {
  profile: UserProfile;
  actionUrl?: string;
  className?: string;
}

const RoommateCard: React.FC<RoommateCardProps> = ({
  profile,
  actionUrl,
  className = "",
}) => {
  const [reviewsOpen, setReviewsOpen] = useState(false);
  
  // Track if card should be clickable based on action URL
  const isCardClickable = !!actionUrl;
  
  // Use div instead of Link to avoid nested anchor tags issue
  const CardComponent = 'div';
  const cardProps = {};
  
  // Handle review click to prevent navigation
  const handleReviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReviewsOpen(!reviewsOpen);
  };
  
  // Sample reviews - in a real app, these would come from the API
  const sampleReviews = [
    {
      id: 1,
      author: "Sophia",
      text: "Great roommate! Very respectful of shared spaces and quiet hours.",
      rating: 5,
      date: "April 2025"
    },
    {
      id: 2,
      author: "Isabella",
      text: "We had a wonderful stay sharing a room in Paris. Very organized and friendly.",
      rating: 5,
      date: "March 2025"
    }
  ];

  // Handle click on the entire card
  const handleCardClick = () => {
    if (isCardClickable && actionUrl) {
      window.location.href = actionUrl;
    }
  };

  return (
    <CardComponent {...cardProps}>
      <Card 
        className={cn(
          "border-2 border-gray-200 hover:border-gray-300", 
          isCardClickable ? "cursor-pointer" : "",
          className
        )}
        onClick={isCardClickable ? handleCardClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <UserAvatar
              user={{
                fullName: profile.fullName,
                profilePicture: profile.profilePicture,
                isVerified: profile.isVerified,
              }}
              size="lg"
              showVerified={false}
            />
            
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">{profile.fullName}</h3>
                {profile.matchPercentage && (
                  <span className="font-semibold text-secondary">{profile.matchPercentage}%</span>
                )}
              </div>
              
              <div className="text-gray-600 text-sm">
                <span className="mr-2">
                  {profile.gender === "female" ? "♀" : profile.gender === "male" ? "♂" : "⚪"} {profile.age}
                </span>
                <span>{profile.languages.join(", ")}</span>
              </div>
              
              {profile.matchLabel && (
                <div className="mt-1">
                  <Badge variant="secondary" className="rounded-full">
                    {profile.matchLabel}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {profile.bio && (
            <div className="mt-2 text-gray-700 text-sm">
              "{profile.bio}"
            </div>
          )}
          
          {/* Preferred Accommodation Section */}
          {profile.preferredAccommodation && (
            <div className="mt-3 border-t pt-2 border-gray-100 text-xs">
              <div className="flex items-start">
                <div className="flex items-center">
                  <Home className="h-3 w-3 mr-1 text-gray-600" />
                  <span className="font-medium text-gray-700">Preferred Accommodation:</span>
                </div>
                
                <div className="ml-2 flex-1">
                  <div className="flex justify-between">
                    <span>{profile.preferredAccommodation.name}</span>
                    <a 
                      href={profile.preferredAccommodation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(profile.preferredAccommodation.url, '_blank');
                      }}
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      {profile.preferredAccommodation.platform === 'booking' && (
                        <div className="h-4 w-4 mr-1 rounded-md bg-[#003580] flex items-center justify-center relative">
                          <span className="text-white font-bold text-[8px]">B</span>
                          <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#00B9F7]"></span>
                        </div>
                      )}
                      {profile.preferredAccommodation.platform === 'airbnb' && (
                        <FaAirbnb className="h-3 w-3 mr-1 text-red-500" />
                      )}
                      {profile.preferredAccommodation.platform === 'agoda' && (
                        <MdHotel className="h-3 w-3 mr-1 text-purple-600" />
                      )}
                      <span>View</span>
                      <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                    </a>
                  </div>
                  
                  <div className="flex items-center mt-1">
                    {profile.preferredAccommodation.isFlexible ? (
                      <Badge variant="outline" className="h-5 border-green-200 bg-green-50 text-green-600 text-[10px] px-1 py-0 rounded-sm">
                        <Check className="h-2.5 w-2.5 mr-0.5" />
                        Open to other options
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-5 border-amber-200 bg-amber-50 text-amber-600 text-[10px] px-1 py-0 rounded-sm">
                        <Lock className="h-2.5 w-2.5 mr-0.5" />
                        Preferred location only
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-1">
                    <Bed className="h-3 w-3 mr-1 text-gray-600" />
                    <span className="text-xs text-gray-700">{profile.preferredAccommodation.roomType}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {profile.isVerified && (
            <div className="mt-1 flex items-center space-x-2 text-xs text-green-600">
              <span className="inline-flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </span>
              {profile.positiveReviews && (
                <Collapsible 
                  open={reviewsOpen} 
                  onOpenChange={setReviewsOpen}
                >
                  <CollapsibleTrigger 
                    className="inline-flex items-center hover:underline cursor-pointer"
                    onClick={handleReviewClick}
                  >
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                    Positive reviews
                    {reviewsOpen ? (
                      <ChevronUp className="h-3 w-3 ml-1" />
                    ) : (
                      <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2 border-t pt-2 border-gray-100">
                    <div className="space-y-2">
                      {sampleReviews.map(review => (
                        <div key={review.id} className="text-xs text-gray-700">
                          <div className="flex justify-between">
                            <span className="font-medium">{review.author}</span>
                            <span className="text-gray-500">{review.date}</span>
                          </div>
                          <div className="flex items-center mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "h-2.5 w-2.5", 
                                  i < review.rating 
                                    ? "fill-yellow-500 text-yellow-500" 
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <p className="mt-1">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </CardComponent>
  );
};

export default RoommateCard;
