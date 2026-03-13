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

          <div className="mt-12 pt-8 border-t border-gray-200 text-center space-y-4">
            <p className="text-gray-600">
              Questions? Reach us at{' '}
              <a
                href="mailto:hello@splitstay.travel"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                hello@splitstay.travel
              </a>
            </p>
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
