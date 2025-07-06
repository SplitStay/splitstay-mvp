import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Plus } from "lucide-react";

export default function CreateProfile() {
  console.log("CreateProfile component is loading");
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    travelReason: ""
  });

  // Check user path from URL
  const urlParams = new URLSearchParams(window.location.search);
  const userPath = urlParams.get('path');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleStep2Submit = () => {
    // For now, just navigate based on user path
    if (userPath === "host") {
      navigate("/create-trip");
    } else if (userPath === "guest") {
      navigate("/browse-trips");
    } else {
      navigate("/find-roommate");
    }
  };

  const handleSkipStep2 = () => {
    handleStep2Submit();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleAddCustomLanguage = () => {
    if (customLanguage.trim() && !selectedLanguages.includes(customLanguage.trim())) {
      setSelectedLanguages(prev => [...prev, customLanguage.trim()]);
      setCustomLanguage("");
    }
  };

  const handleTraitToggle = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(prev => prev.filter(t => t !== trait));
    } else if (selectedTraits.length < 5) {
      setSelectedTraits(prev => [...prev, trait]);
    }
  };

  const languageOptions = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Dutch", "Japanese", "Korean", "Chinese", "Arabic", "Russian", "Hindi"
  ];

  const traitOptions = [
    "Early Bird", "Night Owl", "Adventurous", "Relaxed", "Social", "Quiet", 
    "Foodie", "Fitness Enthusiast", "Culture Lover", "Nature Lover", 
    "Tech Savvy", "Minimalist", "Photographer", "Music Lover", "Budget Traveler",
    "Luxury Traveler", "Backpacker", "City Explorer", "Beach Lover", "Mountain Hiker"
  ];

  // Generate options for date dropdowns
  const dayOptions = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const monthOptions = [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 82 }, (_, i) => (currentYear - 18 - i).toString());

  // Check if step 1 form is valid
  const isStep1Valid = formData.fullName && 
                      formData.dayOfBirth && 
                      formData.monthOfBirth && 
                      formData.yearOfBirth &&
                      profileImagePreview;

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy mb-2">
              Build your traveler profile
            </h1>
            <p className="text-gray-600">
              Let's start with the basics
            </p>
          </div>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-xl text-navy">Step 1 of 2</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-6">
                {/* Profile Photo Upload */}
                <div className="text-center">
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    Profile Photo <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-col items-center">
                    {profileImagePreview ? (
                      <div className="relative">
                        <img
                          src={profileImagePreview}
                          alt="Profile preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setProfileImagePreview(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <Label
                      htmlFor="profile-image-upload"
                      className="mt-4 bg-navy text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-navy/90 transition-colors"
                    >
                      {profileImagePreview ? "Change Photo" : "Upload Photo"}
                    </Label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="fullName" className="text-base font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                    placeholder="Enter your full name"
                    className="mt-2 h-12 text-base"
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio" className="text-base font-medium text-gray-700">
                    What makes you feel alive? <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                    placeholder="Share what excites you about travel..."
                    rows={3}
                    className="mt-2 text-base"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dayOfBirth" className="text-sm text-gray-600">Day</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({...prev, dayOfBirth: value}))}>
                        <SelectTrigger className="mt-1 h-12">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {dayOptions.map((day) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="monthOfBirth" className="text-sm text-gray-600">Month</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({...prev, monthOfBirth: value}))}>
                        <SelectTrigger className="mt-1 h-12">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((month) => (
                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="yearOfBirth" className="text-sm text-gray-600">Year</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({...prev, yearOfBirth: value}))}>
                        <SelectTrigger className="mt-1 h-12">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Travel Reason */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    Reason for travel
                  </Label>
                  <RadioGroup 
                    value={formData.travelReason} 
                    onValueChange={(value) => setFormData(prev => ({...prev, travelReason: value}))}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="leisure" id="leisure" />
                      <Label htmlFor="leisure" className="font-medium cursor-pointer">Leisure</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="business" id="business" />
                      <Label htmlFor="business" className="font-medium cursor-pointer">Business</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit"
                  disabled={!isStep1Valid}
                  className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                    isStep1Valid
                      ? "bg-navy text-white hover:bg-navy/90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Tell us how you travel
          </h1>
          <p className="text-gray-600">
            Help us match you with compatible travelers
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-navy">Step 2 of 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Languages */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">
                  Languages you speak
                </Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {languageOptions.map((language) => (
                    <Badge
                      key={language}
                      variant={selectedLanguages.includes(language) ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1 transition-colors ${
                        selectedLanguages.includes(language)
                          ? "bg-navy text-white hover:bg-navy/90"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleLanguageToggle(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Add another language"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {selectedLanguages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected languages:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedLanguages.map((language) => (
                        <Badge
                          key={language}
                          variant="secondary"
                          className="pr-1"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => handleLanguageToggle(language)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Travel Traits */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">
                  Travel traits (select up to 5)
                </Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {traitOptions.map((trait) => (
                    <Badge
                      key={trait}
                      variant={selectedTraits.includes(trait) ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1 transition-colors ${
                        selectedTraits.includes(trait)
                          ? "bg-navy text-white hover:bg-navy/90"
                          : selectedTraits.length >= 5
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleTraitToggle(trait)}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
                
                {selectedTraits.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected traits ({selectedTraits.length}/5):</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTraits.map((trait) => (
                        <Badge
                          key={trait}
                          variant="secondary"
                          className="pr-1"
                        >
                          {trait}
                          <button
                            type="button"
                            onClick={() => handleTraitToggle(trait)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handleStep2Submit}
                  className="w-full bg-navy text-white hover:bg-navy/90 py-6 text-lg font-semibold"
                >
                  Create My Profile
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleSkipStep2}
                  className="w-full py-6 text-lg font-semibold"
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}