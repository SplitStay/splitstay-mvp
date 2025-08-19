import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Upload, Smile, Sparkles, Camera } from "lucide-react";

interface Step4Props {
  selectedTraits: string[];
  formData: {
    bio: string;
    mostInfluencedExperience: string;
  };
  travelPhotos: string[];
  setSelectedTraits: (traits: string[]) => void;
  setFormData: (data: any) => void;
  setTravelPhotos: (photos: string[]) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const Step4Preferences: React.FC<Step4Props> = ({
  selectedTraits,
  formData,
  travelPhotos,
  setSelectedTraits,
  setFormData,
  setTravelPhotos,
  onBack,
  onSubmit,
  isLoading
}) => {
  const [showTraitModal, setShowTraitModal] = useState(false);
  const [traitSearchTerm, setTraitSearchTerm] = useState('');

  const mainTraits = [
    "Adventurous", "Relaxed", "Social", "Quiet", "Early Bird", "Night Owl",
    "Foodie", "Culture Lover", "Nature Lover", "Budget Traveler", "Luxury Traveler", "Backpacker"
  ];

  const allTraits = [
    "Adventurous", "Relaxed", "Social", "Quiet", "Early Bird", "Night Owl", "Spontaneous", "Planner",
    "Minimalist", "Culture Lover", "Foodie", "Nature Lover", "Tech Savvy", "Fitness Enthusiast",
    "Beach Lover", "Mountain Explorer", "City Explorer", "Art Enthusiast", "History Buff", "Photography Lover",
    "Music Lover", "Dancer", "Swimmer", "Hiker", "Runner", "Cyclist", "Yoga Practitioner", "Meditation Enthusiast",
    "Budget Traveler", "Luxury Traveler", "Backpacker", "Digital Nomad", "Solo Traveler", "Group Traveler",
    "Road Tripper", "Train Enthusiast", "Flight Lover", "Cruise Enthusiast", "Camping Lover", "Hostel Hopper",
    "Bookworm", "Gamer", "Musician", "Artist", "Writer", "Photographer", "Blogger", "Vlogger",
    "Language Learner", "Cooking Enthusiast", "Wine Lover", "Coffee Connoisseur", "Tea Lover", "Craft Beer Fan"
  ];

  const handleTraitToggle = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
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
            setTravelPhotos([...travelPhotos, ...newPhotos].slice(0, 3));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeTravelPhoto = (index: number) => {
    setTravelPhotos(travelPhotos.filter((_, i) => i !== index));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6 lg:space-y-8"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-blue-700 mb-2">
          Your Travel Style
        </h2>
        <p className="text-gray-600 text-lg">
          Help us understand how you like to travel
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="bio" className="block text-lg font-semibold text-gray-800 mb-2">
            <Smile className="inline w-5 h-5 mr-2 text-yellow-500" />
            What makes you feel alive? <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Travel, music, trying new foods, meeting people..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-lg resize-none"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            <Sparkles className="inline w-5 h-5 mr-2 text-purple-600" />
            Travel traits <span className="text-gray-400">(optional)</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {mainTraits.map((trait) => (
              <button
                key={trait}
                type="button"
                onClick={() => handleTraitToggle(trait)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedTraits.includes(trait)
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {trait}
              </button>
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => setShowTraitModal(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all text-left flex items-center justify-between"
          >
            <span>
              {selectedTraits.length > 0 
                ? `${selectedTraits.length} selected, add more...` 
                : 'Add traits...'}
            </span>
            <Plus className="w-4 h-4" />
          </button>

          {selectedTraits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedTraits.map((trait) => (
                <span
                  key={trait}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                >
                  {trait}
                  <button
                    onClick={() => handleTraitToggle(trait)}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="mostInfluencedExperience" className="block text-sm font-medium text-gray-700 mb-2">
            Most impactful travel experience? <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="mostInfluencedExperience"
            value={formData.mostInfluencedExperience}
            onChange={(e) => setFormData({...formData, mostInfluencedExperience: e.target.value})}
            placeholder="Tell us about a moment, encounter, or journey that changed your perspective..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            <Camera className="inline w-5 h-5 mr-2 text-pink-500" />
            Travel Photos <span className="text-gray-400">(optional, up to 3)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative">
                {travelPhotos[index] ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => removeTravelPhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <img
                      src={travelPhotos[index]}
                      alt={`Travel photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
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
                      multiple
                    />
                    <label
                      htmlFor={`travel-photo-${index}`}
                      className="cursor-pointer w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Upload</span>
                    </label>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="w-1/2 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200"
        >
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          type="submit"
          disabled={isLoading}
          className={`w-1/2 py-3 rounded-lg font-bold text-lg shadow-lg transition ${
            isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          }`}
        >
          {isLoading ? "Creating Profile..." : "Create Profile"}
        </motion.button>
      </div>

      {showTraitModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTraitModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Travel Traits</h3>
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
                  type="button"
                  onClick={() => handleTraitToggle(trait)}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    selectedTraits.includes(trait)
                      ? "bg-purple-600 text-white"
                      : "hover:bg-purple-50"
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.form>
  );
};
