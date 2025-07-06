import { useState } from "react";
import { X, Plus } from "lucide-react";

function CreateProfile() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [travelPhotos, setTravelPhotos] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    country: "",
    bio: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: ""
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
    console.log("Profile Data:", profileData);
    alert("Profile created! Check console for data.");
  };

  const isFormValid = formData.fullName && 
                      formData.country &&
                      formData.dayOfBirth && 
                      formData.monthOfBirth && 
                      formData.yearOfBirth &&
                      profileImagePreview;

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
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Dutch", "Japanese", "Korean", "Chinese", "Arabic", "Russian", "Hindi"
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
    "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", 
    "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", 
    "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Cambodia", 
    "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Cuba", 
    "Czech Republic", "Denmark", "Dominican Republic", "Ecuador", "Egypt", 
    "Estonia", "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", 
    "Greece", "Guatemala", "Honduras", "Hungary", "Iceland", "India", 
    "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", 
    "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon", 
    "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Morocco", "Netherlands", 
    "New Zealand", "Nicaragua", "Nigeria", "North Korea", "Norway", "Pakistan", 
    "Panama", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
    "Russia", "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia", 
    "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", 
    "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", 
    "United States", "Uruguay", "Venezuela", "Vietnam", "Yemen", "Zimbabwe"
  ];

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
            <button 
              onClick={() => setShowForm(true)}
              className="bg-navy text-white hover:bg-navy/90 text-lg px-8 py-6 rounded-lg font-semibold transition-all duration-300"
            >
              Create My Profile
            </button>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #f5f9ff, white)' }}>
      {/* Header */}
      <div className="text-center py-8">
        <button
          onClick={() => setShowForm(false)}
          className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors mb-6"
        >
          Back to Home
        </button>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1e2a78', fontFamily: 'system-ui, Inter, sans-serif' }}>
          ✨ Build your traveler profile
        </h1>
        <p className="text-gray-600 text-lg">
          Tell us about yourself and how you travel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[1350px] mx-auto px-4 pb-16">
        {/* 12-column grid layout: 5 cols left, 7 cols right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Step 1 - Left Panel (5 columns) */}
          <div className="lg:col-span-5 bg-white rounded-lg shadow-lg p-5">
            <div className="mb-3">
              <h2 className="text-lg font-bold mb-1" style={{ color: '#1e2a78' }}>
                👉 Tell us about you
              </h2>
              <p className="text-gray-600 text-xs">Let's start with the basics</p>
            </div>
            
            <div className="space-y-3">
              {/* Profile Photo Upload */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center">
                  {profileImagePreview ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setProfileImagePreview(null)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
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
                    className="cursor-pointer text-white px-4 py-2 rounded text-sm font-medium mt-3"
                    style={{ backgroundColor: '#1e2a78' }}
                  >
                    Upload Photo
                  </label>
                </div>
              </div>

              {/* Name Input - Now directly under profile photo */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  How do you want to be called? <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                  placeholder="e.g. Jane"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  autoFocus
                  required
                />
              </div>

              {/* Where are you from? - New required field */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Where are you from? <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => setFormData(prev => ({...prev, country: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                >
                  <option value="">Select your country</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* What makes you feel alive */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  What makes you feel alive? <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                  placeholder="e.g. chasing sunsets, street food tours, spontaneous hikes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
                />
              </div>



              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={formData.dayOfBirth}
                    onChange={(e) => setFormData(prev => ({...prev, dayOfBirth: e.target.value}))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
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
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
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
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    required
                  >
                    <option value="">Year</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be 18+</p>
              </div>

              {/* Languages Section - Moved from right column */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages you speak
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {languageOptions.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => handleLanguageToggle(language)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors h-6 ${
                        selectedLanguages.includes(language)
                          ? "text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      style={{ 
                        backgroundColor: selectedLanguages.includes(language) ? '#1e2a78' : undefined 
                      }}
                    >
                      {language}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Add language"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomLanguage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                
                {selectedLanguages.length > 0 && (
                  <div className="mb-2">
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

          {/* Step 2 - Right Panel (7 columns) */}
          <div className="lg:col-span-7 bg-white rounded-lg shadow-lg p-5">
            
            {/* Section 2: Tell us how you travel */}
            <div className="mb-8" style={{marginTop: '32px'}}>
              <div className="mb-3">
                <h2 className="text-lg font-bold mb-1" style={{ color: '#1e2a78' }}>
                  👉 Tell us how you travel
                </h2>
                <p className="text-gray-600 text-xs">Help us match you with compatible travelers</p>
              </div>
              
              {/* Travel Traits Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel traits <span className="text-gray-400">(select up to 5)</span>
                  <span className="ml-1 text-xs text-gray-500 cursor-help" title="These traits help us find roommates who share your travel style">
                    ℹ️
                  </span>
                </label>
                {/* Compact inline tags - flex-wrapped */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {traitOptions.map((trait) => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleTraitToggle(trait)}
                      disabled={!selectedTraits.includes(trait) && selectedTraits.length >= 5}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        selectedTraits.includes(trait)
                          ? "text-white"
                          : selectedTraits.length >= 5
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

            {/* Section 3: Tell us about your travel experience */}
            <div style={{marginTop: '32px'}}>
              <div className="mb-3">
                <h2 className="text-lg font-bold mb-1" style={{ color: '#1e2a78' }}>
                  👉 Tell us about your travel experience
                </h2>
                <p className="text-gray-600 text-xs">Share your travel background</p>
              </div>
              
              <div className="space-y-6">

              {/* Countries Visited Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Countries visited or lived in 
                  <span className="ml-1 text-xs text-gray-500 cursor-help" title="This helps us match you with travelers who share similar cultural experiences">
                    ℹ️
                  </span>
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="">Select a country...</option>
                    {countryOptions.filter(country => !selectedCountries.includes(country)).map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCustomCountry}
                    disabled={!customCountry}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {popularCountries.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => handleCountryToggle(country)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors h-6 ${
                        selectedCountries.includes(country)
                          ? "text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      style={{ 
                        backgroundColor: selectedCountries.includes(country) ? '#1e2a78' : undefined 
                      }}
                    >
                      {country}
                    </button>
                  ))}
                </div>
                {selectedCountries.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {selectedCountries.map((country) => (
                        <span 
                          key={country} 
                          className="inline-flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => handleCountryToggle(country)}
                            className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Travel Photos Section - Moved from left column */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top 3 Travel Photos <span className="text-gray-400">(optional)</span>
                </label>
                <div className="flex space-x-2">
                  {/* Always show 3 placeholders */}
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="relative">
                      {travelPhotos[index] ? (
                        <>
                          <img
                            src={travelPhotos[index]}
                            alt={`Travel photo ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border p-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeTravelPhoto(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                          >
                            <X className="w-2 h-2" />
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
                            className="cursor-pointer w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition-colors"
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
            onClick={() => alert("You can complete this later in your settings")}
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
  return <CreateProfile />;
}

export default App;