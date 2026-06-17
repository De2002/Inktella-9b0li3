import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

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

const faqs = [
  {
    id: 'why-support',
    question: 'Why does Inktella need support?',
    answer: 'Inktella is built to be a free and open home for poets and readers. Support from the community helps us maintain the platform, build new features, improve the experience, and continue creating a space where poetry can thrive.',
  },
  {
    id: 'paid-platform',
    question: 'Is Inktella becoming a paid platform?',
    answer: 'No. Inktella will remain free and open for poets and readers. Supporting Inktella is completely optional. It is a way for people who believe in the mission to help keep it alive and growing.',
  },
  {
    id: 'what-benefits',
    question: 'What do funding members receive?',
    answer: 'Funding members receive recognition as people who help support Inktella\'s journey. This is not a premium account or a way to unlock better features. Everyone on Inktella has access to the same creative community.',
  },
  {
    id: 'poem-visibility',
    question: 'Will supporters get more visibility for their poems?',
    answer: 'No. Support does not influence how poems are discovered, reviewed, or recommended. Poetry should be valued based on creativity, engagement, and community response — not financial support.',
  },
  {
    id: 'ads',
    question: 'Will Inktella have advertisements?',
    answer: 'Inktella\'s goal is to keep the poetry experience clean and enjoyable. We may explore carefully selected advertising or partnerships in the future to help sustain the platform, but we will avoid intrusive ads that interrupt reading, writing, or discovery.',
  },
  {
    id: 'money-used',
    question: 'How will support money be used?',
    answer: 'Support helps fund: Platform hosting and maintenance, Development of new features, Improving tools for poets and readers, Community improvements, and Keeping Inktella accessible worldwide.',
  },
  {
    id: 'other-support',
    question: 'Can I support Inktella without becoming a funding member?',
    answer: 'Yes. You can support Inktella by sharing poems, giving meaningful feedback, inviting poets, participating in the community, and spreading the word. Every contribution matters.',
  },
  {
    id: 'cancel-support',
    question: 'Can I change or cancel my support?',
    answer: 'Yes. You can manage or cancel your support at any time.',
  },
  {
    id: 'one-time',
    question: 'Can I make a one-time contribution?',
    answer: 'Yes. Some people prefer to support once instead of joining monthly. A one-time contribution option can be available for those who want to help without a recurring commitment.',
  },
  {
    id: 'member-decisions',
    question: 'Are funding members involved in decisions about Inktella?',
    answer: 'Funding members may have opportunities to share feedback and ideas about the future of Inktella. However, decisions will always be guided by the mission of creating the best possible experience for poets and readers.',
  },
  {
    id: 'public-names',
    question: 'Why are the supporter names displayed publicly?',
    answer: 'The Funding Members Hall is a way to recognize the people who choose to stand behind Inktella. Public display is optional. Supporters can choose whether their name appears.',
  },
  {
    id: 'organizations',
    question: 'Can businesses or organizations support Inktella?',
    answer: 'Yes. Organizations, writing groups, schools, and creative communities can support Inktella and help promote a culture of poetry and creativity.',
  },
  {
    id: 'cannot-afford',
    question: 'What if I cannot afford to support?',
    answer: 'That is completely okay. Inktella exists for everyone. Reading poems, sharing your work, and being part of the community are valuable forms of support too.',
  },
  {
    id: 'pay-success',
    question: 'Will paying make my poems more successful?',
    answer: 'No. Supporting Inktella does not give anyone an advantage in publishing, feedback, discovery, or recognition. Every poet deserves an equal opportunity to be heard.',
  },
];

export default function LoveInktella() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
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

        {/* Pricing Cards */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-12">Funding Levels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4">
            {fundingTiers.map((tier, idx) => (
              <div
                key={tier.id}
                className={`relative bg-surface border rounded-lg p-6 sm:p-5 flex flex-col h-full transition-all hover:border-brand-400 ${
                  idx === 3 ? 'lg:scale-105 border-brand-600 dark:border-brand-500' : 'border-border'
                }`}
              >
                {idx === 3 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-bold">
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
                      ? 'bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white'
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
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm sm:text-base">{impact}</span>
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
      </div>
    </div>
  );
}
