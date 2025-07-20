import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { locationIQService } from "@/lib/locationiq";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedLearningLanguages, setSelectedLearningLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [travelPhotos, setTravelPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    birthPlace: "",
    currentPlace: "",
    bio: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    gender: "",
    mostInfluencedCountry: "",
    mostInfluencedCountryDescription: "",
    mostInfluencedExperience: "",
    personalizedLink: ""
  });

  // Additional state for enhanced features
  const [birthLocationInput, setBirthLocationInput] = useState(formData.birthPlace || '');
  const [currentHomeInput, setCurrentHomeInput] = useState(formData.currentPlace || '');
  const [birthSuggestions, setBirthSuggestions] = useState<string[]>([]);
  const [homeSuggestions, setHomeSuggestions] = useState<string[]>([]);
  const [showBirthSuggestions, setShowBirthSuggestions] = useState(false);
  const [showHomeSuggestions, setShowHomeSuggestions] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [showLearningLanguageModal, setShowLearningLanguageModal] = useState(false);
  const [learningLanguageSearchTerm, setLearningLanguageSearchTerm] = useState('');
  const [showTraitModal, setShowTraitModal] = useState(false);
  const [traitSearchTerm, setTraitSearchTerm] = useState('');
  
  // Personalized link state
  const [personalizedLinkInput, setPersonalizedLinkInput] = useState('');
  const [personalizedLinkError, setPersonalizedLinkError] = useState('');
  const [personalizedLinkAvailable, setPersonalizedLinkAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [originalPersonalizedLink, setOriginalPersonalizedLink] = useState('');

  const { user, loading } = useAuth();
  const { data: userData, refetch: refetchUser } = useUser();
  const updateUserMutation = useUpdateUser();

  // Complete language list for search functionality
  const allLanguages = [
    "English", "Spanish", "French", "German", "Dutch", "Italian", "Portuguese", "Mandarin", 
    "Japanese", "Korean", "Arabic", "Russian", "Hindi", "Bengali", "Thai", "Vietnamese", 
    "Indonesian", "Malay", "Turkish", "Greek", "Hebrew", "Polish", "Czech", "Hungarian", 
    "Romanian", "Bulgarian", "Croatian", "Serbian", "Swedish", "Norwegian", "Danish", 
    "Finnish", "Estonian", "Latvian", "Lithuanian", "Slovenian", "Slovak", "Ukrainian", 
    "Catalan", "Basque", "Galician", "Irish", "Welsh", "Scots Gaelic", "Icelandic", 
    "Albanian", "Macedonian", "Maltese", "Luxembourgish", "Faroese", "Swahili", 
    "Amharic", "Yoruba", "Igbo", "Hausa", "Zulu", "Afrikaans", "Tagalog", "Cebuano", 
    "Ilocano", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", 
    "Punjabi", "Urdu", "Nepali", "Sinhala", "Burmese", "Khmer", "Lao", "Mongolian", 
    "Kazakh", "Uzbek", "Kyrgyz", "Tajik", "Turkmen", "Azerbaijani", "Armenian", "Georgian"
  ];

  // Comprehensive travel traits database for search functionality
  const allTraits = [
    // Core personality traits
    "Adventurous", "Relaxed", "Social", "Quiet", "Early Bird", "Night Owl", "Spontaneous", "Planner",
    "Minimalist", "Culture Lover", "Foodie", "Nature Lover", "Tech Savvy", "Fitness Enthusiast",
    
    // Activity preferences
    "Beach Lover", "Mountain Explorer", "City Explorer", "Art Enthusiast", "History Buff", "Photography Lover",
    "Music Lover", "Dancer", "Swimmer", "Hiker", "Runner", "Cyclist", "Yoga Practitioner", "Meditation Enthusiast",
    
    // Travel styles
    "Budget Traveler", "Luxury Traveler", "Backpacker", "Digital Nomad", "Solo Traveler", "Group Traveler",
    "Road Tripper", "Train Enthusiast", "Flight Lover", "Cruise Enthusiast", "Camping Lover", "Hostel Hopper",
    
    // Additional traits
    "Bookworm", "Gamer", "Musician", "Artist", "Writer", "Photographer", "Blogger", "Vlogger",
    "Language Learner", "Cooking Enthusiast", "Wine Lover", "Coffee Connoisseur", "Tea Lover", "Craft Beer Fan"
  ];

  // Utility functions for personalized link validation
  const validatePersonalizedLink = (value: string): string => {
    if (!value) return '';
    if (value.length < 3) return 'URL must be at least 3 characters long';
    if (value.length > 30) return 'URL must be less than 30 characters';
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'URL can only contain letters and numbers';
    return '';
  };

  const checkLinkAvailability = async (link: string): Promise<boolean> => {
    if (!link || validatePersonalizedLink(link)) return false;
    
    // If it's the same as the original link, it's available (user keeping their existing link)
    if (link.toLowerCase() === originalPersonalizedLink.toLowerCase()) return true;
    
    try {
      const { data, error } = await supabase
        .from('user')
        .select('id')
        .eq('personalizedLink', link)
        .limit(1);
      
      if (error) {
        console.error('Error checking link availability:', error);
        return false;
      }
      
      return data.length === 0;
    } catch (error) {
      console.error('Error checking link availability:', error);
      return false;
    }
  };

  const handlePersonalizedLinkChange = async (value: string) => {
    const cleanValue = value.trim();
    setPersonalizedLinkInput(cleanValue);
    setFormData(prev => ({...prev, personalizedLink: cleanValue}));
    
    // Validate format
    const formatError = validatePersonalizedLink(cleanValue);
    setPersonalizedLinkError(formatError);
    
    if (formatError || !cleanValue) {
      setPersonalizedLinkAvailable(null);
      setCheckingAvailability(false);
      return;
    }
    
    // If it's the same as original, it's available
    if (cleanValue.toLowerCase() === originalPersonalizedLink.toLowerCase()) {
      setPersonalizedLinkAvailable(true);
      setPersonalizedLinkError('');
      return;
    }
    
    // Check availability with debouncing
    setCheckingAvailability(true);
    setPersonalizedLinkAvailable(null);
    
    const timeout = setTimeout(async () => {
      const isAvailable = await checkLinkAvailability(cleanValue);
      setPersonalizedLinkAvailable(isAvailable);
      setCheckingAvailability(false);
      if (!isAvailable && !formatError) {
        setPersonalizedLinkError('This URL is already taken');
      } else if (isAvailable && !formatError) {
        setPersonalizedLinkError('');
      }
    }, 500);
  };

  // Pre-fill form data when userData is available
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.name || "",
        birthPlace: userData.birthPlace || "",
        currentPlace: userData.currentPlace || "",
        bio: userData.bio || "",
        dayOfBirth: userData.dayOfBirth ? userData.dayOfBirth.toString() : "",
        monthOfBirth: userData.monthOfBirth ? userData.monthOfBirth.toString() : "",
        yearOfBirth: userData.yearOfBirth ? userData.yearOfBirth.toString() : "",
        gender: userData.gender || "",
        mostInfluencedCountry: userData.mostInfluencedCountry || "",
        mostInfluencedCountryDescription: userData.mostInfluencedCountryDescription || "",
        mostInfluencedExperience: userData.mostInfluencedExperience || "",
        personalizedLink: userData.personalizedLink || ""
      });

      // Set location inputs
      setBirthLocationInput(userData.birthPlace || '');
      setCurrentHomeInput(userData.currentPlace || '');

      // Set personalized link inputs
      const personalizedLink = userData.personalizedLink || '';
      setPersonalizedLinkInput(personalizedLink);
      setOriginalPersonalizedLink(personalizedLink);
      if (personalizedLink) {
        setPersonalizedLinkAvailable(true); // Current link is available since it's already theirs
      }

      // Set languages
      if (userData.languages) {
        setSelectedLanguages(userData.languages as string[]);
      }

      // Set learning languages
      if (userData.learningLanguages) {
        setSelectedLearningLanguages(userData.learningLanguages as string[]);
      }

      // Set travel traits
      if (userData.travelTraits) {
        setSelectedTraits(userData.travelTraits as string[]);
      }

      // Set profile image
      if (userData.imageUrl) {
        setProfileImagePreview(userData.imageUrl);
        setProfileImageUrl(userData.imageUrl);
      }

      // Set travel photos
      if (userData.travelPhotos) {
        setTravelPhotos(userData.travelPhotos as string[]);
      }
    }
  }, [userData]);

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
      const { error: uploadError } = await supabase.storage
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
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    }
  };

  // Helper function to determine if character count should trigger autocomplete
  const shouldTriggerAutocomplete = (length: number): boolean => {
    if (length === 1 || length === 3 || length === 6 || length === 9) {
      return true;
    }
    // After 9, trigger every 3 characters: 12, 15, 18, 21, etc.
    if (length > 9 && (length - 9) % 3 === 0) {
      return true;
    }
    return false;
  };

  // LocationIQ API autocomplete function
  const searchCities = async (query: string): Promise<string[]> => {
    if (query.length < 1) return [];
    
    try {
      const results = await locationIQService.searchCities(query);
      return results;
    } catch (error) {
      console.error('LocationIQ search error:', error);
      return [];
    }
  };

  // Handle autocomplete for birth location
  const handleBirthLocationChange = async (value: string) => {
    setBirthLocationInput(value);
    setFormData(prev => ({...prev, birthPlace: value}));
    
    // Trigger autocomplete immediately at specific character counts
    if (shouldTriggerAutocomplete(value.length)) {
      const suggestions = await searchCities(value);
      setBirthSuggestions(suggestions);
      setShowBirthSuggestions(true);
    } else if (value.length === 0) {
      // Hide suggestions when input is empty
      setShowBirthSuggestions(false);
      setBirthSuggestions([]);
    }
  };

  // Handle autocomplete for current home
  const handleCurrentHomeChange = async (value: string) => {
    setCurrentHomeInput(value);
    setFormData(prev => ({...prev, currentPlace: value}));
    
    // Trigger autocomplete immediately at specific character counts
    if (shouldTriggerAutocomplete(value.length)) {
      const suggestions = await searchCities(value);
      setHomeSuggestions(suggestions);
      setShowHomeSuggestions(true);
    } else if (value.length === 0) {
      // Hide suggestions when input is empty
      setShowHomeSuggestions(false);
      setHomeSuggestions([]);
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

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        // Remove the language
        return prev.filter(l => l !== language);
      } else {
        // Add the language - if selecting from dropdown, replace first unselected main language
        const mainLanguagesCopy = [...mainLanguages];
        const unselectedMainLang = mainLanguagesCopy.find(lang => !prev.includes(lang));
        
        if (unselectedMainLang && !mainLanguages.includes(language)) {
          // Replace the first unselected main language with the new selection
          return prev.filter(l => l !== unselectedMainLang).concat(language);
        } else {
          // Normal addition
          return [...prev, language];
        }
      }
    });
  };


  const handleLearningLanguageToggle = (language: string) => {
    setSelectedLearningLanguages(prev => {
      if (prev.includes(language)) {
        // Remove the language
        return prev.filter(l => l !== language);
      } else {
        // Add the language - if selecting from dropdown, replace first unselected main language
        const mainLanguagesCopy = [...mainLanguages];
        const unselectedMainLang = mainLanguagesCopy.find(lang => !prev.includes(lang));
        
        if (unselectedMainLang && !mainLanguages.includes(language)) {
          // Replace the first unselected main language with the new selection
          return prev.filter(l => l !== unselectedMainLang).concat(language);
        } else {
          // Normal addition
          return [...prev, language];
        }
      }
    });
  };

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits(prev => {
      if (prev.includes(trait)) {
        // Remove the trait
        return prev.filter(t => t !== trait);
      } else {
        // Add the trait - if selecting from dropdown, replace first unselected main trait
        const mainTraitsCopy = [...traitOptions.slice(0, 18)]; // First 18 main traits
        const unselectedMainTrait = mainTraitsCopy.find(tr => !prev.includes(tr));
        
        if (unselectedMainTrait && !traitOptions.slice(0, 18).includes(trait)) {
          // Replace the first unselected main trait with the new selection
          return prev.filter(t => t !== unselectedMainTrait).concat(trait);
        } else {
          // Normal addition
          return [...prev, trait];
        }
      }
    });
  };

  // Main languages for quick selection (display by default) - expanded to show more
  const mainLanguages = ["English", "Spanish", "French", "German", "Dutch", "Italian", "Portuguese", "Mandarin", "Japanese", "Korean", "Arabic", "Russian"];

  // Function to create display array for main languages grid
  const getLanguagesDisplayArray = (selectedLangs: string[]) => {
    const displayArray = [...selectedLangs];
    
    // Fill remaining slots with unselected main languages
    for (const lang of mainLanguages) {
      if (!selectedLangs.includes(lang) && displayArray.length < 12) {
        displayArray.push(lang);
      }
    }
    
    return displayArray.slice(0, 12); // Always show exactly 12 slots
  };

  // Function to create display array for learning languages
  const getLearningLanguagesDisplayArray = (selectedLangs: string[]) => {
    const displayArray = [...selectedLangs];
    
    // Fill remaining slots with unselected main languages
    for (const lang of mainLanguages) {
      if (!selectedLangs.includes(lang) && displayArray.length < 12) {
        displayArray.push(lang);
      }
    }
    
    return displayArray.slice(0, 12); // Always show exactly 12 slots
  };

  // Function to create display array for travel traits
  const getTraitsDisplayArray = (selectedTraits: string[]) => {
    const displayArray = [...selectedTraits];
    
    // Fill remaining slots with unselected main traits
    for (const trait of traitOptions.slice(0, 18)) {
      if (!selectedTraits.includes(trait) && displayArray.length < 18) {
        displayArray.push(trait);
      }
    }
    
    return displayArray.slice(0, 18); // Always show exactly 18 slots
  };

  const handleTravelPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos: string[] = [];
      Array.from(files).slice(0, 3 - travelPhotos.length).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPhotos.push(reader.result as string);
          if (newPhotos.length === Math.min(files.length, 3 - travelPhotos.length)) {
            setTravelPhotos(prev => [...prev, ...newPhotos].slice(0, 3));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeTravelPhoto = (index: number) => {
    setTravelPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    setIsLoading(true);
    
    try {
      // Update user profile with all the collected data
      await updateUserMutation.mutateAsync({
        fullName: formData.fullName,
        bio: formData.bio || null,
        birthPlace: formData.birthPlace || null,
        currentPlace: formData.currentPlace || null,
        dayOfBirth: formData.dayOfBirth ? parseInt(formData.dayOfBirth) : null,
        monthOfBirth: formData.monthOfBirth ? parseInt(formData.monthOfBirth) : null,
        yearOfBirth: formData.yearOfBirth ? parseInt(formData.yearOfBirth) : null,
        gender: formData.gender || null,
        languages: selectedLanguages.length > 0 ? selectedLanguages : null,
        learningLanguages: selectedLearningLanguages.length > 0 ? selectedLearningLanguages : null,
        travelTraits: selectedTraits.length > 0 ? selectedTraits : null,
        mostInfluencedCountry: formData.mostInfluencedCountry || null,
        mostInfluencedCountryDescription: formData.mostInfluencedCountryDescription || null,
        mostInfluencedExperience: formData.mostInfluencedExperience || null,
        travelPhotos: travelPhotos.filter(photo => photo !== null).length > 0 ? travelPhotos.filter(photo => photo !== null) : null,
        imageUrl: profileImageUrl || null,
        personalizedLink: formData.personalizedLink || null,
        profileCreated: true,
      });

      // Refetch user data to ensure we have the latest information
      await refetchUser();

      toast.success("Profile updated successfully!");

      // Navigate to profile page after update
      navigate(`/profile/${user.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if personalized link is valid (empty is allowed, but if provided must be available)
  const isPersonalizedLinkValid = () => {
    // If no personalized link is provided, it's valid (optional field)
    if (!personalizedLinkInput.trim()) return true;
    
    // If there's a format error, it's invalid
    if (personalizedLinkError) return false;
    
    // If we're still checking availability, consider it invalid for now
    if (checkingAvailability) return false;
    
    // If available is explicitly true, it's valid
    return personalizedLinkAvailable === true;
  };

  const isFormValid = formData.fullName && 
                      formData.birthPlace &&
                      formData.dayOfBirth && 
                      formData.monthOfBirth && 
                      formData.yearOfBirth &&
                      formData.gender &&
                      profileImagePreview &&
                      selectedLanguages.length > 0 &&
                      isPersonalizedLinkValid();

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

  const traitOptions = [
    "Early Bird", "Night Owl", "Adventurous", "Relaxed", "Social", "Quiet", 
    "Foodie", "Fitness Enthusiast", "Culture Lover", "Nature Lover", 
    "Tech Savvy", "Minimalist", "Photographer", "Music Lover", "Budget Traveler",
    "Luxury Traveler", "Backpacker", "City Explorer", "Beach Lover", "Mountain Hiker",
    "Art Enthusiast", "History Buff", "Spontaneous", "Planner", "Solo Traveler",
    "Group Traveler", "Digital Nomad", "Weekend Warrior", "Long-term Traveler",
    "Eco-conscious", "Local Experience Seeker", "Comfort Seeker", "Thrill Seeker"
  ];

  const countryOptions = [
    // Popular travel destinations first
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
  ].sort((a, b) => a.localeCompare(b));

  console.log("countryOptions", countryOptions);

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5dc' }}>
      {/* Header with Back Button */}
      <div className="max-w-[1350px] mx-auto px-4 pt-3 pb-4">
        {/* Mobile Layout - Stack vertically */}
        <div className="block md:hidden mb-4">
          <button
            onClick={() => navigate(`/profile/${user.id}`)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2 mb-3"
            style={{ color: '#4B4B4B', fontFamily: 'system-ui, Inter, sans-serif' }}
          >
            ← Back to Profile
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1e2a78' }}>
              ✨ Build your traveler profile
            </h1>
            <p className="text-gray-600 text-sm">
              Tell us about yourself and how you travel
            </p>
          </div>
        </div>

        {/* Desktop Layout - Side by side */}
        <div className="hidden md:block">
          <div className="relative mb-2">
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="absolute left-0 top-0 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2"
              style={{ color: '#4B4B4B', fontFamily: 'system-ui, Inter, sans-serif' }}
            >
              ← Back to Profile
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold" style={{ color: '#1e2a78' }}>
                ✨ Build your traveler profile
              </h1>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Tell us about yourself and how you travel
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-[1600px] mx-auto px-6 pb-20">
        {/* 3-column layout: optimized full width responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* COLUMN 1 — Personal Info */}
          <div className="bg-white rounded-lg shadow-lg p-5">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-center" style={{ color: '#1e2a78' }}>
                Personal Info
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Profile Photo Upload */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photo <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center">
                  {profileImagePreview ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
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
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg"
                        disabled={isUploading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                      ) : (
                        <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
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
                  <label
                    htmlFor="profile-image-upload"
                    className={`cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium mt-2 shadow-md hover:shadow-lg transition-all duration-200 w-full max-w-[140px] text-center ${
                      isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    style={{ backgroundColor: '#1e2a78' }}
                  >
                    {isUploading ? "Uploading..." : profileImagePreview ? "Change Photo" : "Upload Photo"}
                  </label>
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, gender: "male"}))}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.gender === "male" 
                        ? "text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                    style={{ 
                      backgroundColor: formData.gender === "male" ? '#1e2a78' : undefined
                    }}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, gender: "female"}))}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.gender === "female" 
                        ? "text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                    style={{ 
                      backgroundColor: formData.gender === "female" ? '#1e2a78' : undefined
                    }}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* How do you want to be called */}
              <div>
                <label htmlFor="fullName" className="block text-base font-medium text-gray-700 mb-4">
                  How do you want to be called? <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                  placeholder="e.g. Jane"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  required
                />
              </div>

              {/* What makes you feel alive */}
              <div>
                <label htmlFor="bio" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  What makes you feel alive? 
                  <span className="text-gray-400 ml-1">(optional)</span>
                  <span className="ml-1 text-xs cursor-help" title="Share what energizes and excites you">ℹ️</span>
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                  placeholder="Travel, music, trying new foods, meeting people..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                />
              </div>

              {/* Customized Profile URL */}
              <div>
                <label htmlFor="personalizedLink" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Customize Your Profile URL 
                  <span className="text-gray-400 ml-1">(optional)</span>
                  <span className="ml-1 text-xs cursor-help" title="Make your profile easier to be recognized">ℹ️</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-2 rounded-l-lg border border-r-0 border-gray-300">
                      splitstay.travel/profile/
                    </span>
                    <input
                      id="personalizedLink"
                      type="text"
                      value={personalizedLinkInput}
                      onChange={(e) => handlePersonalizedLinkChange(e.target.value)}
                      placeholder="yourname"
                      className={`flex-1 px-3 py-2 border rounded-r-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                        personalizedLinkError ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="min-h-[20px]">
                    {checkingAvailability && (
                      <div className="flex items-center text-xs text-blue-600">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></div>
                        Checking availability...
                      </div>
                    )}
                    {personalizedLinkError && (
                      <p className="text-xs text-red-600">{personalizedLinkError}</p>
                    )}
                    {personalizedLinkAvailable === true && !personalizedLinkError && personalizedLinkInput && (
                      <p className="text-xs text-green-600">✓ This URL is available!</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Customize your URL to make your profile easier to be recognized. Only letters and numbers allowed.
                  </p>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-4">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={formData.dayOfBirth}
                    onChange={(e) => setFormData(prev => ({...prev, dayOfBirth: e.target.value}))}
                    className="w-full px-3 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    required
                  >
                    <option value="">Day</option>
                    {dayOptions.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <select
                    value={formData.monthOfBirth}
                    onChange={(e) => setFormData(prev => ({...prev, monthOfBirth: e.target.value}))}
                    className="w-full px-3 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    required
                  >
                    <option value="">Month</option>
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                  <select
                    value={formData.yearOfBirth}
                    onChange={(e) => setFormData(prev => ({...prev, yearOfBirth: e.target.value}))}
                    className="w-full px-3 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    required
                  >
                    <option value="">Year</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500 mt-2">Must be 18+</p>
              </div>
            </div>
          </div>

          {/* COLUMN 2 — Location & Language */}
          <div className="bg-white rounded-lg shadow-lg p-5">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-center" style={{ color: '#1e2a78' }}>
                Location & Language
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Where were you born */}
              <div className="relative">
                <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-2">
                  Where were you born? <span className="text-red-500">*</span>
                </label>
                <input
                  id="birthPlace"
                  type="text"
                  value={birthLocationInput}
                  onChange={(e) => handleBirthLocationChange(e.target.value)}
                  onFocus={() => setShowBirthSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowBirthSuggestions(false), 200)}
                  placeholder="Start typing... e.g. Barcelona"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  required
                />
                {showBirthSuggestions && birthSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {birthSuggestions.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setBirthLocationInput(city);
                          setFormData(prev => ({...prev, birthPlace: city}));
                          setShowBirthSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{city.split(', ')[0]}</span>
                        <span className="text-gray-600 ml-1">, {city.split(', ')[1]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Where do you currently call home */}
              <div className="relative">
                <label htmlFor="currentPlace" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Where do you currently call home? 
                  <span className="text-gray-400 ml-2">(optional)</span>
                </label>
                <input
                  id="currentPlace"
                  type="text"
                  value={currentHomeInput}
                  onChange={(e) => handleCurrentHomeChange(e.target.value)}
                  onFocus={() => setShowHomeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowHomeSuggestions(false), 200)}
                  placeholder="Start typing... e.g. Amsterdam"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                {showHomeSuggestions && homeSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {homeSuggestions.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setCurrentHomeInput(city);
                          setFormData(prev => ({...prev, currentPlace: city}));
                          setShowHomeSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{city.split(', ')[0]}</span>
                        <span className="text-gray-600 ml-1">, {city.split(', ')[1]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Combined Languages Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                {/* Languages You Speak */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Languages you speak <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Main Languages Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {getLanguagesDisplayArray(selectedLanguages).map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageToggle(language)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedLanguages.includes(language)
                            ? "bg-blue-600 text-white shadow-md cursor-pointer"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                  
                  {/* Searchable Language Picker */}
                  <button
                    type="button"
                    onClick={() => setShowLanguageModal(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    {selectedLanguages.length > 0 ? selectedLanguages.join(', ') + ', add more...' : 'Add languages...'}
                  </button>
                </div>

                {/* Languages You're Learning */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Languages You're Learning <span className="text-gray-400">(optional)</span>
                  </label>
                  
                  {/* Main Languages Quick Selection */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {getLearningLanguagesDisplayArray(selectedLearningLanguages).map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLearningLanguageToggle(language)}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          selectedLearningLanguages.includes(language)
                            ? "bg-blue-600 text-white cursor-pointer shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md"
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                  
                  {/* Searchable Learning Language Picker */}
                  <button
                    type="button"
                    onClick={() => setShowLearningLanguageModal(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-left mb-3"
                  >
                    {selectedLearningLanguages.length > 0 ? selectedLearningLanguages.join(', ') + ', add more...' : 'Add learning languages...'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3 — Travel Preferences */}
          <div className="bg-white rounded-lg shadow-lg p-5">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-center" style={{ color: '#1e2a78' }}>
                Travel Preferences
              </h2>
            </div>

            <div className="space-y-4">
              {/* Travel Traits Section */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Travel traits 
                  <span className="ml-1 text-xs cursor-help" title="These traits help us find compatible roommates">ℹ️</span>
                </label>
                
                {/* Expanded traits grid */}
                <div className="grid grid-cols-3 gap-1 mb-3">
                  {getTraitsDisplayArray(selectedTraits).map((trait) => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleTraitToggle(trait)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        selectedTraits.includes(trait)
                          ? "bg-blue-600 text-white shadow-md cursor-pointer"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md"
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
                
                {/* Searchable Trait Picker */}
                <button
                  type="button"
                  onClick={() => setShowTraitModal(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-left mb-3"
                >
                  {selectedTraits.length > 0 ? selectedTraits.join(', ') + ', add more...' : 'Add traits...'}
                </button>
              </div>

              {/* Most influential country */}
              <div>
                <label htmlFor="mostInfluencedCountry" className="block text-sm font-medium text-gray-700 mb-2">
                  Which country has influenced you the most?
                </label>
                <select
                  id="mostInfluencedCountry"
                  value={formData.mostInfluencedCountry || ''}
                  onChange={(e) => setFormData(prev => ({...prev, mostInfluencedCountry: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a country</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* How did this country influence you */}
              <div>
                <label htmlFor="mostInfluencedCountryDescription" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  How did this country influence you? 
                  <span className="text-gray-400 ml-1">(optional)</span>
                  <span className="ml-1 text-xs cursor-help" title="Share how this country shaped your perspective">ℹ️</span>
                </label>
                <textarea
                  id="mostInfluencedCountryDescription"
                  value={formData.mostInfluencedCountryDescription || ''}
                  onChange={(e) => setFormData(prev => ({...prev, mostInfluencedCountryDescription: e.target.value}))}
                  placeholder="Tell us about the culture, people, experiences, or values that shaped you..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                />
              </div>

              {/* Most impactful travel experience */}
              <div>
                <label htmlFor="mostInfluencedExperience" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  What travel experience has impacted you most deeply? 
                  <span className="text-gray-400 ml-1">(optional)</span>
                  <span className="ml-1 text-xs cursor-help" title="Share a meaningful travel moment">ℹ️</span>
                </label>
                <textarea
                  id="mostInfluencedExperience"
                  value={formData.mostInfluencedExperience}
                  onChange={(e) => setFormData(prev => ({...prev, mostInfluencedExperience: e.target.value}))}
                  placeholder="Tell us about a moment, encounter, or journey that changed your perspective..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                />
              </div>

              {/* Top 3 Travel Photos */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Top 3 Travel Photos 
                  <span className="text-gray-400 ml-1">(optional)</span>
                  <span className="ml-1 text-xs cursor-help" title="Share your favorite travel memories">ℹ️</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="relative">
                      {travelPhotos[index] ? (
                        <div className="relative">
                        <button
                        type="button"
                        onClick={() => removeTravelPhoto(index)}
                        className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                        style={{ transform: "translate(-50%, -50%)" }}
                        >
                        <X className="w-2 h-2" />
                        </button>
                        <img
                        src={travelPhotos[index]}
                        alt={`Travel photo ${index + 1}`}
                        className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleTravelPhotoUpload}
                            className="hidden"
                            id={`travel-photo-${index}`}
                          />
                          <label
                            htmlFor={`travel-photo-${index}`}
                            className="cursor-pointer w-14 h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                          </label>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Language Search Modals */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Languages You Speak</h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search languages..."
              value={languageSearchTerm}
              onChange={(e) => setLanguageSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="max-h-60 overflow-y-auto">
              {allLanguages
                .filter(lang => 
                  lang.toLowerCase().includes(languageSearchTerm.toLowerCase())
                )
                .map(language => (
                <button
                  key={language}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLanguageToggle(language);
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    selectedLanguages.includes(language)
                      ? "bg-blue-600 text-white cursor-pointer"
                      : "hover:bg-blue-50"
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLearningLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Learning Languages</h3>
              <button
                onClick={() => setShowLearningLanguageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search languages..."
              value={learningLanguageSearchTerm}
              onChange={(e) => setLearningLanguageSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="max-h-60 overflow-y-auto">
              {allLanguages
                .filter(lang => 
                  lang.toLowerCase().includes(learningLanguageSearchTerm.toLowerCase())
                )
                .map(language => (
                <button
                  key={language}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLearningLanguageToggle(language);
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    selectedLearningLanguages.includes(language)
                      ? "bg-blue-600 text-white cursor-pointer"
                      : "hover:bg-blue-50"
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTraitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Travel Traits</h3>
              <button
                onClick={() => setShowTraitModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search traits..."
              value={traitSearchTerm}
              onChange={(e) => setTraitSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="max-h-60 overflow-y-auto">
              {allTraits
                .filter(trait => 
                  trait.toLowerCase().includes(traitSearchTerm.toLowerCase())
                )
                .map(trait => (
                <button
                  key={trait}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTraitToggle(trait);
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    selectedTraits.includes(trait)
                      ? "bg-blue-600 text-white cursor-pointer"
                      : "hover:bg-blue-50"
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compact Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row gap-3 justify-center">
          {/* Enhanced visual feedback for duplicate link error */}
          {!isPersonalizedLinkValid() && personalizedLinkInput.trim() && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {checkingAvailability ? "Checking link availability..." : 
               personalizedLinkError ? personalizedLinkError : "Profile URL issue detected"}
            </div>
          )}
          
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className={`px-5 py-2 text-sm font-semibold rounded transition-all duration-300 ${
              isFormValid && !isLoading
                ? "text-white shadow-md hover:shadow-lg transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            }`}
            style={{ 
              fontFamily: 'system-ui, Inter, sans-serif',
              backgroundColor: (isFormValid && !isLoading) ? '#1e2a78' : '#d1d5db'
            }}
          >
            {isLoading ? "Updating Profile..." : "Update My Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}