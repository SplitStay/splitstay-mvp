import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PrivacyPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-700">SplitStay - User Privacy Policy</h1>
          <p className="text-lg text-gray-600 mb-4">Effective Date: 1 September 2025</p>
          <p className="text-gray-700 leading-relaxed">
            At SplitStay ("SplitStay", "we", "our", or "us"), your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your personal data when you access or use our platform, website, mobile apps, and services (collectively, the "Platform" or "Services").
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            By using SplitStay, you agree to the terms of this Privacy Policy.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What data we collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect personal information to operate our Platform efficiently, match travelers effectively, and comply with legal obligations, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Account Data:</strong> Name, email, phone, age, gender, preferences.</li>
              <li><strong>Booking Data:</strong> Trip details, accommodation preferences.</li>
              <li><strong>Verification Data:</strong> ID documents.</li>
              <li><strong>Usage Data:</strong> Device info, IP address, geolocation (if enabled), platform interaction data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How we use your data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To create and manage your Account</li>
              <li>To match users for shared bookings based on their preferences and to facilitate communication for managing bookings and trips, including sending important updates and trip details</li>
              <li>To verify identity when required</li>
              <li>To improve platform performance and personalisation which may include messages exchanged between members</li>
              <li>To protect our community and detect fraud or harmful behavior</li>
            </ul>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700 leading-relaxed">
                We will never share the content of private messages with other members of third parties without your consent, except when required by law or to address safety and security concerns.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                We do not sell or use your personal data for advertising or third party marketing.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How we store, retain and protect your data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We store your data securely using encrypted tools and services to protect your data against loss, misuse and unauthorised access.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your data as long as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Your Account remains active</li>
              <li>It's necessary to provide our Services</li>
              <li>Required to comply with our legal or financial obligations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              WhatsApp is a third-party platform and subject to its own privacy practices. We recommend reviewing WhatsApp's privacy policy for more information.
            </p>
            <p className="text-gray-700 leading-relaxed">
              SplitStay is not intended for individuals under the age of 18. We do not knowingly collect personal data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Your privacy rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access and request a copy of your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw your consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or how your data is handled, contact us at{' '}
              <a href="mailto:hello@splitstay.travel" className="text-blue-600 hover:text-blue-700 underline">
                hello@splitstay.travel
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-700 underline font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </motion.div>
  </div>
)

export default PrivacyPage;