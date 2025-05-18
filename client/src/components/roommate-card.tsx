import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { UserProfile } from "@shared/schema";

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
  const CardComponent = actionUrl ? Link : 'div';
  const cardProps = actionUrl ? { href: actionUrl } : {};

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
              <span className="inline-flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Positive reviews
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </CardComponent>
  );
};

export default RoommateCard;
