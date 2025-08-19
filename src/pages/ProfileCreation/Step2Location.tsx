import { motion } from "framer-motion";
import { MapPin, Globe, Heart } from "lucide-react";
import CityAutocomplete from "@/components/CityAutocomplete";

interface Step2Props {
  formData: {
    birthPlace: string;
    currentPlace: string;
    mostInfluencedCountry: string;
    mostInfluencedCountryDescription: string;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Location: React.FC<Step2Props> = ({
  formData,
  setFormData,
  onNext,
  onBack
}) => {
  const handleNext = () => {
    if (!isFormValid) return;
    onNext();
  };

  const isFormValid = formData.birthPlace;

  const countryOptions = [
    "United States", "France", "Spain", "Thailand", "Japan", "United Kingdom", "Germany", 
    "Italy", "Australia", "Canada", "Netherlands", "Switzerland", "Greece", "Portugal", 
    "South Korea", "Singapore", "New Zealand", "Sweden", "Norway", "Denmark", "Belgium", 
    "Austria", "Ireland", "Czech Republic", "Croatia", "Mexico", "Brazil", "Argentina", 
    "Chile", "Peru", "Colombia", "Costa Rica", "India", "China", "Indonesia", "Malaysia", 
    "Philippines", "Vietnam", "Turkey", "Egypt", "Morocco", "South Africa", "Kenya", 
    "Israel", "Jordan", "Russia", "Poland", "Hungary", "Romania", "Bulgaria", "Serbia", 
    "Bosnia and Herzegovina", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", 
    "Finland", "Iceland", "Luxembourg", "Ukraine", "Belarus", "Georgia", "Armenia", 
    "Azerbaijan", "Kazakhstan", "Uzbekistan", "Mongolia", "Pakistan", "Bangladesh", "Sri Lanka", 
    "Nepal", "Myanmar", "Cambodia", "Laos", "North Korea", "Taiwan", "Hong Kong", "Macau"
  ].sort((a, b) => a.localeCompare(b));

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
      className="space-y-6 lg:space-y-8"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-blue-700 mb-2">
          Tell us about your roots
        </h2>
        <p className="text-gray-600 text-lg">
          Where are you from and what has shaped you?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            <MapPin className="inline w-5 h-5 mr-2 text-blue-600" />
            Where were you born? <span className="text-red-500">*</span>
          </label>
          <CityAutocomplete
            value={formData.birthPlace}
            onChange={(value) => setFormData({...formData, birthPlace: value})}
            placeholder="Start typing... e.g. Barcelona"
            required
            className="[&>input]:text-lg [&>input]:py-3"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            <Globe className="inline w-5 h-5 mr-2 text-green-600" />
            Where do you currently call home?
          </label>
          <CityAutocomplete
            value={formData.currentPlace}
            onChange={(value) => setFormData({...formData, currentPlace: value})}
            placeholder="Start typing... e.g. Amsterdam"
            className="[&>input]:text-lg [&>input]:py-3"
          />
        </div>

        <div>
          <label htmlFor="mostInfluencedCountry" className="block text-lg font-semibold text-gray-800 mb-2">
            <Heart className="inline w-5 h-5 mr-2 text-red-500" />
            Which country has influenced you the most?
          </label>
          <select
            id="mostInfluencedCountry"
            value={formData.mostInfluencedCountry || ''}
            onChange={(e) => setFormData({...formData, mostInfluencedCountry: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a country (optional)</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {formData.mostInfluencedCountry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <label htmlFor="mostInfluencedCountryDescription" className="block text-sm font-medium text-gray-700 mb-2">
              How did {formData.mostInfluencedCountry} influence you?
            </label>
            <textarea
              id="mostInfluencedCountryDescription"
              value={formData.mostInfluencedCountryDescription || ''}
              onChange={(e) => setFormData({...formData, mostInfluencedCountryDescription: e.target.value})}
              placeholder="Tell us about the culture, people, experiences, or values that shaped you..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg resize-none"
            />
          </motion.div>
        )}
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
          disabled={!isFormValid}
          className={`w-1/2 py-3 rounded-lg font-bold text-lg shadow-lg transition ${
            isFormValid
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </motion.button>
      </div>
    </motion.form>
  );
};
