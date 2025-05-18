import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TravelTrait {
  id: string;
  label: string;
}

const CreateProfile: React.FC = () => {
  const [_, navigate] = useLocation();
  
  // Personal info states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [travelReason, setTravelReason] = useState<"leisure" | "business">("leisure");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  
  // Travel traits
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  // Predefined values
  const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese"];
  
  const travelTraits: TravelTrait[] = [
    { id: "spontaneous", label: "Spontaneous" },
    { id: "street_food", label: "Street Food" },
    { id: "quiet_time", label: "Quiet Time" },
    { id: "early_bird", label: "Early Bird" },
    { id: "night_owl", label: "Night Owl" },
    { id: "planner", label: "Planner" },
    { id: "adventurous", label: "Adventurous" },
    { id: "relaxed", label: "Relaxed" },
  ];

  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const toggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter(id => id !== traitId));
    } else {
      setSelectedTraits([...selectedTraits, traitId]);
    }
  };

  const handleCreateProfile = () => {
    // Save profile data to localStorage for demo purposes
    localStorage.setItem('splitstay_profile', JSON.stringify({
      name: name || "Jane",
      bio: bio || "Love hiking, exploring, and catching sunrises",
      dateOfBirth: dateOfBirth || new Date("1995-01-01"),
      travelReason,
      languages: selectedLanguages.length > 0 ? selectedLanguages : ["English"],
      traits: selectedTraits
    }));
    
    // Navigate to the next step
    navigate("/find-roommate");
  };

  const handleSkip = () => {
    navigate("/find-roommate");
  };

  return (
    <div className="flex flex-col min-h-screen p-5 bg-cream">
      <h1 className="text-4xl font-bold text-navy text-center mb-8">Complete Your profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column - Personal Info */}
        <div className="bg-white rounded-lg p-5 flex flex-col gap-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-navy font-medium mb-1">What should we call you?</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane"
              className="w-full border-gray-300"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-navy font-medium mb-1">What makes you feel alive?</label>
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Love hiking, exploring, and catching sunrises"
              className="w-full border-gray-300 min-h-[100px]"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-navy font-medium mb-1">Date of Birth</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal border-gray-300 relative"
                >
                  {dateOfBirth ? format(dateOfBirth, "PPP") : "Select date"}
                  <Calendar className="ml-auto h-4 w-4 opacity-50 absolute right-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Travel Reason */}
          <div>
            <label className="block text-navy font-medium mb-1">Reason for Travel</label>
            <div className="flex w-full rounded-md overflow-hidden">
              <Button 
                type="button"
                className={`flex-1 rounded-none ${travelReason === 'leisure' ? 'bg-navy text-white' : 'bg-white text-navy border border-gray-300'}`}
                onClick={() => setTravelReason('leisure')}
              >
                Leisure
              </Button>
              <Button 
                type="button"
                className={`flex-1 rounded-none ${travelReason === 'business' ? 'bg-navy text-white' : 'bg-white text-navy border border-gray-300'}`}
                onClick={() => setTravelReason('business')}
              >
                Business
              </Button>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-navy font-medium mb-1">Languages</label>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <button
                  key={language}
                  type="button"
                  className={`py-2 px-4 rounded-full text-sm transition-colors ${
                    selectedLanguages.includes(language)
                      ? "bg-yellow-100 text-gray-800 border border-yellow-300"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-yellow-300"
                  }`}
                  onClick={() => toggleLanguage(language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - ID Verification & Traits */}
        <div className="flex flex-col gap-5">
          {/* ID Verification Box */}
          <div className="bg-white rounded-lg p-5">
            <h2 className="text-2xl font-bold text-navy mb-3">ID Verification</h2>
            
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold">ID Verified</span>
            </div>
            
            <p className="text-gray-700">
              To host or be hosted, SplitStay requires a one-time ID verification.
              Your info is encrypted and never shared.
            </p>
          </div>

          {/* Travel Traits */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex flex-wrap gap-2">
              {travelTraits.map((trait) => (
                <button
                  key={trait.id}
                  type="button"
                  className={`py-2 px-4 rounded-full text-sm transition-colors ${
                    selectedTraits.includes(trait.id)
                      ? "bg-yellow-100 text-gray-800 border border-yellow-300"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-yellow-300"
                  }`}
                  onClick={() => toggleTrait(trait.id)}
                >
                  {trait.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Button 
          variant="outline"
          className="py-4 text-lg border-navy text-navy"
          onClick={handleSkip}
        >
          Skip for Now
        </Button>
        <Button 
          className="py-4 text-lg bg-navy hover:bg-navy/90 text-white"
          onClick={handleCreateProfile}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CreateProfile;