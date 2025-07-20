import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Plus, ArrowRight, Camera } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormData {
  // Step 1 - Basic Details
  profilePhoto: string | null;
  gender: string;
  fullName: string;
  whatMakesYouAlive: string;
  dayOfBirth: string;
  monthOfBirth: string;
  yearOfBirth: string;
  birthplace: string;
  currentHome: string;
  languages: string[];
  
  // Step 2 - Travel Experience
  influentialCountry: string;
  countryImpactReason: string;
  mostImpactfulExperience: string;
  travelPhotos: string[];
}

const preloadedLanguages = [
  "English", "Spanish", "French", "German", "Dutch", "Italian", 
  "Portuguese", "Chinese (Mandarin)", "Japanese", "Korean"
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 18 - i);

export default function CreateProfileClean() {
  console.log("🚀 Clean CreateProfile component loaded!");
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [customLanguage, setCustomLanguage] = useState("");
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    profilePhoto: null,
    gender: "",
    fullName: "",
    whatMakesYouAlive: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    birthplace: "",
    currentHome: "",
    languages: [],
    influentialCountry: "",
    countryImpactReason: "",
    mostImpactfulExperience: "",
    travelPhotos: []
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('profilePhoto', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageToggle = (language: string) => {
    const newLanguages = formData.languages.includes(language)
      ? formData.languages.filter(l => l !== language)
      : [...formData.languages, language];
    handleInputChange('languages', newLanguages);
  };

  const addCustomLanguage = () => {
    if (customLanguage.trim() && !formData.languages.includes(customLanguage.trim())) {
      handleInputChange('languages', [...formData.languages, customLanguage.trim()]);
      setCustomLanguage("");
      setShowAddLanguage(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const isStep1Valid = () => {
    return formData.profilePhoto && formData.gender && formData.fullName && 
           formData.dayOfBirth && formData.monthOfBirth && formData.yearOfBirth &&
           formData.birthplace && formData.currentHome && formData.languages.length > 0;
  };

  // Step 1: Basic Details
  if (currentStep === 1) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-[1400px] mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Step 1: Basic Details
              </h1>
              <p className="text-lg text-gray-600">
                Tell us about yourself and where you're from
              </p>
            </div>

            <form onSubmit={handleStep1Submit}>
              <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="p-16">
                  <div className="grid lg:grid-cols-2 gap-24">
                    
                    {/* Left Column */}
                    <div className="space-y-10">
                      
                      {/* Profile Photo Upload */}
                      <div>
                        <Label className="text-xl font-semibold text-gray-900 block mb-6">
                          Upload Photo
                        </Label>
                        <div className="flex justify-center">
                          {formData.profilePhoto ? (
                            <div className="relative">
                              <img 
                                src={formData.profilePhoto} 
                                alt="Profile preview" 
                                className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-md"
                              />
                              <button
                                type="button"
                                onClick={() => handleInputChange('profilePhoto', null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
                                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
                                  <span className="text-base font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Upload Photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                  />
                                </label>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This will be shown on your public traveler profile</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      {/* Gender Toggle */}
                      <div>
                        <Label className="text-xl font-semibold text-gray-900 block mb-6">Gender</Label>
                        <div className="flex border-2 border-gray-200 rounded-xl p-1 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => handleInputChange('gender', 'male')}
                            className={`flex-1 py-3 px-6 rounded-lg text-base font-semibold transition-all duration-200 ${
                              formData.gender === 'male' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            Male
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange('gender', 'female')}
                            className={`flex-1 py-3 px-6 rounded-lg text-base font-semibold transition-all duration-200 ${
                              formData.gender === 'female' 
                                ? 'bg-pink-600 text-white shadow-md' 
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            Female
                          </button>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <Label htmlFor="fullName" className="text-xl font-semibold text-gray-900 block mb-6">
                          What's your name?
                        </Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="e.g. Jane"
                          className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          required
                        />
                      </div>

                      {/* What Makes You Alive */}
                      <div>
                        <Label htmlFor="whatMakesYouAlive" className="text-xl font-semibold text-gray-900 block mb-6">
                          What makes you feel alive?
                        </Label>
                        <Textarea
                          id="whatMakesYouAlive"
                          value={formData.whatMakesYouAlive}
                          onChange={(e) => handleInputChange('whatMakesYouAlive', e.target.value)}
                          placeholder="e.g. chasing sunsets, street food tours, spontaneous hikes…"
                          className="resize-none text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          rows={3}
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <Label className="text-xl font-semibold text-gray-900 block mb-6">
                          Date of Birth
                        </Label>
                        <div className="flex gap-4 mb-2">
                          <Select onValueChange={(value) => handleInputChange('dayOfBirth', value)}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-base">
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent>
                              {days.map(day => (
                                <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select onValueChange={(value) => handleInputChange('monthOfBirth', value)}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-base">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month, index) => (
                                <SelectItem key={month} value={(index + 1).toString()}>{month}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select onValueChange={(value) => handleInputChange('yearOfBirth', value)}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-base">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm text-red-600 font-medium">* Must be 18+</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-10">
                      
                      {/* Birthplace */}
                      <div>
                        <Label htmlFor="birthplace" className="text-xl font-semibold text-gray-900 block mb-6">
                          Where were you born?
                        </Label>
                        <Input
                          id="birthplace"
                          value={formData.birthplace}
                          onChange={(e) => handleInputChange('birthplace', e.target.value)}
                          placeholder="e.g. London, United Kingdom"
                          className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          required
                        />
                      </div>

                      {/* Current Home */}
                      <div>
                        <Label htmlFor="currentHome" className="text-xl font-semibold text-gray-900 block mb-6">
                          Where do you currently call home?
                        </Label>
                        <Input
                          id="currentHome"
                          value={formData.currentHome}
                          onChange={(e) => handleInputChange('currentHome', e.target.value)}
                          placeholder="e.g. Berlin, Germany"
                          className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          required
                        />
                      </div>

                      {/* Languages */}
                      <div>
                        <Label className="text-xl font-semibold text-gray-900 block mb-6">
                          Languages You Speak
                        </Label>
                        
                        <div className="space-y-6">
                          {/* Selected Languages */}
                          {formData.languages.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {formData.languages.map((language) => (
                                <Badge
                                  key={language}
                                  variant="secondary"
                                  className="px-4 py-2 text-base bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full border border-blue-200"
                                >
                                  {language}
                                  <button
                                    type="button"
                                    onClick={() => handleLanguageToggle(language)}
                                    className="ml-2 hover:text-blue-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Language Selection */}
                          <div className="flex flex-wrap gap-3">
                            {preloadedLanguages.map((language) => (
                              <button
                                key={language}
                                type="button"
                                onClick={() => handleLanguageToggle(language)}
                                className={`px-4 py-2 text-base border-2 rounded-full transition-all duration-200 ${
                                  formData.languages.includes(language)
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {language}
                              </button>
                            ))}
                          </div>
                          
                          {/* Add Custom Language */}
                          {!showAddLanguage ? (
                            <button
                              type="button"
                              onClick={() => setShowAddLanguage(true)}
                              className="text-blue-600 hover:text-blue-700 text-base font-semibold flex items-center gap-2 transition-colors"
                            >
                              <Plus className="w-5 h-5" />
                              Add more…
                            </button>
                          ) : (
                            <div className="flex gap-3">
                              <Input
                                value={customLanguage}
                                onChange={(e) => setCustomLanguage(e.target.value)}
                                placeholder="Enter language"
                                className="flex-1 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && addCustomLanguage()}
                              />
                              <Button type="button" onClick={addCustomLanguage} className="h-12 px-6 bg-blue-600 hover:bg-blue-700 rounded-xl">
                                Add
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="h-12 px-6 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                                onClick={() => {
                                  setShowAddLanguage(false);
                                  setCustomLanguage("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Continue Button */}
                  <div className="flex justify-center mt-16">
                    <Button 
                      type="submit" 
                      className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
                      disabled={!isStep1Valid()}
                    >
                      Continue to Travel Experience
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Step 2 would go here (keeping it simple for now)
  return <div>Step 2 placeholder</div>;
}