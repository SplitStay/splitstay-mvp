import { useState } from "react";
import { ArrowLeft, Plus, MapPin, Calendar, DollarSign, Users, Globe, Heart, Share2, Copy, MessageCircle, Loader2 } from "lucide-react";

interface TripFormData {
  accommodationLink: string;
  platform: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  costPerNight: string;
  currency: string;
  spotsAvailable: string;
  tripVibes: string[];
  preferredCoTraveler: string;
  bookingStatus: 'booked' | 'not-booked';
  accommodationImage?: string;
  roomType?: string;
  roomSize?: string;
  extractedPrice?: string;
  hotelName?: string;
  amenities?: string[];
}

interface AccommodationDetails {
  image: string;
  roomType: string;
  price: string;
  roomSize: string;
  title: string;
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  amenities?: string[];
}

export default function CreateTrip() {
  const [currentStep, setCurrentStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [isSearchingDestinations, setIsSearchingDestinations] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [accommodationDetails, setAccommodationDetails] = useState<AccommodationDetails | null>(null);
  const [isLoadingAccommodation, setIsLoadingAccommodation] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({
    accommodationLink: '',
    platform: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    costPerNight: '',
    currency: 'USD',
    spotsAvailable: '1',
    tripVibes: [],
    preferredCoTraveler: 'open',
    bookingStatus: 'not-booked'
  });

  const platforms = [
    { name: 'Booking.com', domains: ['booking.com'], icon: '🏨' },
    { name: 'Airbnb', domains: ['airbnb.com'], icon: '🏠' },
    { name: 'Agoda', domains: ['agoda.com'], icon: '🏢' },
    { name: 'Hostelworld', domains: ['hostelworld.com'], icon: '🎒' },
    { name: 'Hotels.com', domains: ['hotels.com'], icon: '🏨' },
    { name: 'Other', domains: [], icon: '🔗' }
  ];

  const tripVibes = ['Chill', 'Cultural', 'Active', 'Social', 'Work-friendly', 'Spiritual / Wellness'];
  const currencies = ['USD', 'EUR', 'GBP', 'PHP', 'THB', 'IDR', 'SGD', 'AUD', 'CAD', 'JPY'];
  const coTravelerOptions = [
    { value: 'open', label: 'Open to Anyone' },
    { value: 'same-gender', label: 'Same Gender' },
    { value: 'similar-age', label: 'Similar Age' },
    { value: 'digital-nomads', label: 'Digital Nomads' }
  ];

  // Popular destinations for autocomplete
  const popularDestinations = [
    'Tokyo, Japan', 'Bangkok, Thailand', 'Singapore, Singapore', 'Manila, Philippines',
    'Seoul, South Korea', 'Kuala Lumpur, Malaysia', 'Ho Chi Minh City, Vietnam',
    'Jakarta, Indonesia', 'Hong Kong, Hong Kong', 'Taipei, Taiwan',
    'London, United Kingdom', 'Paris, France', 'Barcelona, Spain', 'Berlin, Germany',
    'Amsterdam, Netherlands', 'Rome, Italy', 'Prague, Czech Republic', 'Vienna, Austria',
    'Brussels, Belgium', 'Madrid, Spain', 'Lisbon, Portugal', 'Copenhagen, Denmark',
    'Stockholm, Sweden', 'Oslo, Norway', 'Helsinki, Finland', 'Zurich, Switzerland',
    'Milan, Italy', 'Munich, Germany', 'Budapest, Hungary', 'Warsaw, Poland',
    'New York, United States', 'Los Angeles, United States', 'San Francisco, United States',
    'Toronto, Canada', 'Vancouver, Canada', 'Sydney, Australia', 'Melbourne, Australia',
    'Dubai, UAE', 'Istanbul, Turkey', 'Cairo, Egypt', 'Mumbai, India', 'Delhi, India',
    'Bali, Indonesia', 'Phuket, Thailand', 'Boracay, Philippines', 'Jeju, South Korea',
    'Kyoto, Japan', 'Osaka, Japan', 'Chiang Mai, Thailand', 'Penang, Malaysia',
    'Hanoi, Vietnam', 'Da Nang, Vietnam', 'Siem Reap, Cambodia', 'Yangon, Myanmar',
    'Shanghai, China', 'Beijing, China', 'Guangzhou, China', 'Shenzhen, China',
    'Moscow, Russia', 'St. Petersburg, Russia', 'Tel Aviv, Israel', 'Athens, Greece'
  ];



  const handleBack = () => {
    window.history.back();
  };

  const detectPlatform = (url: string) => {
    const platform = platforms.find(p => 
      p.domains.some(domain => url.toLowerCase().includes(domain))
    );
    return platform ? platform.name : 'Other';
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchAccommodationDetails = async (url: string) => {
    setIsLoadingAccommodation(true);
    setAccommodationDetails(null);
    
    try {
      const response = await fetch('/api/accommodation/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const details = await response.json();
        setAccommodationDetails(details);
        
        // Update form data with extracted information
        setFormData(prev => ({
          ...prev,
          accommodationImage: details.image,
          roomType: details.roomType,
          roomSize: details.roomSize,
          extractedPrice: details.price,
          hotelName: details.title,
          amenities: details.amenities || [],
          // Auto-fill destination if extracted from URL
          destination: details.location || prev.destination,
          // Auto-fill dates if found in URL parameters
          startDate: details.checkInDate || prev.startDate,
          endDate: details.checkOutDate || prev.endDate,
          // Auto-fill cost if extracted
          costPerNight: details.price?.replace(/[^0-9.]/g, '') || prev.costPerNight
        }));
      }
    } catch (error) {
      console.error('Error fetching accommodation details:', error);
    } finally {
      setIsLoadingAccommodation(false);
    }
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
      
      // Fetch accommodation details if it's a valid URL
      if (value.trim() && isValidUrl(value)) {
        fetchAccommodationDetails(value);
      } else {
        setAccommodationDetails(null);
      }
    }

    // Handle destination search with debouncing
    if (field === 'destination' && typeof value === 'string') {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      if (value.length > 2) {
        // Debounce the search to avoid too many API calls
        const timeout = setTimeout(() => {
          searchCities(value);
        }, 500);
        setSearchTimeout(timeout);
      } else {
        setShowDestinationSuggestions(false);
        setDestinationSuggestions([]);
        setIsSearchingDestinations(false);
      }
    }
  };

  const handleTripVibeToggle = (vibe: string) => {
    setFormData(prev => {
      const currentVibes = prev.tripVibes;
      const isSelected = currentVibes.includes(vibe);
      
      if (isSelected) {
        // Remove the vibe
        return {
          ...prev,
          tripVibes: currentVibes.filter(v => v !== vibe)
        };
      } else {
        // Add the vibe, but only if we don't already have 2
        if (currentVibes.length < 2) {
          return {
            ...prev,
            tripVibes: [...currentVibes, vibe]
          };
        }
        return prev; // Don't add if already at max
      }
    });
  };

  const searchCities = async (query: string) => {
    if (query.length < 3) return;
    
    setIsSearchingDestinations(true);
    try {
      // Use Nominatim OpenStreetMap geocoding API with broader search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&countrycodes=`
      );
      
      if (response.ok) {
        const data = await response.json();
        // console.log('API Response:', data); // Debug log
        
        const cities = data
          .filter((item: any) => {
            // Very permissive filtering - just need a display name
            return item.display_name && item.display_name.length > 0;
          })
          .map((item: any) => {
            // Extract city and country from display_name
            const parts = item.display_name.split(', ');
            if (parts.length >= 2) {
              const city = parts[0];
              const country = parts[parts.length - 1];
              return `${city}, ${country}`;
            }
            return item.display_name;
          })
          .filter((city, index, self) => self.indexOf(city) === index) // Remove duplicates
          .slice(0, 8);
        
        setDestinationSuggestions(cities);
        setShowDestinationSuggestions(cities.length > 0);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      // Fallback to local search if API fails
      const filtered = popularDestinations.filter(dest =>
        dest.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setDestinationSuggestions(filtered);
      setShowDestinationSuggestions(filtered.length > 0);
    } finally {
      setIsSearchingDestinations(false);
    }
  };

  const handleDestinationSelect = (destination: string) => {
    setFormData(prev => ({
      ...prev,
      destination: destination
    }));
    setShowDestinationSuggestions(false);
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

  const handleShare = async (type: 'copy' | 'whatsapp' | 'instagram') => {
    const tripUrl = `${window.location.origin}/t/${Date.now()}`;
    const text = `Split this stay with me in ${formData.destination}! ${formData.startDate} - ${formData.endDate}`;

    switch (type) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(tripUrl);
          alert('Link copied to clipboard!');
        } catch (error) {
          console.error('Failed to copy link:', error);
          alert('Failed to copy link. Please try again.');
        }
        break;
      case 'whatsapp':
        const whatsappText = `${text}\n\nCheck out my travel plans: ${tripUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`);
        break;
      case 'instagram':
        // For Instagram, we'll copy the text for users to paste in their story
        try {
          await navigator.clipboard.writeText(`${text}\n\n${tripUrl}`);
          alert('Text copied! You can now paste it in your Instagram story.');
        } catch (error) {
          console.error('Failed to copy text:', error);
          alert('Failed to copy text. Please try again.');
        }
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
              🎉 Your trip is live! Want to find a match faster?
            </h2>
            <p className="text-gray-600 mb-6">
              Your trip to {formData.destination} is now posted. Share it to attract more travel companions!
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Shareable Link
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Share on WhatsApp
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share on Instagram
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
          
          {/* Step 1: Accommodation Link */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Step 1: Accommodation Link</h3>
            
            {/* Accommodation Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Link *
              </label>
              <input
                type="url"
                value={formData.accommodationLink}
                onChange={(e) => handleInputChange('accommodationLink', e.target.value)}
                placeholder="https://booking.com/hotel/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              {/* Platform Detection */}
              {formData.platform && (
                <p className="text-sm text-gray-600 mt-1">
                  Detected platform: {getPlatformIcon(formData.platform)} {formData.platform}
                </p>
              )}
              
              {/* Loading State */}
              {isLoadingAccommodation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">Analyzing accommodation details...</span>
                  </div>
                </div>
              )}
              
              {/* Smart Accommodation Summary Card */}
              {accommodationDetails && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-4">
                    {/* Room Image */}
                    {accommodationDetails.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={accommodationDetails.image} 
                          alt="Room" 
                          className="w-16 h-16 rounded-lg object-cover shadow-sm"
                        />
                      </div>
                    )}
                    
                    {/* Details */}
                    <div className="flex-1">
                      {accommodationDetails.title && (
                        <h4 className="font-semibold text-gray-900 mb-1">{accommodationDetails.title}</h4>
                      )}
                      <div className="space-y-1 text-sm text-gray-600">
                        {accommodationDetails.roomType && (
                          <p><span className="font-medium">Room:</span> {accommodationDetails.roomType}</p>
                        )}
                        {accommodationDetails.price && (
                          <p><span className="font-medium">Price:</span> {accommodationDetails.price}</p>
                        )}
                        {accommodationDetails.roomSize && (
                          <p><span className="font-medium">Size:</span> {accommodationDetails.roomSize}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Trip Details - Only show after accommodation detected */}
          {(accommodationDetails || formData.destination) && (
            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Step 2: Trip Details</h3>
              
              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination (City, Country) *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  {isSearchingDestinations && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                    placeholder="Type any city, e.g. Barcelona, Spain"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {destinationSuggestions.map((destination, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDestinationSelect(destination)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{destination}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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

            {/* Booking Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Have you already booked this room? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bookingStatus"
                    value="not-booked"
                    checked={formData.bookingStatus === 'not-booked'}
                    onChange={(e) => handleInputChange('bookingStatus', e.target.value)}
                    className="mr-2"
                  />
                  <span>Not yet booked (preferred option)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bookingStatus"
                    value="booked"
                    checked={formData.bookingStatus === 'booked'}
                    onChange={(e) => handleInputChange('bookingStatus', e.target.value)}
                    className="mr-2"
                  />
                  <span>Yes, already booked</span>
                </label>
              </div>
              
              {/* Warning message for already booked */}
              {formData.bookingStatus === 'booked' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">⚠️</span>
                    <p className="text-sm text-yellow-800">
                      <strong>Heads up!</strong> If no match is found, you may be responsible for the full room cost. Check the platform for cancellation options.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Step 3: Trip Details */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Step 3: Trip Details</h3>
            
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
            
            {/* Cost and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost per Night
                </label>
                <input
                  type="number"
                  value={formData.costPerNight}
                  onChange={(e) => handleInputChange('costPerNight', e.target.value)}
                  placeholder="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Number of Spots Available */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Spots Available
              </label>
              <select
                value={formData.spotsAvailable}
                onChange={(e) => handleInputChange('spotsAvailable', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 spot</option>
                <option value="2">2 spots</option>
              </select>
            </div>



            {/* Trip Vibe Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Vibe (Select up to 2)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tripVibes.map((vibe) => (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => handleTripVibeToggle(vibe)}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      formData.tripVibes.includes(vibe)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {vibe}
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