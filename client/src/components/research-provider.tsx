import React from "react";
import FeedbackButton from "./feedback-button";

interface ResearchProviderProps {
  children: React.ReactNode;
}

const ResearchProvider: React.FC<ResearchProviderProps> = ({ children }) => {
  // Simplified provider without consent popup or session recording
  return (
    <>
      {children}
      <FeedbackButton />
    </>
  );
};

export default ResearchProvider;