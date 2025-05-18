import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { User, insertReviewSchema } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface RateRoommateProps {
  params: {
    id: string;
  };
}

const roommateTags = ["Friendly", "Respectful", "Tidy", "Communicative", "Considerate"];

const RateRoommate: React.FC<RateRoommateProps> = ({ params }) => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = parseInt(params.id, 10);
  const bookingId = 1; // In a real app, this would be from context or URL
  
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { data: roommate, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json() as Promise<User>;
    }
  });
  
  // Define the form schema based on the insert review schema
  const formSchema = z.object({
    comment: z.string().optional(),
  });
  
  type FormValues = z.infer<typeof formSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });
  
  const submitReviewMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const reviewData = {
        bookingId,
        reviewerId: 5, // Current user ID (John Doe)
        revieweeId: userId,
        rating,
        comment: data.comment,
        tags: selectedTags
      };
      
      return apiRequest("POST", "/api/reviews", reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/user/${userId}`] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      navigate(`/post-stay/${bookingId}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (data: FormValues) => {
    submitReviewMutation.mutate(data);
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-7 w-40" />
          <div className="w-5"></div>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-8 w-32 mb-4" />
        </div>
        
        <Skeleton className="h-6 w-64 mx-auto mb-6" />
        
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-28 w-full" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>
        
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }
  
  if (!roommate) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">Failed to load roommate profile</div>
        <Button onClick={() => navigate(`/post-stay/${bookingId}`)}>
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate(`/post-stay/${bookingId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-primary">Rate Your Roommate</h1>
        <div className="w-5"></div> {/* Spacer for layout balance */}
      </div>
      
      {/* Profile */}
      <div className="flex flex-col items-center mb-6">
        <UserAvatar
          user={{
            fullName: roommate.fullName,
            profilePicture: roommate.profilePicture,
            isVerified: roommate.isVerified
          }}
          size="xl"
          className="mb-4"
        />
        <h2 className="text-2xl font-bold text-primary mb-4">{roommate.fullName}</h2>
      </div>
      
      <p className="text-center text-gray-700 mb-6">
        How was sharing a room with {roommate.fullName}?
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Rating */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Overall Rating</h3>
            <div className="flex justify-center space-x-2 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${star <= rating ? 'text-primary fill-primary' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Feedback */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Feedback</h3>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Write any comments here..."
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {/* Tags */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Roommate Tags</h3>
            <div className="flex flex-wrap gap-2">
              {roommateTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  className={`rounded-full ${
                    selectedTags.includes(tag) 
                      ? 'border-primary bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary text-white font-semibold py-6"
            disabled={submitReviewMutation.isPending}
          >
            {submitReviewMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RateRoommate;
