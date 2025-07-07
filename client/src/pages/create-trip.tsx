import { useState } from "react";
import { ArrowLeft, Plus, MapPin, Calendar, DollarSign, Users, Globe, Heart, Share2, Copy, MessageCircle } from "lucide-react";

interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  accommodationLink: string;
  platform: string;
  description: string;
  costPerNight: string;
  spotsAvailable: string;
  languages: string[];
  tripType: string;
  preferredCoTraveler: string;
}

export default function CreateTrip() {
  const [currentStep, setCurrentStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    accommodationLink: '',
    platform: '',
    description: '',
    costPerNight: '',
    spotsAvailable: '1',
    languages: [],
    tripType: '',
    preferredCoTraveler: 'open'
  });

  const platforms = [
    { name: 'Booking.com', domains: ['booking.com'], icon: '🏨' },
    { name: 'Airbnb', domains: ['airbnb.com'], icon: '🏠' },
    { name: 'Agoda', domains: ['agoda.com'], icon: '🏢' },
    { name: 'Hostelworld', domains: ['hostelworld.com'], icon: '🎒' },
    { name: 'Hotels.com', domains: ['hotels.com'], icon: '🏨' },
    { name: 'Other', domains: [], icon: '🔗' }
  ];

  const tripTypes = ['Chill', 'Party', 'Culture', 'Mixed'];
  const coTravelerOptions = [
    { value: 'open', label: 'Open to Anyone' },
    { value: 'same-gender', label: 'Same Gender Only' },
    { value: 'similar-age', label: 'Similar Age (±5 years)' },
    { value: 'verified-only', label: 'Verified Users Only' }
  ];

  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'];

  const handleBack = () => {
    window.history.back();
  };

  const detectPlatform = (url: string) => {
    const platform = platforms.find(p => 
      p.domains.some(domain => url.toLowerCase().includes(domain))
    );
    return platform ? platform.name : 'Other';
  };

  const handleInputChange = (field: keyof TripFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'accommodationLink' && typeof value === 'string') {
      const detectedPlatform = detectPlatform(value);
      setFormData(prev => ({
        ...prev,
        platform: detectedPlatform
      }));
    }
  };

  const handleLanguageToggle = (language: string) => {
    const currentLanguages = formData.languages;
    const updatedLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(l => l !== language)
      : [...currentLanguages, language];
    
    handleInputChange('languages', updatedLanguages);
  };

  const isFormValid = () => {
    return formData.destination.trim() && 
           formData.startDate && 
           formData.endDate && 
           formData.accommodationLink.trim() && 
           formData.description.trim() &&
           formData.description.length <= 300;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store trip in localStorage for now
      const trips = JSON.parse(localStorage.getItem('splitstay_user_trips') || '[]');
      const newTrip = {
        id: Date.now(),
        ...formData,
        userId: 'current_user', // Replace with actual user ID
        createdAt: new Date().toISOString()
      };
      trips.push(newTrip);
      localStorage.setItem('splitstay_user_trips', JSON.stringify(trips));
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Error submitting trip:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlatformIcon = (platformName: string) => {
    const platform = platforms.find(p => p.name === platformName);
    return platform ? platform.icon : '🔗';
  };

  const handleShare = (type: 'copy' | 'whatsapp' | 'instagram') => {
    const tripUrl = `${window.location.origin}/trip/share/${Date.now()}`;
    const text = `Split this stay with me in ${formData.destination}! ${formData.startDate} - ${formData.endDate}`;

    switch (type) {
      case 'copy':
        navigator.clipboard.writeText(tripUrl);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + tripUrl)}`);
        break;
      case 'instagram':
        // Instagram sharing would require Instagram API integration
        navigator.clipboard.writeText(text);
        break;
    }
  };

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900">Trip Posted Successfully!</h1>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trip Successfully Posted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your trip to {formData.destination} is now live. Start connecting with fellow travelers!
            </p>
          </div>

          {/* Trip Preview Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Trip Preview</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-white">
                    {JSON.parse(localStorage.getItem('splitstay_user') || '{}').firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {formData.destination}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {formData.startDate} - {formData.endDate}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">"{formData.description}"</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl">{getPlatformIcon(formData.platform)}</span>
                    <span className="text-sm text-gray-600">{formData.platform}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-center text-blue-600 font-medium">Split this stay with me!</p>
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Trip</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Instagram
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Plan Your First Trip</h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Trip Post</h2>
          
          {/* Required Fields */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Required Information</h3>
            
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination (City, Country) *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="e.g. Tokyo, Japan"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Accommodation Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accommodation Link *
              </label>
              <input
                type="url"
                value={formData.accommodationLink}
                onChange={(e) => handleInputChange('accommodationLink', e.target.value)}
                placeholder="https://booking.com/hotel/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {formData.platform && (
                <p className="text-sm text-gray-600 mt-1">
                  Detected platform: {getPlatformIcon(formData.platform)} {formData.platform}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description * (max 300 characters)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell others about your trip plans and what you're looking for in a travel buddy..."
                maxLength={300}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/300 characters
              </p>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Optional Details</h3>
            
            {/* Cost and Spots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost per Night
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.costPerNight}
                    onChange={(e) => handleInputChange('costPerNight', e.target.value)}
                    placeholder="50"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Spots Available
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={formData.spotsAvailable}
                    onChange={(e) => handleInputChange('spotsAvailable', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 person</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4+ people</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => handleLanguageToggle(language)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.languages.includes(language)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tripTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('tripType', type === formData.tripType ? '' : type)}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      formData.tripType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Co-traveler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Co-traveler
              </label>
              <select
                value={formData.preferredCoTraveler}
                onChange={(e) => handleInputChange('preferredCoTraveler', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {coTravelerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className={`flex-1 px-6 py-3 rounded-md transition-colors ${
                isFormValid() && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Posting Trip...' : 'Post Trip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}