import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  className?: string;
}

export function Rating({
  value,
  onChange,
  maxRating = 5,
  size = "md",
  readOnly = false,
  className,
}: RatingProps) {
  // Array of numbers from 1 to maxRating
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);
  
  // Size classes for stars
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  
  const starSize = sizeClasses[size];
  
  return (
    <div className={cn("flex space-x-1", className)}>
      {stars.map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => !readOnly && onChange(starValue)}
          className={cn(
            "focus:outline-none transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"
          )}
          disabled={readOnly}
          aria-label={`Rate ${starValue} of ${maxRating} stars`}
        >
          <Star
            className={cn(
              starSize,
              starValue <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}