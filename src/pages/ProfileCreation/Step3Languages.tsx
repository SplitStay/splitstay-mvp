import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Languages, MessageCircle, Link } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Step3Props {
  selectedLanguages: string[];
  selectedLearningLanguages: string[];
  formData: {
    personalizedLink: string;
  };
  setSelectedLanguages: (languages: string[]) => void;
  setSelectedLearningLanguages: (languages: string[]) => void;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Languages: React.FC<Step3Props> = ({
  selectedLanguages,
  selectedLearningLanguages,
  formData,
  setSelectedLanguages,
  setSelectedLearningLanguages,
  setFormData,
  onNext,
  onBack
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [learningSearchTerm, setLearningSearchTerm] = useState('');
  const [personalizedLinkError, setPersonalizedLinkError] = useState('');
  const [personalizedLinkAvailable, setPersonalizedLinkAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const mainLanguages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Mandarin", "Japanese"];
  
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

  const validatePersonalizedLink = (value: string): string => {
    if (!value) return '';
    if (value.length < 3) return 'URL must be at least 3 characters long';
    if (value.length > 30) return 'URL must be less than 30 characters';
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'URL can only contain letters and numbers';
    return '';
  };

  const checkLinkAvailability = async (link: string): Promise<boolean> => {
    if (!link || validatePersonalizedLink(link)) return false;
    
    try {
      const { data, error } = await supabase
        .from('user')
        .select('id')
        .eq('personalizedLink', link)
        .limit(1);
      
      if (error) return false;
      return data.length === 0;
    } catch (error) {
      return false;
    }
  };

  const handlePersonalizedLinkChange = async (value: string) => {
    const cleanValue = value.trim();
    setFormData({...formData, personalizedLink: cleanValue});
    
    const formatError = validatePersonalizedLink(cleanValue);
    setPersonalizedLinkError(formatError);
    
    if (formatError || !cleanValue) {
      setPersonalizedLinkAvailable(null);
      setCheckingAvailability(false);
      return;
    }
    
    setCheckingAvailability(true);
    setPersonalizedLinkAvailable(null);
    
    const timeout = setTimeout(async () => {
      const isAvailable = await checkLinkAvailability(cleanValue);
      setPersonalizedLinkAvailable(isAvailable);
      setCheckingAvailability(false);
      if (!isAvailable && !formatError) {
        setPersonalizedLinkError('This URL is already taken');
      } else if (isAvailable && !formatError) {
        setPersonalizedLinkError('');
      }
    }, 500);

    return () => clearTimeout(timeout);
  };

  const handleLanguageToggle = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const handleLearningLanguageToggle = (language: string) => {
    if (selectedLearningLanguages.includes(language)) {
      setSelectedLearningLanguages(selectedLearningLanguages.filter(l => l !== language));
    } else {
      setSelectedLearningLanguages([...selectedLearningLanguages, language]);
    }
  };

  const handleNext = () => {
    if (!isFormValid) return;
    onNext();
  };

  const isPersonalizedLinkValid = () => {
    if (!formData.personalizedLink.trim()) return true;
    if (personalizedLinkError) return false;
    if (checkingAvailability) return false;
    return personalizedLinkAvailable === true;
  };

  const isFormValid = selectedLanguages.length > 0 && isPersonalizedLinkValid();

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
          Languages & Communication
        </h2>
        <p className="text-gray-600 text-lg">
          What languages do you speak and want to learn?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            <Languages className="inline w-5 h-5 mr-2 text-blue-600" />
            Languages you speak <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {mainLanguages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => handleLanguageToggle(language)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedLanguages.includes(language)
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {language}
              </button>
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => setShowLanguageModal(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-left flex items-center justify-between"
          >
            <span>
              {selectedLanguages.length > 0 
                ? `${selectedLanguages.length} selected, add more...` 
                : 'Add languages...'}
            </span>
            <Plus className="w-4 h-4" />
          </button>

          {selectedLanguages.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedLanguages.map((language) => (
                <span
                  key={language}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {language}
                  <button
                    onClick={() => handleLanguageToggle(language)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Languages you're learning <span className="text-gray-400">(optional)</span>
          </label>
          
          <button
            type="button"
            onClick={() => setShowLearningModal(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all text-left flex items-center justify-between"
          >
            <span>
              {selectedLearningLanguages.length > 0 
                ? `${selectedLearningLanguages.length} selected` 
                : 'Add learning languages...'}
            </span>
            <Plus className="w-4 h-4" />
          </button>

          {selectedLearningLanguages.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedLearningLanguages.map((language) => (
                <span
                  key={language}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800"
                >
                  {language}
                  <button
                    onClick={() => handleLearningLanguageToggle(language)}
                    className="ml-1 hover:text-orange-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="personalizedLink" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Profile URL <span className="text-gray-400">(optional)</span>
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-xs text-gray-500 bg-gray-50 px-3 py-3 rounded-l-lg border border-r-0 border-gray-300">
                splitstay.travel/profile/
              </span>
              <input
                id="personalizedLink"
                type="text"
                value={formData.personalizedLink}
                onChange={(e) => handlePersonalizedLinkChange(e.target.value)}
                placeholder="yourname"
                className={`flex-1 px-3 py-3 border rounded-r-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  personalizedLinkError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            <div className="min-h-[20px]">
              {checkingAvailability && (
                <div className="flex items-center text-xs text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></div>
                  Checking availability...
                </div>
              )}
              {personalizedLinkError && (
                <p className="text-xs text-red-600">{personalizedLinkError}</p>
              )}
              {personalizedLinkAvailable === true && !personalizedLinkError && formData.personalizedLink && (
                <p className="text-xs text-green-600">✓ This URL is available!</p>
              )}
            </div>
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

      {showLanguageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLanguageModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Languages You Speak</h3>
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
              {allLanguages
                .filter(lang => 
                  lang.toLowerCase().includes(languageSearchTerm.toLowerCase())
                )
                .map(language => (
                <button
                  key={language}
                  type="button"
                  onClick={() => handleLanguageToggle(language)}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    selectedLanguages.includes(language)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-50"
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLearningModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLearningModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Learning Languages</h3>
              <button
                onClick={() => setShowLearningModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search languages..."
              value={learningSearchTerm}
              onChange={(e) => setLearningSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="max-h-60 overflow-y-auto">
              {allLanguages
                .filter(lang => 
                  lang.toLowerCase().includes(learningSearchTerm.toLowerCase())
                )
                .map(language => (
                <button
                  key={language}
                  type="button"
                  onClick={() => handleLearningLanguageToggle(language)}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    selectedLearningLanguages.includes(language)
                      ? "bg-orange-600 text-white"
                      : "hover:bg-orange-50"
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.form>
  );
};
