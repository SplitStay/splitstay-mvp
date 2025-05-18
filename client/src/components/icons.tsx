import React from "react";

// Twin bed icon
export const TwinBedIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="6" width="7" height="12" rx="1" />
    <rect x="14" y="6" width="7" height="12" rx="1" />
    <path d="M3 13h7" />
    <path d="M14 13h7" />
    <path d="M21 19v2" />
    <path d="M3 19v2" />
  </svg>
);

// Hotel icon
export const HotelIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
    <path d="M1 21h22" />
    <path d="M8 10h8" />
    <path d="M8 14h8" />
    <path d="M8 18h8" />
  </svg>
);

// Door icon
export const DoorIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
    <path d="M17 13.5V10.5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1Z" />
    <path d="M15 7.5V7a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v0.5" />
    <path d="M15 17.5V17a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v0.5" />
  </svg>
);

// Lamp icon
export const LampIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 2h6l3 7H6l3-7Z" />
    <path d="M12 9v13" />
    <path d="M9 22h6" />
  </svg>
);

// Logo component using the LOGO_TP.png file
export const SplitStayLogo = ({ className = "", size = "medium" }: { className?: string; size?: "small" | "medium" | "large" }) => {
  const sizeClass = {
    small: "h-8 w-auto",
    medium: "h-16 w-auto",
    large: "h-24 w-auto"
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/LOGO_TP.png" 
        alt="SplitStay Logo" 
        className={sizeClass[size]}
      />
    </div>
  );
};
