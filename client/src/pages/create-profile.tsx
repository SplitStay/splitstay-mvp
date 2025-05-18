import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [_, navigate] = useLocation();
  
  // Personal info states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [travelReason, setTravelReason] = useState<"leisure" | "business">("leisure");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Travel traits
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  
  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
  
  const travelTraits: TravelTrait[] = [
    { id: "spontaneous", label: "Spontaneous" },
    { id: "street_food", label: "Street Food" },
    { id: "quiet_time", label: "Quiet Time" },
    { id: "early_bird", label: "Early Bird" },
    { id: "night_owl", label: "Night Owl" },
    { id: "planner", label: "Planner" },
    { id: "adventurous", label: "Adventurous" },
    { id: "relaxed", label: "Relaxed" },
  ];
  
  // Complete list of travel traits for search
  const allTravelTraits: TravelTrait[] = [
    ...travelTraits,
    { id: "fine_dining", label: "Fine Dining" },
    { id: "chatterbox", label: "Chatterbox" },
    { id: "party_animal", label: "Party Animal" },
    { id: "nature_lover", label: "Nature Lover" },
    { id: "city_lover", label: "City Lover" },
    { id: "bookworm", label: "Bookworm" },
    { id: "binge_watcher", label: "Binge Watcher" },
    { id: "coffee_lover", label: "Coffee Lover" },
    { id: "tea_enthusiast", label: "Tea Enthusiast" },
    { id: "foodie", label: "Foodie" },
    { id: "minimalist", label: "Minimalist" },
    { id: "shopping_addict", label: "Shopping Addict" },
    { id: "museum_goer", label: "Museum Goer" },
    { id: "history_buff", label: "History Buff" },
    { id: "beach_lover", label: "Beach Lover" },
    { id: "mountain_climber", label: "Mountain Climber" },
    { id: "yoga_enthusiast", label: "Yoga Enthusiast" },
    { id: "architecture_buff", label: "Architecture Buff" },
    { id: "photography_fan", label: "Photography Fan" },
    { id: "social_butterfly", label: "Social Butterfly" },
    { id: "tech_geek", label: "Tech Geek" },
    { id: "family_oriented", label: "Family Oriented" },
    { id: "adventure_seeker", label: "Adventure Seeker" },
    { id: "environmentalist", label: "Environmentalist" },
    { id: "sports_fan", label: "Sports Fan" },
    { id: "music_lover", label: "Music Lover" },
    { id: "art_enthusiast", label: "Art Enthusiast" },
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
      profileImage: profileImage
    }));
    
    // Navigate to the next step
    navigate("/find-roommate");
  };

  const handleSkip = () => {
    navigate("/find-roommate");
  };

  return (
    <div className="flex flex-col min-h-screen p-5 bg-cream">
      <h1 className="text-4xl font-bold text-navy text-center mt-0 mb-4">Complete Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column - Personal Info */}
        <div className="bg-white rounded-lg p-5 flex flex-col gap-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-2">
            <p className="text-sm font-medium text-center mb-2">Add Profile Photo</p>
            <label htmlFor="profile-upload" className="cursor-pointer">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3 relative overflow-hidden hover:opacity-90 transition-opacity border-2 border-dashed border-navy">
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

          {/* Date of Birth */}
          <div>
            <label className="block text-navy font-medium mb-1">Date of Birth</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal border-gray-300 relative"
                >
                  {dateOfBirth ? format(dateOfBirth, "PPP") : "Select date"}
                  <Calendar className="ml-auto h-4 w-4 opacity-50 absolute right-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <select 
                      value={dateOfBirth ? dateOfBirth.getMonth() : new Date().getMonth()} 
                      onChange={(e) => {
                        const newMonth = parseInt(e.target.value);
                        const newDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
                        newDate.setMonth(newMonth);
                        setDateOfBirth(newDate);
                      }}
                      className="px-2 py-1 rounded border border-gray-300"
                    >
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
                        <option key={month} value={index}>{month}</option>
                      ))}
                    </select>
                    <select 
                      value={dateOfBirth ? dateOfBirth.getFullYear() : new Date().getFullYear()} 
                      onChange={(e) => {
                        const newYear = parseInt(e.target.value);
                        const newDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
                        newDate.setFullYear(newYear);
                        setDateOfBirth(newDate);
                      }}
                      className="px-2 py-1 rounded border border-gray-300"
                    >
                      {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                  initialFocus
                  captionLayout="buttons"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
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

        {/* Right Column - ID Verification & Traits */}
        <div className="flex flex-col gap-5">
          {/* ID Verification Box */}
          <div className="bg-white rounded-lg p-5">
            <h2 className="text-2xl font-bold text-navy mb-3">ID Verification</h2>
            
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold">ID Verified</span>
            </div>
            
            <p className="text-gray-700">
              To host or be hosted, SplitStay requires a one-time ID verification.
              Your info is encrypted and never shared.
            </p>
          </div>

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
        </div>
      </div>
      
      {/* Bottom Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Button 
          variant="outline"
          className="py-4 text-lg border-navy text-navy"
          onClick={handleSkip}
        >
          Skip for Now
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
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CreateProfile;