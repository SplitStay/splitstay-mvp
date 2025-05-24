import React from "react";
import "../styles/mobile-container.css";

interface MobileContainerProps {
  children: React.ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="mobile-container-wrapper">
      <div className="mobile-container">
        {/* Removed status bar with black marks */}
        <div className="mobile-content">
          {children}
        </div>
        {/* Removed home indicator */}
      </div>
    </div>
  );
}