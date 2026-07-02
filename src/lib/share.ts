import { toast } from 'sonner';

interface ShareOptions {
  title?: string;
  text?: string;
  url: string;
}

/**
 * Share content using the native Web Share API if available,
 * otherwise falls back to copying the URL to clipboard
 */
export async function shareContent(options: ShareOptions): Promise<void> {
  const { title = '', text = '', url } = options;

  // Check if the Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
    } catch (error) {
      // User cancelled the share dialog - that's okay
      if ((error as any).name !== 'AbortError') {
        console.error('[v0] Share failed:', error);
        toast.error('Failed to share');
      }
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  }
}
