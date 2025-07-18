import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PrivacyPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Privacy Policy</h1>
        <p className="mb-4 text-gray-700">Your privacy is important to us. This policy explains how SplitStay collects, uses, and protects your information.</p>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2">
          <li>We collect personal information you provide during signup and profile creation.</li>
          <li>Your data is used to facilitate bookings, communication, and improve our services.</li>
          <li>We do not sell your personal information to third parties.</li>
          <li>We may share data with service providers as needed to operate the platform.</li>
          <li>All data is stored securely and access is restricted to authorized personnel only.</li>
          <li>You may request deletion of your account and data at any time.</li>
        </ol>
        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </motion.div>
  </div>
)

export default PrivacyPage; 