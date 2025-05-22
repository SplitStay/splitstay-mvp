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
    <div className="mobile-wrapper">
      <div className="mobile-scroll">
        <div className={cn("app-container", className)} style={{ paddingTop: "0" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
