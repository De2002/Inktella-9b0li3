import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SupporterTermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Inktella
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Supporter Terms</h1>
          <p className="text-foreground-secondary">Effective Date: January 1, 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. What Does Support Mean?</h2>
            <p className="text-foreground-secondary leading-relaxed">
              When you become a supporter on Inktella, you are choosing to contribute financially to help keep the platform alive and growing. Support is voluntary and does not grant you access to premium features, special privileges, or priority on the platform. Inktella remains completely free for all users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Support Tiers</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              Inktella offers multiple support tiers:
            </p>
            <ul className="list-disc list-inside text-foreground-secondary space-y-2 ml-4">
              <li><strong>Supporter ($2/month):</strong> Help keep Inktella alive</li>
              <li><strong>Believer ($5/month):</strong> Show your belief in the mission</li>
              <li><strong>Patron ($15/month):</strong> Actively support our work</li>
              <li><strong>Visionary ($50/month):</strong> Champion the future of poetry</li>
            </ul>
            <p className="text-foreground-secondary leading-relaxed mt-4">
              Each tier provides recognition in the Funding Members Hall (if you choose to be public). You can change or cancel your support at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. No Platform Advantages</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Support does not provide any platform advantages. Supporters do not receive: priority in poetry discovery, increased visibility for their poems, special badges or status (other than optional recognition), access to creator tools or features, or any other form of preferential treatment on Inktella. Everyone experiences the same community.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Payment Processing</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Payments are processed through Paddle, a third-party payment processor. By choosing to support Inktella, you agree to Paddle's terms of service. Your payment information is handled securely and in accordance with applicable data protection laws. You are responsible for providing accurate payment information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Recurring Billing</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Support tiers are set up as recurring monthly charges unless you choose a one-time contribution option. Your payment method will be charged on the same date each month. You will receive confirmation of each charge via email. It is your responsibility to keep your payment information current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Cancellation & Changes</h2>
            <p className="text-foreground-secondary leading-relaxed">
              You can change your support tier or cancel at any time through your account settings or by contacting us. Cancellation will take effect at the end of your current billing cycle. You will not receive a refund for the current month, but your payment method will not be charged again after cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Public Recognition</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Supporters are listed in the Inktella Funding Members Hall. You have the option to choose whether your name and tier are displayed publicly. You can update this preference at any time in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. How Support Is Used</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Your support helps fund: Platform hosting and server maintenance, Development of new features and improvements, Tools for poets and readers, Community moderation and safety, Making Inktella accessible to everyone worldwide. We publish transparency reports regularly to show how supporter contributions are used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Account Termination</h2>
            <p className="text-foreground-secondary leading-relaxed">
              If your Inktella account is terminated due to violation of our Terms of Service, your support will also be cancelled. Any remaining balance will be handled according to our refund policy. Inktella reserves the right to refuse or cancel support from any user for any reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Acknowledgment</h2>
            <p className="text-foreground-secondary leading-relaxed">
              By becoming a supporter, you acknowledge that you have read and understand these terms, that support is optional and does not provide platform advantages, and that you are not purchasing premium access or features. Your support is a contribution to a mission you believe in.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Questions About Support?</h2>
            <p className="text-foreground-secondary mb-4">
              If you have questions about supporting Inktella, please reach out to us.
            </p>
            <a 
              href="mailto:poetry@inktella.cyou" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
