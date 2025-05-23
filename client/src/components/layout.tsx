import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SplitStayLogo } from "@/components/icons";
import "../styles/mobile-container.css";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className = "",
}) => {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top whenever location changes
    const scrollArea = document.querySelector('.mobile-scroll');
    if (scrollArea) {
      scrollArea.scrollTop = 0;
    }
  }, [location]);

  useEffect(() => {
    // Set current time for the mobile status bar
    const updateTime = () => {
      const timeElement = document.querySelector('.mobile-time');
      if (timeElement) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        timeElement.textContent = `${displayHours}:${minutes} ${ampm}`;
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mobile-wrapper">
      {/* Mobile-like status bar */}
      <div className="mobile-status-bar">
        <div className="mobile-time">12:30 PM</div>
        <div className="mobile-status-icons">
          <div className="mobile-signal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V14" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 20V10" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M15 20V6" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M20 20V2" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="mobile-wifi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 19.5H12.01" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 15C8.917 14.042 10.383 13.5 12 13.5C13.617 13.5 15.083 14.042 16 15" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 10.5C5.691 8.248 8.668 6.75 12 6.75C15.332 6.75 18.309 8.248 20 10.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="mobile-battery">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="7" width="18" height="10" rx="2" stroke="#333" strokeWidth="1.5"/>
              <path d="M20 10H22V14H20V10Z" fill="#333"/>
              <rect x="4" y="9" width="14" height="6" fill="#333"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Scrollable mobile content area */}
      <div className="mobile-scroll">
        <div className={cn("app-container", className)} style={{ paddingTop: "0", backgroundColor: "#F5F1EB" }}>
          {children}
        </div>
      </div>
      
      {/* Mobile-like home indicator */}
      <div className="mobile-home-indicator">
        <div className="mobile-home-bar"></div>
      </div>
    </div>
  );
};

export default Layout;
