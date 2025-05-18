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
    <svg width="200" height="120" viewBox="0 0 600 400" className="h-12">
      <rect width="600" height="400" fill="#fffce8" />
      <g transform="translate(150, 80) scale(0.7)">
        <path d="M161 338 c-106 -52 -123 -204 -31 -280 19 -16 57 -33 86 -39 71 -14 153 19 187 76 57 94 -4 219 -121 249 -57 15 -78 14 -121 -6z m140 -34 c50 -21 82 -65 88 -120 10 -98 -78 -177 -176 -159 -82 15 -134 77 -129 154 8 116 108 175 217 125z" fill="#003459" />
        <path d="M152 271 c-9 -5 -12 -24 -10 -57 l3 -49 54 -3 c43 -2 57 1 66 15 17 26 -1 65 -33 73 -14 3 -36 6 -50 6 -14 0 -31 2 -38 5 -8 3 -8 5 1 5 6 1 23 7 37 14 20 11 22 16 12 28 -14 17 -21 18 -42 7z m83 -74 c0 -15 -9 -22 -30 -26 -16 -3 -33 -2 -37 2 -7 7 -7 51 0 58 2 3 18 4 35 3 24 -1 32 -6 32 -21 0 -11 0 -11 0 0z" fill="#003459" />
        <path d="M317 273 c-4 -3 -7 -35 -7 -70 0 -61 1 -63 27 -66 21 -2 31 2 41 19 12 21 13 21 21 -9 7 -31 8 -31 33 -15 22 14 25 14 31 -1 11 -28 34 -17 26 12 -9 36 -1 92 14 94 6 1 -1 9 -15 18 -25 16 -26 16 -44 -5 l-19 -21 -17 23 c-12 16 -26 23 -47 22 -17 0 -36 -1 -44 -1z m73 -42 c0 -24 -22 -41 -41 -32 -9 6 -8 40 2 54 10 16 39 0 39 -22z" fill="#003459" />
        <path d="M510 271 c-11 -5 -23 -17 -26 -25 -10 -24 -1 -67 16 -79 22 -17 78 -32 103 -28 17 3 18 1 9 -17 -8 -15 -20 -21 -46 -22 -19 0 -42 -2 -50 -5 -29 -9 -16 -24 23 -25 43 -1 71 10 93 37 20 24 24 95 5 112 -16 15 -89 41 -109 40 -6 -1 0 6 15 16 14 9 19 17 12 18 -7 0 -21 -1 -30 -2 -9 -1 -15 2 -13 8 6 17 -25 26 -39 11 -7 -7 -17 -10 -23 -7 -6 4 -16 8 -22 10 -7 2 -7 1 0 -2 20 -10 13 -36 -10 -37 -13 -1 -29 -2 -38 -3 -8 0 -15 -5 -15 -10 0 -5 5 -7 11 -3 8 5 10 -1 7 -17 -4 -18 -2 -22 9 -17 13 5 16 -4 17 -46 1 -29 2 -55 3 -59 0 -5 12 -8 26 -8 22 0 26 5 26 27 0 21 4 26 18 22 9 -3 28 -5 42 -5 14 0 28 -5 31 -12 3 -9 11 -8 29 3 l24 15 -22 1 c-13 0 -22 -5 -22 -13 0 -8 -3 -9 -8 -1 -13 21 -3 35 21 29 15 -4 27 -1 32 7 10 16 -11 40 -27 31 -8 -5 -9 -2 -5 9 10 25 -10 67 -33 70 -11 2 -20 -1 -20 -7 0 -6 7 -11 16 -11 9 0 14 -7 12 -17 -2 -13 -14 -19 -41 -21 -20 -2 -38 1 -38 7 -2 15 15 35 24 28 5 -2 6 2 4 10 -5 14 -7 14 -33 1z m-1 -74 c-1 -12 -15 -9 -30 7 -13 13 -12 15 3 21 16 6 17 5 11 -8 -6 -13 -5 -14 6 -5 11 9 12 7 7 -8 l-7 -19 10 19 c6 10 4 4 -4 -13 -8 -18 -15 -27 -15 -22 0 15 -10 23 -18 14 -4 -4 -2 -14 4 -22 8 -11 9 -13 1 -8 -7 4 -13 3 -14 -2 0 -5 -2 -15 -3 -23 -2 -8 -10 -18 -18 -21 -11 -5 -14 0 -13 16 2 12 0 22 -3 22 -4 0 -6 -14 -6 -30 0 -22 -4 -30 -14 -28 -8 1 -18 5 -21 8 -4 3 -7 31 -7 62 1 31 4 56 9 57 4 0 16 2 26 4 9 2 30 4 45 5 16 1 32 5 36 8 5 3 9 -4 9 -15 0 -13 -7 -21 -22 -22 -22 -3 -22 -3 2 -9 20 -6 26 -4 26 8 0 9 6 19 13 22 27 11 39 8 39 -8z" fill="#003459" />
        <path d="M360 92 c0 -4 12 -13 26 -19 23 -10 25 -10 12 4 -13 14 -38 24 -38 15z" fill="#003459" />
        <path d="M267 61 c-4 -17 -3 -21 5 -13 5 5 8 16 6 23 -3 8 -7 3 -11 -10z" fill="#003459" />
      </g>
      <g transform="translate(150, 250)">
        <path d="M 0 0 L 32 0 L 32 -103 Q 32 -123 42 -133 Q 52 -143 72 -143 Q 92 -143 102 -133 Q 112 -123 112 -103 L 112 0 L 144 0 L 144 -105 Q 144 -139 124 -159 Q 104 -179 72 -179 Q 40 -179 20 -159 Q 0 -139 0 -105 L 0 0 Z" fill="#003459" />
        <path d="M 168 0 L 239 0 Q 273 0 293 -21 Q 313 -42 313 -76 Q 313 -110 293 -130 Q 273 -150 239 -150 L 200 -150 L 200 -176 L 168 -176 L 168 0 Z M 200 -30 L 200 -120 L 239 -120 Q 256 -120 267 -109 Q 278 -98 278 -76 Q 278 -54 267 -42 Q 256 -30 239 -30 L 200 -30 Z" fill="#003459" />
        <path d="M 342 0 L 374 0 L 374 -75 L 448 -75 L 448 -105 L 374 -105 L 374 -146 L 458 -146 L 458 -176 L 342 -176 L 342 0 Z" fill="#003459" />
        <path d="M 548 2 Q 582 2 603 -19 Q 624 -40 624 -74 L 624 -176 L 592 -176 L 592 -74 Q 592 -54 581 -44 Q 570 -34 548 -34 Q 526 -34 516 -44 Q 506 -54 506 -74 L 506 -176 L 474 -176 L 474 -74 Q 474 -40 494 -19 Q 514 2 548 2 Z" fill="#003459" />
      </g>
    </svg>
  </div>
);
