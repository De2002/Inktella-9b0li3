import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, Feather, MessageSquare, BookOpen, Pen, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoSrc from '@/assets/logo.png';

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: BookOpen,
    title: 'Read',
    desc: 'Discover poems from poets around the world. Voices unlike yours. Stories that surprise you.',
  },
  {
    step: '02',
    icon: MessageSquare,
    title: 'Give Feedback',
    desc: 'Say something honest. Something specific. Something that actually helps a writer improve.',
    earn: '+2 Ink per feedback',
  },
  {
    step: '03',
    icon: Feather,
    title: 'Earn Ink',
    desc: 'Your effort becomes currency. Ink is how publishing is earned on Inktella — not bought.',
  },
  {
    step: '04',
    icon: Pen,
    title: 'Publish',
    desc: 'Use your Ink to share your own work. Receive feedback from poets who earn theirs the same way.',
    earn: '10 Ink to publish',
  },
];

const POET_TYPES = [
  {
    title: 'New Poets',
    desc: 'Learn by reading. Grow by receiving feedback on your first drafts.',
    color: '#64748B',
  },
  {
    title: 'Growing Writers',
    desc: 'Improve your craft through discussion, revision, and a community that takes your work seriously.',
    color: '#F59E0B',
  },
  {
    title: 'Experienced Poets',
    desc: 'Share knowledge, mentor others, unlock Critic-level privileges and shape discovery.',
    color: '#A855F7',
  },
  {
    title: 'Poetry Lovers',
    desc: "You don't have to write to belong. Your feedback helps real writers create better work.",
    color: '#6C4EF6',
  },
];



export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/feed', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ───────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-20">
        {/* Ink-splat watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] dark:opacity-[0.06]">
          <img src={logoSrc} alt="" aria-hidden className="w-[600px] h-[600px] object-contain" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-brand-500 border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            A contribution platform for poets
          </div>

          {/* Headline */}
          <h1 className="font-serif font-bold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.1] tracking-tight mb-6">
            Poetry grows<br />
            through <span className="text-brand-500">feedback.</span>
          </h1>

          {/* Manifesto opening */}
          <p className="text-foreground-secondary text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-4">
            Most poetry platforms are full of writers waiting to be read.
          </p>
          <p className="text-foreground font-semibold text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Inktella is different. Before you publish, you contribute.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
            >
              Earn Your First Ink
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-2 bg-background-subtle border border-border hover:border-brand-300 dark:hover:border-brand-700 text-foreground px-8 py-3.5 rounded-full font-medium text-base transition-colors"
            >
              Explore Poems
            </Link>
          </div>

          {/* Sub-note */}
          <p className="text-foreground-muted text-sm mt-5 font-serif italic">
            No subscription. Read. Give feedback. Earn Ink. Publish.
          </p>
        </div>

        {/* Scroll gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ── THE PROBLEM ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-border bg-background-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: The problem */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-4">Why Inktella Exists</p>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-6 leading-tight">
                Thousands of poems.<br />Very little conversation.
              </h2>
              <ul className="space-y-3 mb-6">
                {[
                  'Everyone wants readers.',
                  'Few people want to read.',
                  'Great poems get buried.',
                  'Feedback is rare.',
                  'New writers struggle to be noticed.',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-foreground-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-foreground-secondary leading-relaxed">
                Inktella was built to change that. Everyone who joins believes great poetry grows through{' '}
                <strong className="text-foreground">thoughtful readers, honest feedback, and writers helping writers.</strong>
              </p>
            </div>

            {/* Right: The contrast */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-border bg-surface">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-2">Other platforms</p>
                <p className="font-serif italic text-foreground-secondary leading-relaxed">
                  You post a poem. Maybe you get a like. Maybe nothing happens at all. And then your work disappears into silence.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/15">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Inktella</p>
                <p className="font-serif italic text-foreground leading-relaxed">
                  Publishing is earned through participation. Every poem here is supported by someone who has already helped another writer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-3">How Inktella Works</p>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-3">
              Feedback is the currency.
            </h2>
            <p className="text-foreground-secondary text-lg max-w-md mx-auto">
              The more you contribute, the more opportunities you unlock.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            {/* Central connecting spine */}
            <div
              className="absolute left-[52px] sm:left-1/2 sm:-translate-x-1/2 top-8 bottom-8 w-1 rounded-full bg-gradient-to-b from-brand-200 via-brand-400 to-brand-200 dark:from-brand-900 dark:via-brand-600 dark:to-brand-900"
              aria-hidden="true"
            />

            <ol className="space-y-6 sm:space-y-7">
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, earn }) => (
                <li key={step} className="relative flex items-center gap-3 sm:gap-4">
                  {/* Icon pill (left) */}
                  <div className="shrink-0 w-[72px] h-14 sm:w-20 sm:h-16 rounded-full bg-surface border border-border shadow-md flex items-center justify-center">
                    <span className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                      <Icon size={18} className="text-brand-500" />
                    </span>
                  </div>

                  {/* Numbered badge (center) */}
                  <div className="shrink-0 z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 p-[3px] shadow-lg">
                    <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                      <span className="font-mono font-bold text-base sm:text-lg text-brand-600 dark:text-brand-400">
                        {step}
                      </span>
                    </div>
                  </div>

                  {/* Text card (right) */}
                  <div className="flex-1 min-w-0 px-5 py-3.5 sm:px-6 sm:py-4 rounded-3xl bg-surface border border-border shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h3 className="font-serif font-semibold text-base sm:text-lg text-foreground">{title}</h3>
                      {earn && (
                        <span className="text-[11px] sm:text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {earn}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground-secondary text-xs sm:text-sm leading-relaxed mt-1.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-center text-foreground-muted font-serif italic mt-10 text-base">
            Simple. The more you give, the more you can share.
          </p>
        </div>
      </section>

      {/* ── LIVE POEM SAMPLE ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-y border-border bg-background-subtle">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-3">Poems, Not Posts</p>
            <h2 className="font-serif font-bold text-3xl text-foreground mb-2">Words that breathe.</h2>
            <p className="text-foreground-secondary">Lines that stay with you.</p>
          </div>
          <div className="flex justify-center">
            <img
              src="/images/inktella-mockup.png"
              alt="Inktella shown on a tablet and phone, displaying a poem in the app"
              className="w-full max-w-md h-auto object-contain"
            />
          </div>
          <div className="mt-8 text-center">
            <Link to="/auth" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-semibold transition-colors">
              Join and read more
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOR EVERY KIND OF POET ─────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-3">For Every Kind of Poet</p>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-3">
              Whether this is your first poem or your hundredth.
            </h2>
            <p className="text-foreground-secondary text-lg max-w-md mx-auto">
              You'll find a place here.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {POET_TYPES.map(({ title, desc, color }) => (
              <div key={title} className="p-6 rounded-2xl border border-border bg-surface hover:border-border-subtle transition-all group">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <h3 className="font-serif font-semibold text-lg text-foreground">{title}</h3>
                </div>
                <p className="text-foreground-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MORE THAN PUBLISHING ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-background-subtle border-y border-border">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-4">More Than Publishing</p>
              <h2 className="font-serif font-bold text-3xl text-foreground mb-6 leading-tight">
                Inktella isn't just a place to post poems.
              </h2>
              <ul className="space-y-3">
                {[
                  'Improve your writing',
                  'Discover talented poets',
                  'Build meaningful connections',
                  'Share thoughtful feedback',
                  'Track your growth over time',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-foreground-secondary">
                    <span className="text-brand-500 font-bold text-base leading-none">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="p-6 rounded-2xl border border-border bg-surface">
                <Users size={24} className="text-brand-500 mb-4" />
                <p className="font-serif italic text-foreground text-lg leading-relaxed mb-4">
                  "Every great poem starts as a draft. Every great draft starts with someone willing to read it."
                </p>
                <p className="text-xs text-foreground-muted uppercase tracking-widest font-semibold">
                  The Inktella philosophy
                </p>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/15 border border-brand-100 dark:border-brand-800">
                <p className="text-sm text-brand-700 dark:text-brand-300 leading-relaxed font-serif italic">
                  This is not a posting platform. This is a contribution system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] dark:opacity-[0.05]">
          <img src={logoSrc} alt="" aria-hidden className="w-[500px] h-[500px] object-contain" />
        </div>

        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h2 className="font-serif font-bold text-4xl sm:text-5xl text-foreground mb-5 leading-[1.15]">
            Your next poem starts<br />
            with someone else's.
          </h2>
          <p className="text-foreground-secondary text-lg leading-relaxed mb-4">
            Leave feedback. Earn Ink. Publish poetry. Grow together.
          </p>
          <p className="text-foreground-muted font-serif italic mb-10">
            Join if you're ready to participate, not just publish.
          </p>

          <Link
            to="/auth"
            className="inline-flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-2xl hover:shadow-brand-500/20 active:scale-95"
          >
            Enter Inktella
            <ArrowRight size={20} />
          </Link>
          <p className="text-foreground-muted text-sm mt-4">Free to join. Ink is earned, not bought.</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <img src={logoSrc} alt="Inktella" className="w-6 h-6 object-contain" />
                <span className="font-serif font-bold text-lg text-foreground">Inktella</span>
              </Link>
              <p className="text-foreground-secondary text-sm leading-relaxed">
                A contribution platform for poets. Free, open, and community-powered.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/explore" className="text-foreground-secondary hover:text-foreground text-sm transition-colors">
                    Explore Poems
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-foreground-secondary hover:text-foreground text-sm transition-colors">
                    Join Free
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://blog.inktella.cyou" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground-secondary hover:text-foreground text-sm transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="text-foreground-secondary hover:text-foreground text-sm transition-colors">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/terms" className="text-foreground-secondary hover:text-foreground text-sm transition-colors">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-foreground-secondary hover:text-foreground text-sm transition-colors">
                    Privacy Policy
                  </Link>
                </li>

              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:poetry@inktella.cyou" 
                    className="text-foreground-secondary hover:text-foreground text-sm transition-colors"
                  >
                    Email Support
                  </a>
                </li>
                <li>
                  <Link to="/dashboard" className="text-foreground-secondary hover:text-foreground text-sm transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="text-foreground-secondary hover:text-foreground text-sm transition-colors">
                    Account Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8"></div>

          {/* Bottom Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-foreground-secondary text-sm text-center sm:text-left">
              © {new Date().getFullYear()} Inktella. All rights reserved. Poetry grows through feedback.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
