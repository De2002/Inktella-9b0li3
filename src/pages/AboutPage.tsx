import { useEffect } from 'react';
import { setMetadata } from '@/lib/metadata';
import { LevelBadgeImage } from '@/components/features/LevelBadge';

export default function AboutPage() {
  useEffect(() => {
    setMetadata({
      title: 'About Inktella',
      description: 'Learn about Inktella, a feedback-driven poetry platform where writers grow through meaningful critique and community engagement.',
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground mb-6 leading-[1.1]">
            About Inktella
          </h1>
          <p className="text-base text-foreground-secondary leading-relaxed">
            Inktella is a creative space built for people who love poetry, writing, and meaningful expression.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Belief Section */}
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-foreground mb-6">
              Our Belief
            </h2>
            <p className="text-base text-foreground-secondary leading-relaxed mb-4">
              We believe poetry is not just something you post—it is something that grows when it is shared, read, and improved through feedback.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed">
              That belief is what shaped Inktella.
            </p>
          </div>

          {/* Vision Section */}
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-foreground mb-6">
              Our Vision
            </h2>
            <p className="text-base text-foreground-secondary leading-relaxed mb-6">
              We want to build a community where writers don&apos;t feel alone.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed mb-4">
              A place where:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Every writer has potential</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Feedback improves creativity</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Community builds confidence</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Growth comes from sharing, not isolation</span>
              </li>
            </ul>
            <p className="text-base text-foreground-secondary leading-relaxed mt-6">
              Inktella is designed around these principles.
            </p>
          </div>

          {/* Why Inktella Section */}
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-foreground mb-6">
              What We Offer
            </h2>
            <p className="text-base text-foreground-secondary leading-relaxed mb-6">
              Many writers struggle alone, unsure if their work is improving or being seen.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed mb-6">
              Inktella exists to change that.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed mb-4">
              We created a space where:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Writing is shared</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Writing is shared</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Feedback is encouraged</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Improvement is visible</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Every voice has a place</span>
              </li>
              <li className="text-lg text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Improvement is visible</span>
              </li>
              <li className="text-lg text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Every voice has a place</span>
              </li>
            </ul>
          </div>

          {/* Call to Action Section */}
          <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-8 sm:p-12 text-center">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-foreground mb-4">
              Join the Movement
            </h2>
            <p className="text-base text-foreground-secondary leading-relaxed mb-6">
              Inktella is still growing, and every new writer helps shape it.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed mb-6">
              Many writers struggle alone, unsure if their work is improving or being seen.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed mb-6">
              Inktella exists to change that.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed mb-4">
              We created a space where:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Writing is shared</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Feedback is encouraged</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Improvement is visible</span>
              </li>
              <li className="text-base text-foreground-secondary leading-relaxed flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <span>Every voice has a place</span>
              </li>
            </ul>
          </div>

          {/* Call to Action Section */}
          <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-8 sm:p-12 text-center">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-foreground mb-4">
              Join the Movement
            </h2>
            <p className="text-base text-foreground-secondary leading-relaxed mb-6">
              Inktella is still growing, and every new writer helps shape it.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed mb-6">
              Whether you are writing your first poem or your hundredth, there is space for you here.
            </p>
            <p className="text-base font-serif italic text-foreground">
              Write. Share. Improve. Grow.
            </p>
            <p className="text-base text-foreground-secondary leading-relaxed mt-4">
              That is what Inktella is all about.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
