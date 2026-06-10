import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Feather, X, ChevronDown, Plus, Eye, PenLine, Check, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Topic } from '@/types';
import { INK_PUBLISH_COST, getLevel, LEVEL_CONFIG } from '@/constants';
import { cn, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [poetNote, setPoetNote] = useState('');
  const [changesSummaryInput, setChangesSummaryInput] = useState('');
  const [changesList, setChangesList] = useState<string[]>([]);
  const [originalPoemData, setOriginalPoemData] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPoem, setLoadingPoem] = useState(isEditMode);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Credit step state — shown after a revision publishes
  const [publishedPoemId, setPublishedPoemId] = useState<string | null>(null);
  const [creditCandidates, setCreditCandidates] = useState<CreditCandidate[]>([]);
  const [selectedCredits, setSelectedCredits] = useState<Set<string>>(new Set());
  const [creditSearch, setCreditSearch] = useState('');
  const [savingCredits, setSavingCredits] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTopics();
    if (isEditMode && editPoemId) {
      loadPoemForEdit(editPoemId);
    }
  }, [user]);

  async function loadPoemForEdit(poemId: string) {
    setLoadingPoem(true);
    const { data } = await supabase
      .from('poems')
      .select('*, poem_tags(tag:tags(id, name))')
      .eq('id', poemId)
      .single();

    if (!data) {
      toast.error('Poem not found');
      navigate(-1);
      return;
    }

    if (data.user_id !== user?.id) {
      toast.error('You can only edit your own poems');
      navigate(-1);
      return;
    }

    setTitle(data.title || '');
    setContent(data.content || '');
    setImageUrl(data.image_url || '');
    setTopicId(data.topic_id || '');
    setTags(data.poem_tags?.map((pt: any) => pt.tag?.name).filter(Boolean) || []);
    setOriginalPoemData(data);
    setLoadingPoem(false);
  }

  async function fetchTopics() {
    const { data } = await supabase.from('topics').select('id, name, slug, color').order('name');
    if (data) setTopics(data as Topic[]);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  function addChange() {
    const trimmed = changesSummaryInput.trim();
    if (trimmed && !changesList.includes(trimmed) && changesList.length < 8) {
      setChangesList(prev => [...prev, trimmed]);
    }
    setChangesSummaryInput('');
  }

  function removeChange(item: string) {
    setChangesList(prev => prev.filter(c => c !== item));
  }

  function toggleCredit(id: string) {
    setSelectedCredits(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSaveCredits(skip = false) {
    if (!publishedPoemId) return;
    if (!skip && selectedCredits.size > 0) {
      setSavingCredits(true);
      const inserts = [...selectedCredits].map(uid => ({
        poem_id: publishedPoemId,
        credited_user_id: uid,
      }));
      await supabase
        .from('feedback_credits')
        .upsert(inserts, { onConflict: 'poem_id,credited_user_id' });
      setSavingCredits(false);
    }
    navigate(`/poem/${publishedPoemId}`);
  }

  async function handleRevise() {
    if (!user || !profile || !editPoemId || !originalPoemData) return;

    if (!title.trim()) { toast.error('Your poem needs a title'); return; }
    if (!content.trim() || content.trim().length < 10) { toast.error('Write at least a few lines'); return; }

    setSubmitting(true);

    // 1. Update poem row
    const { error: updateError } = await supabase
      .from('poems')
      .update({
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        topic_id: topicId || null,
        revision_count: (originalPoemData.revision_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editPoemId);

    if (updateError) {
      toast.error('Failed to save revision');
      setSubmitting(false);
      return;
    }

    // 2. Next draft number
    const { data: existingDrafts } = await supabase
      .from('poem_drafts')
      .select('draft_number')
      .eq('poem_id', editPoemId)
      .order('draft_number', { ascending: false })
      .limit(1);
    const nextDraftNumber = (existingDrafts?.[0]?.draft_number || 0) + 1;

    // 3. Save draft
    await supabase.from('poem_drafts').insert({
      poem_id: editPoemId,
      content: content.trim(),
      draft_number: nextDraftNumber,
      poet_note: poetNote.trim() || null,
      changes_summary: changesList.length > 0 ? changesList : [],
    });

    // 4. Update tags
    await supabase.from('poem_tags').delete().eq('poem_id', editPoemId);
    for (const tagName of tags) {
      const { data: existingTag } = await supabase.from('tags').select('id').eq('name', tagName).single();
      let tagId = existingTag?.id;
      if (!tagId) {
        const { data: newTag } = await supabase.from('tags').insert({ name: tagName }).select('id').single();
        tagId = newTag?.id;
      }
      if (tagId) {
        await supabase.from('poem_tags').insert({ poem_id: editPoemId, tag_id: tagId });
      }
    }

    // 5. Notify feedback givers + collect credit candidates
    const { data: feedbackRows } = await supabase
      .from('feedback')
      .select('user_id, author:user_profiles!feedback_user_id_fkey(id, username, avatar_url, tella_balance)')
      .eq('poem_id', editPoemId)
      .neq('user_id', user.id);

    if (feedbackRows && feedbackRows.length > 0) {
      const uniqueIds = [...new Set(feedbackRows.map((f: any) => f.user_id))];
      const notifications = uniqueIds.map((uid: string) => ({
        user_id: uid,
        type: 'poem_revised',
        content: `@${profile.username} revised "${title.trim()}" — you gave feedback on this poem.`,
        read: false,
        related_id: editPoemId,
        actor_id: user.id,
      }));
      await supabase.from('notifications').insert(notifications);

      // Build unique contributor list for the credit step
      const seen = new Set<string>();
      const contributors: CreditCandidate[] = feedbackRows
        .map((f: any) => (Array.isArray(f.author) ? f.author[0] : f.author))
        .filter((a: any) => a?.id && !seen.has(a.id) && seen.add(a.id));
      setCreditCandidates(contributors);
    }

    toast.success('Revision published!', { description: `Draft ${nextDraftNumber} saved` });
    setSubmitting(false);
    setPublishedPoemId(editPoemId); // triggers credit step
  }

  async function handlePublish() {
    if (!user || !profile) return;

    if (!title.trim()) {
      toast.error('Your poem needs a title');
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      toast.error('Write at least a few lines');
      return;
    }
    if (profile.ink_balance < INK_PUBLISH_COST) {
      toast.error(`You need ${INK_PUBLISH_COST} Ink to publish. Give feedback to earn more.`);
      return;
    }

    setSubmitting(true);

    const { data: poem, error } = await supabase
      .from('poems')
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        topic_id: topicId || null,
        ink_spent: INK_PUBLISH_COST,
        published: true,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to publish poem');
      setSubmitting(false);
      return;
    }

    await supabase.from('poem_drafts').insert({
      poem_id: poem.id,
      content: content.trim(),
      draft_number: 1,
      poet_note: poetNote.trim() || null,
    });

    if (tags.length > 0) {
      for (const tagName of tags) {
        const { data: existingTag } = await supabase.from('tags').select('id').eq('name', tagName).single();
        let tagId = existingTag?.id;
        if (!tagId) {
          const { data: newTag } = await supabase.from('tags').insert({ name: tagName }).select('id').single();
          tagId = newTag?.id;
        }
        if (tagId) {
          await supabase.from('poem_tags').insert({ poem_id: poem.id, tag_id: tagId });
        }
      }
    }

    const newInk = profile.ink_balance - INK_PUBLISH_COST;
    await Promise.all([
      supabase.from('user_profiles').update({ ink_balance: newInk }).eq('id', user.id),
      supabase.from('ink_transactions').insert({
        user_id: user.id,
        amount: -INK_PUBLISH_COST,
        reason: `Published "${title.trim()}"`,
        related_id: poem.id,
      }),
    ]);

    await refreshProfile();
    toast.success('Poem published!', { description: `-${INK_PUBLISH_COST} Ink spent` });
    navigate(`/poem/${poem.id}`);
    setSubmitting(false);
  }

  const inkAfter = (profile?.ink_balance || 0) - INK_PUBLISH_COST;
  const canPublish = profile && profile.ink_balance >= INK_PUBLISH_COST;

  // ── Credit step — rendered after a revision publishes ──────────────────────
  if (publishedPoemId) {
    const filtered = creditSearch.trim()
      ? creditCandidates.filter(c => c.username.toLowerCase().includes(creditSearch.toLowerCase()))
      : creditCandidates;

    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-surface border-t border-border rounded-t-2xl max-h-[88vh] flex flex-col shadow-2xl z-10">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif font-semibold text-lg text-foreground flex items-center gap-2">
                  <Users size={18} className="text-brand-500 shrink-0" />
                  Credit Contributors
                </h2>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Did anyone's feedback influence this revision? Select them to appear in{' '}
                  <span className="font-medium text-foreground">Behind the Poem</span>.
                </p>
              </div>
              <button
                onClick={() => handleSaveCredits(true)}
                className="text-xs text-foreground-muted hover:text-foreground transition-colors shrink-0 underline underline-offset-2 mt-1"
              >
                Skip
              </button>
            </div>
          </div>

          {/* Search — only shown when there are enough candidates */}
          {creditCandidates.length > 4 && (
            <div className="px-5 pt-3 shrink-0">
              <input
                type="text"
                value={creditSearch}
                onChange={e => setCreditSearch(e.target.value)}
                placeholder="Search by username…"
                className="w-full bg-background-subtle border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          )}

          {/* Candidate list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            {creditCandidates.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-3">
                  <Users size={22} className="text-foreground-muted" />
                </div>
                <p className="font-serif italic text-foreground-muted text-sm">No feedback contributors yet.</p>
                <p className="text-xs text-foreground-muted">
                  Once readers give feedback, you can credit them here after revisions.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-foreground-muted text-center py-8">
                No matches for &quot;{creditSearch}&quot;
              </p>
            ) : (
              filtered.map(contributor => {
                const level = getLevel(contributor.tella_balance || 0);
                const cfg = LEVEL_CONFIG[level];
                const checked = selectedCredits.has(contributor.id);
                return (
                  <button
                    key={contributor.id}
                    onClick={() => toggleCredit(contributor.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                      checked
                        ? 'border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-border hover:border-border-subtle hover:bg-background-subtle'
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden',
                        cfg.borderClass
                      )}
                      style={{ background: cfg.color + '18', color: cfg.color }}
                    >
                      {contributor.avatar_url
                        ? <img src={contributor.avatar_url} alt={contributor.username} className="w-full h-full object-cover" />
                        : getInitials(contributor.username)
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-none">
                        @{contributor.username}
                      </p>
                      <p className={cn('text-xs mt-0.5 font-medium', cfg.textClass)}>
                        {cfg.badgeText}
                      </p>
                    </div>

                    {/* Checkbox */}
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        checked ? 'bg-brand-500 border-brand-500' : 'border-border'
                      )}
                    >
                      {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-5 py-4 border-t border-border shrink-0 space-y-2">
            {selectedCredits.size > 0 && (
              <p className="text-xs text-foreground-muted text-center">
                {selectedCredits.size} contributor{selectedCredits.size !== 1 ? 's' : ''} will appear in{' '}
                <span className="font-medium text-foreground">Behind the Poem</span>
              </p>
            )}
            <button
              onClick={() => handleSaveCredits(false)}
              disabled={savingCredits}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-3 rounded-full font-semibold text-sm transition-colors"
            >
              {savingCredits
                ? 'Saving credits…'
                : selectedCredits.size > 0
                  ? `Credit ${selectedCredits.size} contributor${selectedCredits.size !== 1 ? 's' : ''} & view poem`
                  : 'Continue to poem'
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
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
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif font-bold text-2xl text-foreground flex items-center gap-2">
            {isEditMode ? <><PenLine size={20} className="text-brand-500" /> Revise Poem</> : 'Write a Poem'}
          </h1>
          {isEditMode && originalPoemData && (
            <p className="text-sm text-foreground-muted mt-0.5 font-serif italic">
              &quot;{originalPoemData.title}&quot; &middot; Draft {(originalPoemData.revision_count || 0) + 1}
            </p>
          )}
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors',
            preview ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-500' : 'text-foreground-muted hover:bg-background-subtle'
          )}
        >
          <Eye size={14} />
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Ink balance — new poems only */}
      {!isEditMode && (
        <>
          <div className={cn(
            'flex items-center justify-between p-3 rounded-xl mb-5 text-sm',
            canPublish
              ? 'bg-ink-50 dark:bg-ink-900/20 border border-ink-200 dark:border-ink-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          )}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💧</span>
              <span className="text-foreground-secondary">
                Your Ink:{' '}
                <strong className={canPublish ? 'text-ink-600 dark:text-ink-400' : 'text-red-500'}>
                  {profile?.ink_balance || 0}
                </strong>
              </span>
            </div>
            <span className="text-foreground-muted">
              Publishing costs <strong className="text-foreground">{INK_PUBLISH_COST} Ink</strong>
              {canPublish && <span className="ml-2 text-ink-600 dark:text-ink-400">→ {inkAfter} remaining</span>}
            </span>
          </div>

          {!canPublish && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-5 text-sm text-red-700 dark:text-red-400">
              You need more Ink. <strong>Give feedback</strong> on poems to earn +2 Ink per feedback.
            </div>
          )}
        </>
      )}

      {/* Edit mode notice */}
      {isEditMode && (
        <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
          <PenLine size={14} className="text-brand-500 shrink-0" />
          <span className="text-brand-700 dark:text-brand-400">
            Revisions are <strong>free</strong>. After publishing you can credit feedback contributors.
          </span>
        </div>
      )}

      {/* Preview / Edit */}
      {preview ? (
        <div className="space-y-4">
          <div className="border-b border-border pb-4">
            {title ? (
              <h2 className="poem-title text-3xl text-foreground mb-2">{title}</h2>
            ) : (
              <p className="italic text-foreground-muted text-lg">No title yet…</p>
            )}
            <p className="text-xs text-foreground-muted">@{user?.username} &middot; Draft preview</p>
          </div>
          <div className="poem-text text-foreground-secondary leading-[1.85] text-lg min-h-[80px]">
            {content || <span className="italic text-foreground-muted">Start writing…</span>}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
            </div>
          )}
          {imageUrl && (
            <div className="rounded-xl overflow-hidden max-h-48">
              <img src={imageUrl} alt="Poem visual" className="w-full object-cover" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="poem title (lowercase works well)"
            className="w-full text-2xl font-serif font-semibold bg-transparent outline-none text-foreground placeholder:text-foreground-muted border-b border-border pb-2 focus:border-brand-400 transition-colors"
            maxLength={120}
          />

          {/* Content */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`write here.\nline breaks are sacred.\ntake your time.`}
            className="w-full min-h-[280px] bg-transparent outline-none text-foreground placeholder:text-foreground-muted text-base poem-text resize-none leading-[1.85]"
          />

          <div className="border-t border-border pt-4 space-y-4">
            {/* Topic */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">Topic</label>
              <div className="relative">
                <select
                  value={topicId}
                  onChange={e => setTopicId(e.target.value)}
                  className="w-full appearance-none bg-background-subtle border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-400 pr-8 transition-colors"
                >
                  <option value="">No topic</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">Tags (up to 5)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 tag-pill pr-1">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-500 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
                    placeholder="add tag, press Enter"
                    className="flex-1 bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
                  />
                  <button onClick={addTag} className="p-2 bg-background-subtle border border-border rounded-lg hover:border-brand-300 transition-colors">
                    <Plus size={14} className="text-foreground-muted" />
                  </button>
                </div>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-background-subtle border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
              />
              <p className="text-xs text-foreground-muted mt-1">Paste an image URL hosted elsewhere (Unsplash, etc.)</p>
            </div>

            {/* Poet's note */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">
                {isEditMode ? "Poet's note for this revision (optional)" : "Poet's note (optional)"}
              </label>
              <textarea
                value={poetNote}
                onChange={e => setPoetNote(e.target.value)}
                placeholder={
                  isEditMode
                    ? "What changed in your thinking? What drove this revision?"
                    : "What was happening when you wrote this? What do you want feedback on?"
                }
                rows={2}
                maxLength={500}
                className="w-full bg-background-subtle border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 resize-none transition-colors"
              />
            </div>

            {/* What changed — edit mode only */}
            {isEditMode && (
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 block">
                  What changed? (optional — shown in Behind the Poem)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {changesList.map(item => (
                    <span key={item} className="flex items-center gap-1 tag-pill pr-1 text-xs">
                      <span className="text-green-500">+</span> {item}
                      <button onClick={() => removeChange(item)} className="hover:text-red-500 transition-colors ml-0.5">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                {changesList.length < 8 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={changesSummaryInput}
                      onChange={e => setChangesSummaryInput(e.target.value)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addChange())}
                      placeholder='e.g. "Sharpened the ending line", press Enter'
                      className="flex-1 bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
                    />
                    <button onClick={addChange} className="p-2 bg-background-subtle border border-border rounded-lg hover:border-brand-300 transition-colors">
                      <Plus size={14} className="text-foreground-muted" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex items-center gap-3">
        {isEditMode ? (
          <button
            onClick={handleRevise}
            disabled={submitting || !title.trim() || !content.trim()}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            <PenLine size={16} />
            {submitting ? 'Saving revision…' : 'Publish Revision'}
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={submitting || !canPublish || !title.trim() || !content.trim()}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            <Feather size={16} />
            {submitting ? 'Publishing…' : `Publish · ${INK_PUBLISH_COST} Ink`}
          </button>
        )}
        <button onClick={() => navigate(-1)} className="px-5 py-3 text-sm text-foreground-muted hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
