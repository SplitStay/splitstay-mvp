import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail, Check, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Get the current URL 
  const currentUrl = window.location.origin;
  const shareUrl = currentUrl;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleEmailShare = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate sending an email
    setTimeout(() => {
      // In a real app, this would send an API request
      // For now we'll just track that the user tried to share
      localStorage.setItem('splitstay_shared_via_email', JSON.stringify({
        to: email,
        url: shareUrl,
        timestamp: new Date().toISOString()
      }));
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      });
      
      setIsSending(false);
      setEmail("");
    }, 1000);
  };
  
  const handleSocialShare = (platform: string) => {
    // Track sharing intent
    localStorage.setItem('splitstay_shared_via_social', JSON.stringify({
      platform,
      url: shareUrl,
      timestamp: new Date().toISOString()
    }));
    
    let socialShareUrl;
    
    switch (platform) {
      case 'whatsapp':
        socialShareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out SplitStay - a better way to find compatible roommates when traveling! ${window.location.origin}`)}`;
        break;
      case 'facebook':
        socialShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`;
        break;
      case 'twitter':
        socialShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm using SplitStay to find compatible roommates when traveling. Check it out! ${window.location.origin}`)}`;
        break;
      default:
        return;
    }
    
    window.open(socialShareUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">
            Share SplitStay
          </DialogTitle>
          <DialogDescription>
            Invite people who might be interested in finding roommates for their travels.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="py-4">
            <div className="space-y-4">
              <Label htmlFor="shareUrl">Share this link</Label>
              <div className="flex space-x-2">
                <Input
                  id="shareUrl"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={copyToClipboard}
                  className={copied ? "bg-green-600" : "bg-primary"}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="py-4">
            <form onSubmit={handleEmailShare} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary"
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send Invitation"}
                {!isSending && <Mail className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="social" className="py-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-20"
                onClick={() => handleSocialShare('whatsapp')}
              >
                <div className="text-2xl mb-1">💬</div>
                <span className="text-xs">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-20"
                onClick={() => handleSocialShare('facebook')}
              >
                <div className="text-2xl mb-1">👥</div>
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-20"
                onClick={() => handleSocialShare('twitter')}
              >
                <div className="text-2xl mb-1">🐦</div>
                <span className="text-xs">Twitter</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;