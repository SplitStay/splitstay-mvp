import React from "react";
import "../styles/mobile-container.css";

interface MobileContainerProps {
  children: React.ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="mobile-container-wrapper">
      <div className="mobile-container">
        <div className="mobile-status-bar">
          <div className="mobile-time">11:23 AM</div>
          <div className="mobile-icons">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0H2C0.9 0 0 0.9 0 2V10C0 11.1 0.9 12 2 12H16C17.1 12 18 11.1 18 10V2C18 0.9 17.1 0 16 0ZM11 8H7V4H11V8Z" fill="#000"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9L12 2L23 9V20H1V9Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="16" height="8" rx="1" stroke="#000" strokeWidth="2"/>
              <path d="M20 4V8" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
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