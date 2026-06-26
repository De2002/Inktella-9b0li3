interface VerticalSectionLabelProps {
  label: string;
  isDotted?: boolean;
  className?: string;
}

/**
 * Renders a vertical text label with decorative green line and dots.
 * Used on poem detail pages to label sections like "Title" and "Poet".
 */
export default function VerticalSectionLabel({
  label,
  isDotted = false,
  className = '',
}: VerticalSectionLabelProps) {
  return (
    <div className={`flex flex-col items-center h-full ${className}`}>
      {/* Top decorative line */}
      <div
        className={`w-1 flex-1 ${isDotted ? 'border-l-2 border-dashed border-green-400' : ''}`}
        style={isDotted ? {} : { background: 'linear-gradient(to bottom, rgb(74, 222, 128), rgb(74, 222, 128))' }}
      />

      {/* Vertical text label */}
      <div className="py-2 px-1 flex items-center justify-center">
        <div
          className="text-xs font-bold text-green-400 tracking-widest"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>

      {/* Decorative dots on the line */}
      <div className="flex flex-col gap-2 py-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      </div>

      {/* Bottom decorative line */}
      <div
        className={`w-1 flex-1 ${isDotted ? 'border-l-2 border-dashed border-green-400' : ''}`}
        style={isDotted ? {} : { background: 'linear-gradient(to bottom, rgb(74, 222, 128), rgb(74, 222, 128))' }}
      />
    </div>
  );
}
