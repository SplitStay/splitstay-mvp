import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { UserProfile } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  
  // Always make the card clickable when an action URL is provided
  const isCardClickable = !!actionUrl;
  
  const CardComponent = isCardClickable ? Link : 'div';
  const cardProps = isCardClickable ? { href: actionUrl } : {};
  
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
      author: "Emily",
      text: "Great roommate! Very respectful of shared spaces and quiet hours.",
      rating: 5,
      date: "April 2025"
    },
    {
      id: 2,
      author: "Michael",
      text: "We had a pleasant stay sharing a room in Paris. Very organized and friendly.",
      rating: 4,
      date: "March 2025"
    }
  ];

  return (
    <CardComponent {...cardProps}>
      <Card className={cn("border-2 border-gray-200 cursor-pointer hover:border-gray-300", className)}>
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
