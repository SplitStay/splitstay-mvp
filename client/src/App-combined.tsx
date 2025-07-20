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
  const [selectedLearningLanguages, setSelectedLearningLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [travelPhotos, setTravelPhotos] = useState<string[]>([]);
  const [showMoreLanguages, setShowMoreLanguages] = useState(false);
  const [showMoreLearningLanguages, setShowMoreLearningLanguages] = useState(false);
  const [showMoreTraits, setShowMoreTraits] = useState(false);
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

  // Comprehensive global cities database
  const cities = [
    // Europe
    "Lyon, France", "Toulouse, France", "Nice, France", "Nantes, France", "Strasbourg, France", "Montpellier, France", "Bordeaux, France", "Lille, France", "Rennes, France", "Reims, France", "Le Havre, France", "Saint-Étienne, France", "Toulon, France", "Grenoble, France", "Dijon, France", "Angers, France", "Nîmes, France", "Villeurbanne, France", "Le Mans, France", "Aix-en-Provence, France", "Clermont-Ferrand, France", "Brest, France", "Limoges, France", "Tours, France", "Amiens, France", "Perpignan, France", "Metz, France", "Besançon, France", "Boulogne-Billancourt, France", "Orléans, France", "Mulhouse, France", "Rouen, France", "Pau, France", "Caen, France", "La Rochelle, France", "Calais, France", "Cannes, France", "Paris, France", "Marseille, France",
    
    "Barcelona, Spain", "Madrid, Spain", "Valencia, Spain", "Seville, Spain", "Zaragoza, Spain", "Málaga, Spain", "Murcia, Spain", "Palma, Spain", "Las Palmas, Spain", "Bilbao, Spain", "Alicante, Spain", "Córdoba, Spain", "Valladolid, Spain", "Vigo, Spain", "Gijón, Spain", "Hospitalet de Llobregat, Spain", "Vitoria-Gasteiz, Spain", "A Coruña, Spain", "Granada, Spain", "Elche, Spain", "Oviedo, Spain", "Badalona, Spain", "Cartagena, Spain", "Terrassa, Spain", "Jerez de la Frontera, Spain", "Sabadell, Spain", "Móstoles, Spain", "Santa Cruz de Tenerife, Spain", "Pamplona, Spain", "Almería, Spain",
    
    "Berlin, Germany", "Hamburg, Germany", "Munich, Germany", "Cologne, Germany", "Frankfurt, Germany", "Stuttgart, Germany", "Düsseldorf, Germany", "Dortmund, Germany", "Essen, Germany", "Leipzig, Germany", "Bremen, Germany", "Dresden, Germany", "Hanover, Germany", "Nuremberg, Germany", "Duisburg, Germany", "Bochum, Germany", "Wuppertal, Germany", "Bielefeld, Germany", "Bonn, Germany", "Münster, Germany", "Karlsruhe, Germany", "Mannheim, Germany", "Augsburg, Germany", "Wiesbaden, Germany", "Gelsenkirchen, Germany", "Mönchengladbach, Germany", "Braunschweig, Germany", "Chemnitz, Germany", "Kiel, Germany", "Aachen, Germany",
    
    "Rome, Italy", "Milan, Italy", "Naples, Italy", "Turin, Italy", "Palermo, Italy", "Genoa, Italy", "Bologna, Italy", "Florence, Italy", "Bari, Italy", "Catania, Italy", "Venice, Italy", "Verona, Italy", "Messina, Italy", "Padua, Italy", "Trieste, Italy", "Taranto, Italy", "Brescia, Italy", "Prato, Italy", "Parma, Italy", "Reggio Calabria, Italy", "Modena, Italy", "Reggio Emilia, Italy", "Perugia, Italy", "Livorno, Italy", "Ravenna, Italy", "Cagliari, Italy", "Foggia, Italy", "Rimini, Italy", "Salerno, Italy", "Ferrara, Italy",
    
    "London, United Kingdom", "Birmingham, United Kingdom", "Leeds, United Kingdom", "Glasgow, United Kingdom", "Sheffield, United Kingdom", "Bradford, United Kingdom", "Liverpool, United Kingdom", "Edinburgh, United Kingdom", "Manchester, United Kingdom", "Bristol, United Kingdom", "Cardiff, Wales", "Leicester, United Kingdom", "Wakefield, United Kingdom", "Coventry, United Kingdom", "Nottingham, United Kingdom", "Newcastle upon Tyne, United Kingdom", "Belfast, Northern Ireland", "Brighton, United Kingdom", "Hull, United Kingdom", "Plymouth, United Kingdom", "Stoke-on-Trent, United Kingdom", "Wolverhampton, United Kingdom", "Derby, United Kingdom", "Southampton, United Kingdom", "Portsmouth, United Kingdom", "York, United Kingdom", "Dundee, Scotland", "Aberdeen, Scotland", "Cambridge, United Kingdom", "Oxford, United Kingdom",
    
    "Amsterdam, Netherlands", "Rotterdam, Netherlands", "The Hague, Netherlands", "Utrecht, Netherlands", "Eindhoven, Netherlands", "Tilburg, Netherlands", "Groningen, Netherlands", "Almere, Netherlands", "Breda, Netherlands", "Nijmegen, Netherlands", "Enschede, Netherlands", "Haarlem, Netherlands", "Arnhem, Netherlands", "Zaanstad, Netherlands", "Amersfoort, Netherlands", "Apeldoorn, Netherlands", "s-Hertogenbosch, Netherlands", "Hoofddorp, Netherlands", "Maastricht, Netherlands", "Leiden, Netherlands",
    
    "Brussels, Belgium", "Antwerp, Belgium", "Ghent, Belgium", "Charleroi, Belgium", "Liège, Belgium", "Bruges, Belgium", "Namur, Belgium", "Leuven, Belgium", "Mons, Belgium", "Aalst, Belgium",
    
    "Zurich, Switzerland", "Geneva, Switzerland", "Basel, Switzerland", "Lausanne, Switzerland", "Bern, Switzerland", "Winterthur, Switzerland", "Lucerne, Switzerland", "St. Gallen, Switzerland", "Lugano, Switzerland", "Biel/Bienne, Switzerland",
    
    "Vienna, Austria", "Graz, Austria", "Linz, Austria", "Salzburg, Austria", "Innsbruck, Austria", "Klagenfurt, Austria", "Villach, Austria", "Wels, Austria", "Sankt Pölten, Austria", "Dornbirn, Austria",
    
    "Prague, Czech Republic", "Brno, Czech Republic", "Ostrava, Czech Republic", "Plzen, Czech Republic", "Liberec, Czech Republic", "Olomouc, Czech Republic", "Ústí nad Labem, Czech Republic", "České Budějovice, Czech Republic", "Hradec Králové, Czech Republic", "Pardubice, Czech Republic",
    
    "Stockholm, Sweden", "Gothenburg, Sweden", "Malmö, Sweden", "Uppsala, Sweden", "Västerås, Sweden", "Örebro, Sweden", "Linköping, Sweden", "Helsingborg, Sweden", "Jönköping, Sweden", "Norrköping, Sweden",
    
    "Oslo, Norway", "Bergen, Norway", "Stavanger, Norway", "Trondheim, Norway", "Drammen, Norway", "Fredrikstad, Norway", "Kristiansand, Norway", "Sandnes, Norway", "Tromsø, Norway", "Sarpsborg, Norway",
    
    "Copenhagen, Denmark", "Aarhus, Denmark", "Odense, Denmark", "Aalborg, Denmark", "Esbjerg, Denmark", "Randers, Denmark", "Kolding, Denmark", "Horsens, Denmark", "Vejle, Denmark", "Roskilde, Denmark",
    
    "Helsinki, Finland", "Espoo, Finland", "Tampere, Finland", "Vantaa, Finland", "Oulu, Finland", "Turku, Finland", "Jyväskylä, Finland", "Lahti, Finland", "Kuopio, Finland", "Kouvola, Finland",
    
    "Warsaw, Poland", "Kraków, Poland", "Łódź, Poland", "Wrocław, Poland", "Poznań, Poland", "Gdańsk, Poland", "Szczecin, Poland", "Bydgoszcz, Poland", "Lublin, Poland", "Katowice, Poland",
    
    // Asia
    "Tokyo, Japan", "Yokohama, Japan", "Osaka, Japan", "Nagoya, Japan", "Sapporo, Japan", "Fukuoka, Japan", "Kobe, Japan", "Kyoto, Japan", "Kawasaki, Japan", "Saitama, Japan", "Hiroshima, Japan", "Sendai, Japan", "Kitakyushu, Japan", "Chiba, Japan", "Sakai, Japan", "Niigata, Japan", "Hamamatsu, Japan", "Okayama, Japan", "Sagamihara, Japan", "Kumamoto, Japan",
    
    "Seoul, South Korea", "Busan, South Korea", "Incheon, South Korea", "Daegu, South Korea", "Daejeon, South Korea", "Gwangju, South Korea", "Suwon, South Korea", "Ulsan, South Korea", "Changwon, South Korea", "Goyang, South Korea",
    
    "Beijing, China", "Shanghai, China", "Guangzhou, China", "Shenzhen, China", "Tianjin, China", "Wuhan, China", "Dongguan, China", "Chengdu, China", "Nanjing, China", "Foshan, China", "Chongqing, China", "Xi'an, China", "Suzhou, China", "Hangzhou, China", "Qingdao, China",
    
    "Bangkok, Thailand", "Chiang Mai, Thailand", "Phuket, Thailand", "Pattaya, Thailand", "Hat Yai, Thailand", "Udon Thani, Thailand", "Nakhon Ratchasima, Thailand", "Khon Kaen, Thailand", "Ubon Ratchathani, Thailand", "Songkhla, Thailand",
    
    "Ho Chi Minh City, Vietnam", "Hanoi, Vietnam", "Da Nang, Vietnam", "Hai Phong, Vietnam", "Can Tho, Vietnam", "Bien Hoa, Vietnam", "Hue, Vietnam", "Nha Trang, Vietnam", "Buon Ma Thuot, Vietnam", "Vung Tau, Vietnam",
    
    "Jakarta, Indonesia", "Surabaya, Indonesia", "Bandung, Indonesia", "Bekasi, Indonesia", "Medan, Indonesia", "Tangerang, Indonesia", "Depok, Indonesia", "Semarang, Indonesia", "Palembang, Indonesia", "Makassar, Indonesia",
    
    "Manila, Philippines", "Quezon City, Philippines", "Davao, Philippines", "Caloocan, Philippines", "Cebu City, Philippines", "Zamboanga, Philippines", "Taguig, Philippines", "Antipolo, Philippines", "Pasig, Philippines", "Cagayan de Oro, Philippines",
    
    "Kuala Lumpur, Malaysia", "George Town, Malaysia", "Ipoh, Malaysia", "Shah Alam, Malaysia", "Petaling Jaya, Malaysia", "Johor Bahru, Malaysia", "Subang Jaya, Malaysia", "Kuching, Malaysia", "Kota Kinabalu, Malaysia", "Seremban, Malaysia",
    
    "Singapore, Singapore",
    
    "Mumbai, India", "Delhi, India", "Bangalore, India", "Hyderabad, India", "Chennai, India", "Kolkata, India", "Pune, India", "Ahmedabad, India", "Surat, India", "Jaipur, India", "Lucknow, India", "Kanpur, India", "Nagpur, India", "Indore, India", "Thane, India", "Bhopal, India", "Visakhapatnam, India", "Pimpri-Chinchwad, India", "Patna, India", "Vadodara, India",
    
    // North America
    "New York, United States", "Los Angeles, United States", "Chicago, United States", "Houston, United States", "Phoenix, United States", "Philadelphia, United States", "San Antonio, United States", "San Diego, United States", "Dallas, United States", "San Jose, United States", "Austin, United States", "Jacksonville, United States", "Fort Worth, United States", "Columbus, United States", "Charlotte, United States", "San Francisco, United States", "Indianapolis, United States", "Seattle, United States", "Denver, United States", "Washington, United States", "Boston, United States", "El Paso, United States", "Nashville, United States", "Detroit, United States", "Oklahoma City, United States", "Portland, United States", "Las Vegas, United States", "Memphis, United States", "Louisville, United States", "Baltimore, United States", "Milwaukee, United States", "Albuquerque, United States", "Tucson, United States", "Fresno, United States", "Sacramento, United States", "Mesa, United States", "Kansas City, United States", "Atlanta, United States", "Long Beach, United States", "Colorado Springs, United States", "Raleigh, United States", "Miami, United States", "Virginia Beach, United States", "Omaha, United States", "Oakland, United States", "Minneapolis, United States", "Tulsa, United States", "Arlington, United States", "Tampa, United States", "New Orleans, United States",
    
    "Toronto, Canada", "Montreal, Canada", "Calgary, Canada", "Ottawa, Canada", "Edmonton, Canada", "Mississauga, Canada", "Winnipeg, Canada", "Vancouver, Canada", "Brampton, Canada", "Hamilton, Canada", "Quebec City, Canada", "Surrey, Canada", "Laval, Canada", "Halifax, Canada", "London, Canada", "Markham, Canada", "Vaughan, Canada", "Gatineau, Canada", "Saskatoon, Canada", "Longueuil, Canada",
    
    "Mexico City, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico", "Puebla, Mexico", "Tijuana, Mexico", "León, Mexico", "Juárez, Mexico", "Zapopan, Mexico", "Nezahualcóyotl, Mexico", "Chihuahua, Mexico", "Naucalpan, Mexico", "Mérida, Mexico", "Álvaro Obregón, Mexico", "San Luis Potosí, Mexico", "Aguascalientes, Mexico", "Hermosillo, Mexico", "Saltillo, Mexico", "Mexicali, Mexico", "Culiacán, Mexico", "Guadalupe, Mexico",
    
    // South America
    "São Paulo, Brazil", "Rio de Janeiro, Brazil", "Brasília, Brazil", "Salvador, Brazil", "Fortaleza, Brazil", "Belo Horizonte, Brazil", "Manaus, Brazil", "Curitiba, Brazil", "Recife, Brazil", "Goiânia, Brazil", "Belém, Brazil", "Porto Alegre, Brazil", "Guarulhos, Brazil", "Campinas, Brazil", "São Luís, Brazil", "São Gonçalo, Brazil", "Maceió, Brazil", "Duque de Caxias, Brazil", "Natal, Brazil", "Teresina, Brazil",
    
    "Buenos Aires, Argentina", "Córdoba, Argentina", "Rosario, Argentina", "Mendoza, Argentina", "Tucumán, Argentina", "La Plata, Argentina", "Mar del Plata, Argentina", "Salta, Argentina", "Santa Fe, Argentina", "San Juan, Argentina",
    
    "Lima, Peru", "Arequipa, Peru", "Trujillo, Peru", "Chiclayo, Peru", "Huancayo, Peru", "Piura, Peru", "Iquitos, Peru", "Cusco, Peru", "Chimbote, Peru", "Tacna, Peru",
    
    "Bogotá, Colombia", "Medellín, Colombia", "Cali, Colombia", "Barranquilla, Colombia", "Cartagena, Colombia", "Cúcuta, Colombia", "Soledad, Colombia", "Ibagué, Colombia", "Bucaramanga, Colombia", "Soacha, Colombia",
    
    "Santiago, Chile", "Valparaíso, Chile", "Concepción, Chile", "La Serena, Chile", "Antofagasta, Chile", "Temuco, Chile", "Rancagua, Chile", "Talca, Chile", "Arica, Chile", "Chillán, Chile",
    
    "Caracas, Venezuela", "Maracaibo, Venezuela", "Valencia, Venezuela", "Barquisimeto, Venezuela", "Maracay, Venezuela", "Ciudad Guayana, Venezuela", "San Cristóbal, Venezuela", "Maturín, Venezuela", "Ciudad Bolívar, Venezuela", "Cumana, Venezuela",
    
    // Africa
    "Lagos, Nigeria", "Kano, Nigeria", "Ibadan, Nigeria", "Kaduna, Nigeria", "Port Harcourt, Nigeria", "Benin City, Nigeria", "Maiduguri, Nigeria", "Zaria, Nigeria", "Aba, Nigeria", "Jos, Nigeria",
    
    "Cairo, Egypt", "Alexandria, Egypt", "Giza, Egypt", "Shubra El Kheima, Egypt", "Port Said, Egypt", "Suez, Egypt", "Luxor, Egypt", "al-Mansura, Egypt", "el-Mahalla el-Kubra, Egypt", "Tanta, Egypt",
    
    "Johannesburg, South Africa", "Cape Town, South Africa", "Durban, South Africa", "Soweto, South Africa", "Pretoria, South Africa", "Port Elizabeth, South Africa", "Pietermaritzburg, South Africa", "Benoni, South Africa", "Tembisa, South Africa", "East London, South Africa",
    
    "Casablanca, Morocco", "Rabat, Morocco", "Fez, Morocco", "Marrakech, Morocco", "Agadir, Morocco", "Tangier, Morocco", "Meknes, Morocco", "Oujda, Morocco", "Kenitra, Morocco", "Tetouan, Morocco",
    
    // Oceania
    "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia", "Adelaide, Australia", "Gold Coast, Australia", "Newcastle, Australia", "Canberra, Australia", "Sunshine Coast, Australia", "Wollongong, Australia", "Hobart, Australia", "Geelong, Australia", "Townsville, Australia", "Cairns, Australia", "Darwin, Australia",
    
    "Auckland, New Zealand", "Wellington, New Zealand", "Christchurch, New Zealand", "Hamilton, New Zealand", "Tauranga, New Zealand", "Napier-Hastings, New Zealand", "Dunedin, New Zealand", "Palmerston North, New Zealand", "Nelson, New Zealand", "Rotorua, New Zealand",
    
    // Middle East
    "Dubai, United Arab Emirates", "Abu Dhabi, United Arab Emirates", "Sharjah, United Arab Emirates", "Al Ain, United Arab Emirates", "Ajman, United Arab Emirates", "Ras Al Khaimah, United Arab Emirates", "Fujairah, United Arab Emirates", "Umm Al Quwain, United Arab Emirates",
    
    "Istanbul, Turkey", "Ankara, Turkey", "Izmir, Turkey", "Bursa, Turkey", "Adana, Turkey", "Gaziantep, Turkey", "Konya, Turkey", "Antalya, Turkey", "Kayseri, Turkey", "Mersin, Turkey",
    
    "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia", "Mecca, Saudi Arabia", "Medina, Saudi Arabia", "Dammam, Saudi Arabia", "Khobar, Saudi Arabia", "Tabuk, Saudi Arabia", "Buraidah, Saudi Arabia", "Khamis Mushait, Saudi Arabia", "Hail, Saudi Arabia",
    
    "Tehran, Iran", "Mashhad, Iran", "Isfahan, Iran", "Karaj, Iran", "Shiraz, Iran", "Tabriz, Iran", "Qom, Iran", "Ahvaz, Iran", "Kermanshah, Iran", "Urmia, Iran",
    
    "Tel Aviv, Israel", "Jerusalem, Israel", "Haifa, Israel", "Rishon LeZion, Israel", "Petah Tikva, Israel", "Ashdod, Israel", "Netanya, Israel", "Beer Sheva, Israel", "Holon, Israel", "Bnei Brak, Israel",
    
    "Amman, Jordan", "Zarqa, Jordan", "Irbid, Jordan", "Russeifa, Jordan", "Quwaysima, Jordan", "Wadi as-Sir, Jordan", "Ajloun, Jordan", "Madaba, Jordan", "Aqaba, Jordan", "Jerash, Jordan",
    
    "Beirut, Lebanon", "Tripoli, Lebanon", "Sidon, Lebanon", "Tyre, Lebanon", "Nabatieh, Lebanon", "Jounieh, Lebanon", "Zahle, Lebanon", "Baalbek, Lebanon", "Byblos, Lebanon", "Anjar, Lebanon",
    
    "Athens, Greece", "Thessaloniki, Greece", "Patras, Greece", "Piraeus, Greece", "Larissa, Greece", "Heraklion, Greece", "Peristeri, Greece", "Kallithea, Greece", "Acharnes, Greece", "Kalamaria, Greece"
  ];

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
    
    // Interests and hobbies
    "Bookworm", "Gamer", "Musician", "Artist", "Writer", "Photographer", "Blogger", "Vlogger",
    "Language Learner", "Cooking Enthusiast", "Wine Lover", "Coffee Connoisseur", "Tea Lover", "Craft Beer Fan",
    
    // Social and lifestyle
    "Extrovert", "Introvert", "Party Lover", "Peaceful", "Organized", "Flexible", "Independent", "Team Player",
    "Creative", "Analytical", "Optimistic", "Realistic", "Curious", "Open-minded", "Traditional", "Modern",
    
    // Special interests
    "Architecture Lover", "Design Enthusiast", "Fashion Forward", "Vintage Collector", "Antique Hunter",
    "Local Markets Fan", "Street Food Explorer", "Fine Dining Lover", "Vegetarian", "Vegan", "Pescatarian",
    
    // Activity levels
    "High Energy", "Moderate Pace", "Slow Traveler", "Marathon Runner", "Gym Enthusiast", "Outdoor Athlete",
    "Indoor Activities", "Weather Flexible", "Sun Seeker", "Snow Lover", "Rain Dancer", "Wind Surfer",
    
    // Communication styles
    "Chatty", "Good Listener", "Storyteller", "Joke Teller", "Deep Conversations", "Light Hearted",
    "Multilingual", "Sign Language", "Non-verbal Communicator", "Patient Teacher", "Eager Learner",
    
    // Practical traits
    "Early Riser", "Night Owl", "Heavy Sleeper", "Light Sleeper", "Snorer", "Non-snorer",
    "Clean", "Organized", "Tidy", "Casual", "Respectful", "Considerate", "Helpful", "Sharing",
    
    // Cultural and spiritual
    "Spiritual", "Religious", "Secular", "Philosophical", "Environmental Conscious", "Sustainable Traveler",
    "Local Culture Immersion", "Traditional Practices", "Modern Lifestyle", "Urban Explorer", "Rural Explorer",
    
    // Entertainment preferences
    "Movie Buff", "TV Series Fan", "Documentary Lover", "Comedy Fan", "Drama Enthusiast", "Horror Fan",
    "Sci-Fi Lover", "Fantasy Reader", "Non-fiction Reader", "Podcast Listener", "Music Festival Goer",
    
    // Lifestyle choices
    "Non-smoker", "Occasional Smoker", "Non-drinker", "Social Drinker", "Wine Enthusiast", "Beer Lover",
    "Cocktail Enthusiast", "Health Conscious", "Fitness Focused", "Wellness Oriented", "Mental Health Aware"
  ];

  // Additional state for enhanced features
  const [birthLocationInput, setBirthLocationInput] = useState(formData.country || '');
  const [currentHomeInput, setCurrentHomeInput] = useState(formData.currentHome || '');
  const [birthSuggestions, setBirthSuggestions] = useState<string[]>([]);
  const [homeSuggestions, setHomeSuggestions] = useState<string[]>([]);
  const [showBirthSuggestions, setShowBirthSuggestions] = useState(false);
  const [showHomeSuggestions, setShowHomeSuggestions] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [showLearningLanguageModal, setShowLearningLanguageModal] = useState(false);
  const [learningLanguageSearchTerm, setLearningLanguageSearchTerm] = useState('');
  const [showCustomTraitInput, setShowCustomTraitInput] = useState(false);
  const [customTraitInput, setCustomTraitInput] = useState('');
  const [showTraitModal, setShowTraitModal] = useState(false);
  const [traitSearchTerm, setTraitSearchTerm] = useState('');

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

  const handleLearningLanguageDropdownChange = (language: string) => {
    if (language && !selectedLearningLanguages.includes(language)) {
      setSelectedLearningLanguages(prev => [...prev, language]);
    }
  };

  const handleLearningLanguageToggle = (language: string) => {
    setSelectedLearningLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  // Debounce timer for API calls
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // LocationIQ API autocomplete function
  const searchCities = async (query: string): Promise<string[]> => {
    if (query.length < 2) return [];
    
    try {
      // Using LocationIQ free API (10,000 requests/day)
      const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
      if (!apiKey) {
        // Fallback to local database if no API key
        return cities.filter(city => 
          city.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
      }
      
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(query)}&tag=place:city,place:town,place:village&limit=8&format=json`
      );
      
      if (!response.ok) {
        // Fallback to local database if API fails
        return cities.filter(city => 
          city.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
      }
      
      const data = await response.json();
      return data.map((item: any) => {
        const name = item.display_name.split(',')[0];
        const country = item.display_name.split(',').slice(-1)[0].trim();
        return `${name}, ${country}`;
      });
    } catch (error) {
      console.log('API search failed, using local database');
      // Fallback to local database
      return cities.filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
    }
  };

  // Handle autocomplete for birth location with API
  const handleBirthLocationChange = async (value: string) => {
    setBirthLocationInput(value);
    setFormData(prev => ({...prev, country: value}));
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length > 1) {
      // Debounce API calls
      const timeout = setTimeout(async () => {
        const suggestions = await searchCities(value);
        setBirthSuggestions(suggestions);
        setShowBirthSuggestions(true);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setShowBirthSuggestions(false);
    }
  };

  // Handle autocomplete for current home with API
  const handleCurrentHomeChange = async (value: string) => {
    setCurrentHomeInput(value);
    setFormData(prev => ({...prev, currentHome: value}));
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length > 1) {
      // Debounce API calls
      const timeout = setTimeout(async () => {
        const suggestions = await searchCities(value);
        setHomeSuggestions(suggestions);
        setShowHomeSuggestions(true);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setShowHomeSuggestions(false);
    }
  };

  // Add custom trait
  const addCustomTrait = () => {
    if (customTraitInput.trim() && selectedTraits.length < 5) {
      setSelectedTraits(prev => [...prev, customTraitInput.trim()]);
      setCustomTraitInput('');
      setShowCustomTraitInput(false);
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

  // Main languages for quick selection (display by default)
  const mainLanguages = ["English", "Spanish", "French", "German", "Dutch", "Italian"];
  
  // Additional languages in dropdown
  const additionalLanguages = ["Portuguese", "Chinese (Mandarin)", "Japanese", "Korean", "Arabic", "Russian", "Hindi", "Swahili", "Turkish", "Polish"];

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
                      <button
                        type="button"
                        onClick={() => setProfileImagePreview(null)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                      <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
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
                    className="cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium mt-2 shadow-md hover:shadow-lg transition-all duration-200 w-full max-w-[140px]"
                    style={{ backgroundColor: '#1e2a78' }}
                  >
                    {profileImagePreview ? "Change Photo" : "Upload Photo"}
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
                    className={`flex-1 px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
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
                <label htmlFor="what_makes_alive" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  What makes you feel alive? 
                  <span className="text-gray-400 ml-1">(optional)</span>
                  <span className="ml-1 text-xs cursor-help" title="Share what energizes and excites you">ℹ️</span>
                </label>
                <textarea
                  id="what_makes_alive"
                  value={formData.what_makes_alive}
                  onChange={(e) => setFormData(prev => ({...prev, what_makes_alive: e.target.value}))}
                  placeholder="Travel, music, trying new foods, meeting people..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                />
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
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Where were you born? <span className="text-red-500">*</span>
                </label>
                <input
                  id="country"
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
                          setFormData(prev => ({...prev, country: city}));
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
                <label htmlFor="currentHome" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Where do you currently call home? 
                  <span className="text-gray-400 ml-2">(optional)</span>
                </label>
                <input
                  id="currentHome"
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
                          setFormData(prev => ({...prev, currentHome: city}));
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
                    {mainLanguages.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageDropdownChange(language)}
                        disabled={selectedLanguages.includes(language)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedLanguages.includes(language)
                            ? "bg-blue-600 text-white shadow-md"
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
                    🔍 Search & add more languages...
                  </button>
                  
                  {/* Selected Languages Display */}
                  {selectedLanguages.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedLanguages.map((language) => (
                          <span 
                            key={language} 
                            className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {language}
                            <button
                              type="button"
                              onClick={() => handleLanguageToggle(language)}
                              className="ml-2 hover:bg-blue-200 rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Languages You're Learning */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Languages You're Learning <span className="text-gray-400">(optional)</span>
                </label>
                
                {/* Main Languages Quick Selection */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {mainLanguages.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => handleLearningLanguageDropdownChange(language)}
                      disabled={selectedLearningLanguages.includes(language)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        selectedLearningLanguages.includes(language)
                          ? "bg-orange-100 text-orange-800 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 hover:shadow-md"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all text-left mb-3"
                >
                  🔍 Search & add more languages...
                </button>
                
                {selectedLearningLanguages.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {selectedLearningLanguages.map((language) => (
                        <span 
                          key={language} 
                          className="inline-flex items-center bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => handleLearningLanguageToggle(language)}
                            className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
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
                  <span className="text-gray-400 ml-1">(select up to 5)</span>
                  <span className="ml-1 text-xs cursor-help" title="These traits help us find compatible roommates">ℹ️</span>
                </label>
                
                {/* Top 2 rows of most common traits */}
                <div className="grid grid-cols-3 gap-1 mb-3">
                  {traitOptions.slice(0, 12).map((trait) => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleTraitToggle(trait)}
                      disabled={!selectedTraits.includes(trait) && selectedTraits.length >= 5}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        selectedTraits.includes(trait)
                          ? "text-white shadow-md"
                          : selectedTraits.length >= 5
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md"
                      }`}
                      style={{ 
                        backgroundColor: selectedTraits.includes(trait) ? '#1e2a78' : undefined 
                      }}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
                
                {/* Searchable Trait Picker */}
                <button
                  type="button"
                  onClick={() => setShowTraitModal(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all text-left mb-3"
                >
                  🔍 Search & add more traits...
                </button>
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

              {/* Most influential country */}
              <div>
                <label htmlFor="influential_country" className="block text-sm font-medium text-gray-700 mb-2">
                  Which country has influenced you the most?
                </label>
                <select
                  id="influential_country"
                  value={formData.influential_country || ''}
                  onChange={(e) => setFormData(prev => ({...prev, influential_country: e.target.value}))}
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
                <label htmlFor="country_influence_explanation" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  How did this country influence you? 
                  <span className="text-gray-400 ml-1">(optional)</span>
                  <span className="ml-1 text-xs cursor-help" title="Share how this country shaped your perspective">ℹ️</span>
                </label>
                <textarea
                  id="country_influence_explanation"
                  value={formData.country_influence_explanation || ''}
                  onChange={(e) => setFormData(prev => ({...prev, country_influence_explanation: e.target.value}))}
                  placeholder="Tell us about the culture, people, experiences, or values that shaped you..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                />
              </div>

              {/* Most impactful travel experience */}
              <div>
                <label htmlFor="most_impactful_experience" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  What travel experience has impacted you most deeply? 
                  <span className="text-gray-400 ml-1">(optional)</span>
                  <span className="ml-1 text-xs cursor-help" title="Share a meaningful travel moment">ℹ️</span>
                </label>
                <textarea
                  id="most_impactful_experience"
                  value={formData.most_impactful_experience}
                  onChange={(e) => setFormData(prev => ({...prev, most_impactful_experience: e.target.value}))}
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
                        <>
                          <img
                            src={travelPhotos[index]}
                            alt={`Travel photo ${index + 1}`}
                            className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
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
              {allLanguages.filter(lang => 
                lang.toLowerCase().includes(languageSearchTerm.toLowerCase()) &&
                !selectedLanguages.includes(lang)
              ).map(language => (
                <button
                  key={language}
                  onClick={() => {
                    handleLanguageDropdownChange(language);
                    setLanguageSearchTerm('');
                    setShowLanguageModal(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500"
            />
            <div className="max-h-60 overflow-y-auto">
              {allLanguages.filter(lang => 
                lang.toLowerCase().includes(learningLanguageSearchTerm.toLowerCase()) &&
                !selectedLearningLanguages.includes(lang)
              ).map(language => (
                <button
                  key={language}
                  onClick={() => {
                    handleLearningLanguageDropdownChange(language);
                    setLearningLanguageSearchTerm('');
                    setShowLearningLanguageModal(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-orange-50 rounded"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500"
            />
            <div className="max-h-60 overflow-y-auto">
              {allTraits.filter(trait => 
                trait.toLowerCase().includes(traitSearchTerm.toLowerCase()) &&
                !selectedTraits.includes(trait) &&
                selectedTraits.length < 5
              ).map(trait => (
                <button
                  key={trait}
                  onClick={() => {
                    if (selectedTraits.length < 5) {
                      handleTraitToggle(trait);
                      setTraitSearchTerm('');
                      setShowTraitModal(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded"
                >
                  {trait}
                </button>
              ))}
            </div>
            {selectedTraits.length >= 5 && (
              <p className="text-sm text-gray-500 mt-2">
                Maximum 5 traits selected. Remove one to add more.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Compact Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row gap-3 justify-center">
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