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
      {/* Feedback button removed for MVP video */}

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