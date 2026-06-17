import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface FundingTier {
  id: string;
  icon: string;
  title: string;
  price: number;
  tagline: string;
  description: string;
  quote: string;
  buttonText: string;
}

const fundingTiers: FundingTier[] = [
  {
    id: 'supporter',
    icon: '🤍',
    title: 'Supporter',
    price: 2,
    tagline: 'I like this.',
    description: 'For those who enjoy Inktella and want to show their support.',
    quote: 'You are helping this creative space continue to exist.',
    buttonText: 'Become a Supporter',
  },
  {
    id: 'believer',
    icon: '🌱',
    title: 'Believer',
    price: 5,
    tagline: 'I believe in this.',
    description: 'For those who believe poetry deserves a dedicated home beyond traditional social media.',
    quote: 'You are helping us build the future of poetry sharing.',
    buttonText: 'Become a Believer',
  },
  {
    id: 'patron',
    icon: '✒️',
    title: 'Patron',
    price: 15,
    tagline: 'I support this.',
    description: 'For those who want to play a bigger role in supporting the growth of Inktella.',
    quote: 'Your support helps nurture a community where poets can create and connect.',
    buttonText: 'Become a Patron',
  },
  {
    id: 'visionary',
    icon: '✨',
    title: 'Visionary',
    price: 50,
    tagline: 'I see the future of this.',
    description: 'For those who believe Inktella can become a lasting home for poets worldwide.',
    quote: 'You are helping shape what this platform can become.',
    buttonText: 'Become a Visionary',
  },
];

const impacts = [
  'Keep Inktella free for poets and readers',
  'Build better writing and feedback tools',
  'Improve the community experience',
  'Support platform maintenance',
  'Create new ways for poets to share their work',
];

export default function LoveInktella() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            The People Behind Inktella
          </h1>
          <p className="text-base sm:text-lg text-foreground-secondary max-w-3xl mx-auto mb-4 sm:mb-6">
            Every creative movement is built by people who believe in it.
          </p>
          <p className="text-sm sm:text-base text-foreground-secondary max-w-3xl mx-auto mb-4">
            Inktella exists to give poets a place to share their voices, receive meaningful feedback, and connect with readers.
          </p>
          <p className="text-sm sm:text-base text-foreground max-w-3xl mx-auto font-medium">
            Your support helps us keep poetry free, improve the platform, and continue building a home for poets everywhere.
          </p>
        </div>

        {/* Support Journey */}
        <div className="mb-16 sm:mb-20">
          <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-8">Support Journey</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
              {[
                { icon: '🤍', title: 'Supporter' },
                { icon: '🌱', title: 'Believer' },
                { icon: '✒️', title: 'Patron' },
                { icon: '✨', title: 'Visionary' },
              ].map((tier, idx) => (
                <div key={tier.title} className="flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl mb-2">{tier.icon}</div>
                  <p className="font-semibold text-foreground text-sm sm:text-base text-center">{tier.title}</p>
                  {idx < 3 && <div className="hidden sm:block text-purple-600 dark:text-purple-400 text-xl mt-2">↓</div>}
                  {idx < 3 && <div className="sm:hidden text-purple-600 dark:text-purple-400 text-lg mt-2">↓</div>}
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                '"I like this"',
                '"I believe in this"',
                '"I support this"',
                '"I see the future of this."',
              ].map((text, idx) => (
                <p key={idx} className="text-center text-sm sm:text-base text-foreground-secondary italic">
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-12">Funding Levels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4">
            {fundingTiers.map((tier, idx) => (
              <div
                key={tier.id}
                className={`relative bg-surface border rounded-lg p-6 sm:p-5 flex flex-col h-full transition-all hover:border-purple-400 ${
                  idx === 3 ? 'lg:scale-105 border-purple-600 dark:border-purple-500' : 'border-border'
                }`}
              >
                {idx === 3 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-4">
                  <div className="text-4xl sm:text-3xl mb-2">{tier.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">{tier.title}</h3>
                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-foreground">${tier.price}</span>
                    <span className="text-foreground-secondary text-sm">/month</span>
                  </div>
                  <p className="text-foreground-secondary text-sm mt-2 italic">{tier.tagline}</p>
                </div>

                <p className="text-foreground-secondary text-sm mb-4 flex-1">{tier.description}</p>

                <div className="bg-background-subtle rounded p-3 mb-4 border border-border-subtle">
                  <p className="text-sm text-foreground italic">"{tier.quote}"</p>
                </div>

                <Button
                  className={`w-full font-semibold ${
                    idx === 3
                      ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white'
                      : 'bg-surface-secondary hover:bg-background-subtle border border-border text-foreground'
                  }`}
                >
                  {tier.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
            What Support Makes Possible
          </h2>
          <div className="bg-surface border border-border rounded-lg p-8 sm:p-10">
            <p className="text-foreground-secondary mb-6 sm:mb-8 text-center text-sm sm:text-base">
              Your support helps us:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
              {impacts.map((impact, idx) => (
                <div key={idx} className="flex items-start gap-3 sm:gap-4">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm sm:text-base">{impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900 to-indigo-50 dark:to-indigo-900 border border-purple-200 dark:border-purple-700 rounded-lg p-8 sm:p-10 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
            Ready to support the future of poetry?
          </h3>
          <p className="text-foreground-secondary mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Choose your level of support and help us build a lasting home for poets worldwide. No locked features, no premium access – just a way to support a creative movement you believe in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3">
              Explore Tiers Above
            </Button>
            <Button
              variant="outline"
              className="border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 font-semibold px-6 sm:px-8 py-2 sm:py-3"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
