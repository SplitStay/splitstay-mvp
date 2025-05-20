import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import FeedbackForm from "./feedback-form";
import ShareDialog from "./share-dialog";

const FeedbackButton: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleOpenFeedback = () => {
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };

  const handleOpenShare = () => {
    setShowShare(true);
    setShowFeedback(false);
  };

  const handleCloseShare = () => {
    setShowShare(false);
  };

  return (
    <>
      <div className="fixed bottom-24 right-4 flex flex-col space-y-3 items-end">
        {/* Improved feedback button with better visibility */}
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-white text-sm rounded-lg px-3 py-1.5 shadow-md animate-pulse relative">
            Share Your Feedback
            <div className="absolute w-3 h-3 bg-primary rotate-45 top-1/2 -right-1 transform -translate-y-1/2"></div>
          </div>
          <Button
            size="icon"
            className="rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 h-14 w-14 border-2 border-white"
            onClick={handleOpenFeedback}
          >
            <MessageSquare className="h-7 w-7" />
          </Button>
        </div>
      </div>

      <FeedbackForm
        open={showFeedback}
        onClose={handleCloseFeedback}
        onShare={handleOpenShare}
      />

      <ShareDialog
        open={showShare}
        onClose={handleCloseShare}
      />
    </>
  );
};

export default FeedbackButton;