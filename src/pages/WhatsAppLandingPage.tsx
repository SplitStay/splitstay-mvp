import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const steps = [
  {
    title: 'Start a conversation',
    description:
      'Send a message to our WhatsApp number to get started. No app download needed — just use WhatsApp.',
  },
  {
    title: 'Share your travel plans',
    description:
      "Tell the bot where you're going and when. It only takes a moment.",
  },
  {
    title: 'Get matched',
    description:
      'We connect you with travelers heading to the same place so you can share accommodation and split costs.',
  },
];

const controlPoints = [
  'You start the conversation',
  'No automated marketing messages',
];

export function WhatsAppLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-navy">
              Meet your travel matchmaker on WhatsApp
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              SplitStay's WhatsApp bot helps match you with travelers heading to
              the same destination and dates — so you can share accommodation,
              split costs, and travel smarter.
            </p>
          </div>

          <div className="text-center mb-10">
            {/* Hardcoded for Meta Business verification; migrate to VITE_WHATSAPP_NUMBER after verification */}
            <a
              href="https://wa.me/32460257662"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fba59] text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>WhatsApp</title>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Message us on WhatsApp
            </a>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    className="text-center p-6 rounded-xl bg-blue-50"
                  >
                    <div className="w-12 h-12 bg-navy text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You're in Control
              </h2>
              <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                <ul className="space-y-3 text-gray-700">
                  {controlPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Privacy Matters
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  We only collect the information you share with the bot — your
                  destination, travel dates, and contact preferences. This data
                  is used solely to find you compatible travel matches.
                </p>
                <p>
                  We never sell your data or use it for advertising. WhatsApp is
                  a third-party platform subject to its own privacy practices.
                </p>
                <p>
                  For full details, read our{' '}
                  <Link
                    to="/privacy"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
