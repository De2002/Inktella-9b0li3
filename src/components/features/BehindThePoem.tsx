import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';

interface GraveyardItem {
  type: 'line' | 'word' | 'phrase' | 'stanza';
  content: string;
  eulogy?: string;
}

interface BehindThePoemData {
  spark: string;
  obsession: string;
  graveyard: GraveyardItem[];
  memoryImage?: string;
  vibeDate: string;
}

interface Contributor {
  id: string;
  username: string;
  avatar_url?: string;
  tella_balance: number;
}

interface BehindThePoemProps {
  poem: { id: string; title?: string; behind_the_poem?: BehindThePoemData | null };
  onClose: () => void;
}

export default function BehindThePoem({ poem, onClose }: BehindThePoemProps) {
  const [data, setData] = useState<BehindThePoemData | null>(poem.behind_the_poem || null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(!poem.behind_the_poem);
  const [activeTab, setActiveTab] = useState<'story' | 'credits'>('story');

  useEffect(() => {
    async function load() {
      if (!poem.id) return;
      setLoading(true);
      const { data: poemData } = await supabase
        .from('poems')
        .select('behind_the_poem')
        .eq('id', poem.id)
        .single();
      if (poemData?.behind_the_poem) setData(poemData.behind_the_poem);
      // Load credited contributors
      const { data: credits } = await supabase
        .from('feedback_credits')
        .select('credited_user:user_profiles!feedback_credits_credited_user_id_fkey(id, username, avatar_url, tella_balance)')
        .eq('poem_id', poem.id);
      if (credits) {
        const people = credits.map((c: any) => c.credited_user).filter(Boolean);
        setContributors(people);
      }
      setLoading(false);
    }
    load();
  }, [poem.id]);

  const renderGraveyardItem = (item: GraveyardItem & { _key?: number }) => {
    switch (item.type) {
      case 'word':
        return (
          <div key={item._key ?? `${item.type}-${item.content}`} className="flex flex-col gap-0.5 pb-1.5 border-b border-dotted border-[#ede8e3] last:border-b-0 last:pb-0">
            <span className="inline-block bg-[#f5f0eb] px-2.5 py-0.5 rounded-full text-sm text-[#5a4e4a] border border-[#ede8e3] max-w-fit">
              <span className="line-through decoration-[#c4b5ac] decoration-2">{item.content}</span>
            </span>
            {item.eulogy && <span className="text-xs text-[#8a7e7a] font-light pl-2">— {item.eulogy}</span>}
          </div>
        );
      case 'phrase':
        return (
          <div key={item._key ?? `${item.type}-${item.content}`} className="flex flex-col gap-0.5 pb-1.5 border-b border-dotted border-[#ede8e3] last:border-b-0 last:pb-0">
            <span className="font-playfair italic text-base text-[#5a4e4a]">
              <span className="line-through decoration-[#c4b5ac] decoration-2">&quot;{item.content}&quot;</span>
            </span>
            {item.eulogy && <span className="text-xs text-[#8a7e7a] font-light pl-2">— {item.eulogy}</span>}
          </div>
        );
      case 'stanza':
        return (
          <div key={item._key ?? `${item.type}-${item.content}`} className="flex flex-col gap-0.5 pb-1.5 border-b border-dotted border-[#ede8e3] last:border-b-0 last:pb-0">
            <div className="font-playfair italic text-sm text-[#5a4e4a] p-2.5 bg-[#faf6f2] rounded-lg border-l-4 border-[#e3dad4] leading-relaxed whitespace-pre-wrap">
              <span className="line-through decoration-[#c4b5ac] decoration-2">{item.content}</span>
            </div>
            {item.eulogy && <span className="text-xs text-[#8a7e7a] font-light pl-2">— {item.eulogy}</span>}
          </div>
        );
      case 'line':
      default:
        return (
          <div key={item._key ?? `${item.type}-${item.content}`} className="flex flex-col gap-0.5 pb-1.5 border-b border-dotted border-[#ede8e3] last:border-b-0 last:pb-0">
            <span className="font-playfair italic text-base text-[#5a4e4a]">
              <span className="line-through decoration-[#c4b5ac] decoration-2">{item.content}</span>
            </span>
            {item.eulogy && <span className="text-xs text-[#8a7e7a] font-light pl-2">— {item.eulogy}</span>}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#faf8f5] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#faf8f5] border-b border-[#f0e9e4] px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-playfair font-semibold text-[#1e1b1a]">Behind the Poem</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f0e9e4] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-[#1e1b1a]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#f0e9e4] shrink-0">
          {(['story', 'credits'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[#6C4EF6] text-[#6C4EF6]'
                  : 'text-[#b5a69e] hover:text-[#8a7e7a]'
              }`}
            >
              {tab === 'story' ? '📖 Story' : `🙏 Credits${contributors.length > 0 ? ` (${contributors.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-[#6C4EF6]" />
              <p className="text-sm text-[#b5a69e]">Loading the story…</p>
            </div>
          ) : activeTab === 'credits' ? (
            <div className="space-y-4">
              {contributors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🌱</div>
                  <p className="font-playfair italic text-[#8a7e7a] text-sm">No contributors credited yet.</p>
                  <p className="text-xs text-[#b5a69e] mt-1">The poet credits feedback givers after each revision.</p>
                </div>
              ) : (
                <>
                  <div className="text-center text-xs uppercase tracking-widest text-[#b5a69e] font-semibold mb-5">
                    Grateful for these voices
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                    {contributors.map(person => {
                      const level = getLevel(person.tella_balance || 0);
                      const cfg = LEVEL_CONFIG[level];
                      return (
                        <div key={person.id} className="flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5 cursor-default">
                          <div
                            className={cn('w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold border-2', cfg.borderClass)}
                            style={{ background: cfg.color + '15', color: cfg.color }}
                          >
                            {person.avatar_url
                              ? <img src={person.avatar_url} alt={person.username} className="w-full h-full object-cover" />
                              : getInitials(person.username)
                            }
                          </div>
                          <span className="text-xs font-medium text-[#2b2523] text-center max-w-[80px]">@{person.username}</span>
                          <span className={cn('text-[10px] font-semibold text-center', cfg.textClass)}>{cfg.badgeText}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : !data ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🚪</div>
              <p className="font-playfair italic text-[#8a7e7a]">The poet hasn't opened this door yet.</p>
              <p className="text-xs text-[#b5a69e] mt-2">No story behind this poem has been shared.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Spark */}
              {data.spark && (
                <div className="bg-[#fffcf9] rounded-2xl p-7 border border-[#f0e9e4] shadow-[0_2px_12px_rgba(30,27,26,0.04)]">
                  <div className="text-xs uppercase tracking-widest text-[#b5a69e] font-semibold mb-2">
                    <span className="mr-1.5">🌱</span>The Spark
                  </div>
                  <p className="font-patrick text-xl leading-relaxed text-[#3d322e]">{data.spark}</p>
                </div>
              )}

              {/* Obsession */}
              {data.obsession && (
                <div className="bg-[#fffcf9] rounded-2xl p-7 border border-[#f0e9e4] shadow-[0_2px_12px_rgba(30,27,26,0.04)]">
                  <div className="text-xs uppercase tracking-widest text-[#b5a69e] font-semibold mb-2">
                    <span className="mr-1.5">🌀</span>The Obsession
                  </div>
                  <p className="border-l-4 border-[#e3dad4] pl-5 text-base leading-7 text-[#2b2523] font-light">{data.obsession}</p>
                </div>
              )}

              {/* Graveyard */}
              {data.graveyard && data.graveyard.length > 0 && (
                <div className="bg-[#fffcf9] rounded-2xl p-7 border border-[#f0e9e4] shadow-[0_2px_12px_rgba(30,27,26,0.04)]">
                  <div className="text-xs uppercase tracking-widest text-[#b5a69e] font-semibold mb-3">
                    <span className="mr-1.5">🪦</span>The Graveyard
                  </div>
                  <div className="space-y-2">
                    {data.graveyard.map((item, i) => renderGraveyardItem({ ...item, _key: i } as any))}
                  </div>
                </div>
              )}

              {/* Memory Image */}
              {data.memoryImage && (
                <div className="flex justify-center py-2">
                  <div className="bg-[#fffcf9] p-2.5 shadow-[0_8px_30px_rgba(30,27,26,0.08)] border border-[#f0e9e4] transform -rotate-1 hover:rotate-0 transition-transform max-w-[240px] rounded">
                    <img
                      src={data.memoryImage}
                      alt="Memory"
                      className="w-full h-auto rounded-sm"
                      style={{ filter: 'grayscale(20%) contrast(1.05)' }}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="text-xs text-center mt-3 text-[#8a7e7a] font-light tracking-widest uppercase">A moment in time</div>
                  </div>
                </div>
              )}

              {/* Vibe Date */}
              {data.vibeDate && (
                <div className="text-center pt-2 pb-4 text-xs text-[#c4b5ac]">
                  <div className="text-xl text-[#d4c9c2] mb-1">~~~~</div>
                  {data.vibeDate}
                </div>
              )}

              {/* Empty story state */}
              {!data.spark && !data.obsession && (!data.graveyard || data.graveyard.length === 0) && !data.memoryImage && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🚪</div>
                  <p className="font-playfair italic text-[#8a7e7a]">The poet hasn't opened this door yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Patrick+Hand&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-patrick { font-family: 'Patrick Hand', cursive; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
      `}</style>
    </div>
  );
}
