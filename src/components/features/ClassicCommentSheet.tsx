import { useState, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Poem } from '@/types';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
    tella_balance: number;
  };
}

interface ClassicCommentSheetProps {
  poem: Poem;
  onClose: () => void;
}

export default function ClassicCommentSheet({ poem, onClose }: ClassicCommentSheetProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [poem.id]);

  async function fetchComments() {
    setLoading(true);
    const { data } = await supabase
      .from('feedback')
      .select(`
        id, content, created_at,
        author:user_profiles!feedback_user_id_fkey(id, username, avatar_url, tella_balance)
      `)
      .eq('poem_id', poem.id)
      .order('created_at', { ascending: true });

    setComments(
      (data || []).map((c: any) => ({
        ...c,
        author: Array.isArray(c.author) ? c.author[0] : c.author,
      }))
    );
    setLoading(false);
  }

  async function handleSubmit() {
    if (!user) { navigate('/auth'); return; }
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from('feedback')
      .insert({ poem_id: poem.id, user_id: user.id, content: trimmed, is_highlighted: false })
      .select(`id, content, created_at, author:user_profiles!feedback_user_id_fkey(id, username, avatar_url, tella_balance)`)
      .single();

    if (error) {
      toast.error('Could not post comment');
      setSubmitting(false);
      return;
    }

    const newComment = {
      ...data,
      author: Array.isArray(data.author) ? data.author[0] : data.author,
    } as Comment;

    setComments(prev => [...prev, newComment]);
    setText('');
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-surface border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl z-10">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Comments</p>
            <p className="text-xs text-foreground-muted font-serif italic">"{poem.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Comments list */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={22} className="animate-spin text-foreground-muted" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-serif italic text-foreground-muted text-sm">No comments yet.</p>
              <p className="text-xs text-foreground-muted mt-1">Be the first to say something.</p>
            </div>
          ) : (
            comments.map(comment => {
              const level = getLevel(comment.author?.tella_balance || 0);
              const cfg = LEVEL_CONFIG[level];
              return (
                <div key={comment.id} className="flex gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden',
                      cfg.borderClass
                    )}
                    style={{ background: cfg.color + '18', color: cfg.color }}
                  >
                    {comment.author?.avatar_url ? (
                      <img src={comment.author.avatar_url} alt={comment.author.username} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(comment.author?.username || '?')
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground">{comment.author?.username || 'Poet'}</span>
                      <span className="text-[10px] text-foreground-muted">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground-secondary leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Compose area */}
        <div className="px-4 py-3 border-t border-border shrink-0 bg-background">
          {user ? (
            <div className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Leave a comment…"
                rows={2}
                className="flex-1 resize-none text-sm bg-background-subtle border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-brand-400 transition-colors leading-relaxed"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-40 shrink-0 mb-0.5"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="w-full text-center text-sm text-brand-500 hover:text-brand-600 font-medium py-2"
            >
              Sign in to comment
            </button>
          )}
          <p className="text-[10px] text-foreground-muted text-center mt-2">⌘ + Enter to send</p>
        </div>
      </div>
    </div>
  );
}
