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
      <header className="pt-2 px-0" style={{ backgroundColor: "#F5F1EB", marginBottom: "0" }}>
        <div className="container mx-auto flex justify-center">
          <Link href="/">
            <div className="cursor-pointer">
              <SplitStayLogo />
            </div>
          </Link>
        </div>
      </header>
      <div className={cn("app-container", className)} style={{ paddingTop: "0" }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
