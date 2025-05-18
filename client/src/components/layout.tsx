import React from "react";
import { SplitStayLogo } from "@/components/icons";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn("app-container", className)}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
