import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

export default function CreateProfile() {
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
    travelReason: "",
    gender: "",
    birthplace: "",
    currentHome: "",
    influentialCountry: "",
    countryImpactReason: "",
    mostImpactfulExperience: ""
  });
  
  // Additional state for travel photos and location search
  const [travelPhotos, setTravelPhotos] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState<{
    birthplace: boolean;
    currentHome: boolean;
    influentialCountry: boolean;
  }>({
    birthplace: false,
    currentHome: false,
    influentialCountry: false
  });

  // Check user path from URL
  const urlParams = new URLSearchParams(window.location.search);
  const userPath = urlParams.get('path');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleStep2Submit = () => {
    if (userPath === "host") {
      navigate("/create-trip");
    } else if (userPath === "guest") {
      navigate("/browse-trips");
    } else {
      navigate("/find-roommate");
    }
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

  // Location search function
  const searchLocations = async (query: string, field: 'birthplace' | 'currentHome' | 'influentialCountry') => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(prev => ({ ...prev, [field]: false }));
      return;
    }

    try {
      // Use a simple list of countries and major cities for autocomplete
      const locations = [
        'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 
        'Netherlands', 'Australia', 'New Zealand', 'Japan', 'Singapore', 'Thailand', 
        'Philippines', 'Malaysia', 'Indonesia', 'Vietnam', 'South Korea', 'India', 'China',
        'Brazil', 'Argentina', 'Mexico', 'Colombia', 'Chile', 'South Africa', 'Egypt',
        'New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Bangkok', 'Singapore', 'Berlin',
        'Amsterdam', 'Barcelona', 'Rome', 'Vienna', 'Prague', 'Copenhagen', 'Stockholm'
      ];
      
      const filtered = locations.filter(location => 
        location.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(prev => ({ ...prev, [field]: true }));
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  // Handle travel photo upload
  const handleTravelPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      if (travelPhotos.length < 3) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTravelPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Remove travel photo
  const removeTravelPhoto = (index: number) => {
    setTravelPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Handle input change with proper typing
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Form validation for each step
  const isStep1Valid = formData.fullName && 
                      formData.dayOfBirth && 
                      formData.monthOfBirth && 
                      formData.yearOfBirth &&
                      formData.gender &&
                      formData.birthplace &&
                      formData.currentHome;

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

  // Generate date options
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

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy mb-2">
              Build your traveler profile
            </h1>
            <p className="text-gray-600">
              Let's start with the basics
            </p>
          </div>

          <Card className="shadow-md border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-xl text-navy">Step 1 of 2</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-6">
                
                {/* 1️⃣ Gender Section */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-gray-700">
                    What is your gender? *
                  </Label>
                  <RadioGroup 
                    value={formData.gender} 
                    onValueChange={(value) => handleInputChange('gender', value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
                {/* Profile Photo Upload - Optional */}
                <div className="text-center">
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    Profile Photo
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
                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <div className="flex items-center gap-3 mt-4">
                      <Label
                        htmlFor="profile-image-upload"
                        className="bg-blue-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors text-sm"
                      >
                        {profileImagePreview ? "Change Photo" : "Upload Photo"}
                      </Label>
                      <button type="button" className="text-sm text-gray-500 hover:text-gray-700 underline">
                        Add later
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name - Required */}
                <div>
                  <Label htmlFor="fullName" className="text-base font-medium text-gray-700">
                    How should travelers call you? <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                    placeholder="e.g. Jane"
                    className="mt-2 h-12"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>

                {/* Bio - Optional */}
                <div>
                  <Label htmlFor="bio" className="text-base font-medium text-gray-700">
                    What makes you feel alive? <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                    placeholder="e.g. chasing sunsets, street food tours, spontaneous hikes…"
                    rows={3}
                    className="mt-2"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Date of Birth - Required */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="dayOfBirth" className="text-sm text-gray-600">Day</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({...prev, dayOfBirth: value}))}>
                        <SelectTrigger className="mt-1 h-10">
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
                        <SelectTrigger className="mt-1 h-10">
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
                        <SelectTrigger className="mt-1 h-10">
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
                  <p className="text-sm text-gray-500 mt-2">Must be at least 18 years old</p>
                </div>

                {/* 🌍 2️⃣ Location Questions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">🌍 Location</h3>
                  
                  {/* Where were you born? */}
                  <div className="relative">
                    <Label htmlFor="birthplace" className="text-base font-medium text-gray-700">
                      Where were you born? *
                    </Label>
                    <Input
                      id="birthplace"
                      value={formData.birthplace}
                      onChange={(e) => {
                        handleInputChange('birthplace', e.target.value);
                        searchLocations(e.target.value, 'birthplace');
                      }}
                      placeholder="e.g. New York, United States"
                      className="mt-2 h-12"
                      style={{ fontSize: '16px' }}
                      required
                    />
                    {showLocationSuggestions.birthplace && locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {locationSuggestions.map((location, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              handleInputChange('birthplace', location);
                              setShowLocationSuggestions(prev => ({ ...prev, birthplace: false }));
                            }}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Where do you currently call home? */}
                  <div className="relative">
                    <Label htmlFor="currentHome" className="text-base font-medium text-gray-700">
                      Where do you currently call home? *
                    </Label>
                    <Input
                      id="currentHome"
                      value={formData.currentHome}
                      onChange={(e) => {
                        handleInputChange('currentHome', e.target.value);
                        searchLocations(e.target.value, 'currentHome');
                      }}
                      placeholder="e.g. London, United Kingdom"
                      className="mt-2 h-12"
                      style={{ fontSize: '16px' }}
                      required
                    />
                    {showLocationSuggestions.currentHome && locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {locationSuggestions.map((location, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              handleInputChange('currentHome', location);
                              setShowLocationSuggestions(prev => ({ ...prev, currentHome: false }));
                            }}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Travel Reason */}
                <div>
                  <Label className="text-base font-medium text-gray-700 mb-3 block">
                    What best describes this trip?
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
                      ? "bg-blue-900 text-white hover:bg-blue-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  style={{ fontSize: '16px' }}
                >
                  Continue to Step 2
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2 - Travel Experiences
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[600px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Share your travel story
          </h1>
          <p className="text-gray-600">
            Help us connect you with compatible travel companions
          </p>
        </div>

        <Card className="shadow-md border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-navy">Step 2 of 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">

              {/* ✈️ Travel Experience Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800">✈️ Travel Experience</h3>
                
                {/* Which country has been most influential in shaping who you are? */}
                <div className="relative">
                  <Label htmlFor="influentialCountry" className="text-base font-medium text-gray-700">
                    Which country has been most influential in shaping who you are?
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">This could be where you lived, studied, worked, or had a life-changing experience</p>
                  <Input
                    id="influentialCountry"
                    value={formData.influentialCountry}
                    onChange={(e) => {
                      handleInputChange('influentialCountry', e.target.value);
                      searchLocations(e.target.value, 'influentialCountry');
                    }}
                    placeholder="e.g. Japan, France, Brazil..."
                    className="mt-2 h-12"
                    style={{ fontSize: '16px' }}
                  />
                  {showLocationSuggestions.influentialCountry && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {locationSuggestions.map((location, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            handleInputChange('influentialCountry', location);
                            setShowLocationSuggestions(prev => ({ ...prev, influentialCountry: false }));
                          }}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* How did this country impact you? */}
                <div>
                  <Label htmlFor="countryImpactReason" className="text-base font-medium text-gray-700">
                    How did this country impact you?
                  </Label>
                  <Textarea
                    id="countryImpactReason"
                    value={formData.countryImpactReason}
                    onChange={(e) => handleInputChange('countryImpactReason', e.target.value)}
                    placeholder="e.g. Living in Tokyo for 2 years taught me the beauty of mindfulness and attention to detail. I learned to appreciate slow mornings and the art of making perfect ramen..."
                    rows={4}
                    className="mt-2"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* What's been your most impactful travel experience? */}
                <div>
                  <Label htmlFor="mostImpactfulExperience" className="text-base font-medium text-gray-700">
                    What's been your most impactful travel experience?
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">Share a moment that changed your perspective, taught you something important, or created a lasting memory</p>
                  <Textarea
                    id="mostImpactfulExperience"
                    value={formData.mostImpactfulExperience}
                    onChange={(e) => handleInputChange('mostImpactfulExperience', e.target.value)}
                    placeholder="e.g. Getting lost in the backstreets of Marrakech led me to a family dinner where I learned that kindness transcends language barriers. That night I realized travel is about human connections, not destinations..."
                    rows={5}
                    className="mt-2"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* 📸 Travel Photos Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">📸 Travel Photos</h3>
                <div>
                  <Label className="text-base font-medium text-gray-700">
                    Share up to 3 travel photos <span className="text-gray-400">(optional)</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-3">Help others see the world through your eyes</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {travelPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={photo}
                          alt={`Travel photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeTravelPhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {travelPhotos.length < 3 && (
                      <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleTravelPhotoUpload}
                          className="hidden"
                          id="travel-photos-upload"
                        />
                        <Label
                          htmlFor="travel-photos-upload"
                          className="cursor-pointer text-center p-4"
                        >
                          <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">Add Photo</span>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                          ? "bg-blue-900 text-white hover:bg-blue-800"
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
                        <Badge key={language} variant="secondary" className="pr-1">
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
                          ? "bg-blue-900 text-white hover:bg-blue-800"
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
                        <Badge key={trait} variant="secondary" className="pr-1">
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

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handleStep2Submit}
                  className="w-full bg-blue-900 text-white hover:bg-blue-800 py-6 text-lg font-semibold"
                >
                  Create My Profile
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleStep2Submit}
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