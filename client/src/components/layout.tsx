import React from "react";
import { Link } from "wouter";
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
  return (
    <div className="min-h-screen bg-[#F5F1EB] flex justify-center items-center">
      <div className="mobile-container">
        <div className="mobile-content">
          <div className={cn("app-container", className)} style={{ paddingTop: "0" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
