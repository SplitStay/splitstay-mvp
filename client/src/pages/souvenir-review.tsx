import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Star, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { useToast } from "@/hooks/use-toast";

const SouvenirReview: React.FC = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [sharedPhoto, setSharedPhoto] = useState(false);
  
  const handleShareMemory = () => {
    setSharedPhoto(true);
    toast({
      title: "Photo shared",
      description: "Your memory has been shared with Amara!",
    });
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500"
          onClick={() => navigate("/shared-experience")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Trip Memories</h1>
      </div>

      {/* Reviews summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Your Reviews</h2>
        
        <Card className="border-2 border-gray-200 rounded-lg mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <UserAvatar
                user={{
                  fullName: "Amara",
                  profilePicture: "/assets/Amara Profile Photo 4.png"
                }}
                size="md"
              />
              <div>
                <h3 className="font-semibold">Amara</h3>
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "Emily was the perfect roommate! She's respectful, friendly, and made our shared stay so enjoyable. We had great conversations over tea while it rained outside. I would definitely share a room with her again!"
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-gray-200 rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <UserAvatar
                user={{
                  fullName: "Emily",
                  profilePicture: "/assets/Emily Profile Photo 3.png"
                }}
                size="md"
              />
              <div>
                <h3 className="font-semibold">You</h3>
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "Amara was an amazing roommate! She's considerate, organized, and made our stay so comfortable. We had wonderful conversations and even shared book recommendations. Would definitely room with her again!"
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trip Souvenir */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Trip Souvenir</h2>
        <Card className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="relative w-full h-64 bg-gray-200">
            <div className="absolute inset-0 flex items-center justify-center text-lg text-gray-500">
              Photo of Emily and Amara smiling in front of the Atomium in Brussels
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold">Brussels, Belgium</h3>
            <p className="text-gray-600">May 24, 2025 • with Amara</p>
            <div className="flex justify-between mt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-700 border-gray-300 flex items-center gap-1"
                onClick={() => toast({
                  title: "Added to favorites",
                  description: "This memory has been saved to your favorites!"
                })}
              >
                <Heart className="h-4 w-4" /> Favorite
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className={`${
                  sharedPhoto 
                    ? "text-primary border-primary" 
                    : "text-gray-700 border-gray-300"
                } flex items-center gap-1`}
                onClick={handleShareMemory}
              >
                <Share2 className="h-4 w-4" /> {sharedPhoto ? "Shared" : "Share"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote */}
      <Card className="border-2 border-gray-200 rounded-lg mb-6 bg-primary text-white">
        <CardContent className="p-4 text-center">
          <p className="italic text-lg mb-2">
            "What started as a way to save on a hotel room turned into a friendship for life."
          </p>
          <div className="text-sm opacity-80">— Your SplitStay Journey</div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-primary text-white font-semibold py-6"
          onClick={() => navigate("/find-roommate")}
        >
          Plan Another Trip
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-6"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default SouvenirReview;