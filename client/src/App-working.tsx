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
      <div className="min-h-screen bg-cream py-2">
        <div className="w-full text-center">
          
          {/* Logo */}
          <div className="mb-2">
            <h1 className="text-5xl md:text-6xl font-bold text-navy mb-6">
              SplitStay
            </h1>
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
            Share your accommodation. Save money. Meet travelers.
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-navy mb-8 leading-relaxed max-w-4xl mx-auto">
            You're early — and that's exactly the point. SplitStay is just opening up. The first few travelers shape what this becomes. Want to be one of them?
          </p>
          
          {/* User Path Selection Cards */}
          <div className="w-full mb-8 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 px-4">
              
              {/* Host Card */}
              <div 
                className="bg-white border-2 border-gray-200 hover:border-navy rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setShowForm(true)}
              >
                <h2 className="text-xl font-bold text-navy mb-3">
                  Have an accommodation to share?
                </h2>
                <p className="text-gray-600">
                  Already booked a place? Post your stay to find a roommate.
                </p>
              </div>
              
              {/* Guest Card */}
              <div 
                className="bg-white border-2 border-gray-200 hover:border-navy rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setShowForm(true)}
              >
                <h2 className="text-xl font-bold text-navy mb-3">
                  Looking to join someone else's trip?
                </h2>
                <p className="text-gray-600">
                  Browse open stays and message the traveler.
                </p>
              </div>
              
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mb-4">
            <Button 
              onClick={() => setShowForm(true)}
              size="lg"
              className="bg-navy text-white hover:bg-navy/90 text-lg px-8 py-6 rounded-lg font-semibold transition-all duration-300"
            >
              Create My Profile
            </Button>
          </div>
          
          {/* Benefits Section */}
          <div className="mb-16 max-w-6xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-navy mb-8 text-center">
              Why travelers love SplitStay
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Cost Savings Card */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-navy mb-3">Cost Savings</h4>
                <p className="text-gray-600 leading-relaxed">
                  Save up to 50% on your accommodation costs by sharing with verified travelers
                </p>
              </div>

              {/* Flexible Accommodations Card */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-navy mb-3">Flexible Options</h4>
                <p className="text-gray-600 leading-relaxed">
                  Split hotel rooms or full apartments at any destination
                </p>
              </div>

              {/* Meaningful Matches Card */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-navy mb-3">Verified Matches</h4>
                <p className="text-gray-600 leading-relaxed">
                  Connect with verified travelers for meaningful and safe experiences
                </p>
              </div>

            </div>
          </div>
          
          {/* Badges section */}
          <div className="mb-16 max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-navy mb-2">
                Earn your badge. Join the SplitStay movement.
              </h3>
              <p className="text-gray-600">
                Celebrate your contribution and unlock early perks with SplitStay.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ambassador Badge */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-xl hover:scale-[1.02] hover:border-green-300 transition-all duration-300">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-extrabold text-navy mb-3">Ambassador</h4>
                <p className="text-gray-600 mb-4">
                  Invited 3+ friends to SplitStay — help the community grow
                </p>
                {/* Progress Indicator */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full w-2/3"></div>
                </div>
                <p className="text-sm text-gray-500">Invited 2 of 3 friends</p>
              </div>
              
              {/* Trip Host Badge */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-xl hover:scale-[1.02] hover:border-blue-300 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                  </svg>
                </div>
                <h4 className="text-2xl font-extrabold text-navy mb-3">Trip Host</h4>
                <p className="text-gray-600 mb-4">
                  Post a stay and match with at least 1 traveler to earn this badge
                </p>
                {/* Progress Indicator */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                </div>
                <p className="text-sm text-gray-500">1 of 1 successful match</p>
              </div>
              
              {/* Pioneer Badge */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-xl hover:scale-[1.02] hover:border-purple-300 transition-all duration-300">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-extrabold text-navy mb-3">Pioneer</h4>
                <p className="text-gray-600 mb-4">
                  One of the first 100 active users on the platform
                </p>
                {/* Progress Indicator */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-purple-500 h-2 rounded-full w-4/5"></div>
                </div>
                <p className="text-sm text-gray-500">User #47 of 100</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="text-center text-gray-500 py-8">
            <p>© 2025 SplitStay · Built with love by solo travelers</p>
          </footer>
          
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