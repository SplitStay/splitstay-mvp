import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}