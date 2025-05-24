import React, { useState, useEffect } from "react";
import "../styles/mobile-container.css";

interface MobileContainerProps {
  children: React.ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  
  useEffect(() => {
    // Set current time and update it every minute
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      setCurrentTime(`${displayHours}:${displayMinutes} ${period}`);
    };
    
    updateTime(); // Initial call
    
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  
  return (
    <div className="mobile-container-wrapper">
      <div className="mobile-container">
        <div className="mobile-content">
          {children}
        </div>
        <div className="mobile-home-indicator"></div>
      </div>
    </div>
  );
}