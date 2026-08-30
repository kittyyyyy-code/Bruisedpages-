import React, { useState } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from './EmptyState';
import { BookOpen, Calendar, Layers, Eye, PlusCircle, Search } from 'lucide-react';

interface ComicsViewProps {
  onReadComic: (comicId: string) => void;
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
}

export const ComicsView: React.FC<ComicsViewProps> = ({
  onReadComic,
  onNavigate,
  onOpenLogin,
}) => {
  const { comics } = useArchive();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Admins see all, visitors see only published
  const displayedComics = comics.filter((c) => {
    const isVisible = isAdmin ? true : c.published;
    if (!isVisible) return false;
    if (!searchTerm) return true;
    return (
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (displayedComics.length === 0 && !searchTerm) {
    return (
      <div className="py-8">
        <EmptyState
          title="NO COMICS HAVE BEEN PUBLISHED YET."
          subtitle="The comic archive is currently blank. New chapters will appear here as soon as they are uploaded."
          actionText="Create First Comic"
          onAction={() => onNavigate('dashboard')}
          onOpenLogin={onOpenLogin}
          icon={<BookOpen className="w-7 h-7" />}
          category="comics"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Archive Header */}
      <div className="border-b border-[#202c24] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="ink-stamp text-[10px]">COMIC CHRONICLES</span>
            <span className="text-xs font-typewriter text-[#7b8c82]">
              TOTAL ENTRIES: {displayedComics.length}
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#eae5d8] tracking-wider">
            COMICS ARCHIVE
          </h2>
          <p className="font-sketch text-sm text-[#9aa8a0] mt-1">
            Browse and read official serialized chapters and standalone works.
          </p>
        </div>

        {/* Search Bar & Admin Action */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comics..."
              className="bg-[#0b100d] border border-[#233328] focus:border-[#415e4c] text-xs font-typewriter text-[#dcd7c9] px-3.5 py-2 pl-9 rounded-sm focus:outline-none w-48 sm:w-60"
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#5e7065]" />
          </div>

          {isAdmin && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#8de2ad]" />
              <span>NEW COMIC</span>
            </button>
          )}
        </div>
      </div>

      {displayedComics.length === 0 && searchTerm ? (
        <div className="text-center py-16 text-[#8b9990] font-typewriter text-sm">
          No comics found matching "{searchTerm}".
        </div>
      ) : (
        /* Comics Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedComics.map((comic) => (
            <div
              key={comic.id}
              className="rough-panel rounded-sm overflow-hidden flex flex-col group hover:border-[#385141] transition-all"
            >
              {/* Cover with tape badge */}
              <div className="relative aspect-[3/4] bg-[#070b09] overflow-hidden border-b border-[#202c24]">
                {comic.coverUrl ? (
                  <img
                    src={comic.coverUrl}
                    alt={comic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#586960] text-center">
                    <BookOpen className="w-12 h-12 mb-3 opacity-40" />
                    <span className="font-sketch text-xs tracking-wider">NO COVER ART</span>
                  </div>
                )}

                {/* Chapter Stamp Badge */}
                {comic.chapterNumber && (
                  <div className="absolute top-3 left-3 bg-[#0c130f]/90 border border-[#2b3d31] px-2.5 py-1 text-[11px] font-typewriter text-[#9ce2b3] shadow-md backdrop-blur-xs">
                    CH. {comic.chapterNumber}
                  </div>
                )}

                {!comic.published && (
                  <div className="absolute top-3 right-3 bg-[#381616]/90 border border-[#6b2525] px-2 py-0.5 text-[10px] font-typewriter text-[#f0a8a8] shadow-md">
                    DRAFT (UNPUBLISHED)
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-[11px] font-typewriter text-[#7b8c82]">
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-[#586960]" />
                      <span>{comic.pages?.length || 0} PAGES</span>
                    </span>
                    {comic.publishedAt && (
                      <>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-[#586960]" />
                          <span>{new Date(comic.publishedAt).toLocaleDateString()}</span>
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-display font-black text-xl text-[#eae5d8] group-hover:text-[#f8f5ee] transition-colors line-clamp-1">
                    {comic.title}
                  </h3>

                  <p className="font-body text-sm text-[#abb9af] line-clamp-3 leading-relaxed">
                    {comic.description || 'No summary recorded for this entry.'}
                  </p>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    onClick={() => onReadComic(comic.id)}
                    className="w-full py-2.5 bg-[#142019] hover:bg-[#6b1b1b] border border-[#293d31] hover:border-[#8c2828] text-[#dce6df] hover:text-white font-display text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>READ COMIC</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
