import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import logoImage from "@assets/Splitstay Logo Transparent_1751765053004.png";

const Login: React.FC = () => {
  const [_, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Placeholder login logic - in a real app, this would authenticate
    // For now, just redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-md mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-navy hover:text-navy/80"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Button>
          <img 
            src={logoImage} 
            alt="SplitStay Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Main Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Sign in to your SplitStay account
          </p>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-navy font-medium mb-2 text-left">
                  Email Address
                </label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-navy font-medium mb-2 text-left">
                  Password
                </label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                />
              </div>

              <Button 
                onClick={handleLogin}
                className="w-full bg-navy text-white hover:bg-navy/90 transition-colors duration-300 text-lg py-3 rounded-lg font-semibold"
              >
                Sign In
              </Button>
            </div>
          </div>

          <p className="text-gray-600">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate("/")}
              className="text-navy hover:text-navy/80 underline transition-colors duration-300"
            >
              Create one here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;