import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const [_, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to authenticate
      // For demo purposes, we'll simulate success
      setTimeout(() => {
        setIsLoading(false);
        
        // Store login state
        localStorage.setItem('splitstay_auth', JSON.stringify({
          isLoggedIn: true,
          email: email
        }));
        
        // Navigate to dashboard page after login
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
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
      
      // Navigate to dashboard page after social login
      navigate("/dashboard");
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
        <h1 className="text-2xl font-bold text-navy">Log In</h1>
      </div>
      
      <div className="bg-white rounded-lg p-6 flex-1 flex flex-col">
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
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
              placeholder="Enter your password"
              className="w-full"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm text-navy"
              onClick={() => toast({
                title: "Password Reset",
                description: "Reset link would be sent in a real app",
              })}
              type="button"
            >
              Forgot password?
            </Button>
          </div>
          
          <Button 
            type="submit" 
            className="navy-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
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
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
          >
            <FaGoogle className="text-red-500" />
            <span>Google</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="flex items-center justify-center gap-2 py-5"
            onClick={() => handleSocialLogin("facebook")}
            disabled={isLoading}
          >
            <FaFacebook className="text-blue-600" />
            <span>Facebook</span>
          </Button>
        </div>
        
        <div className="mt-auto pt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              className="text-navy p-0 h-auto font-semibold"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;