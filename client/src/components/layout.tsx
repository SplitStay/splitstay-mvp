import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SplitStayLogo } from "@/components/icons";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#f0f0f0" }}>
      <div className="mobile-container">
        <div className="mobile-notch absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-xl z-10"></div>
        <div className={cn("app-content h-full overflow-y-auto", className)} style={{ backgroundColor: "#F5F1EB" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
