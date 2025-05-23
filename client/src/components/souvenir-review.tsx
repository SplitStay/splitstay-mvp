import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Rating } from "./ui/rating";

// Define the form schema
const souvenirFormSchema = z.object({
  photoUrl: z.string().min(1, "Please upload a photo"),
  reviewText: z.string().min(3, "Please leave a short review").max(500, "Review is too long"),
  rating: z.number().min(1).max(5),
});

type SouvenirFormValues = z.infer<typeof souvenirFormSchema>;

interface SouvenirReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: number;
  userId: number;
  onSubmit: (values: SouvenirFormValues) => void;
}

export function SouvenirReview({
  open,
  onOpenChange,
  tripId,
  userId,
  onSubmit,
}: SouvenirReviewProps) {
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const form = useForm<SouvenirFormValues>({
    resolver: zodResolver(souvenirFormSchema),
    defaultValues: {
      photoUrl: "",
      reviewText: "",
      rating: 5,
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server and get a URL back
      // For this demo, we'll create a local blob URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        form.setValue("photoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (values: SouvenirFormValues) => {
    // Add tripId and userId to the souvenir data
    onSubmit({
      ...values,
      photoUrl: photoPreview || values.photoUrl,
    });
    
    toast({
      title: "Souvenir Uploaded",
      description: "Your travel memory has been saved.",
    });
    
    // Reset form and close dialog
    form.reset();
    setPhotoPreview(null);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Travel Memory</DialogTitle>
          <DialogDescription>
            Upload a souvenir photo and share your experience with your roommate.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload a Photo</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center space-y-2">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full"
                      />
                      {photoPreview && (
                        <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden">
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate Your Roommate (1-5 stars)</FormLabel>
                  <FormControl>
                    <Rating
                      value={field.value}
                      onChange={field.onChange}
                      maxRating={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reviewText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave a Review</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your experience..." 
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}