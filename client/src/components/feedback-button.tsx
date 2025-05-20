import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mic, MicOff } from "lucide-react";
import FeedbackForm from "./feedback-form";
import ShareDialog from "./share-dialog";
import { sessionRecorder } from "@/lib/session-recorder";
import { useToast } from "@/hooks/use-toast";

const FeedbackButton: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordStatus, setRecordStatus] = useState<"idle" | "recording" | "saved" | "error">("idle");
  const { toast } = useToast();
  
  const toggleAudioFeedback = () => {
    if (isRecording) {
      // If currently recording, stop the recording
      sessionRecorder.stopRecording()
        .then(() => {
          setIsRecording(false);
          setRecordStatus("saved");
          
          // Show success toast
          toast({
            title: "Recording saved",
            description: "Your audio feedback has been saved. Thank you!",
          });
          
          // Reset status after 3 seconds
          setTimeout(() => {
            setRecordStatus("idle");
          }, 3000);
        })
        .catch(error => {
          console.error("Error saving recording:", error);
          setIsRecording(false);
          setRecordStatus("error");
          
          // Show error toast
          toast({
            title: "Error saving recording",
            description: "There was a problem saving your recording. Please try again.",
            variant: "destructive"
          });
          
          // Reset status after 3 seconds
          setTimeout(() => {
            setRecordStatus("idle");
          }, 3000);
        });
    } else {
      // If not recording, check if user already consented to audio
      const consent = sessionStorage.getItem('splitstay_research_consent');
      if (consent) {
        const { recordAudio } = JSON.parse(consent);
        if (recordAudio) {
          // User already consented to audio, start recording
          sessionRecorder.startRecording({ recordAudio: true, recordSession: false })
            .then(() => {
              setIsRecording(true);
              setRecordStatus("recording");
              
              // Show recording toast
              toast({
                title: "Recording started",
                description: "We're now recording your audio feedback. Click the microphone again to stop.",
              });
            })
            .catch(error => {
              console.error("Error starting recording:", error);
              setRecordStatus("error");
              
              // Show error toast
              toast({
                title: "Could not start recording",
                description: "Please make sure microphone access is allowed in your browser.",
                variant: "destructive"
              });
              
              // Reset status after 3 seconds
              setTimeout(() => {
                setRecordStatus("idle");
              }, 3000);
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
        {/* Recording status indicator */}
        {recordingStatus !== 'idle' && (
          <div className={`text-white text-xs rounded-full px-2 py-1 mb-1 flex items-center ${
            recordingStatus === 'recording' ? 'bg-red-500 animate-pulse' : 
            recordingStatus === 'saving' ? 'bg-yellow-500' :
            recordingStatus === 'saved' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {recordingStatus === 'recording' && (
              <>
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                Recording: {formatTime(recordingSeconds)}
              </>
            )}
            {recordingStatus === 'saving' && 'Saving recording...'}
            {recordingStatus === 'saved' && 'Recording saved!'}
            {recordingStatus === 'error' && 'Recording failed'}
          </div>
        )}
        
        {/* Voice feedback button with label */}
        <div className="flex items-center space-x-2">
          <div className="bg-white text-gray-800 text-sm rounded-lg px-3 py-1.5 shadow-md relative">
            {isRecording ? 'Stop Recording' : 'Record Voice Feedback'}
            <div className="absolute w-3 h-3 bg-white rotate-45 top-1/2 -right-1 transform -translate-y-1/2"></div>
          </div>
          <Button
            size="icon"
            className={`rounded-full shadow-lg h-12 w-12 transition-all ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600 border-2 border-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={toggleAudioFeedback}
            disabled={recordingStatus === 'saving'}
          >
            {isRecording ? (
              <MicOff className="h-6 w-6" />
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