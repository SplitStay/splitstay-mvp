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
        <div style={{
          height: '44px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: '500',
            fontSize: '15px'
          }}>
            {currentTime}
          </div>
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {/* Signal Icon */}
            <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9H2V10H1V9ZM4 7H5V10H4V7ZM7 5H8V10H7V5ZM10 3H11V10H10V3ZM13 1H14V10H13V1Z" fill="black"/>
            </svg>
            
            {/* WiFi Icon */}
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 2C8.5 2 9.5 2.5 10.25 3.25C11 4 11.5 5 11.5 6C11.5 7 11 8 10.25 8.75C9.5 9.5 8.5 10 7.5 10C6.5 10 5.5 9.5 4.75 8.75C4 8 3.5 7 3.5 6C3.5 5 4 4 4.75 3.25C5.5 2.5 6.5 2 7.5 2Z" stroke="black"/>
              <path d="M0.5 6C0.5 3.5 2.5 0.5 7.5 0.5C12.5 0.5 14.5 3.5 14.5 6" stroke="black"/>
            </svg>
            
            {/* Battery Icon */}
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="black"/>
              <rect x="2" y="2" width="17" height="7" rx="1.5" fill="black"/>
              <path d="M23 4.5V7C23.8284 6.7239 24.3 6.1716 24.3 5.75C24.3 5.3284 23.8284 4.7761 23 4.5Z" fill="black"/>
            </svg>
          </div>
        </div>
        <div className="mobile-content">
          {children}
        </div>
        <div className="mobile-home-indicator"></div>
      </div>
    </div>
  );
}