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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ResearchConsentProps {
  onAccept: (recordAudio: boolean, recordSession: boolean) => void;
  onDecline: () => void;
}

const ResearchConsent: React.FC<ResearchConsentProps> = ({
  onAccept,
  onDecline,
}) => {
  const [open, setOpen] = useState(true);
  const [recordAudio, setRecordAudio] = useState(false);
  const [recordSession, setRecordSession] = useState(false);

  const handleAccept = () => {
    if (recordAudio || recordSession) {
      onAccept(recordAudio, recordSession);
      setOpen(false);
      // Save consent to localStorage for this session
      localStorage.setItem('splitstay_research_consent', JSON.stringify({
        recordAudio,
        recordSession,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const handleDecline = () => {
    onDecline();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">Help Us Improve SplitStay</DialogTitle>
          <DialogDescription>
            SplitStay is a research prototype. We'd like to collect data on how you use our app to make it better.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-700">
            Your participation helps us create a better experience for solo travelers looking to share accommodations.
          </p>
          
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="recordSession" 
              checked={recordSession}
              onCheckedChange={(checked) => setRecordSession(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="recordSession" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Record my session (clicks, navigation paths)
              </Label>
              <p className="text-xs text-gray-500">
                We'll record how you use the app, but no personal data.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="recordAudio" 
              checked={recordAudio}
              onCheckedChange={(checked) => setRecordAudio(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="recordAudio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Record audio feedback
              </Label>
              <p className="text-xs text-gray-500">
                You can share thoughts out loud as you use the app.
              </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 pt-2">
            You can withdraw consent at any time from the settings menu.
            All data is anonymous and will only be used for research purposes.
          </p>
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="outline"
            onClick={handleDecline}
          >
            No thanks
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-primary text-white"
            disabled={!recordAudio && !recordSession}
          >
            I agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchConsent;