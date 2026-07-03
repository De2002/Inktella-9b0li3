'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface GraveyardItem {
  type: 'line' | 'word' | 'phrase' | 'stanza';
  content: string;
  eulogy?: string;
}

interface CreditPerson {
  name: string;
  role: string;
  avatar: string;
}

interface BehindThePoemData {
  spark: string;
  obsession: string;
  graveyard: GraveyardItem[];
  memoryImage?: string;
  vibeDate: string;
  credits?: CreditPerson[];
}

interface BehindThePoemProps {
  isOpen: boolean;
  onClose: () => void;
  data: BehindThePoemData;
}

export default function BehindThePoem({ isOpen, onClose, data }: BehindThePoemProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const renderGraveyardItem = (item: GraveyardItem) => {
    switch (item.type) {
      case 'word':
        return (
          <div key={`${item.type}-${item.content}`} className="flex flex-col gap-0.5 pb-1.5 border-b border-dotted border-[#ede8e3] last:border-b-0 last:pb-0">
            <span className="inline-block bg-[#f5f0eb] px-2.5 py-0.5 rounded-full text-sm text-[#5a4e4a] border border-[#ede8e3] max-w-fit">
              <span className="line-through decoration-[#c4b5ac] decoration-2">{item.content}</span>
            </span>
            {item.eulogy && <span className="text-xs text-[#8a7e7a] font-light pl-2">— {item.eulogy}</span>}
          </div>
        );
      case 'phrase':
        return (
          <div key={`${item.type}-${item.content}`} className="flex flex-col gap-0.5 pb-1.5 border-b border-dotted border-[#ede8e3] last:border-b-0 last:pb-0">
            <span className="font-playfair italic text-base text-[#5a4e4a]">
              <span className="line-through decoration-[#c4b5ac] decoration-2">&quot;{item.content}&quot;</span>
            </span>
            {item.eulogy && <span className="text-xs text-[#8a7e7a] font-light pl-2">— {item.eulogy}</span>}
          </div>
        );
      case 'stanza':
        return (
          <div key={`${item.type}-${item.content}`} className="flex flex-col gap-0.5 pb-1.5 border-b border-dotted border-[#ede8e3] last:border-b-0 last:pb-0">
            <div className="font-playfair italic text-sm text-[#5a4e4a] p-2.5 bg-[#faf6f2] rounded-lg border-l-4 border-[#e3dad4] leading-relaxed whitespace-pre-wrap">
              <span className="line-through decoration-[#c4b5ac] decoration-2">{item.content}</span>
            </div>
            {item.eulogy && <span className="text-xs text-[#8a7e7a] font-light pl-2">— {item.eulogy}</span>}
          </div>
        );
      case 'line':
      default:
        return (
          <div key={`${item.type}-${item.content}`} className="flex flex-col gap-0.5 pb-1.5 border-b border-dotted border-[#ede8e3] last:border-b-0 last:pb-0">
            <span className="font-playfair italic text-base text-[#5a4e4a]">
              <span className="line-through decoration-[#c4b5ac] decoration-2">{item.content}</span>
            </span>
            {item.eulogy && <span className="text-xs text-[#8a7e7a] font-light pl-2">— {item.eulogy}</span>}
          </div>
        );
    }
  };

  if (!isOpen) return null;

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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Spark */}
          <div className="bg-[#fffcf9] rounded-2xl p-7 border border-[#f0e9e4] shadow-[0_2px_12px_rgba(30,27,26,0.04)]">
            <div className="text-xs uppercase tracking-widest text-[#b5a69e] font-semibold mb-2">
              <span className="mr-1.5">🌱</span>
              The Spark
            </div>
            <div 
              className="font-patrick text-xl leading-relaxed text-[#3d322e]"
              dangerouslySetInnerHTML={{ __html: data.spark }}
            />
          </div>

          {/* Obsession */}
          <div className="bg-[#fffcf9] rounded-2xl p-7 border border-[#f0e9e4] shadow-[0_2px_12px_rgba(30,27,26,0.04)]">
            <div className="text-xs uppercase tracking-widest text-[#b5a69e] font-semibold mb-2">
              <span className="mr-1.5">🌀</span>
              The Obsession
            </div>
            <div 
              className="font-light border-l-3 border-[#e3dad4] pl-5 text-base leading-7 text-[#2b2523]"
              dangerouslySetInnerHTML={{ __html: data.obsession }}
            />
          </div>

          {/* Graveyard */}
          {data.graveyard && data.graveyard.length > 0 && (
            <div className="bg-[#fffcf9] rounded-2xl p-7 border border-[#f0e9e4] shadow-[0_2px_12px_rgba(30,27,26,0.04)]">
              <div className="text-xs uppercase tracking-widest text-[#b5a69e] font-semibold mb-3">
                <span className="mr-1.5">🪦</span>
                The Graveyard
              </div>
              <div className="space-y-2">
                {data.graveyard.map((item) => renderGraveyardItem(item))}
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
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="text-xs text-center mt-3 text-[#8a7e7a] font-light tracking-widest uppercase">
                  A moment in time
                </div>
              </div>
            </div>
          )}

          {/* Credits */}
          {data.credits && data.credits.length > 0 && (
            <div className="bg-[#fffcf9] rounded-2xl p-7 border border-[#f0e9e4] shadow-[0_2px_12px_rgba(30,27,26,0.04)]">
              <div className="text-center text-xs uppercase tracking-widest text-[#b5a69e] font-semibold mb-5">
                <span className="mr-1.5">🙏</span>
                Grateful for these voices
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {data.credits.map(person => (
                  <div 
                    key={person.name}
                    className="flex flex-col items-center gap-1 transition-transform hover:translate-y-[-2px] cursor-default"
                  >
                    <img 
                      src={person.avatar}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#f0e9e4] bg-[#ede8e3]"
                      loading="lazy"
                    />
                    <span className="text-xs font-medium text-[#2b2523] text-center max-w-[80px]">{person.name}</span>
                    <span className="text-xs text-[#b5a69e] font-light tracking-tight text-center max-w-[80px]">{person.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Vibe */}
          <div className="text-center pt-2 pb-4 text-xs text-[#c4b5ac]">
            <div className="text-xl text-[#d4c9c2] mb-1">~~~~</div>
            {data.vibeDate}
          </div>
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
