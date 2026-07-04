import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { setMetadata } from '@/lib/metadata';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    setMetadata({
      title: 'Privacy Policy',
      description: 'Learn how Inktella protects your personal information and privacy. Review our data practices and privacy standards for our poetry platform.',
      url: 'https://inktella.onspace.app/privacy',
    });
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="flex items-center gap-2 text-brand-500 hover:text-brand-600 mb-4 w-fit">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-foreground-muted mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none space-y-6 text-foreground-secondary">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p>
              Inktella ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your personal information when you use our Platform (the "Service").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="font-semibold text-foreground mb-2">Information You Provide:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li>Account information (username, email, profile picture)</li>
              <li>Poetry and content you post on the Platform</li>
              <li>Feedback and comments you provide to other users</li>
              <li>Communication with Inktella support</li>
            </ul>

            <p className="font-semibold text-foreground mb-2">Automatically Collected Information:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, interactions)</li>
              <li>IP address and location data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Providing and improving the Platform</li>
              <li>Creating and managing your account</li>
              <li>Communicating with you about updates, changes, or support</li>
              <li>Monitoring Platform security and preventing fraud</li>
              <li>Analyzing usage patterns to enhance user experience</li>
              <li>Complying with legal obligations</li>
              <li>Enforcing our Terms of Use and other agreements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Sharing Your Information</h2>
            <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Public Content:</strong> Any poetry or feedback you post is visible to other Platform users</li>
              <li><strong>Service Providers:</strong> We may share information with vendors who assist in Platform operations</li>
              <li><strong>Legal Obligations:</strong> We may disclose information if required by law</li>
              <li><strong>Safety:</strong> We may share information to prevent harm or protect rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide the Service and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us. However, we may retain certain information as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Security</h2>
            <p>
              We implement industry-standard security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies</h2>
            <p className="mb-4">
              Inktella uses cookies and similar technologies to enhance your experience. Cookies help us remember your preferences, understand how you use the Platform, and provide personalized content. You can control cookie settings through your browser, though disabling cookies may limit Platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Third-Party Links</h2>
            <p>
              The Platform may contain links to third-party websites. We are not responsible for the privacy practices of external sites. We encourage you to review their privacy policies before providing personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
            <p>
              Inktella is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will promptly delete the information and close the account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Your Privacy Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your information</li>
              <li>Opt out of certain data processing</li>
              <li>Export your data</li>
            </ul>
            <p className="mt-4">To exercise these rights, contact us at poetry@inktella.cyou</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date. Your continued use of the Platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at{' '}
              <a href="mailto:poetry@inktella.cyou" className="text-brand-500 hover:text-brand-600 underline">
                poetry@inktella.cyou
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
