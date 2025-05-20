import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mic, MicOff } from "lucide-react";
import FeedbackForm from "./feedback-form";
import ShareDialog from "./share-dialog";
import { sessionRecorder } from "@/lib/session-recorder";

const FeedbackButton: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const toggleAudioFeedback = () => {
    if (isRecording) {
      // If currently recording, stop the recording
      sessionRecorder.stopRecording().then(() => {
        setIsRecording(false);
      });
    } else {
      // If not recording, check if user already consented to audio
      const consent = localStorage.getItem('splitstay_research_consent');
      if (consent) {
        const { recordAudio } = JSON.parse(consent);
        if (recordAudio) {
          // User already consented to audio, start recording
          sessionRecorder.startRecording({ recordAudio: true, recordSession: false })
            .then(() => {
              setIsRecording(true);
            });
        }
      }
    }
  };

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
      <div className="fixed bottom-24 right-4 flex flex-col space-y-2">
        {isRecording && (
          <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mb-1 animate-pulse flex items-center">
            <span className="inline-block w-2 h-2 bg-white rounded-full mr-1"></span>
            Recording
          </div>
        )}
        <Button
          size="icon"
          className="rounded-full bg-white border border-gray-200 text-gray-700 shadow-lg hover:bg-gray-100"
          onClick={toggleAudioFeedback}
        >
          {isRecording ? (
            <MicOff className="h-5 w-5 text-red-500" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        <Button
          size="icon"
          className="rounded-full bg-primary text-white shadow-lg"
          onClick={handleOpenFeedback}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
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