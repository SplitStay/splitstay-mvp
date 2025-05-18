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
      <header className="p-4 pb-0 pt-0" style={{ backgroundColor: "#F5F1EB" }}>
        <div className="container mx-auto flex justify-center">
          <Link href="/">
            <div className="cursor-pointer">
              <SplitStayLogo />
            </div>
          </Link>
        </div>
      </header>
      <div className={cn("app-container", className)} style={{ paddingTop: "0", marginTop: "-90px" }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
