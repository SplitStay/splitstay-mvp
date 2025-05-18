import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import logoImage from "../assets/logo.jpg";

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
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-center">
          <Link href="/">
            <img src={logoImage} alt="SplitStay Logo" className="h-16 cursor-pointer" />
          </Link>
        </div>
      </header>
      <div className={cn("app-container", className)}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
