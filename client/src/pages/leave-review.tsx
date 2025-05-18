import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SplitStayLogo } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { toast } from "@/hooks/use-toast";

interface LeaveReviewProps {
  params: {
    id: string;
  };
}

const LeaveReview: React.FC<LeaveReviewProps> = ({ params }) => {
  const [_, navigate] = useLocation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock data - in a real app this would come from an API call
  const roommate = {
    id: params.id,
    fullName: "Sophie Müller",
    profilePicture: "https://i.pravatar.cc/150?img=5",
    isVerified: true,
    trip: {
      destination: "Paris, France",
      dates: "March 10 - March 15, 2025",
      hotel: "Le Petit Hotel"
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting",
        variant: "destructive",
      });
      return;
    }
    
    if (!reviewText.trim()) {
      toast({
        title: "Review Required",
        description: "Please write a review before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would be an API call to submit the review
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="p-6">
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
          <h1 className="text-2xl font-bold text-primary">Leave a Review</h1>
        </div>
        <div className="w-10"></div> {/* Empty div for spacing */}
      </div>
      
      {/* Roommate Info */}
      <Card className="border-2 border-gray-200 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <UserAvatar
              user={{
                fullName: roommate.fullName,
                profilePicture: roommate.profilePicture,
                isVerified: roommate.isVerified,
              }}
              size="md"
              showVerified
            />
            <div>
              <h2 className="font-semibold">{roommate.fullName}</h2>
              <p className="text-sm text-gray-500">{roommate.trip.destination}</p>
              <p className="text-xs text-gray-500">{roommate.trip.dates}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <h3 className="font-medium mb-2">Rate your experience</h3>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer ${
                  (hoverRating || rating) >= star
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>
        
        {/* Review Text */}
        <div>
          <h3 className="font-medium mb-2">Write your review</h3>
          <Textarea
            placeholder="Share your experience with this roommate..."
            className="min-h-[150px] border-2"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Your review will be public and help other travelers find great roommates.
          </p>
        </div>
        
        {/* Quick Feedback Options */}
        <div>
          <h3 className="font-medium mb-2">What was great about this roommate?</h3>
          <div className="flex flex-wrap gap-2">
            {["Clean", "Respectful", "Friendly", "Quiet", "Great communication", "Punctual", "Considerate"].map((trait) => (
              <Button
                key={trait}
                type="button"
                variant="outline"
                className="text-xs h-auto py-1"
                onClick={() => setReviewText((prev) => 
                  prev ? `${prev}\n\n${trait} roommate.` : `${trait} roommate.`
                )}
              >
                {trait}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full navy-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
};

export default LeaveReview;