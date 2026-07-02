import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const premiumFeatures = [
  'Monthly Ink credits for creating more poems',
  'Advanced dashboard insights on your writing',
  'Premium badge on your profile',
  'Image embedding in poems',
  'Professional Audio poem adaptation',
  'Listen to audio poems',
  'Deep analytics (views, reads, saves, listens)',
  'Best performing poems insights',
  'Notes or Analysis from poets',
  'View your followers',
  'Limited Ads',
];



const faqs = [
  {
    id: 'keep-free-account',
    question: 'Do I keep my free account?',
    answer: 'Yes. The free version stays available.',
  },
  {
    id: 'cancel-anytime',
    question: 'Can I cancel anytime?',
    answer: 'Yes. No long-term commitment.',
  },
  {
    id: 'premium-visibility',
    question: 'Will Premium affect visibility?',
    answer: 'No. All poets are treated equally.',
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
