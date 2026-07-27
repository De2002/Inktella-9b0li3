export default function MobileGuestNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 h-16 pb-safe">
      <div className="flex items-center justify-around h-full px-2">
        {/* About */}
        <a
          href="https://www.inktella.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[44px] min-h-[44px] justify-center transition-colors text-foreground-muted hover:text-brand-500"
        >
          <span className="text-[12px] font-semibold">ABOUT</span>
        </a>

        {/* Terms */}
        <a
          href="https://www.inktella.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[44px] min-h-[44px] justify-center transition-colors text-foreground-muted hover:text-brand-500"
        >
          <span className="text-[12px] font-semibold">TERMS</span>
        </a>

        {/* Privacy */}
        <a
          href="https://www.inktella.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[44px] min-h-[44px] justify-center transition-colors text-foreground-muted hover:text-brand-500"
        >
          <span className="text-[12px] font-semibold">PRIVACY</span>
        </a>
      </div>
    </nav>
  );
}
