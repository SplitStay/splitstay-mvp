import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import splitstayLogo from "@assets/Splitstay Logo Transparent.png";
import HowItWorks from "./components/HowItWorks";
import Dashboard from "./pages/dashboard-new";
import DashboardTrips from "./pages/dashboard-trips";
import CreateTrip from "./pages/create-trip";
import TripDetails from "./pages/trip-details";
import Chat from "./pages/chat";

function CreateProfile() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [travelPhotos, setTravelPhotos] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(() => {
    // Check if URL has profile parameter to show form directly
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('profile') === 'true';
  });
  const [formData, setFormData] = useState({
    fullName: "",
    country: "",
    currentHome: "",
    bio: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    gender: "",
    influential_country: "",
    country_impact_reason: "",
    most_impactful_experience: ""
  });

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

  const handleLanguageDropdownChange = (language: string) => {
    if (language && !selectedLanguages.includes(language)) {
      setSelectedLanguages(prev => [...prev, language]);
      setCustomLanguage("");
    }
  };

  const handleCountryDropdownChange = (country: string) => {
    if (country && !selectedCountries.includes(country)) {
      setSelectedCountries(prev => [...prev, country]);
      setCustomCountry("");
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

  // Popular languages for quick selection
  const popularLanguages = ["English", "Spanish", "French", "German", "Dutch", "Italian", "Portuguese", "Chinese (Mandarin)", "Japanese", "Korean"];

  // Popular countries for quick selection  
  const popularCountries = ["United States", "France", "Spain", "Japan", "Thailand", "Netherlands", "Germany", "Italy", "United Kingdom", "Australia"];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      ...formData,
      selectedLanguages,
      selectedTraits,
      selectedCountries,
      profileImage: profileImagePreview,
      travelPhotos
    };
    
    // Store profile completion status and user data
    localStorage.setItem('profileCreated', 'true');
    localStorage.setItem('user', JSON.stringify({
      firstName: formData.fullName.split(' ')[0],
      fullName: formData.fullName,
      ...profileData
    }));
    
    // Redirect to dashboard
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSkip = () => {
    // Store that profile was skipped
    localStorage.setItem('profileCreated', 'false');
    localStorage.setItem('user', JSON.stringify({
      firstName: 'traveler',
      fullName: 'Guest User'
    }));
    
    // Redirect to dashboard
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const isFormValid = formData.fullName && 
                      formData.country &&
                      formData.dayOfBirth && 
                      formData.monthOfBirth && 
                      formData.yearOfBirth &&
                      profileImagePreview &&
                      selectedLanguages.length > 0;

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

  const languageOptions = [
    // Most common/popular languages first
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
  ];

  // Landing page view
  if (!showForm) {
    return (
      <div className="min-h-screen bg-cream py-1">
        {/* Header Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 mb-2">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img 
                  src={splitstayLogo} 
                  alt="SplitStay Logo" 
                  className="h-8"
                />
                <span className="text-navy font-bold text-lg">SplitStay</span>
              </div>
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-4 md:space-x-6">
                  <a 
                    href="/" 
                    className="text-navy font-medium border-b-2 border-navy pb-1 text-sm md:text-base"
                  >
                    Home
                  </a>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/how-it-works');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="text-gray-700 hover:text-navy font-medium transition-colors text-sm md:text-base"
                  >
                    How it Works
                  </button>
                </nav>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-3 py-2 md:px-4 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors font-medium text-sm md:text-base"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full text-center">
          
          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src={splitstayLogo} 
              alt="SplitStay Logo" 
              className="h-48 md:h-60 mb-1"
            />
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-3 mt-1">
            Share your accommodation. Save money. Meet travelers.
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-navy mb-4 leading-relaxed max-w-4xl mx-auto">
            You're early — and that's exactly the point. SplitStay is just opening up. The first few travelers shape what this becomes. Want to be one of them?
          </p>
          
          {/* User Path Selection Cards */}
          <div className="w-full mb-4 max-w-6xl mx-auto">
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
            <button 
              onClick={() => setShowForm(true)}
              className="bg-navy text-white hover:bg-navy/90 text-lg px-8 py-6 rounded-lg font-semibold transition-all duration-300"
            >
              Create My Profile
            </button>
            <p className="mt-4 text-gray-600">
              Already have a profile?{' '}
              <button 
                onClick={() => {
                  window.history.pushState({}, '', '/login');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="text-navy hover:text-navy/80 font-medium underline"
              >
                Log in
              </button>
            </p>
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

              {/* Verified Matches Card */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

  return (
    <div className="min-h-screen bg-cream">
      {/* Header with Back Button */}
      <div className="max-w-[1350px] mx-auto px-4 pt-3 pb-4">
        {/* Mobile Layout - Stack vertically */}
        <div className="block md:hidden mb-4">
          <button
            onClick={() => setShowForm(false)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2 mb-3"
            style={{ color: '#4B4B4B', fontFamily: 'system-ui, Inter, sans-serif' }}
          >
            ← Back to Home
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
              onClick={() => setShowForm(false)}
              className="absolute left-0 top-0 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2"
              style={{ color: '#4B4B4B', fontFamily: 'system-ui, Inter, sans-serif' }}
            >
              ← Back to Home
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

      <form onSubmit={handleSubmit} className="max-w-[1300px] mx-auto px-8 pb-16">
        {/* 2-column layout: 50/50 split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN — Personal Basics */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#1e2a78' }}>
                🪪 Tell us about you
              </h2>
            </div>
            
            <div className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  {profileImagePreview ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setProfileImagePreview(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
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
                  <label
                    htmlFor="profile-image-upload"
                    className="cursor-pointer text-white px-6 py-2 rounded-lg text-sm font-medium mt-4 shadow-md hover:shadow-lg transition-all duration-200"
                    style={{ backgroundColor: '#1e2a78' }}
                  >
                    {profileImagePreview ? "Change Photo" : "Upload Photo"}
                  </label>
                </div>
              </div>

              {/* Gender Selection */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What is your gender?
                </label>
                <div className="flex justify-center">
                  <div className="bg-gray-100 p-1 rounded-full inline-flex">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, gender: "male"}))}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 transform ${
                        formData.gender === "male" 
                          ? "text-white shadow-lg scale-105" 
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-200 hover:scale-105 hover:shadow-md"
                      }`}
                      style={{ 
                        backgroundColor: formData.gender === "male" ? '#1e2a78' : 'transparent'
                      }}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, gender: "female"}))}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 transform ${
                        formData.gender === "female" 
                          ? "text-white shadow-lg scale-105" 
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-200 hover:scale-105 hover:shadow-md"
                      }`}
                      style={{ 
                        backgroundColor: formData.gender === "female" ? '#1e2a78' : 'transparent'
                      }}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </div>

              {/* How do you want to be called */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-3">
                  How do you want to be called? <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                  placeholder="e.g. Jane"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                  required
                />
              </div>

              {/* Where were you born */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-3">
                  Where were you born? <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => setFormData(prev => ({...prev, country: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select your birth country</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Where do you currently call home */}
              <div>
                <label htmlFor="currentHome" className="block text-sm font-medium text-gray-700 mb-3">
                  Where do you currently call home? <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  id="currentHome"
                  value={formData.currentHome || ''}
                  onChange={(e) => setFormData(prev => ({...prev, currentHome: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select your current home</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* What makes you feel alive */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-3">
                  What makes you feel alive? <span className="text-gray-400">(optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Share moments, passions, or travel rituals</p>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                  placeholder="e.g. chasing sunsets, street food tours, spontaneous hikes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>



              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={formData.dayOfBirth}
                    onChange={(e) => setFormData(prev => ({...prev, dayOfBirth: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Year</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2">Must be 18+</p>
              </div>

              {/* Languages Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Languages you speak <span className="text-red-500">*</span>
                </label>
                
                {/* Popular Languages Quick Selection */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {popularLanguages.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => handleLanguageDropdownChange(language)}
                      disabled={selectedLanguages.includes(language)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedLanguages.includes(language)
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md"
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
                
                <div className="mb-3">
                  <select
                    value=""
                    onChange={(e) => handleLanguageDropdownChange(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    <option value="">More languages...</option>
                    {languageOptions.filter(language => !selectedLanguages.includes(language)).map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>
                
                {selectedLanguages.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {selectedLanguages.map((language) => (
                        <span 
                          key={language} 
                          className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => handleLanguageToggle(language)}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Travel Style */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#1e2a78' }}>
                🌍 Build your traveler profile
              </h2>
            </div>

            <div className="space-y-8">
              {/* Section: Tell us how you travel */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1e2a78' }}>
                  🧭 Tell us how you travel
                </h3>
                
                {/* Travel Traits Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Travel traits <span className="text-gray-400">(select up to 5)</span>
                  </label>
                  {/* Modern pill-style trait buttons */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {traitOptions.map((trait) => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => handleTraitToggle(trait)}
                        disabled={!selectedTraits.includes(trait) && selectedTraits.length >= 5}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedTraits.includes(trait)
                            ? "text-white shadow-md scale-105"
                            : selectedTraits.length >= 5
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md hover:scale-105"
                        }`}
                        style={{ 
                          backgroundColor: selectedTraits.includes(trait) ? '#1e2a78' : undefined 
                        }}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                {selectedTraits.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {selectedTraits.map((trait) => (
                        <span 
                          key={trait} 
                          className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs"
                        >
                          {trait}
                          <button
                            type="button"
                            onClick={() => handleTraitToggle(trait)}
                            className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

              {/* Section: Share your most meaningful travel experiences */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1e2a78' }}>
                  📖 Share your most meaningful travel experiences
                </h3>
                
                <div className="space-y-6">
                  {/* Prompt 1: Most influential country */}
                  <div>
                    <label htmlFor="influential_country" className="block text-sm font-medium text-gray-700 mb-3">
                      Which country has influenced you the most?
                    </label>
                    <select
                      id="influential_country"
                      value={formData.influential_country || ''}
                      onChange={(e) => setFormData(prev => ({...prev, influential_country: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a country</option>
                      {countryOptions.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  {/* Follow-up: Why did this country impact you */}
                  {formData.influential_country && (
                    <div>
                      <label htmlFor="country_impact_reason" className="block text-sm font-medium text-gray-700 mb-3">
                        Why did this country impact you?
                      </label>
                      <textarea
                        id="country_impact_reason"
                        value={formData.country_impact_reason}
                        onChange={(e) => setFormData(prev => ({...prev, country_impact_reason: e.target.value}))}
                        placeholder="Share what made this place special to you..."
                        rows={3}
                        maxLength={250}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      />
                      <div className="text-xs text-gray-500 text-right mt-2">
                        {formData.country_impact_reason.length}/250 characters
                      </div>
                    </div>
                  )}

                  {/* Prompt 2: Most impactful travel experience */}
                  <div>
                    <label htmlFor="most_impactful_experience" className="block text-sm font-medium text-gray-700 mb-3">
                      What travel experience has impacted you most deeply? <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      id="most_impactful_experience"
                      value={formData.most_impactful_experience}
                      onChange={(e) => setFormData(prev => ({...prev, most_impactful_experience: e.target.value}))}
                      placeholder="Tell us about a moment, encounter, or journey that changed your perspective..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Travel Photos */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1e2a78' }}>
                  📸 Top 3 Travel Photos
                </h3>
                <div className="flex gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="relative">
                      {travelPhotos[index] ? (
                        <>
                          <img
                            src={travelPhotos[index]}
                            alt={`Travel photo ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeTravelPhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
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
                            className="cursor-pointer w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-400" />
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

      {/* Compact Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-2 justify-center">
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-5 py-2 text-sm font-semibold rounded transition-all duration-300 ${
              isFormValid
                ? "text-white shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            style={{ 
              fontFamily: 'system-ui, Inter, sans-serif',
              backgroundColor: isFormValid ? '#1e2a78' : '#d1d5db'
            }}
          >
            Create My Profile
          </button>
          
          <button 
            type="button"
            onClick={handleSkip}
            className="px-5 py-2 text-sm font-semibold transition-colors text-gray-600 hover:text-gray-800"
            style={{ 
              fontFamily: 'system-ui, Inter, sans-serif'
            }}
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple router to handle URL-based routing
function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route to different components based on path
  if (currentPath === '/how-it-works') {
    return <HowItWorks />;
  }
  
  if (currentPath === '/dashboard') {
    return <DashboardTrips />;
  }
  
  if (currentPath === '/create-trip') {
    return <CreateTrip />;
  }
  
  if (currentPath.startsWith('/trip/')) {
    return <TripDetails />;
  }
  
  if (currentPath.startsWith('/chat/')) {
    return <Chat />;
  }
  
  if (currentPath === '/profile-setup') {
    return <CreateProfile />;
  }

  return <CreateProfile />;
}

export default App;