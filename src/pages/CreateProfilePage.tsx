import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [customCountry, setCustomCountry] = useState("");
  const [travelPhotos, setTravelPhotos] = useState<(string | null)[]>([null, null, null]);
  const [travelPhotosPreviews, setTravelPhotosPreviews] = useState<(string | null)[]>([null, null, null]);
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    location: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    travelReason: ""
  });

  const { user, loading } = useAuth();
  const { refetch: refetchUser } = useUser();
  const updateUserMutation = useUpdateUser();

  // Check user path from URL
  const urlParams = new URLSearchParams(window.location.search);
  const userPath = urlParams.get('path');

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Function to upload image to Supabase storage
  const uploadImageToStorage = async (file: File, bucket: string = 'userimages'): Promise<string | null> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleStep2Submit = async () => {
    if (!user) {
      toast.error("You must be logged in to create a profile");
      return;
    }

    setIsLoading(true);
    
    try {
      // Update user profile with all the collected data
      await updateUserMutation.mutateAsync({
        fullName: formData.fullName,
        bio: formData.bio || null,
        location: formData.location || null,
        dayOfBirth: formData.dayOfBirth ? parseInt(formData.dayOfBirth) : null,
        monthOfBirth: formData.monthOfBirth ? parseInt(formData.monthOfBirth) : null,
        yearOfBirth: formData.yearOfBirth ? parseInt(formData.yearOfBirth) : null,
        languages: selectedLanguages.length > 0 ? selectedLanguages : null,
        travelTraits: selectedTraits.length > 0 ? selectedTraits : null,
        countriesTraveled: selectedCountries.length > 0 ? selectedCountries : null,
        travelPhotos: travelPhotos.filter(photo => photo !== null).length > 0 ? travelPhotos.filter(photo => photo !== null) : null,
        imageUrl: profileImageUrl || null, // Use the storage URL instead of base64 preview
        profileCreated: true, // Set this to true after successful submission
      });

      // Refetch user data to ensure we have the latest information
      await refetchUser();

      toast.success("Profile created successfully!");

      // Always navigate to dashboard after profile creation
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase storage
    const uploadedUrl = await uploadImageToStorage(file, 'userimages');
    if (uploadedUrl) {
      setProfileImageUrl(uploadedUrl);
      toast.success('Image uploaded successfully!');
    }
    
    setIsUploading(false);
  };

  const handleTravelPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Get the index from the input id
    const inputId = event.target.id;
    const index = parseInt(inputId.split('-')[2]);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPhotoIndex(index);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...travelPhotosPreviews];
      newPreviews[index] = reader.result as string;
      setTravelPhotosPreviews(newPreviews);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase storage
    const uploadedUrl = await uploadImageToStorage(file, 'travel-photos');
    if (uploadedUrl) {
      const newPhotos = [...travelPhotos];
      newPhotos[index] = uploadedUrl;
      setTravelPhotos(newPhotos);
      toast.success('Travel photo uploaded successfully!');
    }
    
    setUploadingPhotoIndex(null);
    
    // Reset the input
    event.target.value = '';
  };

  const removeTravelPhoto = (index: number) => {
    const newPhotos = [...travelPhotos];
    const newPreviews = [...travelPhotosPreviews];
    newPhotos[index] = null;
    newPreviews[index] = null;
    setTravelPhotos(newPhotos);
    setTravelPhotosPreviews(newPreviews);
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

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleAddCustomCountry = () => {
    if (customCountry.trim() && !selectedCountries.includes(customCountry.trim())) {
      setSelectedCountries(prev => [...prev, customCountry.trim()]);
      setCustomCountry("");
    }
  };

  const handleLanguageDropdownChange = (language: string) => {
    if (language && !selectedLanguages.includes(language)) {
      setSelectedLanguages(prev => [...prev, language]);
    }
  };

  const handleCountryDropdownChange = (country: string) => {
    if (country && !selectedCountries.includes(country)) {
      setSelectedCountries(prev => [...prev, country]);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  // Form validation: only name and date required
  const isStep1Valid = formData.fullName && 
                      formData.dayOfBirth && 
                      formData.monthOfBirth && 
                      formData.yearOfBirth;

  // Popular languages to show as clickable badges
  const popularLanguages = [
    "English", "Spanish", "French", "German", "Dutch", "Italian", "Portuguese",
    "Chinese (Mandarin)", "Japanese", "Korean"
  ];

  // All languages for the dropdown
  const allLanguages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese (Mandarin)", 
    "Japanese", "Korean", "Arabic", "Russian", "Hindi", "Dutch", "Swedish", "Norwegian", 
    "Danish", "Finnish", "Polish", "Czech", "Hungarian", "Romanian", "Bulgarian", "Croatian", 
    "Serbian", "Greek", "Turkish", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay", 
    "Tagalog", "Swahili", "Yoruba", "Zulu", "Afrikaans", "Amharic", "Bengali", "Gujarati", 
    "Punjabi", "Tamil", "Telugu", "Urdu", "Persian (Farsi)", "Pashto", "Kurdish", "Uzbek", 
    "Kazakh", "Mongolian", "Tibetan", "Burmese", "Khmer", "Lao", "Sinhala", "Nepali"
  ];

  const traitOptions = [
    "Early Bird", "Night Owl", "Adventurous", "Relaxed", "Social", "Quiet", 
    "Foodie", "Fitness Enthusiast", "Culture Lover", "Nature Lover", 
    "Tech Savvy", "Minimalist", "Photographer", "Music Lover", "Budget Traveler",
    "Luxury Traveler", "Backpacker", "City Explorer", "Beach Lover", "Mountain Hiker"
  ];

  // Popular countries to show as clickable badges
  const popularCountries = [
    "United States", "France", "Spain", "Japan", "Thailand", "Netherlands", 
    "Germany", "Italy", "United Kingdom", "Australia"
  ];

  // All countries for the dropdown
  const allCountries = [
    "United States", "France", "Spain", "Thailand", "Japan", "United Kingdom", "Germany", 
    "Italy", "Australia", "Canada", "Netherlands", "Switzerland", "Greece", "Portugal", 
    "South Korea", "Singapore", "New Zealand", "Sweden", "Norway", "Denmark", "Belgium", 
    "Austria", "Ireland", "Czech Republic", "Croatia", "Mexico", "Brazil", "Argentina", 
    "Chile", "Peru", "Colombia", "Costa Rica", "India", "China", "Indonesia", "Malaysia", 
    "Philippines", "Vietnam", "Turkey", "Egypt", "Morocco", "South Africa", "Kenya", 
    "Israel", "Jordan", "Russia", "Poland", "Hungary", "Romania", "Bulgaria", "Serbia", 
    "Bosnia and Herzegovina", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", 
    "Finland", "Iceland", "Luxembourg", "Ukraine", "Belarus", "Georgia", "Armenia", 
    "Azerbaijan", "Kazakhstan", "Uzbek", "Mongolia", "Pakistan", "Bangladesh", "Sri Lanka", 
    "Nepal", "Myanmar", "Cambodia", "Laos", "North Korea", "Taiwan", "Hong Kong", "Macau",
    "Afghanistan", "Albania", "Algeria", "Bahrain", "Bolivia", "Cuba", "Dominican Republic", 
    "Ecuador", "Ethiopia", "Ghana", "Guatemala", "Honduras", "Iran", "Iraq", "Jamaica", 
    "Kuwait", "Lebanon", "Libya", "Nicaragua", "Nigeria", "Panama", "Qatar", "Saudi Arabia", 
    "Tunisia", "United Arab Emirates", "Uruguay", "Venezuela", "Yemen", "Zimbabwe"
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
  const yearOptions = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-background p-4">
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
                        {isUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileImagePreview(null);
                            setProfileImageUrl(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                        ) : (
                          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        )}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                      disabled={isUploading}
                    />
                    <div className="flex items-center gap-3 mt-4">
                      <Label
                        htmlFor="profile-image-upload"
                        className={`px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                          isUploading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-navy text-white hover:bg-navy/90"
                        }`}
                      >
                        {isUploading ? "Uploading..." : profileImagePreview ? "Change Photo" : "Upload Photo"}
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

                {/* Location - Optional */}
                <div>
                  <Label htmlFor="location" className="text-base font-medium text-gray-700">
                    Where are you based? <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                    placeholder="e.g. New York, USA or London, UK"
                    className="mt-2 h-12"
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
                      <Select 
                        defaultValue={formData.dayOfBirth} 
                        onValueChange={(value) => setFormData(prev => ({...prev, dayOfBirth: value}))}
                      >
                        <SelectTrigger className="mt-1 h-10">
                          <SelectValue placeholder={formData.dayOfBirth} />
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
                      <Select 
                        defaultValue={formData.monthOfBirth} 
                        onValueChange={(value) => setFormData(prev => ({...prev, monthOfBirth: value}))}
                      >
                        <SelectTrigger className="mt-1 h-10">
                          <SelectValue placeholder={monthOptions.find(m => m.value === formData.monthOfBirth)?.label} />
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
                      <Select 
                        defaultValue={formData.yearOfBirth} 
                        onValueChange={(value) => setFormData(prev => ({...prev, yearOfBirth: value}))}
                      >
                        <SelectTrigger className="mt-1 h-10">
                          <SelectValue placeholder={formData.yearOfBirth} />
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

                <Button 
                  type="submit"
                  disabled={!isStep1Valid || isLoading || isUploading}
                  className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                    isStep1Valid && !isLoading && !isUploading
                      ? "bg-navy text-white hover:bg-navy/90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  style={{ fontSize: '16px' }}
                >
                  {isUploading ? "Uploading Image..." : isLoading ? "Loading..." : "Continue to Step 2"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2
  return (
    <div className="min-h-screen bg-background p-4">
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
              {/* Languages */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">
                  Languages you speak
                </Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {popularLanguages.map((language) => (
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
                
                <div className="mb-3">
                  <Select value="" onValueChange={(value) => handleLanguageDropdownChange(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="More languages..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allLanguages.filter(language => !selectedLanguages.includes(language)).map((language) => (
                        <SelectItem key={language} value={language}>{language}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {/* Countries visited or lived in */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">
                  Countries visited or lived in
                </Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {popularCountries.map((country) => (
                    <Badge
                      key={country}
                      variant={selectedCountries.includes(country) ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1 transition-colors ${
                        selectedCountries.includes(country)
                          ? "bg-navy text-white hover:bg-navy/90"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleCountryToggle(country)}
                    >
                      {country}
                    </Badge>
                  ))}
                </div>
                
                <div className="mb-3">
                  <Select value="" onValueChange={(value) => handleCountryDropdownChange(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="More countries..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allCountries.filter(country => !selectedCountries.includes(country)).map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCountries.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected countries:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCountries.map((country) => (
                        <Badge key={country} variant="secondary" className="pr-1">
                          {country}
                          <button
                            type="button"
                            onClick={() => handleCountryToggle(country)}
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

              {/* Top 3 Travel Photos */}
              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">
                  Top 3 Travel Photos <span className="text-gray-400">(optional)</span>
                </Label>
                <p className="text-sm text-gray-600 mb-4">Share your travel background</p>
                
                {/* Photo upload area */}
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="aspect-square">
                      {travelPhotosPreviews[index] ? (
                        <div className="relative w-full h-full">
                          <img
                            src={travelPhotosPreviews[index]}
                            alt={`Travel photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                          />
                          {uploadingPhotoIndex === index && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeTravelPhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            disabled={uploadingPhotoIndex === index}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor={`travel-photo-${index}`}
                          className={`w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${
                            uploadingPhotoIndex === index ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          {uploadingPhotoIndex === index ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                          ) : (
                            <Plus className="w-8 h-8 text-gray-400" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleTravelPhotoUpload}
                            className="hidden"
                            id={`travel-photo-${index}`}
                            disabled={uploadingPhotoIndex === index}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handleStep2Submit}
                  disabled={isLoading || isUploading || uploadingPhotoIndex !== null}
                  className="w-full bg-navy text-white hover:bg-navy/90 py-6 text-lg font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {uploadingPhotoIndex !== null ? "Uploading Photos..." : isUploading ? "Uploading Image..." : isLoading ? "Creating Profile..." : "Create My Profile"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}