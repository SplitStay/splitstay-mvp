import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import toast from "react-hot-toast";

import { ProgressBar } from "./ProfileCreation/ProgressBar";
import { Step1BasicInfo } from "./ProfileCreation/Step1BasicInfo";
import { Step2Location } from "./ProfileCreation/Step2Location";
import { Step3Languages } from "./ProfileCreation/Step3Languages";
import { Step4Preferences } from "./ProfileCreation/Step4Preferences";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedLearningLanguages, setSelectedLearningLanguages] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [travelPhotos, setTravelPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    birthPlace: "",
    currentPlace: "",
    bio: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    gender: "",
    mostInfluencedCountry: "",
    mostInfluencedCountryDescription: "",
    mostInfluencedExperience: "",
    personalizedLink: ""
  });

  const { user, loading } = useAuth();
  const { data: userData, refetch: refetchUser } = useUser();
  const updateUserMutation = useUpdateUser();

  const stepTitles = ["Basic Info", "Location", "Languages", "Preferences"];
  const totalSteps = 4;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.name || "",
        birthPlace: userData.birthPlace || "",
        currentPlace: userData.currentPlace || "",
        bio: userData.bio || "",
        dayOfBirth: userData.dayOfBirth ? userData.dayOfBirth.toString() : "",
        monthOfBirth: userData.monthOfBirth ? userData.monthOfBirth.toString() : "",
        yearOfBirth: userData.yearOfBirth ? userData.yearOfBirth.toString() : "",
        gender: userData.gender || "",
        mostInfluencedCountry: userData.mostInfluencedCountry || "",
        mostInfluencedCountryDescription: userData.mostInfluencedCountryDescription || "",
        mostInfluencedExperience: userData.mostInfluencedExperience || "",
        personalizedLink: userData.personalizedLink || ""
      });

      if (userData.languages) {
        setSelectedLanguages(userData.languages as string[]);
      }

      if (userData.learningLanguages) {
        setSelectedLearningLanguages(userData.learningLanguages as string[]);
      }

      if (userData.travelTraits) {
        setSelectedTraits(userData.travelTraits as string[]);
      }

      if (userData.imageUrl) {
        setProfileImagePreview(userData.imageUrl);
        setProfileImageUrl(userData.imageUrl);
      }

      if (userData.travelPhotos) {
        setTravelPhotos(userData.travelPhotos as string[]);
      }
    }
  }, [userData]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    setIsLoading(true);
    
    try {
      await updateUserMutation.mutateAsync({
        name: formData.fullName,
        bio: formData.bio || null,
        birthPlace: formData.birthPlace || null,
        currentPlace: formData.currentPlace || null,
        dayOfBirth: formData.dayOfBirth ? parseInt(formData.dayOfBirth) : null,
        monthOfBirth: formData.monthOfBirth ? parseInt(formData.monthOfBirth) : null,
        yearOfBirth: formData.yearOfBirth ? parseInt(formData.yearOfBirth) : null,
        gender: formData.gender || null,
        languages: selectedLanguages.length > 0 ? selectedLanguages : null,
        learningLanguages: selectedLearningLanguages.length > 0 ? selectedLearningLanguages : null,
        travelTraits: selectedTraits.length > 0 ? selectedTraits : null,
        mostInfluencedCountry: formData.mostInfluencedCountry || null,
        mostInfluencedCountryDescription: formData.mostInfluencedCountryDescription || null,
        mostInfluencedExperience: formData.mostInfluencedExperience || null,
        travelPhotos: travelPhotos.filter(photo => photo !== null).length > 0 ? travelPhotos.filter(photo => photo !== null) : null,
        imageUrl: profileImageUrl || null,
        personalizedLink: formData.personalizedLink || null,
        profileCreated: true,
      });

      await refetchUser();
      toast.success("Profile updated successfully!");
      navigate(`/profile/${user.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200">
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto sm:max-w-lg lg:max-w-2xl"
        >
          <div className="w-full bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4 sm:mb-6 text-center">Edit Your Profile</h1>
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepTitles={stepTitles}
            />
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1BasicInfo
                key="step1"
                formData={{
                  fullName: formData.fullName,
                  dayOfBirth: formData.dayOfBirth,
                  monthOfBirth: formData.monthOfBirth,
                  yearOfBirth: formData.yearOfBirth,
                  gender: formData.gender
                }}
                profileImagePreview={profileImagePreview}
                profileImageUrl={profileImageUrl}
                setFormData={(data: any) => setFormData({...formData, ...data})}
                setProfileImagePreview={setProfileImagePreview}
                setProfileImageUrl={setProfileImageUrl}
                onNext={handleNext}
                userId={user.id}
              />
            )}

            {currentStep === 2 && (
              <Step2Location
                key="step2"
                formData={{
                  birthPlace: formData.birthPlace,
                  currentPlace: formData.currentPlace,
                  mostInfluencedCountry: formData.mostInfluencedCountry,
                  mostInfluencedCountryDescription: formData.mostInfluencedCountryDescription
                }}
                setFormData={(data: any) => setFormData({...formData, ...data})}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 3 && (
              <Step3Languages
                key="step3"
                selectedLanguages={selectedLanguages}
                selectedLearningLanguages={selectedLearningLanguages}
                formData={{
                  personalizedLink: formData.personalizedLink
                }}
                setSelectedLanguages={setSelectedLanguages}
                setSelectedLearningLanguages={setSelectedLearningLanguages}
                setFormData={(data: any) => setFormData({...formData, ...data})}
                onNext={handleNext}
                onBack={handleBack}
                originalPersonalizedLink={userData?.personalizedLink || ""}
              />
            )}

            {currentStep === 4 && (
              <Step4Preferences
                key="step4"
                selectedTraits={selectedTraits}
                formData={{
                  bio: formData.bio,
                  mostInfluencedExperience: formData.mostInfluencedExperience
                }}
                travelPhotos={travelPhotos}
                setSelectedTraits={setSelectedTraits}
                setFormData={(data: any) => setFormData({...formData, ...data})}
                setTravelPhotos={setTravelPhotos}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isEditMode={true}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
