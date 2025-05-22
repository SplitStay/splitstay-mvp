import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";

const SharedExperience: React.FC = () => {
  const [_, navigate] = useLocation();
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500"
          onClick={() => navigate("/chat/1")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Your Stay</h1>
      </div>

      {/* Room photo */}
      <Card className="border-2 border-gray-200 rounded-lg mb-6 overflow-hidden">
        <div className="relative w-full h-48 bg-gray-200">
          <div className="absolute inset-0 flex items-center justify-center text-lg text-gray-500">
            Twin room with cozy beds, warm lighting, and window with rain outside
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg">MEININGER Hotel Brussels</h3>
          <p className="text-gray-600">Twin Room • Shared with Amara</p>
          <p className="text-gray-600">May 23 - May 24, 2025</p>
        </CardContent>
      </Card>

      {/* Shared moments */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Shared Moments</h2>
        <Card className="border-2 border-gray-200 rounded-lg mb-4 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="mr-3">
                <UserAvatar
                  user={{
                    fullName: "Amara",
                    profilePicture: "/assets/Amara Profile Photo 4.png"
                  }}
                  size="sm"
                />
              </div>
              <div>
                <h3 className="font-semibold">Cozy Evening</h3>
                <p className="text-sm text-gray-600">Yesterday, 9:15 PM</p>
              </div>
            </div>
            <p className="text-gray-700">
              I loved our evening chats with tea while it was raining outside! It was so cozy and peaceful.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="mr-3">
                <UserAvatar
                  user={{
                    fullName: "Emily",
                    profilePicture: "/assets/Emily Profile Photo 3.png"
                  }}
                  size="sm"
                />
              </div>
              <div>
                <h3 className="font-semibold">Reading Together</h3>
                <p className="text-sm text-gray-600">Yesterday, 10:30 PM</p>
              </div>
            </div>
            <p className="text-gray-700">
              Sharing book recommendations and enjoying a quiet evening in our pajamas made this trip extra special!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost savings */}
      <Card className="border-2 border-gray-200 rounded-lg mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">Your Savings</h3>
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600">Original room cost</p>
            <p className="font-semibold">€126</p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600">Your share (50%)</p>
            <p className="font-semibold">€63</p>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <p className="text-gray-800 font-semibold">Total savings</p>
            <p className="font-semibold text-green-600">€63</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-primary text-white font-semibold py-6"
          onClick={() => navigate("/rate-roommate/1")}
        >
          Rate Your Experience
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-6"
          onClick={() => navigate("/dashboard")}
        >
          Share a Photo Memory
        </Button>
      </div>
    </div>
  );
};

export default SharedExperience;