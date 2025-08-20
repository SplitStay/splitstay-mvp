import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, User, Calendar, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface Step1Props {
  formData: {
    fullName: string;
    dayOfBirth: string;
    monthOfBirth: string;
    yearOfBirth: string;
    gender: string;
  };
  profileImagePreview: string | null;
  profileImageUrl: string | null;
  setFormData: (data: any) => void;
  setProfileImagePreview: (url: string | null) => void;
  setProfileImageUrl: (url: string | null) => void;
  onNext: () => void;
  userId?: string;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({
  formData,
  profileImagePreview,
  profileImageUrl,
  setFormData,
  setProfileImagePreview,
  setProfileImageUrl,
  onNext,
  userId
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `userimages/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('userimages')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('userimages')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const uploadedUrl = await uploadImageToStorage(file);
    if (uploadedUrl) {
      setProfileImageUrl(uploadedUrl);
      toast.success('Image uploaded successfully!');
    }
    
    setIsUploading(false);
  };

  const handleNext = () => {
    if (!isFormValid) return;
    onNext();
  };

  const isFormValid = formData.fullName && 
                      formData.dayOfBirth && 
                      formData.monthOfBirth && 
                      formData.yearOfBirth &&
                      formData.gender &&
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
          Let's start with the basics
        </h2>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
          Tell us a bit about yourself
        </p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Profile Photo <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col items-center">
            {profileImagePreview ? (
              <div className="relative">
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setProfileImagePreview(null);
                    setProfileImageUrl(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="profile-image-upload"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                ) : (
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                )}
              </label>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-image-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="profile-image-upload"
              className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium mt-3 sm:mt-4 transition-colors ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? "Uploading..." : profileImagePreview ? "Change Photo" : "Upload Photo"}
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
            <User className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            What should we call you? <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            placeholder="e.g. Jane"
            className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base sm:text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
            <Users className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3 sm:gap-4">
            <label className="flex items-center gap-2 text-base sm:text-lg">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={() => setFormData({...formData, gender: "male"})}
                required
                className="w-4 h-4"
              />
              Male
            </label>
            <label className="flex items-center gap-2 text-base sm:text-lg">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={() => setFormData({...formData, gender: "female"})}
                required
                className="w-4 h-4"
              />
              Female
            </label>
          </div>
        </div>

        <div>
          <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
            <Calendar className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex-1">
              <select
                value={formData.dayOfBirth}
                onChange={(e) => setFormData({...formData, dayOfBirth: e.target.value})}
                className="w-full px-2 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg text-sm sm:text-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Day</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={formData.monthOfBirth}
                onChange={(e) => setFormData({...formData, monthOfBirth: e.target.value})}
                className="w-full px-2 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg text-sm sm:text-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Month</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={formData.yearOfBirth}
                onChange={(e) => setFormData({...formData, yearOfBirth: e.target.value})}
                className="w-full px-2 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg text-sm sm:text-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Must be 18+</p>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-1/2 bg-gray-100 text-gray-700 py-3 sm:py-4 rounded-lg font-medium hover:bg-gray-200 text-sm sm:text-base"
        >
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          type="submit"
          disabled={!isFormValid}
          className={`w-1/2 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-lg shadow-lg transition ${
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
