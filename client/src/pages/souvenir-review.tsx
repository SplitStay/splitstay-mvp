import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Rating } from "@/components/ui/rating";
import { MobileContainer } from "@/components/mobile-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Camera, AlertCircle, Star } from "lucide-react";
import { uploadSouvenirPhoto, getMockSouvenirs } from "@/lib/supabase";
// Import selfie images directly
import selfieImage from "../assets/selfie-brussels.png";
import amaraImage from "../assets/amara-brussels.jpg";

export default function SouvenirReviewPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Use the actual uploaded selfie photo with direct path
  const [selectedImage, setSelectedImage] = useState<string | null>("/brussels-selfie.png");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [review, setReview] = useState("Had an amazing time in Brussels with Amara! The Grand Place was so beautiful at sunset. We saved over €120 by sharing the room!");
  const [rating, setRating] = useState(5);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [existingReviews, setExistingReviews] = useState<Array<{photoUrl: string, rating: number, reviewText: string, userName: string}>>([]);
  const [showExistingPhotos, setShowExistingPhotos] = useState(true);
  
  // In a real app, we would get the booking details from the URL or state
  const bookingId = 1;
  const userId = 1;
  const roommateName = "Amara";
  
  // Check if user has already uploaded a photo for this trip
  const [hasExistingPhoto, setHasExistingPhoto] = useState(false); // Set to false to allow uploading
  
  useEffect(() => {
    // Simulate fetching existing souvenirs for this trip
    const fetchExistingPhotos = async () => {
      try {
        // In a real app, this would call an API
        // For demo, we'll use our mock function
        const photos = getMockSouvenirs(bookingId);
        
        // Set up roommate's review with the new Brussels photo
        setExistingReviews([
          {
            photoUrl: amaraImage,
            rating: 5,
            reviewText: "Had such a great time sharing this room with Emily! Our Brussels trip was amazing and we saved over €120.",
            userName: roommateName
          }
        ]);
        
        // Start with showing roommate's photos by default
        setShowExistingPhotos(true);
      } catch (error) {
        console.error("Error fetching souvenirs:", error);
      }
    };
    
    fetchExistingPhotos();
  }, [bookingId, roommateName]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Store the file for later upload
      setImageFile(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async () => {
    // Check if we already have an existing photo for this trip
    if (hasExistingPhoto) {
      toast({
        title: "You've already shared a memory for this trip",
        description: "Only one photo per trip is allowed. You can view your existing memory in your dashboard.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedImage || !imageFile) {
      toast({
        title: "Please select an image",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // In a real app, this would upload to Supabase or another cloud storage
      // For this demo, we'll simulate a successful upload
      // const photoUrl = await uploadSouvenirPhoto(imageFile, userId, bookingId);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save the review data to our database
      // In a real app, this would be an API call
      // For demo purposes, we'll just simulate success
      setShowSuccess(true);
      
      // Invalidate queries to refresh the dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    } catch (error) {
      console.error("Error uploading souvenir:", error);
      toast({
        title: "Failed to save your memory",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
        <div className="pt-2">
          {/* Status bar mockup - cleaner version */}
          <div className="flex justify-between items-center px-5 py-2 bg-white rounded-t-xl">
            <div className="text-base font-medium text-gray-800">10:42 AM</div>
            <div className="flex items-center space-x-2">
              <div className="h-3">
                <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 8.5H2.5V11.5H1V8.5ZM4.5 6H6V11.5H4.5V6ZM8 3H9.5V11.5H8V3ZM11.5 0.5H13V11.5H11.5V0.5ZM15 5H16.5V11.5H15V5Z" fill="black"/>
                </svg>
              </div>
              <div className="h-3">
                <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.06694C8.75 2.06694 9.90125 2.54028 10.7437 3.38194C11.5875 4.2236 12.0625 5.3736 12.0625 6.62194C12.0625 7.87194 11.5875 9.02194 10.7437 9.86194C9.90125 10.7036 8.75 11.1769 7.5 11.1769C6.25 11.1769 5.09875 10.7036 4.25625 9.86194C3.41375 9.02194 2.9375 7.87194 2.9375 6.62194C2.9375 5.3736 3.41375 4.2236 4.25625 3.38194C5.09875 2.54028 6.25 2.06694 7.5 2.06694ZM13.5888 1.7786C15.1375 3.32694 16 5.38527 16 6.62194C16 7.86027 15.1375 9.9186 13.5888 11.4669L12.5 10.3786C13.75 9.12694 14.375 7.46194 14.375 6.62194C14.375 5.78194 13.75 4.11694 12.5 2.8653L13.5888 1.7786ZM1.41125 1.7786L2.5 2.8653C1.25 4.11694 0.625 5.78194 0.625 6.62194C0.625 7.46194 1.25 9.12694 2.5 10.3786L1.41125 11.4669C-0.1375 9.9186 -1 7.86027 -1 6.62194C-1 5.38527 -0.1375 3.32694 1.41125 1.7786Z" fill="black"/>
                </svg>
              </div>
              <div className="h-3">
                <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.833984" y="0.5" width="21" height="11" rx="3" stroke="black"/>
                  <rect x="2.83398" y="2" width="17" height="8" rx="1.5" fill="black"/>
                  <path d="M23.334 4V8C24.2164 7.66122 24.8334 6.87313 24.8334 6C24.8334 5.12687 24.2164 4.33878 23.334 4Z" fill="black"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Regular header */}
          <div className="px-4 py-3 flex items-center bg-white">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium ml-2">Rate Your Experience</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {hasExistingPhoto ? (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-center bg-yellow-50 p-3 rounded-md mb-4 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <p>You've already shared a memory for this trip. You can view it in your dashboard.</p>
                </div>
                <Button 
                  onClick={() => navigate("/dashboard")} 
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                        disabled={isUploading}
                      />
                      <div
                        className="flex flex-col items-center justify-center w-full overflow-hidden"
                        style={{ height: "400px", width: "100%", margin: "0 auto" }}
                      >
                        {/* Use the imported selfie image with no borders */}
                        <img
                          src={selfieImage}
                          alt="Brussels trip selfie"
                          className="h-full object-cover"
                          style={{ width: "100%" }}
                        />
                      </div>
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
                      className="w-full p-2 min-h-[150px] border rounded-md"
                      disabled={isUploading}
                      style={{ resize: "none" }}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full" 
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Submit Review"}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500">
                    You can only upload one photo per trip.<br />
                    Both you and {roommateName} will be able to see each other's reviews.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Roommate's reviews section */}
          {existingReviews.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Roommate's Memory</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs" 
                  onClick={() => setShowExistingPhotos(!showExistingPhotos)}
                >
                  {showExistingPhotos ? "Hide" : "Show"}
                </Button>
              </div>
              
              {showExistingPhotos && existingReviews.map((review, index) => (
                <Card key={index} className="mb-4">
                  <div className="w-full aspect-video">
                    <img
                      src={review.photoUrl}
                      alt={`Memory from ${review.userName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{review.userName}'s Review</h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.reviewText}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}