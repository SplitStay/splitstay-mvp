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

// Logo combination
export const SplitStayLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="flex flex-col items-center">
      <svg 
        width="128" 
        height="96" 
        viewBox="0 0 128 96" 
        className={`text-blue-900 h-12 ${className}`}
        fill="currentColor"
      >
        <path d="M53.9 48.1v-4.5h-5.6v4.5h-5.6v-4.5h-5.6v22.7h5.6v-12h5.6v12h5.6v-12h5.6v12h5.6v-22.7h-11.2v4.5z" />
        <path d="M86.4 48.1v-4.5h-5.6v4.5h-5.6v-4.5h-5.6v22.7h5.6v-12h5.6v12h5.6v-12h5.6v12h5.6v-22.7h-11.2v4.5z" />
        <path d="M64 21.3h-5.6v42h5.6v-42z" />
        <path d="M64 21.3h5.6v5.6H64z" />
      </svg>
      <div className="text-blue-900 font-bold text-2xl">SplitStay</div>
    </div>
  </div>
);
