import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedPoemSectionProps {
  title: string;
  author: string;
  excerpt: string;
  fullText: string;
  image: string;
  sponsored?: boolean;
  likes: number;
  comments: number;
  bookmarks: number;
}

export default function FeaturedPoemSection({
  title,
  author,
  excerpt,
  fullText,
  image,
  sponsored = false,
  likes,
  comments,
  bookmarks,
}: FeaturedPoemSectionProps) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-6">
        {/* Sponsored Badge */}
        {sponsored && (
          <div className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            Sponsored
          </div>
        )}

        {/* Title and Author */}
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-sm text-foreground-secondary">by {author}</p>
        </div>

        {/* Poem Content */}
        <div className="text-foreground-secondary leading-relaxed text-base mb-4">
          <p>{excerpt}</p>
          <p className="mt-3 text-sm">{fullText}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4" />

        {/* Engagement Metrics & Read Button */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 text-foreground-secondary text-sm">
            <div className="flex items-center gap-2">
              <Heart size={16} />
              <span>{likes}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <span>{comments}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark size={16} />
              <span>{bookmarks}</span>
            </div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white">
            Read Poem
          </Button>
        </div>
      </div>
    </div>
  );
}
