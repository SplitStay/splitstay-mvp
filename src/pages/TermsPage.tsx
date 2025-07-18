import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const TermsPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Terms of Use</h1>
        <p className="mb-4 text-gray-700">Welcome to SplitStay! By using our platform, you agree to the following terms and conditions. Please read them carefully.</p>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2">
          <li>You must be at least 18 years old to use SplitStay.</li>
          <li>Respect all users and hosts. Harassment or discrimination is strictly prohibited.</li>
          <li>Do not post false information or attempt to scam other users.</li>
          <li>All bookings and trip arrangements are the responsibility of the users involved.</li>
          <li>SplitStay is not liable for any disputes or damages arising from user interactions.</li>
          <li>We reserve the right to suspend or terminate accounts for violations of these terms.</li>
        </ol>
        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </motion.div>
  </div>
)

export default TermsPage; 