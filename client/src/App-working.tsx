import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ArrowLeft } from "lucide-react";

function CreateProfile() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    travelReason: ""
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
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

  const isStep1Valid = formData.fullName && 
                      formData.dayOfBirth && 
                      formData.monthOfBirth && 
                      formData.yearOfBirth;

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

  // Landing page view
  if (!showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-navy mb-6">
                SplitStay
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Find compatible roommates and share hotel rooms to reduce costs while traveling solo
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-2">Find Compatible Roommates</h3>
                <p className="text-gray-600">Match with travelers who share your interests and travel style</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-2">Save Money</h3>
                <p className="text-gray-600">Split accommodation costs and travel more for less</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-2">Safe & Verified</h3>
                <p className="text-gray-600">All travelers are verified for your safety and peace of mind</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Building Your Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-[600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">
              Build your traveler profile
            </h1>
            <p className="text-gray-600 text-lg">
              Let's start with the basics
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-navy">Step 1 of 2</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-6">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Step 1
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">
            Tell us how you travel
          </h1>
          <p className="text-gray-600 text-lg">
            Help us match you with compatible travelers
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-navy">Step 2 of 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                  onClick={() => alert("Profile created! Welcome to SplitStay!")}
                  className="w-full bg-blue-900 text-white hover:bg-blue-800 py-6 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Create My Profile
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => alert("You can complete this later in your settings")}
                  className="w-full py-6 text-lg font-semibold border-2 hover:bg-gray-50"
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

// Simple router to handle URL-based routing
function App() {
  const path = window.location.pathname;
  
  // Always show the profile creation form directly
  return <CreateProfile />;
}

export default App;