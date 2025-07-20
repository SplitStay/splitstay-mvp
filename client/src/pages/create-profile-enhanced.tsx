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
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-[1200px] mx-auto">
            
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
                <div className="grid lg:grid-cols-2 gap-8 p-8">
                  
                  {/* Left Column */}
                  <div className="space-y-8">
                    
                    {/* Profile Photo Upload */}
                    <div>
                      <Label className="text-lg font-semibold text-gray-900 block mb-4">
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
                      <Label className="text-lg font-semibold text-gray-900 block mb-4">Gender</Label>
                      <div className="flex border-2 border-gray-200 rounded-xl p-1.5 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => handleInputChange('gender', 'male')}
                          className={`flex-1 py-3 px-6 rounded-lg text-base font-semibold transition-all duration-200 ${
                            formData.gender === 'male' 
                              ? 'bg-blue-600 text-white shadow-md border-2 border-blue-600' 
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
                              ? 'bg-pink-600 text-white shadow-md border-2 border-pink-600' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <Label htmlFor="fullName" className="text-lg font-semibold text-gray-900 block mb-4">
                        What's your name?
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="e.g. Jane"
                        className="h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        required
                      />
                    </div>

                    {/* What Makes You Alive */}
                    <div>
                      <Label htmlFor="whatMakesYouAlive" className="text-lg font-semibold text-gray-900 block mb-4">
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
                      <Label className="text-lg font-semibold text-gray-900 block mb-4">
                        Date of Birth
                      </Label>
                      <div className="flex gap-4 mb-2">
                        <Select onValueChange={(value) => handleInputChange('dayOfBirth', value)}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-base">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map(day => (
                              <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select onValueChange={(value) => handleInputChange('monthOfBirth', value)}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-base">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={month} value={(index + 1).toString()}>{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select onValueChange={(value) => handleInputChange('yearOfBirth', value)}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-base">
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
                  <div className="space-y-8">
                    
                    {/* Birthplace */}
                    <div>
                      <Label htmlFor="birthplace" className="text-lg font-semibold text-gray-900 block mb-4">
                        Where were you born?
                      </Label>
                      <Input
                        id="birthplace"
                        value={formData.birthplace}
                        onChange={(e) => handleInputChange('birthplace', e.target.value)}
                        placeholder="e.g. London, United Kingdom"
                        className="h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Current Home */}
                    <div>
                      <Label htmlFor="currentHome" className="text-lg font-semibold text-gray-900 block mb-4">
                        Where do you currently call home?
                      </Label>
                      <Input
                        id="currentHome"
                        value={formData.currentHome}
                        onChange={(e) => handleInputChange('currentHome', e.target.value)}
                        placeholder="e.g. Berlin, Germany"
                        className="h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Languages */}
                    <div>
                      <Label className="text-lg font-semibold text-gray-900 block mb-4">
                        Languages You Speak
                      </Label>
                      
                      <div className="space-y-4">
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
                <div className="flex justify-center mt-12">
                  <Button 
                    type="submit" 
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
                    disabled={!isStep1Valid()}
                  >
                    Continue to Travel Experience
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
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