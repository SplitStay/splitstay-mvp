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
      <div className="fixed bottom-24 right-4 flex flex-col space-y-3 items-end">
        {isRecording && (
          <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mb-1 animate-pulse flex items-center">
            <span className="inline-block w-2 h-2 bg-white rounded-full mr-1"></span>
            Recording
          </div>
        )}
        
        {/* Voice feedback button with label */}
        <div className="flex items-center space-x-2">
          <div className="bg-white text-gray-800 text-sm rounded-lg px-3 py-1.5 shadow-md relative">
            Record Voice
            <div className="absolute w-3 h-3 bg-white rotate-45 top-1/2 -right-1 transform -translate-y-1/2"></div>
          </div>
          <Button
            size="icon"
            className="rounded-full bg-white border border-gray-200 text-gray-700 shadow-lg hover:bg-gray-100 h-12 w-12"
            onClick={toggleAudioFeedback}
          >
            {isRecording ? (
              <MicOff className="h-6 w-6 text-red-500" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>
        
        {/* Text feedback button with label */}
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-white text-sm rounded-lg px-3 py-1.5 shadow-md animate-pulse relative">
            Give Feedback
            <div className="absolute w-3 h-3 bg-primary rotate-45 top-1/2 -right-1 transform -translate-y-1/2"></div>
          </div>
          <Button
            size="icon"
            className="rounded-full bg-primary text-white shadow-lg h-14 w-14 border-2 border-white hover:scale-110 transition-transform"
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