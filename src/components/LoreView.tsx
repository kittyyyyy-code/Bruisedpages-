import React, { useState } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from './EmptyState';
import { ScrollText, PlusCircle, Users, BookOpen, X, Tag } from 'lucide-react';
import { LoreEntry } from '../types';

interface LoreViewProps {
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
  onReadComic?: (comicId: string) => void;
}

export const LoreView: React.FC<LoreViewProps> = ({
  onNavigate,
  onOpenLogin,
  onReadComic,
}) => {
  const { lore, characters, comics } = useArchive();
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeEntry, setActiveEntry] = useState<LoreEntry | null>(null);

  const categories: string[] = ['ALL', ...Array.from(new Set<string>(lore.map((l) => l.category || 'General')))];

  const filteredLore = lore.filter((l) => {
    if (selectedCategory === 'ALL') return true;
    return (l.category || 'General') === selectedCategory;
  });

  if (lore.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          title="THE ARCHIVE IS EMPTY."
          subtitle="Nothing has been filed here yet."
          actionText="Create Lore Document"
          onAction={() => onNavigate('dashboard')}
          onOpenLogin={onOpenLogin}
          icon={<ScrollText className="w-7 h-7" />}
          category="lore"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#202c24] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="ink-stamp text-[10px]">HISTORICAL ARCHIVES</span>
            <span className="text-xs font-typewriter text-[#7b8c82]">
              RECORDS LOGGED: {lore.length}
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#eae5d8] tracking-wider">
            LORE & WORLD DOSSIERS
          </h2>
          <p className="font-sketch text-sm text-[#9aa8a0] mt-1">
            World-building manuscripts, faction accounts, timeline chronicles, and artifacts.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-1.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#8de2ad]" />
            <span>NEW LORE ENTRY</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-typewriter tracking-wider rounded border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1a2d21] border-[#37523f] text-[#a4e6bc]'
                  : 'bg-[#0c120f] border-[#1e2a22] text-[#7d8e83] hover:text-[#d3ded7]'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Lore Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLore.map((entry) => (
          <article
            key={entry.id}
            onClick={() => setActiveEntry(entry)}
            className="rough-panel rounded-sm overflow-hidden flex flex-col cursor-pointer group hover:border-[#3d5a47] transition-all"
          >
            {/* Image if attached */}
            {entry.imageUrl && (
              <div className="aspect-[16/9] bg-[#070b09] overflow-hidden border-b border-[#1f2d24]">
                <img
                  src={entry.imageUrl}
                  alt={entry.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[11px] font-typewriter text-[#7c8e84]">
                  <span className="px-2 py-0.5 bg-[#121c17] border border-[#233429] text-[#9ae0b1] rounded">
                    {entry.category || 'General'}
                  </span>
                  <span>•</span>
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="font-display font-black text-xl text-[#eae5d8] group-hover:text-[#f8f5ee] transition-colors">
                  {entry.title}
                </h3>

                <p className="font-body text-sm text-[#abb9af] line-clamp-4 leading-relaxed whitespace-pre-line">
                  {entry.content}
                </p>
              </div>

              {/* Related tags info */}
              <div className="pt-3 border-t border-[#1a251e] flex items-center justify-between text-xs font-typewriter text-[#889a8f] group-hover:text-[#cde2d6]">
                <span>READ MANUSCRIPT</span>
                <span>→</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Full Lore Modal */}
      {activeEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0b100d] border border-[#263a2e] rounded-sm shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            {/* Distress top tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-5 tape-strip rotate-1 pointer-events-none" />

            <button
              onClick={() => setActiveEntry(null)}
              className="absolute top-4 right-4 text-[#788a80] hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="ink-stamp text-[9px]">{activeEntry.category || 'LORE'}</span>
                  <span className="text-xs font-typewriter text-[#889a8f]">
                    LOGGED ON {new Date(activeEntry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-[#eae5d8]">
                  {activeEntry.title}
                </h2>
              </div>

              {activeEntry.imageUrl && (
                <div className="aspect-[16/9] max-h-[380px] bg-[#070b09] border border-[#202d24] overflow-hidden rounded-sm">
                  <img
                    src={activeEntry.imageUrl}
                    alt={activeEntry.title}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Manuscript Content */}
              <div className="font-body text-base sm:text-lg text-[#ccd7cf] leading-relaxed whitespace-pre-line space-y-4 border-t border-[#1c2a21] pt-6">
                {activeEntry.content}
              </div>

              {/* Related Characters or Comics */}
              {(activeEntry.relatedCharacterIds?.length || 0) > 0 && (
                <div className="pt-4 border-t border-[#1c2a21] space-y-2">
                  <h4 className="font-display text-xs tracking-wider text-[#9fe1b6] uppercase flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Related Characters</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeEntry.relatedCharacterIds?.map((charId) => {
                      const char = characters.find((c) => c.id === charId);
                      return (
                        <span
                          key={charId}
                          className="px-2.5 py-1 text-xs font-typewriter bg-[#141f19] border border-[#273a2e] text-[#9ce0b3] rounded"
                        >
                          {char ? char.name : charId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {(activeEntry.relatedComicIds?.length || 0) > 0 && (
                <div className="pt-3 border-t border-[#1c2a21] space-y-2">
                  <h4 className="font-display text-xs tracking-wider text-[#9fe1b6] uppercase flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Related Comics</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeEntry.relatedComicIds?.map((comicId) => {
                      const comic = comics.find((c) => c.id === comicId);
                      return (
                        <span
                          key={comicId}
                          onClick={() => {
                            if (comic && onReadComic) {
                              setActiveEntry(null);
                              onReadComic(comic.id);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-typewriter bg-[#17251d] border border-[#2b4133] text-[#9ce0b3] rounded cursor-pointer hover:bg-[#203428]"
                        >
                          <BookOpen className="w-3 h-3 inline mr-1 opacity-75" />
                          {comic ? comic.title : comicId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
