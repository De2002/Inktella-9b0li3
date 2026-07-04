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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-[90vh] max-h-[90vh] animate-slideUp rounded-t-3xl">
        {/* Header - Dark background */}
        <div className="bg-[#1e1b1a] text-white px-6 py-5 flex items-center justify-between shrink-0 rounded-t-3xl">
          <h2 className="text-lg font-playfair font-semibold">Behind the Poem + Credits</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-[#f5f0eb]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-[#6C4EF6]" />
              <p className="text-sm text-[#b5a69e]">Loading the story…</p>
            </div>
          ) : !data ? (
            <div className="text-center py-12 px-6">
              <div className="text-4xl mb-3">🚪</div>
              <p className="font-playfair italic text-[#8a7e7a]">The poet hasn&apos;t opened this door yet.</p>
              <p className="text-xs text-[#b5a69e] mt-2">No story behind this poem has been shared.</p>
            </div>
          ) : (
            <div className="space-y-0 pb-8">
              {/* Spark Slide */}
              {data.spark && (
                <div className="w-full px-6 py-8 bg-[#f5f0eb] border-b border-[#e3dad4] animate-slideInUp" style={{ animationDelay: '0.1s' }}>
                  <div className="max-w-2xl mx-auto">
                    <div className="text-xs uppercase tracking-widest text-[#8a7e7a] font-semibold mb-3 flex items-center gap-1.5">
                      <span>🌱</span>THE SPARK
                    </div>
                    <p className="font-patrick text-lg leading-relaxed text-[#3d322e]">{data.spark}</p>
                  </div>
                </div>
              )}

              {/* Obsession Slide */}
              {data.obsession && (
                <div className="w-full px-6 py-8 bg-[#f5f0eb] border-b border-[#e3dad4] animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                  <div className="max-w-2xl mx-auto">
                    <div className="text-xs uppercase tracking-widest text-[#8a7e7a] font-semibold mb-3 flex items-center gap-1.5">
                      <span>🌀</span>THE OBSESSION
                    </div>
                    <p className="border-l-4 border-[#c4b5ac] pl-5 text-base leading-7 text-[#2b2523] font-light">{data.obsession}</p>
                  </div>
                </div>
              )}

              {/* Graveyard Slide */}
              {data.graveyard && data.graveyard.length > 0 && (
                <div className="w-full px-6 py-8 bg-[#f5f0eb] border-b border-[#e3dad4] animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                  <div className="max-w-2xl mx-auto">
                    <div className="text-xs uppercase tracking-widest text-[#8a7e7a] font-semibold mb-4 flex items-center gap-1.5">
                      <span>🪦</span>THE GRAVEYARD
                    </div>
                    <div className="space-y-2">
                      {data.graveyard.map((item, i) => renderGraveyardItem({ ...item, _key: i } as any))}
                    </div>
                  </div>
                </div>
              )}

              {/* Memory Image Slide */}
              {data.memoryImage && (
                <div className="w-full px-6 py-8 bg-[#f5f0eb] border-b border-[#e3dad4] animate-slideInUp flex justify-center" style={{ animationDelay: '0.4s' }}>
                  <div className="bg-white p-2.5 shadow-[0_8px_30px_rgba(30,27,26,0.08)] border border-[#e3dad4] transform -rotate-1 hover:rotate-0 transition-transform max-w-[240px] rounded">
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

              {/* Vibe Date Slide */}
              {data.vibeDate && (
                <div className="w-full px-6 py-8 bg-[#f5f0eb] border-b border-[#e3dad4] animate-slideInUp text-center" style={{ animationDelay: '0.5s' }}>
                  <div className="text-xl text-[#d4c9c2] mb-2">~~~~</div>
                  <p className="text-xs text-[#c4b5ac]">{data.vibeDate}</p>
                </div>
              )}

              {/* Credits Slide */}
              <div className="w-full px-6 py-8 bg-[#f5f0eb] animate-slideInUp" style={{ animationDelay: '0.6s' }}>
                <div className="max-w-2xl mx-auto">
                  <div className="text-xs uppercase tracking-widest text-[#8a7e7a] font-semibold mb-6 flex items-center gap-1.5">
                    <span>🙏</span>CREDITS
                  </div>
                  {contributors.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2">🌱</div>
                      <p className="font-playfair italic text-[#8a7e7a] text-sm">No contributors credited yet.</p>
                      <p className="text-xs text-[#b5a69e] mt-1">The poet credits feedback givers after each revision.</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center text-xs uppercase tracking-widest text-[#8a7e7a] font-semibold mb-6">
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
              </div>

              {/* Empty story state */}
              {!data.spark && !data.obsession && (!data.graveyard || data.graveyard.length === 0) && !data.memoryImage && (
                <div className="text-center py-12 px-6">
                  <div className="text-4xl mb-3">🚪</div>
                  <p className="font-playfair italic text-[#8a7e7a]">The poet hasn&apos;t opened this door yet.</p>
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        
        @keyframes slideInUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInUp { animation: slideInUp 0.5s ease forwards; }
      `}</style>
    </>
  );
}
