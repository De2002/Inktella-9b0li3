

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

import { useState, useEffect } from 'react';

/**
 * Handwritten launch note for the desktop header.
 * Hidden on smaller viewports where header space is tight.
 */
export function LaunchNoteDesktop() {
  const [days, setDays] = useState(daysSinceLaunch());

  useEffect(() => {
    setDays(daysSinceLaunch());
    
    // Calculate time until midnight to update the counter
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      setDays(daysSinceLaunch());
      // After first update, set interval for daily updates
      const dailyInterval = setInterval(() => setDays(daysSinceLaunch()), 86_400_000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <p
      className="hidden md:flex text-brand-500/90 leading-none whitespace-nowrap text-[17px]"
      style={{ fontFamily: "'Caveat', cursive" }}
      title={`Launched July 2026, just ${ageLabel(days)} — be one of the first poets or readers to shape Inktella`}
    >
      {/* Full note on wide screens, trimmed on mid-size desktops */}
      <span className="hidden xl:inline">
        Launched July 2026, just {ageLabel(days)} &mdash; be one of the first poets or readers to shape
        Inktella
      </span>
      <span className="xl:hidden">
        Launched July 2026 &middot; {ageLabel(days)}
      </span>
    </p>
  );
}

/**
 * Compact, low-key version for the mobile hero.
 */
export function LaunchNoteMobile() {
  const [days, setDays] = useState(daysSinceLaunch());

  useEffect(() => {
    setDays(daysSinceLaunch());
    
    // Calculate time until midnight to update the counter
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      setDays(daysSinceLaunch());
      // After first update, set interval for daily updates
      const dailyInterval = setInterval(() => setDays(daysSinceLaunch()), 86_400_000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <p
      className="text-brand-500/80 text-base leading-none mb-2"
      style={{ fontFamily: "'Caveat', cursive" }}
    >
      Launched July 2026 &middot; {ageLabel(days)} &mdash; help shape it
    </p>
  );
}
