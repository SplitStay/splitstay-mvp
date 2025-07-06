import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

function CreateProfile() {
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[600px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Tell us how you travel
          </h1>
          <p className="text-gray-600">
            Help us match you with compatible travelers
          </p>
        </div>

        <Card className="shadow-md border-0 bg-white">
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
                  onClick={() => alert("Profile created! (This would navigate to next page)")}
                  className="w-full bg-blue-900 text-white hover:bg-blue-800 py-6 text-lg font-semibold"
                >
                  Create My Profile
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => alert("Skipped! (This would navigate to next page)")}
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

// Simple router to handle URL-based routing
function App() {
  const path = window.location.pathname;
  
  if (path === "/create-profile") {
    return <CreateProfile />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-navy mb-4">SplitStay</h1>
        <p className="text-xl text-gray-600 mb-8">Find compatible roommates and share hotel rooms</p>
        <div className="space-y-4">
          <a href="/create-profile" className="block bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
            Go to Create Profile
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;