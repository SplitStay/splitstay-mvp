// Sample trip data for the dashboard
export const sampleTrips = [
  {
    id: 1,
    destination: "Tokyo, Japan",
    country: "Japan",
    startDate: "2025-07-15",
    endDate: "2025-07-20",
    travelerName: "Sarah Chen",
    travelerCountry: "United States",
    languages: ["English", "Mandarin"],
    tripNote: "First time in Tokyo! Looking for someone to explore temples and try street food with.",
    userId: "user_001"
  },
  {
    id: 2,
    destination: "Barcelona, Spain",
    country: "Spain",
    startDate: "2025-08-03",
    endDate: "2025-08-10",
    travelerName: "Marco Rodriguez",
    travelerCountry: "Mexico",
    languages: ["Spanish", "English"],
    tripNote: "Architecture lover planning to visit Sagrada Familia and Park Güell.",
    userId: "user_002"
  },
  {
    id: 3,
    destination: "Bangkok, Thailand",
    country: "Thailand",
    startDate: "2025-07-22",
    endDate: "2025-07-28",
    travelerName: "Emma Johnson",
    travelerCountry: "Australia",
    languages: ["English"],
    tripNote: "Solo backpacker seeking adventure! Love temples, markets, and authentic cuisine.",
    userId: "user_003"
  },
  {
    id: 4,
    destination: "Paris, France",
    country: "France",
    startDate: "2025-09-05",
    endDate: "2025-09-12",
    travelerName: "Alessandro Rossi",
    travelerCountry: "Italy",
    languages: ["Italian", "French", "English"],
    tripNote: "Art enthusiast visiting museums and galleries. Would love a culture buddy!",
    userId: "user_004"
  },
  {
    id: 5,
    destination: "Lisbon, Portugal",
    country: "Portugal",
    startDate: "2025-08-18",
    endDate: "2025-08-25",
    travelerName: "Sofia Andersson",
    travelerCountry: "Sweden",
    languages: ["Swedish", "English", "Portuguese"],
    tripNote: "Exploring coastal cities and local music scene. Night owl looking for concert buddies!",
    userId: "user_005"
  },
  {
    id: 6,
    destination: "Dubai, UAE",
    country: "United Arab Emirates",
    startDate: "2025-07-30",
    endDate: "2025-08-05",
    travelerName: "Raj Patel",
    travelerCountry: "India",
    languages: ["Hindi", "English", "Arabic"],
    tripNote: "Business trip extended for leisure. Looking to explore traditional markets and modern attractions.",
    userId: "user_006"
  }
];

export const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { month: 'long', day: 'numeric' };
  const startFormatted = start.toLocaleDateString('en-US', options);
  const endFormatted = end.toLocaleDateString('en-US', options);
  
  return `${startFormatted}–${endFormatted}, ${start.getFullYear()}`;
};