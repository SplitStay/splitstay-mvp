import { motion } from 'framer-motion';
import { Globe, Heart, MapPin } from 'lucide-react';
import CityAutocomplete from '@/components/CityAutocomplete';

interface Step2Props {
  formData: {
    birthPlace: string;
    currentPlace: string;
    mostInfluencedCountry: string;
    mostInfluencedCountryDescription: string;
  };
  // biome-ignore lint/suspicious/noExplicitAny: Partial form data
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Location: React.FC<Step2Props> = ({
  formData,
  setFormData,
  onNext,
  onBack,
}) => {
  const handleNext = () => {
    if (!isFormValid) return;
    onNext();
  };

  const isFormValid = formData.birthPlace;

  const countryOptions = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Democratic Republic of the Congo',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Korea',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Korea',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Timor-Leste',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
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
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 mb-2">
          Tell us about your roots
        </h2>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
          Where are you from and what has shaped you?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: Custom autocomplete component */}
          <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
            <MapPin className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Where were you born? <span className="text-red-500">*</span>
          </label>
          <CityAutocomplete
            value={formData.birthPlace}
            onChange={(value) =>
              setFormData({ ...formData, birthPlace: value })
            }
            placeholder="Start typing... e.g. Barcelona"
            required
            className="[&>input]:text-sm [&>input]:sm:text-lg [&>input]:py-3 [&>input]:sm:py-4"
          />
        </div>

        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: Custom autocomplete component */}
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            <Globe className="inline w-5 h-5 mr-2 text-green-600" />
            Where do you currently call home?
          </label>
          <CityAutocomplete
            value={formData.currentPlace}
            onChange={(value) =>
              setFormData({ ...formData, currentPlace: value })
            }
            placeholder="Start typing... e.g. Amsterdam"
            className="[&>input]:text-sm [&>input]:sm:text-lg [&>input]:py-3 [&>input]:sm:py-4"
          />
        </div>

        <div>
          <label
            htmlFor="mostInfluencedCountry"
            className="block text-lg font-semibold text-gray-800 mb-2"
          >
            <Heart className="inline w-5 h-5 mr-2 text-red-500" />
            Which country has influenced you the most?
          </label>
          <select
            id="mostInfluencedCountry"
            value={formData.mostInfluencedCountry || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                mostInfluencedCountry: e.target.value,
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a country (optional)</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {formData.mostInfluencedCountry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <label
              htmlFor="mostInfluencedCountryDescription"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              How did {formData.mostInfluencedCountry} influence you?
            </label>
            <textarea
              id="mostInfluencedCountryDescription"
              value={formData.mostInfluencedCountryDescription || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mostInfluencedCountryDescription: e.target.value,
                })
              }
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
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </motion.button>
      </div>
    </motion.form>
  );
};
