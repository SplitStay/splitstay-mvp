import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Rating } from "@/components/ui/rating";
import { MobileContainer } from "@/components/mobile-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Camera } from "lucide-react";

export default function SouvenirReviewPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // In a real app, we would get the booking details from the URL or state
  const bookingId = 1;
  const roommateName = "Amara";
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = () => {
    // In a real app, we would call an API to save the review
    // For this demo, we'll just show a success message
    
    if (!selectedImage) {
      toast({
        title: "Please select an image",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setShowSuccess(true);
      
      // Invalidate queries to refresh the dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    }, 500);
  };
  
  if (showSuccess) {
    return (
      <MobileContainer>
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 flex items-center bg-white">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium ml-2">Review Submitted</h1>
          </div>
          
          <div className="flex-1 p-4 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-center text-muted-foreground mb-6">
              Your review and travel memory have been submitted successfully.
            </p>
            
            <div className="w-full max-w-md aspect-video rounded-md overflow-hidden mb-4">
              <img
                src={selectedImage || ""}
                alt="Selected souvenir"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="w-full max-w-md p-4 bg-background border rounded-md mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Your rating:</span>
                <Rating value={rating} onChange={() => {}} readOnly />
              </div>
              <p className="text-sm text-muted-foreground">{review}</p>
            </div>
            
            <Button onClick={() => navigate("/dashboard")} className="w-full max-w-md">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MobileContainer>
    );
  }
  
  return (
    <MobileContainer>
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 flex items-center bg-white">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium ml-2">Rate Your Experience</h1>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Share Your Travel Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a photo from your stay and share your experience with {roommateName}
                  </p>
                  
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      id="souvenir-photo"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="souvenir-photo"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-background hover:bg-muted/50"
                    >
                      {selectedImage ? (
                        <img
                          src={selectedImage}
                          alt="Selected"
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload a souvenir photo
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Rate your roommate</h3>
                  <Rating value={rating} onChange={setRating} size="lg" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Leave a review</h3>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full p-2 min-h-[100px] border rounded-md"
                  />
                </div>
                
                <Button onClick={handleSubmit} className="w-full">
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
}