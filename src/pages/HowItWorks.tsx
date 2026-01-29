import { ArrowRight, Shield, ToggleLeft, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImageWhite from '@/assets/logoWhite.jpeg';

function HowItWorks() {
  const [_activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    document.title =
      'How SplitStay Works - Share Hotel Rooms with Verified Travelers';

    const updateMetaTags = () => {
      const metaTags = [
        {
          name: 'description',
          content:
            'Learn how SplitStay helps solo travelers save on hotel rooms by matching them with like-minded guests. Create your profile, match with verified travelers, and split costs.',
        },
        {
          property: 'og:title',
          content:
            'How SplitStay Works - Share Hotel Rooms with Verified Travelers',
        },
        {
          property: 'og:description',
          content:
            'Learn how SplitStay helps solo travelers save on hotel rooms by matching them with like-minded guests.',
        },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: 'https://splitstay.travel/how-it-works',
        },
      ];

      metaTags.forEach((tag) => {
        const element = document.querySelector(
          `meta[name="${tag.name}"], meta[property="${tag.property}"]`,
        );
        if (element) {
          element.setAttribute('content', tag.content);
        } else {
          const newElement = document.createElement('meta');
          if (tag.name) newElement.setAttribute('name', tag.name);
          if (tag.property) newElement.setAttribute('property', tag.property);
          newElement.setAttribute('content', tag.content);
          document.head.appendChild(newElement);
        }
      });
    };

    updateMetaTags();

    return () => {
      document.title = 'SplitStay';
    };
  }, []);

  const steps = [
    {
      icon: '✨',
      title: 'Create Your Profile',
      description:
        "Tell us about yourself — your travel style, interests, and what kind of roommate you'd be.",
    },
    {
      icon: '🔍',
      title: 'Browse & Match',
      description:
        'See compatible travelers heading to your destination. Check out their profiles and preferences.',
    },
    {
      icon: '💰',
      title: 'Split the Cost',
      description:
        'Book together and split hotel costs — you could save 30-50% on your accommodation.',
    },
    {
      icon: '🏆',
      title: 'Build Trust & Badges',
      description:
        'Invite friends, match with more travelers, and earn SplitStay badges as you go.',
    },
    {
      icon: '💬',
      title: 'Chat & Connect Before You Book',
      description:
        'Get to know your match through messaging — so your stay feels smooth from day one.',
    },
  ];

  const whyDifferent = [
    {
      icon: <Shield className="w-8 h-8 text-navy" />,
      title: 'Safety First',
      description:
        'Verified profiles, background checks, and emergency contacts for peace of mind',
    },
    {
      icon: <Users className="w-8 h-8 text-navy" />,
      title: 'Community',
      description:
        'Build lasting connections with fellow travelers who share your values',
    },
    {
      icon: <ToggleLeft className="w-8 h-8 text-navy" />,
      title: 'Flexibility',
      description: 'Match or go solo — no pressure',
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src={logoImageWhite}
                alt="SplitStay"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-navy">SplitStay</span>
            </Link>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4 md:space-x-6">
                <a
                  href="/"
                  className="text-gray-700 hover:text-navy font-medium text-sm md:text-base"
                >
                  Home
                </a>
                <a
                  href="/how-it-works"
                  className="text-navy font-medium border-b-2 border-navy pb-1 text-sm md:text-base"
                >
                  How it Works
                </a>
              </nav>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-3 py-2 md:px-4 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors text-sm md:text-base"
              >
                Get Started
              </button>
            </div>
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
            type="button"
            onClick={() => navigate('/signup')}
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
              From profile creation to earning badges, here's how you'll
              experience SplitStay
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            {steps.map((step, index) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: Step click navigation
              // biome-ignore lint/a11y/noStaticElementInteractions: Interactive step card
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Steps array has no unique id
                key={index}
                className="flex items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setActiveStep(index)}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-navy text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-3xl ml-4">{step.icon}</div>
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
              We're not just another booking platform — we're building a
              community of trusted travelers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyDifferent.map((item, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Items array has no unique id
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
      <div className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-navy mb-6">
              You're Just in Time to Help Shape SplitStay
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              You're early — and that's exactly the point. Be part of our first
              wave of travelers helping shape what SplitStay becomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="inline-flex items-center px-8 py-3 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors font-medium"
              >
                Create Your Profile
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
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
