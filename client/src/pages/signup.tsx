import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const SignUp: React.FC = () => {
  const [_, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to create an account
      // For demo purposes, we'll simulate success
      setTimeout(() => {
        setIsLoading(false);
        
        // Store login state
        localStorage.setItem('splitstay_auth', JSON.stringify({
          isLoggedIn: true,
          email: email
        }));
        
        // Navigate to profile completion
        navigate("/create-profile");
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSocialSignUp = (provider: string) => {
    setIsLoading(true);
    
    // In a real app, this would initiate OAuth flow
    // For demo purposes, we'll simulate success
    setTimeout(() => {
      setIsLoading(false);
      
      // Store login state
      localStorage.setItem('splitstay_auth', JSON.stringify({
        isLoggedIn: true,
        provider: provider
      }));
      
      // Navigate to profile completion
      navigate("/create-profile");
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-cream">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-navy">Create Your Account</h1>
      </div>
      
      <div className="bg-white rounded-lg p-6 flex-1 flex flex-col">
        <form onSubmit={handleSignUp} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full"
              disabled={isLoading}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-navy hover:bg-navy/90 text-white py-6"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="flex items-center my-6">
          <Separator className="flex-1" />
          <span className="px-4 text-gray-500 text-sm">or continue with</span>
          <Separator className="flex-1" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex items-center justify-center gap-2 py-5"
            onClick={() => handleSocialSignUp("google")}
            disabled={isLoading}
          >
            <FaGoogle className="text-red-500" />
            <span>Google</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="flex items-center justify-center gap-2 py-5"
            onClick={() => handleSocialSignUp("facebook")}
            disabled={isLoading}
          >
            <FaFacebook className="text-blue-600" />
            <span>Facebook</span>
          </Button>
        </div>
        
        <div className="mt-auto pt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Button 
              variant="link" 
              className="text-navy p-0 h-auto font-semibold"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;