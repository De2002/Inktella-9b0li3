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
      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Image */}
        <div className="relative">
          {sponsored && (
            <div className="absolute top-4 left-4 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-semibold z-10">
              Sponsored
            </div>
          )}
          <img src={image} alt={title} className="w-full h-full object-cover rounded-lg" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-foreground-secondary text-sm mb-3">by {author}</p>
            <p className="text-foreground-secondary leading-relaxed mb-4">{excerpt}</p>
            <p className="text-foreground-secondary text-sm leading-relaxed">{fullText}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-4 text-foreground-secondary text-sm">
              <div className="flex items-center gap-1">
                <Heart size={16} />
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span>{comments}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark size={16} />
                <span>{bookmarks}</span>
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white">Read Poem</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
