// Collection of decorative dividers for poems
const DIVIDER_MAP: Record<string, string> = {
  'ornament1': '✦ ✦ ✦',
  'ornament2': '⬥ ◆ ⬥',
  'ornament3': '❋ ❋ ❋',
  'ornament4': '✧ ✦ ✧',
  'ornament5': '◆ ◇ ◆',
  'ornament6': '✪ ✦ ✪',
  'ornament7': '❈ ❈ ❈',
  'ornament8': '◆ ◊ ◆',
  'line1': '___',
  'line2': '- - -',
  'line3': '• • •',
};

export const DECORATIVE_DIVIDERS = Object.entries(DIVIDER_MAP).map(([id]) => ({ id }));

export function getRandomDivider() {
  return DECORATIVE_DIVIDERS[Math.floor(Math.random() * DECORATIVE_DIVIDERS.length)];
}

export function getDividerById(id?: string) {
  if (!id) return getRandomDivider();
  return DECORATIVE_DIVIDERS.find(d => d.id === id) || getRandomDivider();
}

export function getDividerText(id?: string): string {
  if (!id) id = getRandomDivider().id;
  return DIVIDER_MAP[id] || DIVIDER_MAP['ornament1'];
}

export function DecorativeDivider({ dividerId }: { dividerId?: string }) {
  const text = getDividerText(dividerId);
  return (
    <div className="flex justify-center py-6">
      <p className="text-foreground-muted text-lg tracking-widest">{text}</p>
    </div>
  );
}
