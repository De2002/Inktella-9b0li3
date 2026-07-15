import { Link } from 'react-router-dom';

export default function LoggedOutFooter() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-sm border-t border-border/50 z-40 pb-safe">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {/* First column: About, Terms of Use */}
          <div className="flex flex-col gap-3">
            <Link
              to="/about"
              className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/terms"
              className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
            >
              Terms of Use
            </Link>
          </div>

          {/* Second column: Blog, Privacy */}
          <div className="flex flex-col gap-3">
            <Link
              to="/blog"
              className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
            >
              Read our Blog
            </Link>
            <Link
              to="/privacy"
              className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        
        {/* Copyright text */}
        <div className="border-t border-border/30 mt-4 pt-3">
          <p className="text-xs text-foreground/50">© 2024 Inktella. All rights reserved.</p>
        </div>
      </div>
    </nav>
  );
}
