import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Feather, Star, MessageSquare, TrendingUp, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import heroImg from '@/assets/hero.jpg';

const SAMPLE_POEMS = [
  {
    title: 'after the rain',
    content: `the city smells like something new
roads still wet, but I'm not.
something inside me
finally learned how to breathe.`,
    author: 'maya.writes',
    tags: ['Life', 'Healing', 'Rain'],
    likes: 234,
  },
  {
    title: 'loud silence',
    content: `everyone talks.
no one listens.
this is how the world
became so tired.`,
    author: 'silent.ink',
    tags: ['Sadness', 'Overthinking'],
    likes: 412,
  },
  {
    title: 'between the thoughts',
    content: `there is a space
between what I feel
and what I know—
that's where I live most days.`,
    author: 'word.wander',
    tags: ['Mental Health', 'Confusion'],
    likes: 178,
  },
];

const STATS = [
  { label: 'Poems published', value: '12,430' },
  { label: 'Feedback given', value: '94,710' },
  { label: 'Poets growing', value: '8,291' },
];

const HOW_IT_WORKS = [
  { icon: MessageSquare, title: 'Give Feedback', desc: 'Read a poem. Leave honest, specific feedback. Every word you offer teaches something.', earn: '+2 Ink, +3 Tella' },
  { icon: Feather, title: 'Earn Ink', desc: 'Ink is your publishing currency. The more you give, the more you can share.', earn: 'Publish for 10 Ink' },
  { icon: Star, title: 'Build Trust', desc: 'As your Tella grows, you unlock deeper platform privileges and greater influence.', earn: 'Observer → Guide → Critic' },
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
      {/* Hero section */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Inktella" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-ink-400 text-sm font-medium bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            A new home for serious poets
          </div>
          <h1 className="font-serif font-bold text-5xl sm:text-6xl lg:text-7xl text-white mb-5 leading-[1.1] tracking-tight">
            Words.<br />
            <span className="text-brand-400">Feedback.</span><br />
            Growth.
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-8">
            The poetry platform where giving honest feedback earns you the right to publish. Craft improves in community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-7 py-3.5 rounded-full font-semibold text-base transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
            >
              Start Writing Free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-7 py-3.5 rounded-full font-medium text-base transition-colors"
            >
              Explore Poems
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center justify-center gap-8 sm:gap-12">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-serif font-bold text-2xl sm:text-3xl text-white">{s.value}</p>
                <p className="text-white/50 text-xs sm:text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/40 z-10">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-3">Feedback is the economy.</h2>
          <p className="text-foreground-secondary text-lg">You don't pay to publish. You earn it.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ icon: Icon, title, desc, earn }) => (
            <div key={title} className="p-6 rounded-2xl border border-border hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-500" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-foreground mb-2">{title}</h3>
              <p className="text-foreground-secondary text-sm leading-relaxed mb-3">{desc}</p>
              <span className="text-xs font-semibold text-ink-600 dark:text-ink-400 bg-ink-50 dark:bg-ink-900/20 px-2.5 py-1 rounded-full">
                {earn}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Sample poems - Instagram-style */}
      <section className="py-16 px-4 border-y border-border bg-background-subtle">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif font-bold text-3xl text-foreground mb-2">Poems, not posts.</h2>
            <p className="text-foreground-secondary">Words that breathe. Lines that stay.</p>
          </div>
          <div className="space-y-0">
            {SAMPLE_POEMS.map((poem, i) => (
              <article key={i} className="poem-entry">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-bold text-brand-600 border-2 dotted border-ink-400" style={{ border: '2px dotted #F59E0B' }}>
                    {poem.author[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">@{poem.author}</span>
                </div>
                <h3 className="poem-title text-xl text-foreground mb-2">{poem.title}</h3>
                <div className="poem-text text-foreground-secondary">{poem.content}</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {poem.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-foreground-muted">
                  <span>❤️ {poem.likes}</span>
                  <span className="flex items-center gap-1"><Feather size={13} /> Give feedback</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/auth" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium">
              See more poems — join free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Level system */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-3">Trust shapes discovery.</h2>
          <p className="text-foreground-secondary text-lg max-w-xl mx-auto">
            As the community trusts your voice more, deeper parts of the platform open.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              level: 'Observer',
              range: '0–199 Tella',
              color: '#64748B',
              dot: 'border-2 border-dotted border-slate-400',
              icon: '⬡',
              perks: ['Publish poems with Ink', 'Give feedback', 'Earn Ink & Tella', 'Like and save poems'],
            },
            {
              level: 'Guide',
              range: '200–999 Tella',
              color: '#F59E0B',
              dot: 'border-2 border-dotted border-amber-400',
              icon: '✦',
              featured: true,
              perks: ['Mark feedback as Helpful', 'Highlight great feedback', 'Access feedback templates', 'Feed influence'],
            },
            {
              level: 'Critic',
              range: '1000+ Tella',
              color: '#A855F7',
              dot: 'border-2 border-dotted border-violet-500',
              icon: '◆',
              perks: ['Boost poems to feeds', 'Write Critic Notes', 'Deep feedback analytics', 'Shape discovery'],
            },
          ].map(({ level, range, color, dot, icon, perks, featured }) => (
            <div
              key={level}
              className={`p-5 rounded-2xl border transition-all ${
                featured
                  ? 'border-ink-300 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-900/10 scale-[1.02]'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold ${dot}`} style={{ color, background: color + '15' }}>
                  {icon}
                </span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{level}</p>
                  <p className="text-xs font-mono" style={{ color }}>{range}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {perks.map(p => (
                  <li key={p} className="flex items-center gap-1.5 text-sm text-foreground-secondary">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-brand-50 dark:to-brand-950/20">
        <div className="max-w-xl mx-auto text-center">
          <blockquote className="font-serif text-2xl sm:text-3xl text-foreground italic leading-relaxed mb-8">
            "Poems don't become perfect.<br />They become true."
          </blockquote>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-brand-500/20 active:scale-95"
          >
            Join Inktella Free
            <ArrowRight size={20} />
          </Link>
          <p className="text-foreground-muted text-sm mt-3">No subscription. Earn your ink by giving first.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center">
        <p className="font-serif font-bold text-lg text-foreground mb-1">Inktella</p>
        <p className="text-foreground-muted text-sm">Words. Feedback. Growth.</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-foreground-muted">
          <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
          <Link to="/auth" className="hover:text-foreground transition-colors">Sign up</Link>
          <Link to="/critic-notes" className="hover:text-foreground transition-colors">Critic Notes</Link>
        </div>
      </footer>
    </div>
  );
}
