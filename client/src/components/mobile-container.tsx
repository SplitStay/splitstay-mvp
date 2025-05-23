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
          <div className="mobile-time">9:41</div>
          <div className="mobile-icons">
            <div className="mobile-signal"></div>
            <div className="mobile-wifi"></div>
            <div className="mobile-battery"></div>
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