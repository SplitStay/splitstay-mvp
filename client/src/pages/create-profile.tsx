import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ArrowLeft, Plus, Search, Star, Check, Calendar, Info, X } from "lucide-react";
// import { DatePicker } from "@/components/date-picker";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
// import { getAge } from "@/lib/date-utils";
import { trackProfileCreation } from "@/lib/analytics";

const MAX_LANGUAGES = 5;
const MAX_TRAITS = 8;

// Define trait type
type TravelTrait = {
  id: string;
  label: string;
};

// Define interest type
type Interest = {
  id: string;
  label: string;
};

const CreateProfile: React.FC = () => {
  const toast = useToast();
  
  // Get location and check if we're in edit mode
  const [location, navigate] = useLocation();  
  const isEditMode = location.includes("/edit-profile");
  
  // Get existing profile data if in edit mode
  const existingProfile = isEditMode 
    ? JSON.parse(localStorage.getItem('splitstay_profile') || '{}')
    : null;
  
  // Personal info states - use Emily's data for demo mode
  const [name, setName] = useState(existingProfile?.name || "");
  const [bio, setBio] = useState(existingProfile?.bio || "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    existingProfile?.dateOfBirth ? new Date(existingProfile.dateOfBirth) : undefined
  );
  const [travelReason, setTravelReason] = useState<"leisure" | "business" | "bleisure">(
    existingProfile?.travelReason || "leisure"
  );
  const [profileImage, setProfileImage] = useState<string | undefined>(
    existingProfile?.profileImage
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    existingProfile?.languages || []
  );
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    existingProfile?.traits || []
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    existingProfile?.interests || []
  );
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For the MVP demo, automatically set Emily's profile image
      const emilyImageUrl = "/emily.png";
      setProfileImage(emilyImageUrl);
    }
  };
  
  // Set demo image for Emily's profile
  const setDemoProfileImage = () => {
    // Using hardcoded data URI to guarantee the image loads
    const emilyImageUrl = "https://res.cloudinary.com/demo/image/fetch/https://xsgames.co/randomusers/assets/avatars/female/43.jpg";
    setProfileImage(emilyImageUrl);
    // Also set the name to Emily for demo purposes
    setName("Emily Zhang");
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
    
    // Exploration style
    { id: "tourist", label: "Tourist" },
    { id: "local_experience", label: "Local Experience" },
    
    // Spending habits
    { id: "budget_conscious", label: "Budget Conscious" },
    { id: "luxury_traveler", label: "Luxury Traveler" },
    
    // Culinary preferences
    { id: "foodie", label: "Foodie" },
    { id: "picky_eater", label: "Picky Eater" },
    
    // Planning intensity
    { id: "scheduler", label: "Scheduler" },
    { id: "go_with_flow", label: "Go with the Flow" },
    
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column - Personal Info */}
        <div className="bg-white rounded-lg p-5 flex flex-col gap-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-2">
            <p className="text-sm font-medium text-center mb-2">Add Profile Photo</p>
            <div 
              className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3 relative overflow-hidden hover:opacity-90 transition-opacity border-2 border-dashed border-navy cursor-pointer"
              onClick={setDemoProfileImage} 
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
              className="border-gray-300"
            />
          </div>
          
          {/* Bio */}
          <div>
            <label className="block text-navy font-medium mb-1">Tell us about yourself</label>
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I love hiking, exploring, and catching sunrises"
              className="border-gray-300 resize-none min-h-[100px]"
            />
          </div>
          
          {/* Date of Birth */}
          <div>
            <label className="block text-navy font-medium mb-1">Date of birth</label>
            <Input 
              type="text"
              placeholder="1998-06-12"
              value={dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                try {
                  const date = new Date(e.target.value);
                  setDateOfBirth(date);
                } catch (error) {
                  console.error("Invalid date format");
                }
              }}
              className="border-gray-300"
            />
            {dateOfBirth && (
              <div className="text-sm text-gray-500 mt-1">
                Birth date: {dateOfBirth.toLocaleDateString()}
              </div>
            )}
          </div>
          
          {/* Travel Reason */}
          <div>
            <label className="block text-navy font-medium mb-1">I usually travel for</label>
            <RadioGroup 
              value={travelReason} 
              onValueChange={(value) => setTravelReason(value as "leisure" | "business" | "bleisure")}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="leisure" id="leisure" />
                <Label htmlFor="leisure">Leisure</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business">Business</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bleisure" id="bleisure" />
                <Label htmlFor="bleisure">Bleisure</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        {/* Right Column - Languages & Traits */}
        <div>
          {/* Languages */}
          <div className="bg-white rounded-lg p-5 mb-5">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-navy font-medium">Languages you speak</label>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  setTempSelectedLanguages([...selectedLanguages]);
                  setLanguageDialogOpen(true);
                }}
              >
                Add More
              </Button>
            </div>
            
            {selectedLanguages.length === 0 ? (
              <div className="text-sm text-gray-500 italic">
                Select languages you speak
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedLanguages.map(language => (
                  <Badge 
                    key={language}
                    className="bg-secondary-light text-primary hover:bg-secondary/80 cursor-pointer flex items-center gap-1 px-3 py-1.5"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                    <X size={14} className="ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Travel Traits */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-navy font-medium">Your travel traits</label>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  setTempSelectedTraits([...selectedTraits]);
                  setTraitDialogOpen(true);
                }}
              >
                Add More
              </Button>
            </div>
            
            {selectedTraits.length === 0 ? (
              <div className="text-sm text-gray-500 italic mb-3">
                Select traits that describe your travel style
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTraits.map(traitId => {
                  const trait = travelTraits.find(t => t.id === traitId);
                  return trait ? (
                    <Badge 
                      key={trait.id}
                      className="bg-secondary-light text-primary hover:bg-secondary/80 cursor-pointer flex items-center gap-1 px-3 py-1.5"
                      onClick={() => toggleTrait(trait.id)}
                    >
                      {trait.label}
                      <X size={14} className="ml-1" />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            
            {/* Most Common Traits Quick Selection */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Quick add popular traits:</p>
              <div className="flex flex-wrap gap-2">
                {travelTraits.slice(0, 8).map(trait => (
                  <Badge 
                    key={trait.id}
                    variant={selectedTraits.includes(trait.id) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-3 py-1.5",
                      selectedTraits.includes(trait.id) 
                        ? "bg-primary hover:bg-primary/80" 
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => toggleTrait(trait.id)}
                  >
                    {trait.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 flex gap-3 justify-center">
        {!isEditMode && (
          <Button
            variant="outline"
            onClick={handleSkip}
            className="min-w-[120px]"
          >
            Skip for now
          </Button>
        )}
        <Button
          onClick={handleCreateProfile}
          className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
        >
          {isEditMode ? "Save changes" : "Create profile"}
        </Button>
      </div>
      
      {/* Language Selection Dialog */}
      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Languages</DialogTitle>
          </DialogHeader>
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Search languages..." 
              value={languageSearch}
              onValueChange={setLanguageSearch}
            />
            <CommandEmpty>No language found.</CommandEmpty>
            <div className="max-h-[300px] overflow-y-auto">
              <CommandGroup>
                {allLanguages
                  .filter(language => 
                    language.toLowerCase().includes(languageSearch.toLowerCase())
                  )
                  .map(language => (
                    <CommandItem
                      key={language}
                      onSelect={() => {
                        if (tempSelectedLanguages.includes(language)) {
                          setTempSelectedLanguages(
                            tempSelectedLanguages.filter(l => l !== language)
                          );
                        } else {
                          if (tempSelectedLanguages.length < MAX_LANGUAGES) {
                            setTempSelectedLanguages([...tempSelectedLanguages, language]);
                          } else {
                            toast({
                              title: "Maximum languages reached",
                              description: `You can select up to ${MAX_LANGUAGES} languages.`,
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                    >
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        tempSelectedLanguages.includes(language)
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300"
                      )}>
                        {tempSelectedLanguages.includes(language) && (
                          <Check className="h-3 w-3 text-current" />
                        )}
                      </div>
                      <span>{language}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </div>
          </Command>
          <div className="flex flex-wrap gap-2 mt-2">
            {tempSelectedLanguages.map(language => (
              <Badge 
                key={language}
                className="px-3 py-1.5 bg-secondary-light text-primary"
              >
                {language}
              </Badge>
            ))}
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setLanguageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSelectedLanguages(tempSelectedLanguages);
                setLanguageDialogOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Trait Selection Dialog */}
      <Dialog open={traitDialogOpen} onOpenChange={setTraitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Travel Traits</DialogTitle>
          </DialogHeader>
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Search traits..." 
              value={traitSearch}
              onValueChange={setTraitSearch}
            />
            <CommandEmpty>No trait found.</CommandEmpty>
            <div className="max-h-[300px] overflow-y-auto">
              <CommandGroup>
                {travelTraits
                  .filter(trait => 
                    trait.label.toLowerCase().includes(traitSearch.toLowerCase())
                  )
                  .map(trait => (
                    <CommandItem
                      key={trait.id}
                      onSelect={() => {
                        if (tempSelectedTraits.includes(trait.id)) {
                          setTempSelectedTraits(
                            tempSelectedTraits.filter(id => id !== trait.id)
                          );
                        } else {
                          if (tempSelectedTraits.length < MAX_TRAITS) {
                            setTempSelectedTraits([...tempSelectedTraits, trait.id]);
                          } else {
                            toast({
                              title: "Maximum traits reached",
                              description: `You can select up to ${MAX_TRAITS} traits.`,
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                    >
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        tempSelectedTraits.includes(trait.id)
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300"
                      )}>
                        {tempSelectedTraits.includes(trait.id) && (
                          <Check className="h-3 w-3 text-current" />
                        )}
                      </div>
                      <span>{trait.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </div>
          </Command>
          <div className="flex flex-wrap gap-2 mt-2">
            {tempSelectedTraits.map(traitId => {
              const trait = travelTraits.find(t => t.id === traitId);
              return trait ? (
                <Badge 
                  key={trait.id}
                  className="px-3 py-1.5 bg-secondary-light text-primary"
                >
                  {trait.label}
                </Badge>
              ) : null;
            })}
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setTraitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSelectedTraits(tempSelectedTraits);
                setTraitDialogOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProfile;