import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import logoImageWhite from '@/assets/logoWhite.jpeg';
import { getEventBySlug } from '@/lib/eventLandingPages';

export function WhatsAppRedirectPage() {
  const { slug } = useParams<{ slug: string }>();
  const config = slug ? getEventBySlug(slug) : undefined;
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER as
    | string
    | undefined;
  const whatsappMessage = config?.whatsappMessage;

  useEffect(() => {
    if (!whatsappMessage || !whatsappNumber) return;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.location.replace(url);
  }, [whatsappMessage]);

  if (!config) {
    return <Navigate to="/" replace />;
  }

  if (!whatsappNumber) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logoImageWhite}
                alt="SplitStay"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-navy">SplitStay</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Coming soon
            </h1>
            <p className="text-gray-600 mb-6">
              WhatsApp chat for {config.name} is being set up. Check back soon!
            </p>
            <Link
              to={`/events/${config.slug}`}
              className="inline-block px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy/90 font-medium transition-colors"
            >
              Back to {config.name}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500">Redirecting to WhatsApp…</p>
    </div>
  );
}
