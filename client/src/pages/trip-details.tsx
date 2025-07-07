import { ArrowLeft, MapPin, Calendar, User, MessageCircle } from "lucide-react";
import { useParams } from "wouter";

export default function TripDetails() {
  const { tripId } = useParams<{ tripId: string }>();
  
  const handleBack = () => {
    window.history.back();
  };

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
          <h1 className="text-xl font-bold text-gray-900">Trip Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Trip Details #{tripId}
          </h2>
          <p className="text-gray-600 mb-6">
            This page will show detailed information about the trip, including accommodation options, 
            activities, and ways to connect with the trip organizer.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Return to Dashboard
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Message Organizer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}