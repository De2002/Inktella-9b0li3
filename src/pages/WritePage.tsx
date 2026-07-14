import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Feather, X, ChevronDown, Plus, PenLine, Check, Users, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Topic } from '@/types';
import { INK_PUBLISH_COST, getLevel, LEVEL_CONFIG, TELLA_PER_CREDIT } from '@/constants';
import { cn, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { getRandomDivider } from '@/components/features/DecorativeDividers';

const POEM_DRAFT_KEY = (id: string) => `inktella_poem_draft_${id}`;
const NEW_POEM_KEY = 'inktella_new_poem_draft';

interface CreditCandidate {
  id: string;
  username: string;
  avatar_url?: string;
  tella_balance: number;
}

export default function WritePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTopic = searchParams.get('topic');
  const editPoemId = searchParams.get('edit');
  const isEditMode = !!editPoemId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [topicId, setTopicId] = useState(preselectedTopic || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [changesSummaryInput, setChangesSummaryInput] = useState('');
  const [changesList, setChangesList] = useState<string[]>([]);

  // Behind the Poem state
  const [behindThePoemData, setBehindThePoemData] = useState({
    spark: '',
    obsession: '',
    graveyard: [] as Array<{ type: 'line' | 'word' | 'phrase' | 'stanza'; content: string; eulogy?: string }>,
    memoryImage: '',
    vibeDate: new Date().toISOString().split('T')[0],
  });
  const [originalPoemData, setOriginalPoemData] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPoem, setLoadingPoem] = useState(isEditMode);
  const [autoSaved, setAutoSaved] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus state for distraction-free feel
  const [editorFocused, setEditorFocused] = useState(false);

  // Credit step state
  const [publishedPoemId, setPublishedPoemId] = useState<string | null>(null);
  const [creditCandidates, setCreditCandidates] = useState<CreditCandidate[]>([]);
  const [selectedCredits, setSelectedCredits] = useState<Set<string>>(new Set());
  const [creditSearch, setCreditSearch] = useState('');
  const [savingCredits, setSavingCredits] = useState(false);

  const draftKey = isEditMode && editPoemId ? POEM_DRAFT_KEY(editPoemId) : NEW_POEM_KEY;

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchTopics();
    if (isEditMode && editPoemId) {
      loadPoemForEdit(editPoemId);
    } else {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTitle(parsed.title || '');
          setContent(parsed.content || '');
          setImageUrl(parsed.imageUrl || '');
          if (parsed.topicId) setTopicId(parsed.topicId);
          setTags(parsed.tags || []);
          setBehindThePoemData(parsed.behindThePoemData || {
            spark: '', obsession: '', graveyard: [], memoryImage: '',
            vibeDate: new Date().toISOString().split('T')[0],
          });
          setAutoSaved(true);
        } catch { /* ignore */ }
      }
    }
  }, [user]);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const data = { title, content, imageUrl, topicId, tags, behindThePoemData, savedAt: new Date().toISOString() };
      localStorage.setItem(draftKey, JSON.stringify(data));
      setAutoSaved(true);
      setAutoSaving(false);
    }, 1500);
    setAutoSaving(true);
  }, [title, content, imageUrl, topicId, tags, behindThePoemData, draftKey]);

  useEffect(() => {
    if (!user || loadingPoem) return;
    if (title || content) triggerAutoSave();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, content, imageUrl, topicId, tags, behindThePoemData]);

  async function loadPoemForEdit(poemId: string) {
    setLoadingPoem(true);
    const saved = localStorage.getItem(POEM_DRAFT_KEY(poemId));
    let localDraft: any = null;
    if (saved) { try { localDraft = JSON.parse(saved); } catch { /* ignore */ } }

    const { data } = await supabase
      .from('poems')
      .select('*, poem_tags(tag:tags(id, name))')
      .eq('id', poemId)
      .single();

    if (!data) { toast.error('Poem not found'); navigate(-1); return; }
    if (data.user_id !== user?.id) { toast.error('You can only edit your own poems'); navigate(-1); return; }

    setTitle(localDraft?.title || data.title || '');
    setContent(localDraft?.content || data.content || '');
    setImageUrl(localDraft?.imageUrl || data.image_url || '');
    setTopicId(localDraft?.topicId || data.topic_id || '');
    setTags(localDraft?.tags || data.poem_tags?.map((pt: any) => pt.tag?.name).filter(Boolean) || []);
    setBehindThePoemData(localDraft?.behindThePoemData || data.behind_the_poem || {
      spark: '', obsession: '', graveyard: [], memoryImage: '',
      vibeDate: new Date().toISOString().split('T')[0],
    });
    setOriginalPoemData(data);
    if (localDraft) setAutoSaved(true);
    setLoadingPoem(false);
  }

  async function fetchTopics() {
    const { data } = await supabase.from('topics').select('id, name, slug, color').order('name');
    if (data) setTopics(data as Topic[]);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) setTags(prev => [...prev, t]);
    setTagInput('');
  }
  function removeTag(tag: string) { setTags(prev => prev.filter(t => t !== tag)); }
  function addChange() {
    const trimmed = changesSummaryInput.trim();
    if (trimmed && !changesList.includes(trimmed) && changesList.length < 8) setChangesList(prev => [...prev, trimmed]);
    setChangesSummaryInput('');
  }
  function removeChange(item: string) { setChangesList(prev => prev.filter(c => c !== item)); }
  function toggleCredit(id: string) {
    setSelectedCredits(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  async function handleSaveCredits(skip = false) {
    if (!publishedPoemId) return;
    if (!skip && selectedCredits.size > 0) {
      setSavingCredits(true);
      const inserts = [...selectedCredits].map(uid => ({ poem_id: publishedPoemId, credited_user_id: uid }));
      await supabase.from('feedback_credits').upsert(inserts, { onConflict: 'poem_id,credited_user_id' });
      await Promise.all([...selectedCredits].map(async uid => {
        const { data: creditedProfile } = await supabase.from('user_profiles').select('tella_balance').eq('id', uid).single();
    if (creditedProfile) {
    await Promise.all([
    supabase.from('tella_transactions').insert({ user_id: uid, amount: TELLA_PER_CREDIT, reason: 'Credited for feedback contribution', related_id: publishedPoemId }),
    supabase.from('user_profiles').update({ tella_balance: creditedProfile.tella_balance + TELLA_PER_CREDIT }).eq('id', uid),
            supabase.from('notifications').insert({ user_id: uid, type: 'feedback_credited', content: `@${profile?.username} credited your feedback contribution (+2 Tella)`, related_id: publishedPoemId, actor_id: user!.id }),
          ]);
        }
      }));
      setSavingCredits(false);
    }
    localStorage.removeItem(isEditMode && editPoemId ? POEM_DRAFT_KEY(editPoemId) : NEW_POEM_KEY);
    navigate(`/poem/${publishedPoemId}`);
  }

  const behindPayload = () => ({
    spark: behindThePoemData.spark || '',
    obsession: behindThePoemData.obsession || '',
    graveyard: behindThePoemData.graveyard || [],
    memoryImage: behindThePoemData.memoryImage || '',
    vibeDate: behindThePoemData.vibeDate || '',
  });

  async function handleRevise() {
    if (!user || !profile || !editPoemId || !originalPoemData) return;
    if (!title.trim()) { toast.error('Your poem needs a title'); return; }
    if (!content.trim() || content.trim().length < 10) { toast.error('Write at least a few lines'); return; }
    setSubmitting(true);

    const { error: updateError } = await supabase.from('poems').update({
      title: title.trim(), content: content.trim(), image_url: imageUrl.trim() || null,
      topic_id: topicId || null,
      updated_at: new Date().toISOString(), behind_the_poem: behindPayload(),
    }).eq('id', editPoemId);

    if (updateError) { toast.error('Failed to save revision'); setSubmitting(false); return; }

    // Keep only one draft per unpublished poem (upsert: delete old and insert new)
    if (!originalPoemData.published) {
      await supabase.from('poem_drafts').delete().eq('poem_id', editPoemId);
      await supabase.from('poem_drafts').insert({ poem_id: editPoemId, content: content.trim(), draft_number: 1, changes_summary: changesList.length > 0 ? changesList : [] });
    }

    await supabase.from('poem_tags').delete().eq('poem_id', editPoemId);
    for (const tagName of tags) {
      const { data: existingTag } = await supabase.from('tags').select('id').eq('name', tagName).single();
      let tagId = existingTag?.id;
      if (!tagId) { const { data: newTag } = await supabase.from('tags').insert({ name: tagName }).select('id').single(); tagId = newTag?.id; }
      if (tagId) await supabase.from('poem_tags').insert({ poem_id: editPoemId, tag_id: tagId });
    }

    const { data: feedbackRows } = await supabase.from('feedback').select('user_id, author:user_profiles!feedback_user_id_fkey(id, username, avatar_url, tella_balance)').eq('poem_id', editPoemId).neq('user_id', user.id);
    if (feedbackRows && feedbackRows.length > 0) {
      const uniqueIds = [...new Set(feedbackRows.map((f: any) => f.user_id))];
      await supabase.from('notifications').insert(uniqueIds.map((uid: string) => ({
        user_id: uid, type: 'poem_revised', content: `@${profile.username} revised "${title.trim()}" — you gave feedback on this poem.`, read: false, related_id: editPoemId, actor_id: user.id,
      })));
      const seen = new Set<string>();
      const contributors: CreditCandidate[] = feedbackRows.map((f: any) => (Array.isArray(f.author) ? f.author[0] : f.author)).filter((a: any) => a?.id && !seen.has(a.id) && seen.add(a.id));
      setCreditCandidates(contributors);
    }

    localStorage.removeItem(POEM_DRAFT_KEY(editPoemId));
    toast.success('Revision published!', { description: `Draft ${nextDraftNumber} saved` });
    setSubmitting(false);
    setPublishedPoemId(editPoemId);
  }

  async function handlePublish() {
    if (!user || !profile) return;
    if (!title.trim()) { toast.error('Your poem needs a title'); return; }
    if (!content.trim() || content.trim().length < 10) { toast.error('Write at least a few lines'); return; }
    if (profile.ink_balance < INK_PUBLISH_COST) { toast.error(`You need ${INK_PUBLISH_COST} Ink to publish. Give feedback to earn more.`); return; }
    setSubmitting(true);

    try {
      // Step 1: Deduct ink from profile first
      const newInk = profile.ink_balance - INK_PUBLISH_COST;
      const { error: profileError } = await supabase.from('user_profiles').update({ ink_balance: newInk }).eq('id', user.id);
      
      if (profileError) {
        console.error('[v0] Profile update error:', profileError);
        toast.error('Failed to deduct ink. Please try again.');
        setSubmitting(false);
        return;
      }

      // Step 2: Create the poem
      const randomDivider = getRandomDivider();
      const poemData = {
        user_id: user.id, title: title.trim(), content: content.trim(),
        image_url: imageUrl.trim() || null, topic_id: topicId || null,
        ink_spent: INK_PUBLISH_COST, published: true, behind_the_poem: behindPayload(),
        decorative_divider: randomDivider.id,
      };
      console.log('[v0] Publishing poem with data:', poemData);
      const { data: poem, error: poemError } = await supabase.from('poems').insert(poemData).select().single();

      if (poemError || !poem) {
        console.error('[v0] Poem insert error:', poemError);
        console.error('[v0] Poem data was:', poemData);
        // Refund the ink if poem creation fails
        await supabase.from('user_profiles').update({ ink_balance: profile.ink_balance }).eq('id', user.id);
        toast.error('Failed to publish poem. Ink refunded.');
        setSubmitting(false);
        return;
      }

      // Step 3: Create poem draft
      await supabase.from('poem_drafts').insert({ poem_id: poem.id, content: content.trim(), draft_number: 1 });

      // Step 4: Add tags
      for (const tagName of tags) {
        const { data: existingTags } = await supabase.from('tags').select('id').eq('name', tagName);
        let tagId = existingTags?.[0]?.id;
        if (!tagId) { 
          const { data: newTags, error: tagError } = await supabase.from('tags').insert({ name: tagName }).select('id');
          if (!tagError && newTags?.[0]) tagId = newTags[0].id;
        }
        if (tagId) await supabase.from('poem_tags').insert({ poem_id: poem.id, tag_id: tagId });
      }

      // Step 5: Create transaction record
      await supabase.from('ink_transactions').insert({ user_id: user.id, amount: -INK_PUBLISH_COST, reason: `Published "${title.trim()}"`, related_id: poem.id });

      localStorage.removeItem(NEW_POEM_KEY);
      await refreshProfile();
      toast.success('Poem published!', { description: `-${INK_PUBLISH_COST} Ink spent` });
      navigate(`/poem/${poem.id}`);
    } catch (err) {
      console.error('[v0] Publish error:', err);
      toast.error('An unexpected error occurred while publishing.');
    } finally {
      setSubmitting(false);
    }
  }

  const canPublish = profile && profile.ink_balance >= INK_PUBLISH_COST;
  const lineCount = content.split('\n').length;
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  // ── Credit step ───────────────────────────────────────────────────────────
  if (publishedPoemId) {
    const filtered = creditSearch.trim()
      ? creditCandidates.filter(c => c.username.toLowerCase().includes(creditSearch.toLowerCase()))
      : creditCandidates;

    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-surface border-t border-border rounded-t-2xl max-h-[88vh] flex flex-col shadow-2xl z-10">
          <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full bg-border" /></div>
          <div className="px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif font-semibold text-lg text-foreground flex items-center gap-2">
                  <Users size={18} className="text-brand-500 shrink-0" />Credit Contributors
                </h2>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Did anyone's feedback influence this revision? Credit them to appear in{' '}
                  <span className="font-medium text-foreground">Behind the Poem</span> — they each earn{' '}
                  <span className="font-semibold text-tella-600 dark:text-tella-400">+2 Tella</span>.
                </p>
              </div>
              <button onClick={() => handleSaveCredits(true)} className="text-xs text-foreground-muted hover:text-foreground transition-colors shrink-0 underline underline-offset-2 mt-1">Skip</button>
            </div>
          </div>
          {creditCandidates.length > 4 && (
            <div className="px-5 pt-3 shrink-0">
              <input type="text" value={creditSearch} onChange={e => setCreditSearch(e.target.value)} placeholder="Search by username…" className="w-full bg-background-subtle border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors" />
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            {creditCandidates.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-3"><Users size={22} className="text-foreground-muted" /></div>
                <p className="font-serif italic text-foreground-muted text-sm">No feedback contributors yet.</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-foreground-muted text-center py-8">No matches for "{creditSearch}"</p>
            ) : filtered.map(contributor => {
              const level = getLevel(contributor.tella_balance || 0);
              const cfg = LEVEL_CONFIG[level];
              const checked = selectedCredits.has(contributor.id);
              return (
                <button key={contributor.id} onClick={() => toggleCredit(contributor.id)} className={cn('w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left', checked ? 'border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20' : 'border-border hover:border-border-subtle hover:bg-background-subtle')}>
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden', cfg.borderClass)} style={{ background: cfg.color + '18', color: cfg.color }}>
                    {contributor.avatar_url ? <img src={contributor.avatar_url} alt={contributor.username} className="w-full h-full object-cover" /> : getInitials(contributor.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-none">@{contributor.username}</p>
                    <p className={cn('text-xs mt-0.5 font-medium', cfg.textClass)}>{cfg.badgeText}</p>
                  </div>
                  {checked && <div className="text-[10px] text-tella-600 dark:text-tella-400 font-semibold">+2 Tella</div>}
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all', checked ? 'bg-brand-500 border-brand-500' : 'border-border')}>
                    {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="px-5 py-4 border-t border-border shrink-0 space-y-2">
            {selectedCredits.size > 0 && (
              <p className="text-xs text-foreground-muted text-center">
                {selectedCredits.size} contributor{selectedCredits.size !== 1 ? 's' : ''} will receive <span className="text-tella-600 dark:text-tella-400 font-semibold">+2 Tella</span> each
              </p>
            )}
            <button onClick={() => handleSaveCredits(false)} disabled={savingCredits} className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-3 rounded-full font-semibold text-sm transition-colors">
              {savingCredits ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : selectedCredits.size > 0 ? `Credit ${selectedCredits.size} & view poem` : 'Continue to poem'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingPoem) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-6 w-full rounded" />
          <div className="skeleton h-48 w-full rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8 transition-all duration-300', editorFocused && 'max-w-3xl')}>

      {/* Header — no heading, ink badge top right */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          {isEditMode && originalPoemData ? (
            <>
              <p className="font-serif font-semibold text-lg text-foreground flex items-center gap-2">
                <PenLine size={18} className="text-brand-500" />
                {originalPoemData.title}
              </p>
              <p className="text-xs text-foreground-muted mt-0.5">Draft (unsaved changes will be discarded on close)</p>
            </>
          ) : (
            <p className="text-sm text-foreground-muted font-serif italic">New poem</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {autoSaved && (
            <div className="flex items-center gap-1 text-xs text-foreground-muted">
              {autoSaving ? <><Loader2 size={11} className="animate-spin" /> Saving…</> : <><Save size={11} /> Saved</>}
            </div>
          )}
          {!isEditMode && (
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border',
              canPublish
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            )}>
              <span className="font-mono">{profile?.ink_balance || 0}</span>
              <span className="opacity-50 font-normal">/</span>
              <span className="font-normal opacity-80">{INK_PUBLISH_COST} Ink</span>
              <span className="text-[9px] font-semibold opacity-70 ml-0.5">
                {canPublish ? '· ready' : '· need more'}
              </span>
            </div>
          )}
        </div>
      </div>

      {isEditMode && (
        <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
          <PenLine size={14} className="text-brand-500 shrink-0" />
          <span className="text-brand-700 dark:text-brand-400">Revisions are <strong>free</strong>. After publishing you can credit feedback contributors (+2 Tella each).</span>
        </div>
      )}

      <div className="space-y-5">
        {/* ── Title ── */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="poem title"
          className="w-full text-2xl sm:text-3xl font-serif font-semibold bg-transparent outline-none text-foreground placeholder:text-foreground-muted/50 border-b-2 border-border pb-3 focus:border-brand-400 transition-colors"
          maxLength={120}
        />

        {/* ── Poem content — free, no containment ── */}
        <div className="relative">
          <textarea
            ref={contentRef}
            value={content}
            onChange={e => {
              setContent(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.max(320, e.target.scrollHeight) + 'px';
            }}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            placeholder={`write here.\n\nline breaks are sacred.\ntake your time.`}
            className="w-full bg-transparent outline-none text-foreground placeholder:text-foreground-muted/40 text-base sm:text-lg poem-text resize-none leading-[1.9] px-0 py-2"
            style={{ minHeight: '320px' }}
          />
          {editorFocused && content && (
            <div className="absolute bottom-2 right-0 flex items-center gap-2 text-[10px] text-foreground-muted/70 font-mono pointer-events-none">
              <span>{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* ── Metadata ── */}
        <div className="border-t border-border pt-5 space-y-4">

          {/* Topic */}
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">Topic</label>
            <div className="relative">
              <select value={topicId} onChange={e => setTopicId(e.target.value)} className="w-full appearance-none bg-background-subtle border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-400 pr-8 transition-colors">
                <option value="">No topic</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">Tags <span className="normal-case font-normal">(up to 5)</span></label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 tag-pill pr-1">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <div className="flex items-center gap-2">
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())} placeholder="add tag, press Enter" className="flex-1 bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors" />
                <button onClick={addTag} className="p-2 bg-background-subtle border border-border rounded-lg hover:border-brand-300 transition-colors"><Plus size={14} className="text-foreground-muted" /></button>
              </div>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">Image URL <span className="normal-case font-normal">(optional)</span></label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full bg-background-subtle border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors" />
            <p className="text-xs text-foreground-muted mt-1">Paste an image URL hosted elsewhere (Unsplash, etc.)</p>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden max-h-32">
                <img src={imageUrl} alt="Preview" className="w-full object-cover" onError={() => {}} />
              </div>
            )}
          </div>

          {/* ── Behind the Poem ── */}
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3 block">Behind the Poem <span className="normal-case font-normal">(optional)</span></label>
            <p className="text-xs text-foreground-secondary mb-4 leading-relaxed">Share the story behind your poem. All these details will appear when readers click the door icon on your poem.</p>
            <div className="space-y-4">
              {/* Spark */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">The Spark <span className="normal-case font-normal">(what started it)</span></label>
                <input type="text" value={behindThePoemData.spark} onChange={e => setBehindThePoemData(prev => ({ ...prev, spark: e.target.value }))} placeholder="A moment, image, conversation, or feeling that sparked this poem…" className="w-full bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors" />
              </div>

              {/* Obsession */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">The Obsession <span className="normal-case font-normal">(what was on your mind)</span></label>
                <textarea value={behindThePoemData.obsession} onChange={e => setBehindThePoemData(prev => ({ ...prev, obsession: e.target.value }))} placeholder="What were you thinking about? What themes kept circling?" className="w-full bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors resize-none" rows={3} />
              </div>

              {/* Graveyard */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">The Graveyard <span className="normal-case font-normal">(what you cut or changed)</span></label>
                {behindThePoemData.graveyard.map((item, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-background-subtle border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <select value={item.type} onChange={e => { const updated = [...behindThePoemData.graveyard]; updated[idx].type = e.target.value as any; setBehindThePoemData(prev => ({ ...prev, graveyard: updated })); }} className="text-xs bg-background border border-border rounded px-2 py-1 text-foreground outline-none focus:border-brand-400">
                        <option value="line">Line</option>
                        <option value="word">Word</option>
                        <option value="phrase">Phrase</option>
                        <option value="stanza">Stanza</option>
                      </select>
                      <button onClick={() => { const updated = behindThePoemData.graveyard.filter((_, i) => i !== idx); setBehindThePoemData(prev => ({ ...prev, graveyard: updated })); }} className="ml-auto text-xs text-red-500 hover:text-red-600 transition-colors">Remove</button>
                    </div>
                    <textarea value={item.content} onChange={e => { const updated = [...behindThePoemData.graveyard]; updated[idx].content = e.target.value; setBehindThePoemData(prev => ({ ...prev, graveyard: updated })); }} placeholder="The content you removed or changed…" className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 mb-2 resize-none" rows={2} />
                    <textarea value={item.eulogy || ''} onChange={e => { const updated = [...behindThePoemData.graveyard]; updated[idx].eulogy = e.target.value; setBehindThePoemData(prev => ({ ...prev, graveyard: updated })); }} placeholder="Why did you cut it? What was it trying to do?" className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 resize-none" rows={2} />
                  </div>
                ))}
                <button onClick={() => setBehindThePoemData(prev => ({ ...prev, graveyard: [...prev.graveyard, { type: 'line', content: '', eulogy: '' }] }))} className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1">
                  <Plus size={12} /> Add to graveyard
                </button>
              </div>

              {/* Memory Image */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">Memory Image <span className="normal-case font-normal">(optional — polaroid)</span></label>
                <input type="url" value={behindThePoemData.memoryImage} onChange={e => setBehindThePoemData(prev => ({ ...prev, memoryImage: e.target.value }))} placeholder="https://images.unsplash.com/..." className="w-full bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors" />
                {behindThePoemData.memoryImage && (
                  <div className="mt-2 rounded-lg overflow-hidden max-h-32">
                    <img src={behindThePoemData.memoryImage} alt="Memory" className="w-full object-cover" onError={() => {}} />
                  </div>
                )}
              </div>

              {/* Vibe Date */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">Vibe Date <span className="normal-case font-normal">(when did you write this)</span></label>
                <input type="date" value={behindThePoemData.vibeDate} onChange={e => setBehindThePoemData(prev => ({ ...prev, vibeDate: e.target.value }))} className="w-full bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-brand-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* What changed — edit mode only */}
          {isEditMode && (
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">What changed? <span className="normal-case font-normal">(optional — shown in revision history)</span></label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {changesList.map(item => (
                  <span key={item} className="flex items-center gap-1 tag-pill pr-1 text-xs">
                    <span className="text-green-500">+</span> {item}
                    <button onClick={() => removeChange(item)} className="hover:text-red-500 transition-colors ml-0.5"><X size={10} /></button>
                  </span>
                ))}
              </div>
              {changesList.length < 8 && (
                <div className="flex items-center gap-2">
                  <input type="text" value={changesSummaryInput} onChange={e => setChangesSummaryInput(e.target.value)} onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addChange())} placeholder='e.g. "Sharpened the ending", press Enter' className="flex-1 bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors" />
                  <button onClick={addChange} className="p-2 bg-background-subtle border border-border rounded-lg hover:border-brand-300 transition-colors"><Plus size={14} className="text-foreground-muted" /></button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex items-center gap-3 flex-wrap">
        {isEditMode ? (
          <button onClick={handleRevise} disabled={submitting || !title.trim() || !content.trim()} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-semibold transition-colors">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><PenLine size={16} /> Publish Revision</>}
          </button>
        ) : (
          <button onClick={handlePublish} disabled={submitting || !canPublish || !title.trim() || !content.trim()} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-semibold transition-colors">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Publishing…</> : <><Feather size={16} /> Publish · {INK_PUBLISH_COST} Ink</>}
          </button>
        )}
        <button onClick={() => navigate(-1)} className="px-5 py-3 text-sm text-foreground-muted hover:text-foreground transition-colors">Cancel</button>
        {autoSaved && !submitting && (
          <span className="text-xs text-foreground-muted ml-auto flex items-center gap-1"><Save size={11} /> Draft saved locally</span>
        )}
      </div>
    </div>
  );
}
