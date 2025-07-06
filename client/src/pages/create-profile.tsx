import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Two-step form schemas
const step1Schema = z.object({
  fullName: z.string().min(1, "Name is required"),
  profileImage: z.any().optional(),
  bio: z.string().optional(),
  dayOfBirth: z.string().min(1, "Day is required"),
  monthOfBirth: z.string().min(1, "Month is required"),
  yearOfBirth: z.string().min(1, "Year is required"),
  travelReason: z.enum(["leisure", "business"], {
    required_error: "Please select a reason for travel",
  }),
}).refine((data) => {
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(data.yearOfBirth);
  const age = currentYear - birthYear;
  return age >= 18;
}, {
  message: "You must be 18 or older to use SplitStay",
  path: ["yearOfBirth"],
});

const step2Schema = z.object({
  languages: z.array(z.string()).min(1, "At least one language is required"),
  travelTraits: z.array(z.string()).max(5, "You can select up to 5 traits"),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

export default function CreateProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  // Check if we're in edit mode and get user path
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.get('mode') === 'edit';
  const userPath = urlParams.get('path'); // 'host' or 'guest'

  const step1Form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: "",
      bio: "",
      dayOfBirth: "",
      monthOfBirth: "",
      yearOfBirth: "",
      travelReason: undefined,
    },
  });

  const step2Form = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      languages: [],
      travelTraits: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile created successfully!",
        description: "Welcome to SplitStay!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      // Navigate based on user path
      if (userPath === "host") {
        navigate("/create-trip");
      } else if (userPath === "guest") {
        navigate("/browse-trips");
      } else {
        navigate("/find-roommate");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStep1Submit = (data: Step1Form) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Form) => {
    if (!step1Data) return;
    
    // Combine both steps data
    const combinedData = {
      ...step1Data,
      ...data,
      languages: selectedLanguages,
      travelTraits: selectedTraits,
      dateOfBirth: `${step1Data.yearOfBirth}-${step1Data.monthOfBirth.padStart(2, '0')}-${step1Data.dayOfBirth.padStart(2, '0')}`,
    };
    
    mutation.mutate(combinedData);
  };

  const handleSkipStep2 = () => {
    if (!step1Data) return;
    
    const combinedData = {
      ...step1Data,
      languages: ["English"], // Default language
      travelTraits: [], // Empty traits
      dateOfBirth: `${step1Data.yearOfBirth}-${step1Data.monthOfBirth.padStart(2, '0')}-${step1Data.dayOfBirth.padStart(2, '0')}`,
    };
    
    mutation.mutate(combinedData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      step1Form.setValue("profileImage", file);
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

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  
  // Generate month options
  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  
  // Generate year options (current year - 100 to current year - 18)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 82 }, (_, i) => (currentYear - 18 - i).toString());

  // Check if step 1 form is valid for enabling Next button
  const isStep1Valid = step1Form.watch("fullName") && 
                      step1Form.watch("dayOfBirth") && 
                      step1Form.watch("monthOfBirth") && 
                      step1Form.watch("yearOfBirth") &&
                      profileImagePreview; // Profile image is required

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
              <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
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
                          onClick={() => {
                            setProfileImagePreview(null);
                            step1Form.setValue("profileImage", undefined);
                          }}
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
                    {...step1Form.register("fullName")}
                    placeholder="Enter your full name"
                    className="mt-2 h-12 text-base"
                  />
                  {step1Form.formState.errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {step1Form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* What makes you feel alive */}
                <div>
                  <Label htmlFor="bio" className="text-base font-medium text-gray-700">
                    What makes you feel alive? <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="bio"
                    {...step1Form.register("bio")}
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
                      <Select onValueChange={(value) => step1Form.setValue("dayOfBirth", value)}>
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
                      <Select onValueChange={(value) => step1Form.setValue("monthOfBirth", value)}>
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
                      <Select onValueChange={(value) => step1Form.setValue("yearOfBirth", value)}>
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
                  {step1Form.formState.errors.dayOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {step1Form.formState.errors.dayOfBirth.message}
                    </p>
                  )}
                  {step1Form.formState.errors.monthOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {step1Form.formState.errors.monthOfBirth.message}
                    </p>
                  )}
                  {step1Form.formState.errors.yearOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {step1Form.formState.errors.yearOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Reason for Travel */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    Reason for travel
                  </Label>
                  <RadioGroup 
                    value={step1Form.watch("travelReason")} 
                    onValueChange={(value) => step1Form.setValue("travelReason", value as "leisure" | "business")}
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
                  {step1Form.formState.errors.travelReason && (
                    <p className="text-red-500 text-sm mt-1">
                      {step1Form.formState.errors.travelReason.message}
                    </p>
                  )}
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
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
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
                
                {/* Custom Language Input */}
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
                
                {/* Selected Languages */}
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
                
                {/* Selected Traits */}
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
                  type="submit"
                  className="w-full bg-navy text-white hover:bg-navy/90 py-6 text-lg font-semibold"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating Profile..." : "Create My Profile"}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleSkipStep2}
                  className="w-full py-6 text-lg font-semibold"
                  disabled={mutation.isPending}
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}