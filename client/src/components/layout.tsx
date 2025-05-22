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
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1EB" }}>
      {/* Empty header - logo is now in each page as needed */}
      <div className={cn("app-container", className)} style={{ paddingTop: "0" }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
