import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const premiumFeatures = [
  'Free monthly ink allocation',
  'Access dashboard analytics',
  'Premium user badge',
  'Submit feature requests',
  'Add images to poems',
  'Audio adaptation support',
  'Access "Behind the Poem" content',
  'Listen to audio poems',
  'See followers list',
];

const benefits = [
  'Keep Inktella free for everyone',
  'Build better writing and feedback tools',
  'Create professional audio poem adaptations',
  'Help more poets discover an audience',
  'Develop new features faster',
  'Maintain a safe, welcoming community',
  'Improve the speed, reliability, and accessibility of the platform',
];

const faqs = [
  {
    id: 'what-is-premium',
    question: 'What is Inktella Premium?',
    answer: 'Inktella Premium is an optional subscription that unlocks enhanced features while keeping the core platform free. Premium subscribers get exclusive tools, badges, and content access to support their writing journey.',
  },
  {
    id: 'is-free-enough',
    question: 'Is Inktella free version enough?',
    answer: 'Yes. Inktella remains free and open for poets and readers. Premium is completely optional and offers additional features for those who want more from their creative experience.',
  },
  {
    id: 'what-benefits',
    question: 'What do Premium members receive?',
    answer: 'Premium members receive monthly ink allocation, dashboard access, a premium badge, the ability to request features, image and audio support for poems, access to behind-the-scenes content, and more. Importantly, Premium does not influence poem discovery or give competitive advantages.',
  },
  {
    id: 'poem-visibility',
    question: 'Will Premium members get more visibility for their poems?',
    answer: 'No. Poetry should be valued based on creativity, engagement, and community response — not financial support. Poem discovery is based on community feedback and merit.',
  },
  {
    id: 'ads',
    question: 'Will Inktella have advertisements?',
    answer: 'Inktella\'s goal is to keep the poetry experience clean and enjoyable. We may explore carefully selected advertising or partnerships in the future to help sustain the platform, but we will avoid intrusive ads that interrupt reading, writing, or discovery.',
  },
  {
    id: 'money-used',
    question: 'How will Premium revenue be used?',
    answer: 'Premium subscriptions help fund: platform hosting and maintenance, development of new features, improving tools for poets and readers, community improvements, and keeping Inktella accessible worldwide.',
  },
  {
    id: 'other-support',
    question: 'Can I support Inktella without Premium?',
    answer: 'Yes. You can support Inktella by sharing poems, giving meaningful feedback, inviting poets, participating in the community, and spreading the word. Every contribution matters.',
  },
  {
    id: 'cancel-premium',
    question: 'Can I change or cancel Premium?',
    answer: 'Yes. You can manage or cancel your Premium subscription at any time. Cancellation takes effect at the end of your current billing period.',
  },
  {
    id: 'one-time',
    question: 'Can I make a one-time contribution?',
    answer: 'Currently, Premium is offered as a monthly subscription. One-time contribution options may become available in the future.',
  },
  {
    id: 'cannot-afford',
    question: 'What if I cannot afford Premium?',
    answer: 'That is completely okay. Inktella exists for everyone. Reading poems, sharing your work, and being part of the community are valuable forms of support too.',
  },
  {
    id: 'pay-success',
    question: 'Will Premium make my poems more successful?',
    answer: 'No. Premium subscription does not give anyone an advantage in publishing, feedback, discovery, or recognition. Every poet deserves an equal opportunity to be heard.',
  },
  {
    id: 'flexible-billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards and digital payment methods through our payment partner, Paddle. Payment is processed securely, and you can manage your subscription anytime.',
  },
];

export default function PremiumPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Inktella Premium
          </h1>
          <p className="text-base sm:text-lg text-foreground-secondary max-w-3xl mx-auto mb-4 sm:mb-6">
            Unlock enhanced features and support the future of poetry.
          </p>
          <p className="text-sm sm:text-base text-foreground-secondary max-w-3xl mx-auto mb-4">
            Inktella remains free for all. Premium is optional and helps us keep building the best poetry platform.
          </p>
          <p className="text-sm sm:text-base text-foreground max-w-3xl mx-auto font-medium">
            Your Premium subscription supports platform development, new features, and a thriving poetry community.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-12">Simple Premium Tier</h2>
          <div className="flex justify-center">
            <div className="relative bg-surface border border-brand-600 dark:border-brand-500 rounded-lg p-8 sm:p-10 w-full max-w-sm">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                Recommended
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Premium</h3>
                <div className="flex items-baseline justify-center gap-1 mb-3">
                  <span className="text-4xl sm:text-5xl font-bold text-foreground">$4.99</span>
                  <span className="text-foreground-secondary text-base">/month</span>
                </div>
                <p className="text-foreground-secondary text-sm">Billed monthly</p>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {premiumFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full font-semibold bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white">
                Upgrade to Premium
              </Button>

              <p className="text-center text-foreground-secondary text-xs mt-4">
                Cancel anytime. No commitment.
              </p>
            </div>
          </div>
        </div>

        {/* What Your Support Makes Possible */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
            What Your Premium Supports
          </h2>
          <div className="bg-surface border border-border rounded-lg p-8 sm:p-10">
            <p className="text-foreground-secondary mb-6 sm:mb-8 text-center text-sm sm:text-base">
              Premium revenue directly supports:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 sm:gap-4">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm sm:text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-surface border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-background-subtle transition-colors text-left"
                >
                  <h3 className="font-semibold text-foreground text-sm sm:text-base pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 transition-transform ${
                      expandedFAQ === faq.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 py-4 border-t border-border bg-background-subtle">
                    <p className="text-foreground-secondary text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-8 sm:py-12 border-t border-border">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Ready to go Premium?</h2>
          <p className="text-foreground-secondary text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Support Inktella and unlock features designed to enhance your poetry experience.
          </p>
          <Button className="font-semibold bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white px-8 py-3">
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </div>
  );
}
