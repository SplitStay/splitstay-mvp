import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface UserAvatarProps {
  user: {
    fullName: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  size?: "sm" | "md" | "lg" | "xl";
  showVerified?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  showVerified = false,
  className = ""
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  return (
    <div className={`relative ${className}`}>
      <Avatar className={`${sizeClasses[size]}`}>
        <AvatarImage src={user.profilePicture} alt={user.fullName} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(user.fullName)}
        </AvatarFallback>
      </Avatar>
      
      {showVerified && user.isVerified && (
        <div className="absolute -bottom-1 -right-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CheckCircle className="h-5 w-5 text-secondary bg-white rounded-full" />
              </TooltipTrigger>
              <TooltipContent>
                <p>ID Verified</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
