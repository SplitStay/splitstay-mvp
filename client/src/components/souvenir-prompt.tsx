import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface SouvenirPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: number;
  destination: string;
  roommateName: string;
}

export function SouvenirPrompt({
  open,
  onOpenChange,
  tripId,
  destination,
  roommateName,
}: SouvenirPromptProps) {
  const [, navigate] = useLocation();

  const handleAddSouvenir = () => {
    // Navigate to the souvenir review page with trip ID
    navigate(`/souvenir-review?tripId=${tripId}`);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DialogHeader>
          <DialogTitle>Share Your Travel Memory</DialogTitle>
          <DialogDescription>
            Your trip to {destination} with {roommateName} is complete! Would you like to share a photo and review?
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center my-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        </div>

        <p className="text-center text-sm mb-4">
          Upload a souvenir photo, rate your roommate, and share your experience to help other travelers.
        </p>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="sm:flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleAddSouvenir} className="sm:flex-1">
            Add Memory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}