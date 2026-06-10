import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { CriticNote } from '@/types';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import CriticNoteCard from '@/components/features/CriticNoteCard';
import { toast } from 'sonner';

// Mock notes for demonstration
const MOCK_NOTES: CriticNote[] = [
  {
    id: 'mock-note-1',
    user_id: 'mock',
    title: 'On the Use of Silence in Contemporary Poetry',
    content: `There is a particular kind of courage in the line break. It asks the reader to pause—not because the grammar demands it, but because the poet has decided that this moment, this small white space, matters.

Contemporary poets have learned something our predecessors struggled to trust: that what we don't say is as powerful as what we do. The lacuna between stanzas can hold a world. The period at the end of a line that could have continued—that is a choice. And choices, in poetry, are everything.

I've been reading the emerging voices on this platform and noticing something hopeful: a generation of poets who are comfortable with restraint. Who don't feel the need to explain their metaphors, who trust that the image will land without footnotes.

This trust in the reader—this is what separates poetry from prose. And it is, I would argue, the single most important skill a poet can develop.`,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    author: {
      id: 'mock',
      username: 'wordwanderer',
      email: '',
      tella_balance: 1200,
      ink_balance: 210,
      level: 'critic',
    },
    like_count: 47,
    is_liked: false,
  },
  {
    id: 'mock-note-2',
    user_id: 'mock2',
    title: 'Why "showing" is overrated (and when telling is right)',
    content: `We've all heard the rule: show, don't tell. It gets repeated in workshops, in creative writing books, in the margins of manuscripts. But poetry—good poetry—breaks this rule constantly, and for good reason.

Lyric poetry is often about the direct transmission of feeling. When Sylvia Plath writes "Dying is an art, like everything else. I do it exceptionally well," she is telling you. And it hits harder than any image could.

The confusion comes from conflating narrative prose advice with poetic practice. In fiction, showing creates immersion. In poetry, telling can be the most honest act available.

What I've been looking for in feedback sessions recently: does the choice between showing and telling feel intentional? Or does it feel like habit?`,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    author: {
      id: 'mock2',
      username: 'ink.critic',
      email: '',
      tella_balance: 1540,
      ink_balance: 320,
      level: 'critic',
    },
    like_count: 31,
    is_liked: true,
  },
];

export default function CriticNotesPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedNoteId = searchParams.get('note');

  const [notes, setNotes] = useState<CriticNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'latest' | 'liked'>('latest');
  const [selectedNote, setSelectedNote] = useState<CriticNote | null>(null);
  const [writing, setWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const level = profile ? getLevel(profile.tella_balance) : 'observer';
  const isCritic = level === 'critic';

  useEffect(() => {
    fetchNotes();
  }, [activeTab]);

  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) setSelectedNote(note);
    }
  }, [selectedNoteId, notes]);

  async function fetchNotes() {
    setLoading(true);
    const { data } = await supabase
      .from('critic_notes')
      .select('*, author:user_profiles!critic_notes_user_id_fkey(id, username, avatar_url, tella_balance)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!data || data.length === 0) {
      setNotes(MOCK_NOTES);
    } else {
      const withCounts = await Promise.all(data.map(async (note) => {
        const { count } = await supabase.from('critic_note_likes').select('*', { count: 'exact', head: true }).eq('note_id', note.id);
        let isLiked = false;
        if (user) {
          const { data: ld } = await supabase.from('critic_note_likes').select('note_id').match({ note_id: note.id, user_id: user.id }).single();
          isLiked = !!ld;
        }
        return { ...note, like_count: count || 0, is_liked: isLiked };
      }));
      setNotes(withCounts);
    }
    setLoading(false);
  }

  async function handlePublishNote() {
    if (!user) { navigate('/auth'); return; }
    if (!isCritic) { toast.error('Only Critics can publish Critic Notes'); return; }
    if (!newTitle.trim()) { toast.error('Note needs a title'); return; }
    if (!newContent.trim() || newContent.trim().length < 100) { toast.error('Write at least 100 characters'); return; }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('critic_notes')
      .insert({ user_id: user.id, title: newTitle.trim(), content: newContent.trim() })
      .select('*, author:user_profiles!critic_notes_user_id_fkey(id, username, avatar_url, tella_balance)')
      .single();

    if (error) { toast.error('Failed to publish note'); setSubmitting(false); return; }

    setNotes(prev => [{ ...data, like_count: 0, is_liked: false }, ...prev]);
    setWriting(false);
    setNewTitle('');
    setNewContent('');
    toast.success('Critic Note published');
    setSubmitting(false);
  }

  async function handleLike(note: CriticNote) {
    if (!user) { navigate('/auth'); return; }
    const wasLiked = note.is_liked;
    setNotes(prev => prev.map(n =>
      n.id === note.id ? { ...n, is_liked: !wasLiked, like_count: (n.like_count || 0) + (wasLiked ? -1 : 1) } : n
    ));
    if (wasLiked) {
      await supabase.from('critic_note_likes').delete().match({ note_id: note.id, user_id: user.id });
    } else {
      await supabase.from('critic_note_likes').insert({ note_id: note.id, user_id: user.id });
    }
  }

  const displayedNotes = activeTab === 'liked'
    ? [...notes].sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    : notes;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Full note view */}
      {selectedNote ? (
        <div>
          <button
            onClick={() => setSelectedNote(null)}
            className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Notes
          </button>

          {/* Author */}
          {selectedNote.author && (() => {
            const aLevel = getLevel(selectedNote.author.tella_balance || 0);
            const aCfg = LEVEL_CONFIG[aLevel];
            return (
              <div className="flex items-center gap-2.5 mb-5">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden', aCfg.borderClass)} style={{ background: aCfg.color + '15', color: aCfg.color }}>
                  {selectedNote.author.avatar_url ? <img src={selectedNote.author.avatar_url} className="w-full h-full object-cover" /> : getInitials(selectedNote.author.username)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">@{selectedNote.author.username}</p>
                  <span className={cn('text-xs', aCfg.textClass)}>{aCfg.badgeText}</span>
                </div>
                <span className="text-xs text-foreground-muted ml-auto">{formatTimeAgo(selectedNote.created_at)}</span>
              </div>
            );
          })()}

          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground mb-6 leading-snug">{selectedNote.title}</h1>

          <div className="text-foreground-secondary leading-[1.85] text-base whitespace-pre-line">{selectedNote.content}</div>
        </div>
      ) : writing && isCritic ? (
        /* Writing mode */
        <div>
          <button onClick={() => setWriting(false)} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground mb-6">
            <ArrowLeft size={14} /> Cancel
          </button>
          <h2 className="font-serif font-bold text-2xl text-foreground mb-5">Write a Critic Note</h2>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Note title"
            className="w-full text-xl font-serif font-semibold bg-transparent outline-none text-foreground placeholder:text-foreground-muted border-b border-border pb-3 mb-4 focus:border-brand-400 transition-colors"
          />
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Write your critical perspective here. Think long-form. Think articles. Your voice shapes the platform."
            className="w-full min-h-[400px] bg-transparent outline-none text-foreground placeholder:text-foreground-muted text-base leading-[1.85] resize-none"
          />
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
            <button
              onClick={handlePublishNote}
              disabled={submitting || !newTitle.trim() || newContent.length < 100}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              {submitting ? 'Publishing...' : 'Publish Note'}
            </button>
            <span className="text-xs text-foreground-muted">{newContent.length} chars (min 100)</span>
          </div>
        </div>
      ) : (
        /* Notes list */
        <>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-serif font-bold text-2xl text-foreground">Critic Notes</h1>
              <p className="text-sm text-foreground-muted mt-0.5">Long-form literary perspectives by Critics.</p>
            </div>
            {isCritic && (
              <button
                onClick={() => setWriting(true)}
                className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                <Plus size={14} /> Write Note
              </button>
            )}
          </div>

          {!isCritic && user && (
            <div className="bg-tella-50 dark:bg-tella-900/20 border border-tella-200 dark:border-tella-800 rounded-xl p-3 mb-5 text-sm text-tella-700 dark:text-tella-400">
              <span className="font-semibold">Critic Notes</span> are written by Critics (1000+ Tella). Keep giving feedback to earn your Critic status.
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border mb-4">
            {(['latest', 'liked'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn('px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition-all', activeTab === tab ? 'text-brand-500 border-brand-500' : 'text-foreground-muted border-transparent hover:text-foreground')}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="border-b border-border pb-6">
                  <div className="flex gap-2.5 mb-3">
                    <div className="skeleton w-9 h-9 rounded-full" />
                    <div className="space-y-1.5">
                      <div className="skeleton h-3.5 w-28 rounded" />
                      <div className="skeleton h-3 w-16 rounded" />
                    </div>
                  </div>
                  <div className="skeleton h-6 w-64 rounded mb-2" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedNotes.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif italic text-foreground-muted">No Critic Notes yet.</p>
              {!isCritic && <p className="text-xs text-foreground-muted mt-1">Reach 1000 Tella to write one.</p>}
            </div>
          ) : (
            displayedNotes.map(note => (
              <CriticNoteCard
                key={note.id}
                note={note}
                onLike={handleLike}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}
