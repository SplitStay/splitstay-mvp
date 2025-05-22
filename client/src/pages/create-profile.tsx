import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Calendar, Plus, Search, X, 
  UserCircle, ShieldCheck, CheckCircle, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { trackProfileCreation } from "@/lib/analytics";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import emilyProfilePic from "../assets/emily-profile-2025.png";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TravelTrait {
  id: string;
  label: string;
}

const CreateProfile: React.FC = () => {
  const [location, navigate] = useLocation();
  const isEditMode = location === "/profile/edit";
  const isDemoMode = !isEditMode; // Consider any new profile creation as demo mode
  
  // Import Emily's profile image directly
  // For the demo, we'll use a placeholder that will be replaced
  // with the right image when you click the profile section
  
  // Emily's demo data for the MVP video
  const emilyData = {
    fullName: "Emily Zhang",
    bio: "Discovering hidden local spots in new cities and capturing sunrise moments with my camera. Nothing beats the feeling of getting lost in a new place and stumbling upon something amazing!",
    dateOfBirth: new Date(1998, 5, 12), // June 12, 1998 
    travelReason: "leisure" as const,
    languages: ["English", "Mandarin"],
    profileImage: emilyProfilePic, // Emily's profile photo
    traits: ["Early bird", "Adventurous", "Clean", "Foodie"],
    interests: ["Photography", "Hiking", "Local cuisine", "Architecture"]
  };
  
  // Pre-fill data based on mode
  const defaultUserData = isEditMode ? {
    fullName: "Alina Chen",
    bio: "Spontaneous traveler who enjoys quiet time. Love exploring new cities and making memories!",
    dateOfBirth: new Date(2002, 0, 15), // Jan 15, 2002 for age 23
    travelReason: "leisure" as const,
    languages: ["English", "German"],
    profileImage: "https://i.pravatar.cc/150?img=31",
    traits: ["Early bird", "Quiet", "Clean", "Budget-conscious"],
    interests: ["Photography", "Hiking", "Food", "Museums"]
  } : isDemoMode ? emilyData : null;
  
  // Personal info states - use Emily's data for demo mode
  const [name, setName] = useState(defaultUserData?.fullName || "");
  const [bio, setBio] = useState(defaultUserData?.bio || "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(defaultUserData?.dateOfBirth);
  const [travelReason, setTravelReason] = useState<"leisure" | "business">(defaultUserData?.travelReason || "leisure");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(defaultUserData?.languages || []);
  const [profileImage, setProfileImage] = useState<string | null>(defaultUserData?.profileImage || null);
  
  // Travel traits
  const [selectedTraits, setSelectedTraits] = useState<string[]>(defaultUserData?.traits || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(defaultUserData?.interests || []);
  
  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For the MVP demo, automatically set Emily's profile image
      const emilyImageUrl = "/images/emily-profile.png";
      setProfileImage(emilyImageUrl);
    }
  };
  
  // Set demo image for Emily's profile
  const setDemoProfileImage = () => {
    // Using Emily's image from public folder
    const emilyImageUrl = "/images/emily-profile.png";
    setProfileImage(emilyImageUrl);
  };

  // Predefined values
  const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese"];
  
  // Complete list of languages for search - comprehensive global list
  const allLanguages = [
    "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Assamese", "Azerbaijani", "Basque", 
    "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Burmese", "Catalan", "Cebuano", "Chichewa", 
    "Chinese", "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", 
    "Farsi", "Filipino", "Finnish", "French", "Frisian", "Galician", "Georgian", "German", "Greek", 
    "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", 
    "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", 
    "Kazakh", "Khmer", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latin", "Latvian", "Lithuanian", 
    "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", 
    "Mongolian", "Nepali", "Norwegian", "Odia", "Pashto", "Persian", "Polish", "Portuguese", 
    "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic", "Serbian", "Sesotho", "Shona", 
    "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", 
    "Swedish", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen", "Ukrainian", 
    "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu",
    "Tagalog", "Mandarin", "Cantonese", "Wu", "Min", "Hakka", "Gan", "Sign Language"
  ];
  
  // State for language search and selection
  const [languageSearch, setLanguageSearch] = useState("");
  const [tempSelectedLanguages, setTempSelectedLanguages] = useState<string[]>([]);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  
  // State for trait search and selection
  const [traitSearch, setTraitSearch] = useState("");
  const [tempSelectedTraits, setTempSelectedTraits] = useState<string[]>([]);
  const [traitDialogOpen, setTraitDialogOpen] = useState(false);
  
  // Main travel traits (organized in logical pairs)
  const travelTraits: TravelTrait[] = [
    // Planning style
    { id: "planner", label: "Planner" },
    { id: "spontaneous", label: "Spontaneous" },
    
    // Activity level
    { id: "adventure_seeker", label: "Adventure Seeker" },
    { id: "relaxed", label: "Relaxed" },
    
    // Sleep schedule
    { id: "early_bird", label: "Early Bird" },
    { id: "night_owl", label: "Night Owl" },
    
    // Social style
    { id: "quiet_time", label: "Quiet Time" },
    { id: "street_food", label: "Street Food" },
  ];
  
  // Complete list of travel traits for search (organized by related pairs)
  const allTravelTraits: TravelTrait[] = [
    // Planning style
    { id: "planner", label: "Planner" },
    { id: "spontaneous", label: "Spontaneous" },
    
    // Activity level
    { id: "adventure_seeker", label: "Adventure Seeker" },
    { id: "relaxed", label: "Relaxed" },
    
    // Sleep schedule
    { id: "early_bird", label: "Early Bird" },
    { id: "night_owl", label: "Night Owl" },
    
    // Social style
    { id: "quiet_time", label: "Quiet Time" },
    { id: "chatterbox", label: "Chatterbox" },
    { id: "party_animal", label: "Party Animal" },
    { id: "social_butterfly", label: "Social Butterfly" },
    
    // Food preferences
    { id: "street_food", label: "Street Food" },
    { id: "fine_dining", label: "Fine Dining" },
    { id: "foodie", label: "Foodie" },
    
    // Drink preferences
    { id: "coffee_lover", label: "Coffee Lover" },
    { id: "tea_enthusiast", label: "Tea Enthusiast" },
    
    // Location preferences
    { id: "nature_lover", label: "Nature Lover" },
    { id: "city_lover", label: "City Lover" },
    { id: "beach_lover", label: "Beach Lover" },
    { id: "mountain_climber", label: "Mountain Climber" },
    
    // Indoor activities
    { id: "bookworm", label: "Bookworm" },
    { id: "binge_watcher", label: "Binge Watcher" },
    
    // Shopping style
    { id: "minimalist", label: "Minimalist" },
    { id: "shopping_addict", label: "Shopping Addict" },
    
    // Cultural interests
    { id: "museum_goer", label: "Museum Goer" },
    { id: "history_buff", label: "History Buff" },
    { id: "architecture_buff", label: "Architecture Buff" },
    { id: "art_enthusiast", label: "Art Enthusiast" },
    
    // Other interests
    { id: "photography_fan", label: "Photography Fan" },
    { id: "tech_geek", label: "Tech Geek" },
    { id: "family_oriented", label: "Family Oriented" },
    { id: "environmentalist", label: "Environmentalist" },
    { id: "sports_fan", label: "Sports Fan" },
    { id: "music_lover", label: "Music Lover" },
    { id: "yoga_enthusiast", label: "Yoga Enthusiast" },
  ];

  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const toggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter(id => id !== traitId));
    } else {
      setSelectedTraits([...selectedTraits, traitId]);
    }
  };

  const handleCreateProfile = () => {
    // Save profile data to localStorage for demo purposes
    localStorage.setItem('splitstay_profile', JSON.stringify({
      name: name || "Jane",
      bio: bio || "Love hiking, exploring, and catching sunrises",
      dateOfBirth: dateOfBirth || new Date("1995-01-01"),
      travelReason,
      languages: selectedLanguages.length > 0 ? selectedLanguages : ["English"],
      traits: selectedTraits,
      profileImage: profileImage,
      interests: selectedInterests
    }));
    
    // Track profile creation/update event in Google Analytics
    trackProfileCreation();
    
    // Show success toast
    toast({
      title: isEditMode ? "Profile updated" : "Profile created",
      description: isEditMode 
        ? "Your profile has been updated successfully!" 
        : "Your profile has been created successfully!",
    });
    
    // Navigate based on mode
    navigate(isEditMode ? "/profile" : "/find-roommate");
  };

  const handleSkip = () => {
    navigate("/find-roommate");
  };

  return (
    <div className="flex flex-col min-h-screen p-5 bg-cream">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          onClick={() => navigate(isEditMode ? "/profile" : "/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary flex-1 text-center">
          {isEditMode ? "Edit Your Profile" : "Complete Your Profile"}
        </h1>
      </div>
      
      <div className="flex flex-col gap-5">
        {/* Left Column - Personal Info */}
        <div className="bg-white rounded-lg p-5 flex flex-col gap-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-2">
            <p className="text-sm font-medium text-center mb-2">Add Profile Photo</p>
            <label htmlFor="profile-upload" className="cursor-pointer">
              <div 
                className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3 relative overflow-hidden hover:opacity-90 transition-opacity border-2 border-dashed border-navy"
                onClick={setDemoProfileImage} // Added for demo to auto-set Emily's photo on click
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Plus className="w-8 h-8 text-navy" />
                    <span className="text-xs text-navy font-medium">Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium">Change photo</span>
                </div>
              </div>
            </label>
            <input 
              type="file" 
              id="profile-upload" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>



          {/* Name */}
          <div>
            <label className="block text-navy font-medium mb-1">What should we call you?</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane"
              className="w-full border-gray-300"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-navy font-medium mb-1">What makes you feel alive?</label>
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Love hiking, exploring, and catching sunrises"
              className="w-full border-gray-300 min-h-[100px]"
            />
          </div>

          {/* Date of Birth - Improved with separate select fields */}
          <div>
            <label className="block text-navy font-medium mb-1">Date of Birth</label>
            <div className="flex gap-2">
              {/* Day Select */}
              <select
                value={dateOfBirth ? dateOfBirth.getDate() : ""}
                onChange={(e) => {
                  const day = parseInt(e.target.value);
                  const newDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
                  newDate.setDate(day);
                  setDateOfBirth(newDate);
                }}
                className="px-3 py-2 rounded-md border border-gray-300 flex-1"
                aria-label="Day"
              >
                <option value="" disabled>Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={`day-${day}`} value={day}>{day}</option>
                ))}
              </select>
              
              {/* Month Select */}
              <select
                value={dateOfBirth ? dateOfBirth.getMonth() : ""}
                onChange={(e) => {
                  const month = parseInt(e.target.value);
                  const newDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
                  newDate.setMonth(month);
                  setDateOfBirth(newDate);
                }}
                className="px-3 py-2 rounded-md border border-gray-300 flex-1"
                aria-label="Month"
              >
                <option value="" disabled>Month</option>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
                  <option key={`month-${month}`} value={index}>{month}</option>
                ))}
              </select>
              
              {/* Year Select */}
              <select
                value={dateOfBirth ? dateOfBirth.getFullYear() : ""}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  const newDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
                  newDate.setFullYear(year);
                  setDateOfBirth(newDate);
                }}
                className="px-3 py-2 rounded-md border border-gray-300 flex-1"
                aria-label="Year"
              >
                <option value="" disabled>Year</option>
                {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={`year-${year}`} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 18 years old</p>
          </div>

          {/* Travel Reason */}
          <div>
            <label className="block text-navy font-medium mb-1">Reason for Travel</label>
            <div className="flex w-full rounded-md overflow-hidden">
              <Button 
                type="button"
                className={`flex-1 rounded-none hover:bg-accent hover:text-accent-foreground hover:border-accent ${travelReason === 'leisure' 
                  ? 'bg-yellow-100 text-gray-800 border border-yellow-300' 
                  : 'bg-white text-navy border border-gray-300'}`}
                onClick={() => setTravelReason('leisure')}
              >
                Leisure
              </Button>
              <Button 
                type="button"
                className={`flex-1 rounded-none hover:bg-accent hover:text-accent-foreground hover:border-accent ${travelReason === 'business' 
                  ? 'bg-yellow-100 text-gray-800 border border-yellow-300' 
                  : 'bg-white text-navy border border-gray-300'}`}
                onClick={() => setTravelReason('business')}
              >
                Business
              </Button>
            </div>
          </div>

          {/* Languages */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-navy font-medium">Languages</label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => {
                    // Initialize temporary selected languages with current selections when opening the dialog
                    setTempSelectedLanguages([...selectedLanguages]);
                    setLanguageSearch("");
                  }}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Languages</DialogTitle>
                    <DialogDescription>
                      Search and select languages you speak. Click Confirm when done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      className="pl-10" 
                      placeholder="Search languages" 
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto mb-4">
                    {allLanguages
                      .filter(lang => 
                        lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
                        !tempSelectedLanguages.includes(lang)
                      )
                      .map((lang) => (
                        <Button 
                          key={lang} 
                          variant="outline" 
                          className="py-1 px-3"
                          onClick={() => {
                            if (!tempSelectedLanguages.includes(lang)) {
                              setTempSelectedLanguages([...tempSelectedLanguages, lang]);
                              setLanguageSearch(""); // Clear search after selection
                            }
                          }}
                        >
                          {lang}
                        </Button>
                      ))
                    }
                  </div>
                  
                  {tempSelectedLanguages.length > 0 && (
                    <div className="border-t pt-3 mb-3">
                      <p className="text-sm font-medium mb-2">Selected languages:</p>
                      <div className="flex flex-wrap gap-2">
                        {tempSelectedLanguages.map(lang => (
                          <Badge 
                            key={lang}
                            className="bg-yellow-100 text-gray-800 border border-yellow-300 px-2 py-1"
                          >
                            {lang}
                            <button 
                              className="ml-1 text-gray-500 hover:text-gray-800"
                              onClick={() => setTempSelectedLanguages(
                                tempSelectedLanguages.filter(l => l !== lang)
                              )}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter className="flex justify-between sm:justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" className="flex-1 sm:flex-none">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        style={{
                          backgroundColor: "#001F3F", 
                          color: "white",
                          flex: "1 1 auto"
                        }}
                        onClick={() => {
                          // Apply the temporary selections to the actual selections
                          setSelectedLanguages(tempSelectedLanguages);
                          
                          // Show success notification
                          toast({
                            title: "Languages updated",
                            description: `${tempSelectedLanguages.length} languages selected`,
                          });
                        }}
                      >
                        Confirm Selection
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.length > 0 ? (
                selectedLanguages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    className="py-2 px-4 rounded-full text-sm transition-colors bg-yellow-100 text-gray-800 border border-yellow-300"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </button>
                ))
              ) : (
                languages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    className="py-2 px-4 rounded-full text-sm transition-colors bg-white border border-gray-300 text-gray-700 hover:border-yellow-300"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Traits */}
        <div className="flex flex-col gap-5">
          {/* Travel Traits */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-medium text-navy">Travel Traits</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 px-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Travel Traits</DialogTitle>
                  </DialogHeader>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      className="pl-10" 
                      placeholder="Search traits" 
                      value={traitSearch}
                      onChange={(e) => setTraitSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto mb-4">
                    {allTravelTraits
                      .filter(trait => 
                        trait.label.toLowerCase().includes(traitSearch.toLowerCase()) &&
                        !tempSelectedTraits.includes(trait.id)
                      )
                      .map((trait) => (
                        <Button 
                          key={trait.id} 
                          variant="outline" 
                          className="py-1 px-3"
                          onClick={() => {
                            if (!tempSelectedTraits.includes(trait.id)) {
                              setTempSelectedTraits([...tempSelectedTraits, trait.id]);
                              setTraitSearch(""); // Clear search after selection
                            }
                          }}
                        >
                          {trait.label}
                        </Button>
                      ))
                    }
                  </div>
                  
                  {tempSelectedTraits.length > 0 && (
                    <div className="border-t pt-3 mb-3">
                      <p className="text-sm font-medium mb-2">Selected traits:</p>
                      <div className="flex flex-wrap gap-2">
                        {tempSelectedTraits.map(traitId => {
                          const trait = allTravelTraits.find(t => t.id === traitId);
                          return trait ? (
                            <Badge 
                              key={trait.id}
                              className="bg-yellow-100 text-gray-800 border border-yellow-300 px-2 py-1"
                            >
                              {trait.label}
                              <button 
                                className="ml-1 text-gray-500 hover:text-gray-800"
                                onClick={() => setTempSelectedTraits(
                                  tempSelectedTraits.filter(id => id !== trait.id)
                                )}
                              >
                                ×
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter className="flex justify-between sm:justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" className="flex-1 sm:flex-none">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        style={{
                          backgroundColor: "#001F3F", 
                          color: "white",
                          flex: "1 1 auto"
                        }}
                        onClick={() => {
                          // Apply the temporary selections to the actual selections
                          setSelectedTraits(tempSelectedTraits);
                          
                          // Show success notification
                          toast({
                            title: "Travel traits updated",
                            description: `${tempSelectedTraits.length} traits selected`,
                          });
                        }}
                      >
                        Confirm Selection
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTraits.length > 0 ? (
                // Display selected traits
                selectedTraits.map(traitId => {
                  const trait = allTravelTraits.find(t => t.id === traitId);
                  return trait ? (
                    <button
                      key={trait.id}
                      type="button"
                      className="py-2 px-4 rounded-full text-sm transition-colors bg-yellow-100 text-gray-800 border border-yellow-300"
                      onClick={() => toggleTrait(trait.id)}
                    >
                      {trait.label}
                    </button>
                  ) : null;
                })
              ) : (
                // If no traits are selected, show default traits
                travelTraits.map((trait) => (
                  <button
                    key={trait.id}
                    type="button"
                    className="py-2 px-4 rounded-full text-sm transition-colors bg-white border border-gray-300 text-gray-700 hover:border-yellow-300"
                    onClick={() => toggleTrait(trait.id)}
                  >
                    {trait.label}
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* ID Verification Section - Moved below travel traits */}
          <div className="bg-white rounded-lg p-5 mt-5">
            <div className="flex items-center mb-2">
              <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-navy">ID Verification</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              To host or be hosted, SplitStay requires a one-time ID verification.
              Your info is encrypted and never shared.
            </p>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span>Email verified</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span>Phone verified</span>
              </div>
              <div className="flex items-center text-sm">
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="inline-block">
                      <Button 
                        variant="outline" 
                        className="text-sm py-1 h-auto border-primary text-primary hover:bg-primary hover:text-white"
                        size="sm"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Verify ID Document
                      </Button>
                    </span>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Verify Your Identity</DialogTitle>
                      <DialogDescription>
                        This helps build trust in the SplitStay community. Your ID is never shared with other users.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg border-gray-300">
                        <div className="text-center">
                          <CreditCard className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm font-medium">Upload a government ID</p>
                          <p className="text-xs text-gray-500 mt-1">Passport, driver's license, or national ID card</p>
                          <Button size="sm" className="mt-3 bg-primary text-white">Select File</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Steps:</label>
                        <div className="flex items-center text-sm mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Upload your ID document</span>
                        </div>
                        <div className="flex items-center text-sm mb-1">
                          <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                          <span className="text-gray-600">Take a selfie to confirm it's you</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                          <span className="text-gray-600">Wait for verification (typically 24 hours)</span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                      <Button className="w-full sm:w-auto bg-primary text-white">
                        Continue Verification
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <span className="ml-2 text-xs text-gray-500">Required for safety</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Button 
          variant="outline"
          className="py-4 text-lg border-navy text-navy"
          onClick={() => navigate(isEditMode ? "/profile" : "/")}
        >
          {isEditMode ? "Cancel" : "Skip for Now"}
        </Button>
        <Button 
          type="button"
          style={{
            backgroundColor: "#001F3F", 
            color: "white",
            padding: "1rem 1.5rem",
            fontSize: "1.125rem",
            fontWeight: "500"
          }}
          onClick={handleCreateProfile}
        >
          {isEditMode ? "Save Changes" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default CreateProfile;