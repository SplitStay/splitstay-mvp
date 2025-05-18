import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, MapPin, Calendar, Euro, CalendarX, CheckCircle, ThumbsUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatPrice, formatDateRange, calculateNights } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StayDetailsProps {
  hotelName: string;
  location?: string;
  roomType: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalCost: number;
  cancellationDate?: Date;
  isIdVerified?: boolean;
  hasPositiveReviews?: boolean;
  showButtons?: boolean;
  onViewBooking?: () => void;
  onDownloadConfirmation?: () => void;
  className?: string;
  defaultOpen?: boolean;
}

const StayDetails: React.FC<StayDetailsProps> = ({
  hotelName,
  location,
  roomType,
  checkInDate,
  checkOutDate,
  totalCost,
  cancellationDate,
  isIdVerified = true,
  hasPositiveReviews = true,
  showButtons = false,
  onViewBooking,
  onDownloadConfirmation,
  className = "",
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const nights = calculateNights(checkInDate, checkOutDate);
  const costPerNight = Math.round(totalCost / nights);
  const costPerPerson = Math.round(totalCost / 2);
  const dateRange = formatDateRange(checkInDate, checkOutDate);

  return (
    <Card className={`border-2 rounded-lg mb-4 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 border-b border-gray-200 cursor-pointer flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Trip Details</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-primary mr-2" />
              <span className="mr-2">{hotelName}</span>
              {location && <span className="text-gray-500 text-sm">{location}</span>}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium mr-2">{roomType}</span>
              </div>
              <span>{dateRange}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Euro className="h-5 w-5 text-primary mr-2" />
                <span>Total cost</span>
              </div>
              <span className="font-medium">
                {formatPrice(totalCost)} ({formatPrice(costPerPerson)} each)
              </span>
            </div>
            
            {cancellationDate && (
              <div className="flex items-center">
                <CalendarX className="h-5 w-5 text-primary mr-2" />
                <span>Free cancellation until {new Date(cancellationDate).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              {isIdVerified && (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                  <span>ID Verified</span>
                </div>
              )}
              
              {hasPositiveReviews && (
                <div className="flex items-center">
                  <ThumbsUp className="h-5 w-5 text-blue-500 mr-1" />
                  <span>Positive Reviews</span>
                </div>
              )}
            </div>
            
            {showButtons && (
              <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                {onDownloadConfirmation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-sm"
                    onClick={onDownloadConfirmation}
                  >
                    <Calendar className="mr-1 h-4 w-4" />
                    Download Confirmation
                  </Button>
                )}
                
                {onViewBooking && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-sm"
                    onClick={onViewBooking}
                  >
                    <Calendar className="mr-1 h-4 w-4" />
                    View Booking Details
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default StayDetails;
