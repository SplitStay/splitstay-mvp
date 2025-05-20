import React, { useState, useEffect } from "react";
import ResearchConsent from "./research-consent";
import FeedbackButton from "./feedback-button";
import { sessionRecorder } from "@/lib/session-recorder";

interface ResearchProviderProps {
  children: React.ReactNode;
}

const ResearchProvider: React.FC<ResearchProviderProps> = ({ children }) => {
  const [showConsent, setShowConsent] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if the user has already provided consent
    const storedConsent = localStorage.getItem('splitstay_research_consent');
    
    if (storedConsent) {
      // User already gave consent, initialize recorder with saved preferences
      const { recordAudio, recordSession } = JSON.parse(storedConsent);
      sessionRecorder.startRecording({ recordAudio, recordSession });
      setInitialized(true);
    } else {
      // User hasn't seen consent dialog yet
      setShowConsent(true);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (sessionRecorder.isCurrentlyRecording()) {
        sessionRecorder.stopRecording();
      }
    };
  }, []);

  const handleAcceptConsent = (recordAudio: boolean, recordSession: boolean) => {
    // Start recording with the selected options
    sessionRecorder.startRecording({ recordAudio, recordSession });
    setShowConsent(false);
    setInitialized(true);
  };

  const handleDeclineConsent = () => {
    // User declined, but we still show the app without recording
    setShowConsent(false);
    setInitialized(true);
  };

  // Don't render until we've determined consent status
  if (!initialized && showConsent) {
    return (
      <ResearchConsent 
        onAccept={handleAcceptConsent} 
        onDecline={handleDeclineConsent} 
      />
    );
  }

  return (
    <>
      {children}
      <FeedbackButton />
    </>
  );
};

export default ResearchProvider;