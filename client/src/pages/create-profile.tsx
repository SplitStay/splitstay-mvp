import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface TravelTrait {
  id: string;
  label: string;
}

const CreateProfile: React.FC = () => {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const availableTraits: TravelTrait[] = [
    { id: "early_bird", label: "Early Bird" },
    { id: "night_owl", label: "Night Owl" },
    { id: "planner", label: "Planner" },
    { id: "spontaneous", label: "Spontaneous" },
    { id: "street_food", label: "Street Food" },
    { id: "fine_dining", label: "Fine Dining" },
    { id: "chatterbox", label: "Chatterbox" },
    { id: "quiet_time", label: "Quiet Time" },
    { id: "party_animal", label: "Party Animal" },
    { id: "relaxed", label: "Relaxed" },
    { id: "nature_lover", label: "Nature Lover" },
    { id: "city_lover", label: "City Lover" },
    { id: "bookworm", label: "Bookworm" },
    { id: "binge_watcher", label: "Binge Watcher" },
  ];

  const toggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter(id => id !== traitId));
    } else {
      setSelectedTraits([...selectedTraits, traitId]);
    }
  };

  const filteredTraits = searchQuery 
    ? availableTraits.filter(trait => 
        trait.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTraits;

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would include more user data
      // For now, we'll just store the travel traits as preferences
      return await apiRequest('/api/users/preferences', 'POST', { 
        travelTraits: selectedTraits 
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile created",
        description: "Your travel traits have been saved"
      });
      // Navigate to the next step in the profile creation process
      navigate("/find-roommate");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateProfile = () => {
    if (selectedTraits.length === 0) {
      toast({
        title: "Select traits",
        description: "Please select at least one travel trait to continue",
        variant: "destructive"
      });
      return;
    }

    // Store traits in localStorage for demo purposes
    localStorage.setItem('splitstay_traits', JSON.stringify(selectedTraits));
    
    // In a real app, we would call the mutation
    // createProfileMutation.mutate();

    // For demo, navigate directly
    navigate("/find-roommate");
  };

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Create Profile</h1>
        <p className="text-xl text-gray-700">Choose your travel traits</p>
      </div>
      
      {/* Search box */}
      <div className="relative mb-6">
        <Input
          className="w-full pl-10 py-3 border-2 border-gray-300 rounded-full focus:border-primary"
          placeholder="Search traits"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      </div>
      
      {/* Traits selection */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filteredTraits.map((trait) => (
          <button
            key={trait.id}
            className={`py-3 px-6 rounded-full text-lg font-medium transition-colors ${
              selectedTraits.includes(trait.id)
                ? "bg-primary-light text-dark border-2 border-primary-light"
                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-light"
            }`}
            onClick={() => toggleTrait(trait.id)}
          >
            {trait.label}
          </button>
        ))}
      </div>
      
      <div className="mt-auto">
        <Button
          className="w-full bg-primary text-white font-semibold py-4 text-lg rounded-full"
          onClick={handleCreateProfile}
          disabled={createProfileMutation.isPending}
        >
          {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
        </Button>
      </div>
    </div>
  );
};

export default CreateProfile;