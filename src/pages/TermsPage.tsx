import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const TermsPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-700">SplitStay - Terms & Conditions</h1>
          <p className="text-lg text-gray-600 mb-4">Effective Date: 1 September 2025</p>
          <p className="text-gray-700 leading-relaxed">
            Welcome to SplitStay ("SplitStay", "we", "us", or "our"). These Terms & Conditions ("Terms") govern your access to and use of the SplitStay platform, including any subdomains, mobile applications, and related services (collectively, the "Platform" or "Services").
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            By accessing or using the Platform, you agree to these Terms.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. About SplitStay</h2>
            <p className="text-gray-700 leading-relaxed">
              SplitStay is a traveltech marketplace designed to help travelers match and share accommodations in order to reduce costs, make new connections and unlock underutilised spaces across multiple destinations. Our platform serves as an intermediary between users and third-party accommodation providers to find compatible matches and facilitate travel experiences that saves cost without compromising quality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
            <div className="space-y-3">
              <p className="text-gray-700"><strong>Account:</strong> The user account that must be created to access certain features of the Platform.</p>
              <p className="text-gray-700"><strong>Booking:</strong> A confirmed reservation made by a user with an accommodation provider via SplitStay.</p>
              <p className="text-gray-700"><strong>Cost Contribution:</strong> The total amount agreed upon for a given Booking, as displayed and accepted at the time of transaction.</p>
              <p className="text-gray-700"><strong>Platform:</strong> The digital marketplace operated by SplitStay, including its website, mobile applications, and related technology, through which Users can access the Services, create Bookings, and manage Trips.</p>
              <p className="text-gray-700"><strong>Services:</strong> All features, content, functionality, and support offered by SplitStay via the Platform.</p>
              <p className="text-gray-700"><strong>Trip:</strong> A planned sequence of stays booked via SplitStay.</p>
              <p className="text-gray-700"><strong>T&Cs:</strong> These Terms & Conditions.</p>
              <p className="text-gray-700"><strong>User:</strong> Any individual who has registered and created an Account on the Platform.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use SplitStay, you confirm that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You are at least 18 years old. Use of the Platform by minors is strictly prohibited.</li>
              <li>You have the legal authority to enter into binding agreements.</li>
              <li>All personal and booking information you provide is accurate, complete, current and reflects your real identity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Bookings and Payments</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Third-Party Providers</h3>
                <p className="text-gray-700 leading-relaxed">
                  All bookings are made directly with third-party accommodation providers. SplitStay is not the owner, operator, or manager of the properties listed.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Pricing & Payment</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Prices, fees, and terms are set by the provider and may vary by location, season, or booking duration.</li>
                  <li>Taxes (except city taxes when applicable), service fees, and other applicable charges will be clearly presented prior to checkout when booking with a third-party accommodation provider. SplitStay is not responsible for any additional costs imposed or incurred at the time of check-in, check-out, or during the stay.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.3 Verification</h3>
                <p className="text-gray-700 leading-relaxed">
                  To enhance trust and safety, SplitStay may verify certain information (e.g. ID documents). However, verification does not guarantee a Member's authenticity. We encourage all users to use their best judgment when engaging with others on the platform.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellations and Refunds</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Cancellation and refund policies are determined by each third-party accommodation provider.</li>
              <li>SplitStay is not liable for refunds beyond the third-party accommodation provider's stated policy unless required by law.</li>
              <li>Any requests to cancel or modify a booking must be submitted to the third-party accommodation provider directly.</li>
            </ul>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-gray-700 leading-relaxed">
                The user who creates and posts a trip (the "Original Booker") is solely responsible for all payments due to the accommodation provider. If any co-guest cancels after joining the trip, the Original Booker remains responsible for covering the total booking cost, including any applicable cancellation fees charged by the accommodation provider. Any reimbursement or cost-sharing arrangements between the Original Booker and co-guests are private agreements between those parties and are not facilitated or enforced by SplitStay.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Behaviour, Interactions & Conduct</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By using SplitStay, you agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Comply with all applicable laws, travel regulations, and property-specific terms</li>
                  <li>Respect fellow travelers, the property of travelers, and property owners</li>
                  <li>Not misuse the Platform or engage in harmful, disruptive, or unlawful behavior</li>
                  <li>Secure appropriate travel insurance to cover potential risks, including but not limited to property damage, cancellations, illness, or loss of possessions.</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You also agree not to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Use SplitStay to harass, stalk, intimidate, or impersonate others</li>
                  <li>Promote or engage in illegal activity</li>
                  <li>Distribute spam or unsolicited content</li>
                  <li>Circumvent Platform security, verification, or policies</li>
                  <li>Register multiple Accounts</li>
                  <li>Contact another User through SplitStay for purposes unrelated to booking or shared accommodation arrangements</li>
                  <li>Collect or misuse personal information of other User</li>
                  <li>Bring SplitStay into public disrepute, contempt, scandal, or ridicule</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-gray-700 leading-relaxed mb-3">
                  We encourage safe, respectful, and inclusive interactions on the Platform:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>A traveler offering to share accommodation may limit bookings to the traveler's gender to ensure comfort and privacy when sharing common spaces (e.g. bedroom and bathroom).</li>
                  <li>All reviews must be honest, unbiased, and based on the User's actual experience. SplitStay reserves the right to remove any content that violates our review or community guidelines.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Violation of these standards may result in suspension or termination of your Account without notice.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers and Limitations of Liability</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>SplitStay does not own or control the accommodations listed and cannot guarantee the safety, quality, legality, or suitability of any property or host.</li>
              <li>SplitStay is not responsible for losses due to delays, visa issues, travel disruptions, or third-party behavior.</li>
              <li>SplitStay is not responsible for any damage to, loss, or theft of personal belongings during any Trip or stay arranged through the Platform. SplitStay assumes no liability for costs, damages, or inconveniences resulting from any Trip, Booking, or accommodation facilitated via the Platform.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To the fullest extent permitted by law, we disclaim all warranties and shall not be liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy & Data Use</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We are committed to protecting your personal data in compliance with applicable privacy laws including with the UK General Data Protection Regulation (UK GDPR).
            </p>
            <p className="text-gray-700 leading-relaxed">
              Please review our User Privacy Policy to understand how we collect, store, and use your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              All content on the SplitStay Platform, including branding, logos and images, is the property of SplitStay. You may not copy, reproduce, distribute, or use any content without our prior written permission.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The "SplitStay" name and logo are registered trademarks and may not be used without authorisation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your Account at our sole discretion if you:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violate these Terms</li>
              <li>Misuse the Platform</li>
              <li>Engage in fraudulent or harmful activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may revise these Terms at any time. When we do, we will update the "Effective Date" and post the revised Terms on the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of Belgium. Any disputes arising from or related to these Terms will be subject to the jurisdiction of the law of that territory.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions or need support, please contact us at:{' '}
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

export default TermsPage;
