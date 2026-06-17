export default function SupporterTermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Supporter Terms</h1>
        <p className="text-foreground-secondary text-sm mb-10">Last updated: June 17, 2026</p>

        <div className="space-y-8 text-foreground-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Nature of Support</h2>
            <p>
              Supporting Inktella is a voluntary contribution to help sustain and grow the platform. It is not a purchase of goods or services,
              and does not entitle supporters to premium features, enhanced visibility, or any competitive advantage on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Funding Tiers</h2>
            <p className="mb-3">
              Inktella offers several voluntary funding tiers: Supporter, Believer, Patron, and Visionary. Each tier is offered on a monthly
              recurring basis unless a one-time contribution option is selected.
            </p>
            <p>
              Recognition within the Funding Members Hall is the primary benefit associated with each tier. This recognition is subject to
              the supporter's preference regarding public display of their name.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. No Influence on Platform Features</h2>
            <p>
              Financial support does not influence poem discovery, feedback visibility, level progression, or any platform mechanics.
              All poets and readers are subject to the same rules regardless of their supporter status.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Cancellation</h2>
            <p>
              Supporters may cancel their recurring contribution at any time. Cancellation will take effect at the end of the current billing
              cycle. No partial refunds are provided for unused time within a billing period unless required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Refunds</h2>
            <p>
              Please refer to our <a href="/refund-policy" className="text-brand hover:underline">Refund Policy</a> for details on
              eligibility and the refund process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Changes to Tiers or Pricing</h2>
            <p>
              Inktella reserves the right to adjust funding tiers, pricing, or benefits at any time. Existing supporters will be notified
              in advance of any material changes and may cancel before such changes take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Public Recognition</h2>
            <p>
              By default, supporters may be listed in the Funding Members Hall. Supporters who prefer not to be listed publicly may opt out
              at any time through their account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
            <p>
              For questions about supporter terms, please contact us at{' '}
              <a href="mailto:contact@inktella.cyou" className="text-brand hover:underline">contact@inktella.cyou</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
