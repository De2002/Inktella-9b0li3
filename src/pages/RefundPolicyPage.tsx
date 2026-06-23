import { Link } from 'react-router-dom';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium text-sm mb-6 inline-block">
            ← Back to Inktella
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">Refund Policy</h1>
          <p className="text-foreground-secondary text-sm">Effective Date: June 17, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <div>
            <p className="text-foreground-secondary leading-relaxed">
              At Inktella, we appreciate everyone who chooses to support our mission of building a free and open home for poets.
            </p>
            <p className="text-foreground-secondary leading-relaxed mt-4">
              This Refund Policy explains how refunds for Inktella Premium subscriptions are handled.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Payment Processing</h2>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              Payments for Inktella Premium subscriptions are processed by Paddle, which acts as our Merchant of Record.
            </p>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              As Merchant of Record, Paddle is responsible for processing payments, handling applicable taxes, issuing receipts, and managing payment-related services.
            </p>
            <p className="text-foreground-secondary leading-relaxed">
              All payments are subject to the Paddle Buyer Terms and Conditions and Paddle's refund policies. If there is any inconsistency between this policy and Paddle's Buyer Terms and Conditions, Paddle's terms will apply.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. About Inktella Premium Subscription</h2>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              Inktella Premium subscriptions help fund the continued development, maintenance, and improvement of the Inktella platform.
            </p>
            <p className="text-foreground-secondary leading-relaxed">
              Premium is optional and provides access to enhanced features. A free version of Inktella remains available to all users.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Refund Periods</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              Refund rights depend on your location and applicable consumer protection laws. Where applicable, the following refund periods apply:
            </p>
            <ul className="space-y-3 ml-4">
              <li className="text-foreground-secondary leading-relaxed list-disc">
                <strong className="text-foreground">European Union, European Economic Area, Switzerland, and United Kingdom:</strong> You may have a 14-day right to withdraw from certain subscription agreements and request a refund, subject to applicable exceptions.
              </li>
              <li className="text-foreground-secondary leading-relaxed list-disc">
                <strong className="text-foreground">Turkey and Israel:</strong> You may have a 14-day right to withdraw from certain digital service agreements.
              </li>
              <li className="text-foreground-secondary leading-relaxed list-disc">
                <strong className="text-foreground">South Korea, Brazil, China, and Canada:</strong> You may have a 7-day right to cancel certain digital services and request a refund.
              </li>
              <li className="text-foreground-secondary leading-relaxed list-disc">
                <strong className="text-foreground">Singapore:</strong> You may have a 5-day right to cancel certain digital services and request a refund.
              </li>
            </ul>
            <p className="text-foreground-secondary leading-relaxed mt-4">
              Outside these regions, refunds may be considered according to Paddle's refund process and applicable laws.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Requesting a Refund</h2>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              To request a refund, please contact Paddle through:
            </p>
            <ul className="space-y-2 ml-4 mb-4">
              <li className="text-foreground-secondary list-disc">The "View Receipt" or "Manage Subscription" link in your Paddle confirmation email</li>
              <li className="text-foreground-secondary list-disc">The refund request option provided by Paddle</li>
              <li className="text-foreground-secondary list-disc">Paddle's customer support process</li>
            </ul>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              Refund requests should be submitted within the applicable refund period.
            </p>
            <p className="text-foreground-secondary leading-relaxed">
              Paddle reviews refund requests and determines eligibility according to applicable laws, Paddle's policies, and transaction details.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Subscription Cancellation</h2>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              If you support Inktella through a recurring contribution, you may cancel at any time. Cancellation:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="text-foreground-secondary list-disc">Stops future charges</li>
              <li className="text-foreground-secondary list-disc">Does not automatically refund previous payments</li>
              <li className="text-foreground-secondary list-disc">Takes effect at the end of the current billing period</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Refund Limitations</h2>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              Refunds may not be issued where there is evidence of:
            </p>
            <ul className="space-y-2 ml-4 mb-4">
              <li className="text-foreground-secondary list-disc">Fraud</li>
              <li className="text-foreground-secondary list-disc">Refund abuse</li>
              <li className="text-foreground-secondary list-disc">Manipulation of the payment system</li>
              <li className="text-foreground-secondary list-disc">Misuse of refund rights</li>
            </ul>
            <p className="text-foreground-secondary leading-relaxed">
              This does not affect any rights you may have under applicable consumer protection laws.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Technical Issues</h2>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              If you experience a technical issue related to an Inktella service you paid for, please contact Inktella first so we can attempt to resolve the issue.
            </p>
            <p className="text-foreground-secondary leading-relaxed">
              If the issue cannot be resolved, Paddle may review the matter and issue a refund where appropriate.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Changes to This Policy</h2>
            <p className="text-foreground-secondary leading-relaxed">
              We may update this Refund Policy from time to time. The version active at the time of your transaction will apply.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Contact</h2>
            <p className="text-foreground-secondary leading-relaxed mb-3">
              For questions about Inktella support:
            </p>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              Email: <a href="mailto:poetry@inktella.cyou" className="text-purple-600 dark:text-purple-400 hover:underline">poetry@inktella.cyou</a>
            </p>
            <p className="text-foreground-secondary leading-relaxed">
              For payment, billing, or refund processing: Please contact Paddle through your payment receipt or Paddle support.
            </p>
          </div>
        </div>

        {/* CTA */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-foreground-secondary text-sm mb-4">Interested in going Premium?</p>
            <Link
              to="/premium"
              className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors"
            >
              View Premium
            </Link>
          </div>
      </div>
    </div>
  );
}
