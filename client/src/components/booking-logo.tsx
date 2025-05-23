import React from "react";

export const BookingLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`inline-block ${className}`}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path
          d="M37 14C18.3 14 3 29.3 3 48s15.3 34 34 34c18.7 0 34-15.3 34-34S55.7 14 37 14z"
          fill="#003580"
        />
        <circle cx="85" cy="48" r="12" fill="#00B9F7" />
      </svg>
    </div>
  );
};