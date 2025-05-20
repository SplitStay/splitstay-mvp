import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sessionRecorder } from "@/lib/session-recorder";

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => setRating(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
};

interface FeedbackFormProps {
  open: boolean;
  onClose: () => void;
  onShare?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ 
  open, 
  onClose,
  onShare
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [wouldUse, setWouldUse] = useState<boolean | null>(null);
  const [knowSomeoneWhoWouldUse, setKnowSomeoneWhoWouldUse] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    // Save feedback to session recorder and send to server
    await sessionRecorder.addFeedback({
      text: feedback,
      rating,
      email: email || undefined,
      wouldUse,
      knowsOthersWhoWouldUse: knowSomeoneWhoWouldUse
    });
    
    // Store additional feedback data locally
    const additionalFeedback = {
      wouldUse,
      knowSomeoneWhoWouldUse,
      shareIntent: !!onShare && knowSomeoneWhoWouldUse === true
    };
    
    sessionStorage.setItem('splitstay_feedback', JSON.stringify({
      feedback,
      rating,
      email,
      ...additionalFeedback,
      timestamp: new Date().toISOString()
    }));
    
    setSubmitted(true);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-primary">
                Share Your Feedback
              </DialogTitle>
              <DialogDescription>
                Help us improve SplitStay with your honest feedback.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="rating">How would you rate your experience?</Label>
                <StarRating rating={rating} setRating={setRating} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback">What did you think of SplitStay?</Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what you liked or what could be improved..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[90px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wouldUse">Would you use SplitStay yourself?</Label>
                <div className="flex space-x-4 mt-1">
                  <Button
                    type="button"
                    variant={wouldUse === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWouldUse(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={wouldUse === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWouldUse(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="knowSomeone">Do you know people who would use this?</Label>
                <div className="flex space-x-4 mt-1">
                  <Button
                    type="button"
                    variant={knowSomeoneWhoWouldUse === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setKnowSomeoneWhoWouldUse(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={knowSomeoneWhoWouldUse === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setKnowSomeoneWhoWouldUse(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  Your email (optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  We'll only use this to follow up on your feedback if needed.
                </p>
              </div>
            </div>
            <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary text-white w-full sm:w-auto"
              >
                Submit Feedback
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-primary">
                Thank You!
              </DialogTitle>
              <DialogDescription>
                Your feedback helps us improve SplitStay.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center">
              <div className="text-5xl mb-4">🙌</div>
              <p className="mb-4">
                We appreciate you taking the time to share your thoughts.
              </p>
              
              {knowSomeoneWhoWouldUse && onShare && (
                <div className="mt-4">
                  <p className="mb-2 font-medium">
                    Know someone who would love SplitStay?
                  </p>
                  <Button
                    onClick={onShare}
                    className="bg-primary text-white mt-2"
                  >
                    Share SplitStay
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={onClose} className="w-full bg-primary text-white">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;