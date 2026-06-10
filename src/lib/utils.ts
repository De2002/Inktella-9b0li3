import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { UserLevel } from '@/types';
import { getLevel, LEVEL_CONFIG } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function truncatePoem(content: string, lines: number = 5): { text: string; truncated: boolean } {
  const allLines = content.split('\n').filter(l => l.trim() !== '' || true);
  const visibleLines = allLines.slice(0, lines);
  return {
    text: visibleLines.join('\n'),
    truncated: allLines.length > lines,
  };
}

export function getLevelConfig(tella: number) {
  const level = getLevel(tella);
  return { level, ...LEVEL_CONFIG[level] };
}

export function getLevelFromTella(tella: number): UserLevel {
  return getLevel(tella);
}

export function getInitials(name: string): string {
  return name
    .split(/[\s._-]/)
    .map(p => p[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function tellaToNextLevel(tella: number): { current: UserLevel; next: UserLevel | null; progress: number; needed: number } {
  if (tella >= 1000) return { current: 'critic', next: null, progress: 100, needed: 0 };
  if (tella >= 200) {
    const progress = Math.min(100, ((tella - 200) / 800) * 100);
    return { current: 'guide', next: 'critic', progress, needed: 1000 - tella };
  }
  const progress = Math.min(100, (tella / 200) * 100);
  return { current: 'observer', next: 'guide', progress, needed: 200 - tella };
}
