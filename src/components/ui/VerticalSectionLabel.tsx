interface VerticalSectionLabelProps {
  label: string;
  isDotted?: boolean;
  className?: string;
  isCompact?: boolean;
}

/**
 * Renders a vertical text label with decorative green line and dots.
 * Used on poem detail pages to label sections like "Title" and "Poet".
 * Supports responsive sizing with compact mode for mobile.
 */
export default function VerticalSectionLabel({
  label,
  isDotted = false,
  className = '',
  isCompact = false,
}: VerticalSectionLabelProps) {
  return (
    <div className={`flex flex-col items-center h-full ${className}`}>
      {/* Top decorative line */}
      <div
        className={`${isCompact ? 'w-0.5' : 'w-1'} flex-1 ${isDotted ? 'border-l-2 border-dashed border-green-400' : ''}`}
        style={isDotted ? {} : { background: 'linear-gradient(to bottom, rgb(74, 222, 128), rgb(74, 222, 128))' }}
      />

      {/* Vertical text label */}
      <div className={`${isCompact ? 'py-1 px-0.5' : 'py-2 px-1'} flex items-center justify-center`}>
        <div
          className={`font-bold text-green-400 tracking-widest ${isCompact ? 'text-[10px]' : 'text-xs'}`}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>

      {/* Decorative dots on the line */}
      <div className={`flex flex-col ${isCompact ? 'gap-1.5 py-0.5' : 'gap-2 py-1'}`}>
        <div className={`rounded-full bg-green-400 ${isCompact ? 'w-1 h-1' : 'w-1.5 h-1.5'}`} />
        <div className={`rounded-full bg-green-400 ${isCompact ? 'w-1 h-1' : 'w-1.5 h-1.5'}`} />
      </div>

      {/* Bottom decorative line */}
      <div
        className={`${isCompact ? 'w-0.5' : 'w-1'} flex-1 ${isDotted ? 'border-l-2 border-dashed border-green-400' : ''}`}
        style={isDotted ? {} : { background: 'linear-gradient(to bottom, rgb(74, 222, 128), rgb(74, 222, 128))' }}
      />
    </div>
  );
}
