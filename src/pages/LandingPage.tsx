import { Link, useNavigate } from 'react-router-dom';
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

const SAMPLE_POEMS = [
  {
    title: 'after the rain',
    content: `the city smells like something new\nroads still wet, but I'm not.\nsomething inside me\nfinally learned how to breathe.`,
    author: 'maya.writes',
    likes: 234,
    feedback: 28,
  },
  {
    title: 'between the thoughts',
    content: `there is a space\nbetween what I feel\nand what I know—\nthat's where I live most days.`,
    author: 'wordwanderer',
    likes: 178,
    feedback: 63,
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/feed', { replace: true });
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, earn }) => (
              <div key={step} className="relative p-6 rounded-2xl border border-border hover:border-brand-300 dark:hover:border-brand-700 bg-surface transition-all group">
                {/* Step number */}
                <span className="text-[11px] font-bold font-mono text-foreground-muted tracking-widest mb-4 block">{step}</span>
                {/* Icon */}
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors">
                  <Icon size={18} className="text-brand-500" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">{desc}</p>
                {earn && (
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 px-2.5 py-1 rounded-full">
                    {earn}
                  </span>
                )}
              </div>
            ))}
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
          <div className="space-y-0">
            {SAMPLE_POEMS.map((poem, i) => (
              <article key={i} className="poem-entry">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-bold text-brand-600" style={{ border: '2px dotted #6C4EF6' }}>
                    {poem.author[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">@{poem.author}</span>
                </div>
                <h3 className="poem-title text-xl text-foreground mb-2">{poem.title}</h3>
                <div className="poem-text text-foreground-secondary text-base whitespace-pre-line">{poem.content}</div>
                <div className="flex items-center gap-4 mt-4 text-sm text-foreground-muted">
                  <span>❤️ {poem.likes}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={13} />
                    {poem.feedback} feedback
                  </span>
                </div>
              </article>
            ))}
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
      <footer className="border-t border-border py-8 px-4 text-center bg-background-subtle">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src={logoSrc} alt="Inktella" className="w-6 h-6 object-contain opacity-80" />
          <p className="font-serif font-bold text-lg text-foreground">Inktella</p>
        </div>
        <p className="text-foreground-muted text-sm">Poetry grows through feedback.</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-foreground-muted flex-wrap">
          <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
          <Link to="/auth" className="hover:text-foreground transition-colors">Join free</Link>
          <Link to="/critic-notes" className="hover:text-foreground transition-colors">Critic Notes</Link>
          <span className="text-border">•</span>
          <Link to="/love-inktella" className="hover:text-foreground transition-colors">Support us</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
