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

  // For home page, use full-width desktop layout
  if (location === "/") {
    return (
      <div className="w-full h-full">
        {children}
      </div>
    );
  }

  // For other pages, use mobile layout
  return (
    <div className="mobile-wrapper">
      {/* Scrollable mobile content area */}
      <div className="mobile-scroll">
        <div className={cn("app-container", className)} style={{ paddingTop: "0", backgroundColor: "#F5F1EB" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
