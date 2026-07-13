// Collection of decorative dividers for poems
export const DECORATIVE_DIVIDERS = [
  { id: 'ornament1', render: () => '✦ ✦ ✦' },
  { id: 'ornament2', render: () => '⬥ ◆ ⬥' },
  { id: 'ornament3', render: () => '❋ ❋ ❋' },
  { id: 'ornament4', render: () => '✧ ✦ ✧' },
  { id: 'ornament5', render: () => '◆ ◇ ◆' },
  { id: 'ornament6', render: () => '✪ ✦ ✪' },
  { id: 'ornament7', render: () => '❈ ❈ ❈' },
  { id: 'ornament8', render: () => '◆ ◊ ◆' },
  { id: 'line1', render: () => '___' },
  { id: 'line2', render: () => '- - -' },
  { id: 'line3', render: () => '• • •' },
];

export function getRandomDivider() {
  return DECORATIVE_DIVIDERS[Math.floor(Math.random() * DECORATIVE_DIVIDERS.length)];
}

export function getDividerById(id?: string) {
  if (!id) return getRandomDivider();
  return DECORATIVE_DIVIDERS.find(d => d.id === id) || getRandomDivider();
}

export function DecorativeDivider({ dividerId }: { dividerId?: string }) {
  const divider = getDividerById(dividerId);
  return (
    <div className="flex justify-center py-6">
      <p className="text-foreground-muted text-lg tracking-widest">{divider.render()}</p>
    </div>
  );
}
