import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Plus, Info, ArrowRight, Camera } from "lucide-react";
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

export default function CreateProfileEnhanced() {
  console.log("🚀 Enhanced CreateProfile component loaded!");
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

  const handleTravelPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && formData.travelPhotos.length < 3) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...formData.travelPhotos, reader.result as string];
        handleInputChange('travelPhotos', newPhotos);
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

  const removeTravelPhoto = (index: number) => {
    const newPhotos = formData.travelPhotos.filter((_, i) => i !== index);
    handleInputChange('travelPhotos', newPhotos);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleStep2Submit = () => {
    // Navigate to dashboard after profile completion
    navigate("/dashboard");
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
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-navy mb-2">
                ✨ Step 1: Basic Details
              </h1>
              <p className="text-gray-600">
                Tell us about yourself and where you're from
              </p>
            </div>

            <form onSubmit={handleStep1Submit}>
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <Card className="p-6">
                  <div className="space-y-6">
                    
                    {/* Profile Photo Upload */}
                    <div>
                      <Label className="text-base font-semibold flex items-center gap-2">
                        Profile Photo Upload 
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2">
                        {formData.profilePhoto ? (
                          <div className="relative w-32 h-32 mx-auto">
                            <img 
                              src={formData.profilePhoto} 
                              alt="Profile preview" 
                              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleInputChange('profilePhoto', null)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition-colors">
                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Gender Toggle */}
                    <div>
                      <Label className="text-base font-semibold">Gender</Label>
                      <div className="mt-2 flex border rounded-lg p-1 bg-gray-100">
                        <button
                          type="button"
                          onClick={() => handleInputChange('gender', 'male')}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            formData.gender === 'male' 
                              ? 'bg-blue-500 text-white shadow-sm' 
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          ♂️ Male
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('gender', 'female')}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            formData.gender === 'female' 
                              ? 'bg-pink-500 text-white shadow-sm' 
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          ♀️ Female
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <Label htmlFor="fullName" className="text-base font-semibold flex items-center gap-2">
                        What's your name? 
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="e.g. Jane"
                        className="mt-2"
                        required
                      />
                    </div>

                    {/* What Makes You Alive */}
                    <div>
                      <Label htmlFor="whatMakesYouAlive" className="text-base font-semibold">
                        What makes you feel alive?
                      </Label>
                      <Textarea
                        id="whatMakesYouAlive"
                        value={formData.whatMakesYouAlive}
                        onChange={(e) => handleInputChange('whatMakesYouAlive', e.target.value)}
                        placeholder="e.g. chasing sunsets, street food tours, spontaneous hikes…"
                        className="mt-2 resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <Label className="text-base font-semibold flex items-center gap-2">
                        Date of Birth 
                        <span className="text-red-500">*</span>
                        <span className="text-sm text-gray-500">(Must be 18+)</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <Select onValueChange={(value) => handleInputChange('dayOfBirth', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map(day => (
                              <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select onValueChange={(value) => handleInputChange('monthOfBirth', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={month} value={(index + 1).toString()}>{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select onValueChange={(value) => handleInputChange('yearOfBirth', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Right Column */}
                <Card className="p-6">
                  <div className="space-y-6">
                    
                    {/* Birthplace */}
                    <div>
                      <Label htmlFor="birthplace" className="text-base font-semibold flex items-center gap-2">
                        Where were you born? 
                        <span className="text-red-500">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>City, Country format helps us match you better</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="birthplace"
                        value={formData.birthplace}
                        onChange={(e) => handleInputChange('birthplace', e.target.value)}
                        placeholder="e.g. London, United Kingdom"
                        className="mt-2"
                        required
                      />
                    </div>

                    {/* Current Home */}
                    <div>
                      <Label htmlFor="currentHome" className="text-base font-semibold flex items-center gap-2">
                        Where do you currently call home? 
                        <span className="text-red-500">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your current city helps with local connections</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="currentHome"
                        value={formData.currentHome}
                        onChange={(e) => handleInputChange('currentHome', e.target.value)}
                        placeholder="e.g. Berlin, Germany"
                        className="mt-2"
                        required
                      />
                    </div>

                    {/* Languages */}
                    <div>
                      <Label className="text-base font-semibold flex items-center gap-2">
                        Languages You Speak 
                        <span className="text-red-500">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Language compatibility helps with better matching</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      
                      <div className="mt-2 space-y-3">
                        {/* Selected Languages */}
                        {formData.languages.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.languages.map((language) => (
                              <Badge
                                key={language}
                                variant="secondary"
                                className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                {language}
                                <button
                                  type="button"
                                  onClick={() => handleLanguageToggle(language)}
                                  className="ml-2 hover:text-blue-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Language Selection */}
                        <div className="grid grid-cols-2 gap-2">
                          {preloadedLanguages.map((language) => (
                            <button
                              key={language}
                              type="button"
                              onClick={() => handleLanguageToggle(language)}
                              className={`p-2 text-sm border rounded-md text-left transition-colors ${
                                formData.languages.includes(language)
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add more…
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              value={customLanguage}
                              onChange={(e) => setCustomLanguage(e.target.value)}
                              placeholder="Enter language"
                              className="flex-1"
                              onKeyPress={(e) => e.key === 'Enter' && addCustomLanguage()}
                            />
                            <Button type="button" onClick={addCustomLanguage} size="sm">
                              Add
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
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
                </Card>
              </div>

              {/* Continue Button */}
              <div className="flex justify-center mt-8">
                <Button 
                  type="submit" 
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  disabled={!isStep1Valid()}
                >
                  Continue to Travel Experience
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Step 2: Travel Experience
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy mb-2">
              ✨ Step 2: Travel Experience
            </h1>
            <p className="text-gray-600">
              Share your travel stories and experiences
            </p>
          </div>

          <div className="space-y-8">
            
            {/* Part 1: Travel Experiences */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">✈️</span>
                <h2 className="text-xl font-semibold">Share your most meaningful travel experiences</h2>
              </div>
              
              <div className="space-y-6">
                {/* Influential Country */}
                <div>
                  <Label htmlFor="influentialCountry" className="text-base font-semibold flex items-center gap-2">
                    Which country has influenced you the most?
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Think about a place that changed your perspective</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="influentialCountry"
                    value={formData.influentialCountry}
                    onChange={(e) => handleInputChange('influentialCountry', e.target.value)}
                    placeholder="e.g. Japan, Peru, Morocco..."
                    className="mt-2"
                  />
                </div>

                {/* Country Impact Reason */}
                {formData.influentialCountry && (
                  <div>
                    <Label htmlFor="countryImpactReason" className="text-base font-semibold">
                      Why did this country impact you?
                    </Label>
                    <Textarea
                      id="countryImpactReason"
                      value={formData.countryImpactReason}
                      onChange={(e) => handleInputChange('countryImpactReason', e.target.value)}
                      placeholder="Share what made this place special to you..."
                      className="mt-2 resize-none"
                      rows={3}
                      maxLength={250}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.countryImpactReason.length}/250
                    </div>
                  </div>
                )}

                {/* Most Impactful Experience */}
                <div>
                  <Label htmlFor="mostImpactfulExperience" className="text-base font-semibold flex items-center gap-2">
                    What travel experience has impacted you most deeply? 
                    <span className="text-gray-500 text-sm">(Optional)</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tell your story - be expressive and authentic</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Textarea
                    id="mostImpactfulExperience"
                    value={formData.mostImpactfulExperience}
                    onChange={(e) => handleInputChange('mostImpactfulExperience', e.target.value)}
                    placeholder="Share a transformative moment, unexpected discovery, or meaningful connection from your travels..."
                    className="mt-2 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {/* Part 2: Travel Photos */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Camera className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Top 3 Travel Photos</h2>
                <span className="text-gray-500 text-sm">(Optional)</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This helps others see your travel vibe</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Photo Upload Slots */}
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="aspect-square">
                    {formData.travelPhotos[index] ? (
                      <div className="relative w-full h-full">
                        <img
                          src={formData.travelPhotos[index]}
                          alt={`Travel photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeTravelPhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500 text-center">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleTravelPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Complete Profile Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleStep2Submit}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg"
              >
                Complete Your Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}