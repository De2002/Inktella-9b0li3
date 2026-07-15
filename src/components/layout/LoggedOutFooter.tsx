import { Link } from 'react-router-dom';

export default function LoggedOutFooter() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 pb-safe">
      <div className="grid grid-cols-2 gap-4 px-4 py-3">
        {/* First column: About, Terms of Use */}
        <div className="flex flex-col gap-2">
          <Link
            to="/about"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            to="/terms"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Terms of Use
          </Link>
        </div>

        {/* Second column: Blog, Privacy */}
        <div className="flex flex-col gap-2">
          <Link
            to="/blog"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Read our Blog
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </nav>
  );
}
