import { Sparkles } from 'lucide-react';

/** The day Inktella went live. */
export const LAUNCH_DATE = new Date('2026-07-22T00:00:00Z');

/** Whole days elapsed since launch (never negative). */
export function daysSinceLaunch(now: Date = new Date()): number {
  const MS_PER_DAY = 86_400_000;
  const diff = Math.floor((now.getTime() - LAUNCH_DATE.getTime()) / MS_PER_DAY);
  return Math.max(diff, 0);
}

function ageLabel(days: number): string {
  if (days === 0) return 'launched today';
  if (days === 1) return '1 day old';
  return `${days} days old`;
}

/**
 * Handwritten launch note for the desktop header.
 * Hidden on smaller viewports where header space is tight.
 */
export function LaunchNoteDesktop() {
  const days = daysSinceLaunch();

  return (
    <p
      className="hidden md:flex items-center gap-1.5 text-brand-500/90 leading-none whitespace-nowrap"
      style={{ fontFamily: "'Caveat', cursive" }}
      title={`Launched July 2026, just ${ageLabel(days)} — be one of the first poets or readers to shape Inktella`}
    >
      <Sparkles size={16} className="shrink-0 text-brand-500" aria-hidden="true" />
      {/* Full note on wide screens, trimmed on mid-size desktops */}
      <span className="hidden xl:inline text-[17px]">
        Launched July 2026, just {ageLabel(days)} &mdash; be one of the first poets or readers to shape
        Inktella
      </span>
      <span className="xl:hidden text-[17px]">
        Launched July 2026 &middot; {ageLabel(days)}
      </span>
    </p>
  );
}

/**
 * Compact, low-key version for the mobile hero.
 */
export function LaunchNoteMobile() {
  const days = daysSinceLaunch();

  return (
    <p
      className="text-brand-500/80 text-base leading-none mb-2"
      style={{ fontFamily: "'Caveat', cursive" }}
    >
      Launched July 2026 &middot; {ageLabel(days)} &mdash; help shape it
    </p>
  );
}
