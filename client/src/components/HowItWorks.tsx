import { useState } from "react";
import { ArrowRight, Shield, Users, DollarSign, Award, Calendar, CheckCircle, MessageCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import splitstayLogo from "@assets/Splitstay Logo Transparent.png";

function HowItWorks() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: "👤",
      title: "Create Your Profile",
      description: "Tell us how you travel — your style, your languages, and your dream destinations."
    },
    {
      icon: "🤝",
      title: "Match With Verified Travelers",
      description: "We'll suggest trusted travelers with compatible travel styles. Review their profiles before confirming."
    },
    {
      icon: "🏨",
      title: "Book & Split Your Stay",
      description: "Pick a hotel together and enjoy all the comfort — at half the price."
    },
    {
      icon: "🏆",
      title: "Build Trust & Badges",
      description: "Invite friends, match with more travelers, and earn SplitStay badges as you go."
    },
    {
      icon: "💬",
      title: "Chat & Connect Before You Book",
      description: "Get to know your match through messaging — so your stay feels smooth from day one."
    }
  ];

  const whyDifferent = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Safety",
      description: "Verified matches only"
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: "Community",
      description: "You're never alone if you don't want to be"
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      title: "Flexibility",
      description: "Match or go solo — no pressure"
    }
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Helmet>
        <title>How SplitStay Works - Share Hotel Rooms with Verified Travelers</title>
        <meta 
          name="description" 
          content="Learn how SplitStay helps solo travelers save on hotel rooms by matching them with like-minded guests. Create your profile, match with verified travelers, and split costs." 
        />
        <meta property="og:title" content="How SplitStay Works - Share Hotel Rooms with Verified Travelers" />
        <meta property="og:description" content="Learn how SplitStay helps solo travelers save on hotel rooms by matching them with like-minded guests." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://splitstay.travel/how-it-works" />
      </Helmet>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={splitstayLogo} 
                alt="SplitStay Logo" 
                className="h-8"
              />
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-700 hover:text-navy font-medium">
                Home
              </a>
              <a href="/how-it-works" className="text-navy font-medium border-b-2 border-navy pb-1">
                How it Works
              </a>
            </nav>
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            ✨ How SplitStay Works
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Split hotel stays with like-minded travelers — here's how it works.
          </p>
          <button
            onClick={() => window.location.href = "/?profile=true"}
            className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors font-medium"
          >
            Create Your Profile
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Your Journey in 5 Simple Steps
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From profile creation to earning badges, here's how you'll experience SplitStay
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center p-6 rounded-lg transition-all duration-300 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } ${currentStep === index ? 'bg-blue-50 shadow-lg' : 'bg-gray-50 hover:bg-gray-100'}`}
                onMouseEnter={() => setCurrentStep(index)}
              >
                {/* Step Number & Icon */}
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mx-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-navy">
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-navy mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Different Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Why SplitStay is Different
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We're not just another booking platform — we're building a community of trusted travelers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyDifferent.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who are already saving money and making connections with SplitStay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = "/?profile=true"}
              className="inline-flex items-center px-8 py-3 bg-white text-navy rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Create Your Profile
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-navy transition-colors font-medium"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 SplitStay · Built with love by solo travelers
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HowItWorks;