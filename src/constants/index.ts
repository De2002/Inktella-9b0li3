import type { UserLevel } from '@/types';

// Badge image imports
export const LEVEL_BADGE_IMAGES: Record<string, string> = {
  observer: '/src/assets/observer-badge.png',
  guide: '/src/assets/guide-badge.png',
  critic: '/src/assets/critic-badge.png',
};

export const INK_PUBLISH_COST = 10;
export const INK_SIGNUP_BONUS = 100;
export const INK_PER_FEEDBACK = 2;
export const TELLA_PER_FEEDBACK = 3;
export const TELLA_PER_CREDIT = 2;
export const INK_PER_LIKE_RECEIVED = 1;

export const LEVEL_THRESHOLDS = {
  observer: { min: 0, max: 199 },
  guide: { min: 200, max: 999 },
  critic: { min: 1000, max: Infinity },
};

export function getLevel(tella: number): UserLevel {
  if (tella >= 1000) return 'critic';
  if (tella >= 200) return 'guide';
  return 'observer';
}

export const LEVEL_CONFIG = {
  observer: {
    label: 'Observer',
    color: '#64748B',
    borderClass: 'border-observer',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-600 dark:text-slate-400',
    badgeText: '⬡ Observer',
    description: 'Building trust through participation.',
    maxFeedbackChars: 300,
  },
  guide: {
    label: 'Guide',
    color: '#F59E0B',
    borderClass: 'border-guide',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    textClass: 'text-amber-700 dark:text-amber-400',
    badgeText: '✦ Guide',
    description: 'A trusted voice in the community.',
    maxFeedbackChars: 800,
  },
  critic: {
    label: 'Critic',
    color: '#A855F7',
    borderClass: 'border-critic',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    textClass: 'text-purple-700 dark:text-purple-400',
    badgeText: '◆ Critic',
    description: 'Your voice shapes the platform.',
    maxFeedbackChars: 2000,
  },
};

export const GUIDE_FEEDBACK_TEMPLATES = [
  { prompt: 'What line stood out most?', placeholder: 'The line that stayed with me was...' },
  { prompt: 'Where did pacing weaken?', placeholder: 'The rhythm felt uneven around...' },
  { prompt: 'What emotion stayed with you?', placeholder: 'After reading, I felt...' },
  { prompt: 'What image felt most vivid?', placeholder: 'The imagery of... worked because...' },
  { prompt: 'What could be cut?', placeholder: 'I think the poem would be stronger without...' },
  { prompt: 'Where did the language feel fresh?', placeholder: 'The most original phrase was...' },
];

export const FEED_TABS = [
  { id: 'picks', label: 'Picks', icon: 'Star', description: 'Curated poems chosen for quality and impact.' },
  { id: 'latest', label: 'Latest', icon: 'Clock', description: 'Recently published poems.' },
  { id: 'discussed', label: 'Discussed', icon: 'MessageSquare', description: 'Most feedback and conversations.' },
  { id: 'hearted', label: 'Hearted', icon: 'Heart', description: 'Most loved by the community.' },
] as const;

export const INKTELLA_QUOTES = [
  { text: "Poems don't become perfect. They become true.", attribution: "Inktella" },
  { text: "Feedback is the compass. The poem is the journey.", attribution: "Inktella" },
  { text: "Your ink is someone else's light.", attribution: "Inktella" },
  { text: "Growth lives in the gap between drafts.", attribution: "Inktella" },
  { text: "The sharpest critiques come from the deepest care.", attribution: "Inktella" },
];
