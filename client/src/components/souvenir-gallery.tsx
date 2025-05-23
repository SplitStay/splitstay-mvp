import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data interface
interface Souvenir {
  id: string;
  tripId: number;
  userId: number;
  photoUrl: string;
  reviewText: string;
  rating: number;
  timestamp: Date;
  location: string;
  roommateName: string;
}

interface SouvenirGalleryProps {
  userId?: number; // Optional - if provided, only show this user's souvenirs
}

export function SouvenirGallery({ userId }: SouvenirGalleryProps) {
  const [, navigate] = useLocation();
  const [selectedSouvenir, setSelectedSouvenir] = useState<Souvenir | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock data - in a real app, this would come from API
  const mockSouvenirs: Souvenir[] = [
    {
      id: "1",
      tripId: 1,
      userId: 1,
      photoUrl: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1974&auto=format&fit=crop",
      reviewText: "Amazing trip with Sophie in Paris! We had a wonderful time exploring the city and our hotel room had an incredible view of the Eiffel Tower.",
      rating: 5,
      timestamp: new Date(2024, 8, 15),
      location: "Paris, France",
      roommateName: "Sophie"
    },
    {
      id: "2",
      tripId: 2,
      userId: 1,
      photoUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
      reviewText: "Beautiful view from our hotel! The Seine river was just outside our window.",
      rating: 4,
      timestamp: new Date(2024, 7, 10),
      location: "Paris, France",
      roommateName: "Sophie"
    },
    {
      id: "3",
      tripId: 3,
      userId: 1,
      photoUrl: "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=2067&auto=format&fit=crop",
      reviewText: "London was amazing! Hannah was a perfect roommate and we saved so much on accommodation.",
      rating: 5,
      timestamp: new Date(2024, 6, 5),
      location: "London, UK",
      roommateName: "Hannah"
    },
    {
      id: "4",
      tripId: 4,
      userId: 2,
      photoUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=2070&auto=format&fit=crop",
      reviewText: "Barcelona was incredible! We had such a great time at the beach.",
      rating: 5,
      timestamp: new Date(2024, 5, 20),
      location: "Barcelona, Spain",
      roommateName: "Emily"
    }
  ];

  // Filter souvenirs if userId is provided
  const souvenirs = userId 
    ? mockSouvenirs.filter(s => s.userId === userId) 
    : mockSouvenirs;

  const openSouvenirDetail = (souvenir: Souvenir) => {
    setSelectedSouvenir(souvenir);
    setDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-2 gap-3">
            {souvenirs.map((souvenir) => (
              <Card 
                key={souvenir.id} 
                className="overflow-hidden cursor-pointer"
                onClick={() => openSouvenirDetail(souvenir)}
              >
                <div className="aspect-square w-full">
                  <img 
                    src={souvenir.photoUrl} 
                    alt={`Memory from ${souvenir.location}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-3 w-3 ${star <= souvenir.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(souvenir.timestamp)}</span>
                  </div>
                  <p className="text-xs truncate">{souvenir.reviewText}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <div className="space-y-3">
            {souvenirs.map((souvenir) => (
              <Card 
                key={souvenir.id} 
                className="overflow-hidden cursor-pointer"
                onClick={() => openSouvenirDetail(souvenir)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={souvenir.photoUrl} 
                        alt={`Memory from ${souvenir.location}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm">{souvenir.location}</h3>
                        <span className="text-xs text-gray-500">{formatDate(souvenir.timestamp)}</span>
                      </div>
                      <div className="flex mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-3 w-3 ${star <= souvenir.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{souvenir.reviewText}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Souvenir Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedSouvenir && (
          <DialogContent className="sm:max-w-md">
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDialogOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogHeader>
              <DialogTitle>{selectedSouvenir.location}</DialogTitle>
            </DialogHeader>
            
            <div className="w-full aspect-video rounded-md overflow-hidden">
              <img 
                src={selectedSouvenir.photoUrl} 
                alt={`Memory from ${selectedSouvenir.location}`} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= selectedSouvenir.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{formatDate(selectedSouvenir.timestamp)}</span>
              </div>
              
              <h3 className="text-sm font-medium mb-1">Trip with {selectedSouvenir.roommateName}</h3>
              <p className="text-sm text-gray-600">{selectedSouvenir.reviewText}</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}