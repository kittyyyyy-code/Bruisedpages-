import React from 'react';
import { useArchive } from '../context/ArchiveContext';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, ScrollText, Image as ImageIcon, ChevronRight, Sparkles, PlusCircle } from 'lucide-react';
import { Comic } from '../types';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
  onReadComic: (comicId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenLogin,
  onReadComic,
}) => {
  const { comics, characters, lore, artworks, settings } = useArchive();
  const { isAdmin } = useAuth();

  const publishedComics = comics.filter((c) => c.published || isAdmin);
  const featuredComic = publishedComics[0];
  const hasContent = publishedComics.length > 0 || characters.length > 0 || lore.length > 0 || artworks.length > 0;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Brand Header */}
      <section className="text-center pt-8 sm:pt-14 pb-8 max-w-4xl mx-auto px-4 relative">
        <div className="inline-block mb-3">
          <span className="ink-stamp text-xs sm:text-sm">
            PERSONAL INDIE COMIC ARCHIVE
          </span>
        </div>

        <h1 className="font-typewriter font-black text-4xl sm:text-6xl md:text-7xl text-[#f0ece1] tracking-wider mb-4 uppercase flair-title-shadow">
          {settings.siteTitle || 'BRUISED PAGES'}
        </h1>

        <p className="font-typewriter italic text-sm sm:text-lg text-[#a4b2a8] max-w-2xl mx-auto tracking-widest leading-relaxed uppercase opacity-80">
          {settings.tagline || 'A HOME FOR MY COMICS, CHARACTERS & STORIES.'}
        </p>

        <div className="mt-6 flex justify-center items-center space-x-3 text-[10px] font-typewriter tracking-[0.25em] text-[#67776d] uppercase">
          <span>REF: ARC-SYS-01</span>
          <span>•</span>
          <span>AUTONOMOUS AUTHOR PLATFORM</span>
          <span>•</span>
          <span className="text-[#7d1e1e]">UNFILTERED</span>
        </div>
      </section>

      {/* When ZERO content exists: Exact Empty-State specified */}
      {!hasContent ? (
        <section className="max-w-2xl mx-auto px-4">
          <div className="relative">
            {/* Distressed Box with Artistic Flair accents */}
            <div className="dashed-archive-box p-8 sm:p-14 text-center rounded-xs">
              {/* Tape corner decals */}
              <div className="tape-corner-tr" />
              <div className="tape-corner-bl" />

              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#0a0f0c] border border-[#27382d] flex items-center justify-center text-[#7e998b]">
                <BookOpen className="w-8 h-8 opacity-80" />
              </div>

              <h2 className="font-typewriter font-bold text-2xl sm:text-3xl text-[#eae5d8] tracking-wider mb-3 flair-header-shadow">
                NO PAGES YET.
              </h2>

              <p className="font-typewriter text-xs sm:text-sm text-[#9daaa1] max-w-md mx-auto mb-8 tracking-widest uppercase opacity-75">
                The archive is waiting to be filled.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAdmin ? (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1a1a1a] hover:bg-[#4a0e0e] border border-[#383838] hover:border-[#7d1e1e] text-[#f2f7f4] font-typewriter text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-2 shadow-xl"
                  >
                    <PlusCircle className="w-4 h-4 text-[#8de2ad]" />
                    <span>OPEN CREATOR DASHBOARD</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenLogin}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#121814] hover:bg-[#4a0e0e] border border-[#2b3e32] hover:border-[#7d1e1e] text-[#dce6df] font-typewriter text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-2"
                  >
                    <span>ENTER CREATOR PORTAL</span>
                    <ChevronRight className="w-4 h-4 text-[#889b90]" />
                  </button>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-[#1a251e] text-[10px] font-typewriter text-[#607166] tracking-wider uppercase">
                Upload comics, character dossiers, lore documents, or artwork in the Creator Dashboard.
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Dynamic Populated Homepage once content exists */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Featured / Latest Chapter Banner */}
          {featuredComic && (
            <section className="rough-panel rounded-sm p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <span className="ink-stamp text-[10px] sm:text-xs">
                  {featuredComic.published ? 'LATEST RELEASE' : 'DRAFT IN ARCHIVE'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Cover Image */}
                <div className="md:col-span-4 lg:col-span-3">
                  <div className="relative group overflow-hidden border border-[#27382d] bg-[#0c120e] shadow-2xl aspect-[3/4] max-h-[380px] mx-auto rounded-sm">
                    {featuredComic.coverUrl ? (
                      <img
                        src={featuredComic.coverUrl}
                        alt={featuredComic.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#68786f] text-center">
                        <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                        <span className="font-sketch text-xs">NO COVER FILED</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comic Details */}
                <div className="md:col-span-8 lg:col-span-9 space-y-4">
                  <div className="text-xs font-typewriter text-[#88988e] flex items-center space-x-2">
                    {featuredComic.chapterNumber && (
                      <span className="px-2 py-0.5 bg-[#17251d] border border-[#293d30] text-[#9ae0b1] rounded">
                        CHAPTER {featuredComic.chapterNumber}
                      </span>
                    )}
                    <span>•</span>
                    <span>{featuredComic.pages?.length || 0} PAGES</span>
                    {featuredComic.publishedAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(featuredComic.publishedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-typewriter font-bold text-2xl sm:text-4xl text-[#eae5d8] tracking-wide flair-header-shadow">
                    {featuredComic.title}
                  </h2>

                  <p className="font-body text-base sm:text-lg text-[#b8c5bc] leading-relaxed line-clamp-3">
                    {featuredComic.description || 'No description recorded.'}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onReadComic(featuredComic.id)}
                      className="px-6 py-3 bg-[#4a0e0e] hover:bg-[#7d1e1e] border border-[#7d1e1e] text-[#ffffff] font-typewriter text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center space-x-2 shadow-lg"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>READ NOW</span>
                    </button>
                    <button
                      onClick={() => onNavigate('comics')}
                      className="px-5 py-3 bg-[#131d17] hover:bg-[#4a0e0e] hover:text-white border border-[#283b30] hover:border-[#7d1e1e] text-[#ccd7cf] font-typewriter text-xs tracking-[0.2em] uppercase transition-all"
                    >
                      BROWSE ALL COMICS
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Quick Navigation Archives Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Comics */}
            <div
              onClick={() => onNavigate('comics')}
              className="dashed-archive-box p-6 cursor-pointer group hover:border-[#7d1e1e] transition-all"
            >
              <div className="tape-corner-tr" />
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-6 h-6 text-[#7da38d] group-hover:text-[#ffffff] transition-colors" />
                <span className="text-[10px] font-typewriter tracking-widest text-[#7d1e1e]">
                  {publishedComics.length} {publishedComics.length === 1 ? 'ENTRY' : 'ENTRIES'}
                </span>
              </div>
              <h3 className="font-typewriter font-bold text-base text-[#eae5d8] mb-1 group-hover:text-[#ffffff] tracking-wider">
                COMICS ARCHIVE
              </h3>
              <p className="font-sketch text-xs text-[#8c9a91]">
                Read serialized chapters and standalone episodes.
              </p>
            </div>

            {/* Characters */}
            <div
              onClick={() => onNavigate('characters')}
              className="dashed-archive-box p-6 cursor-pointer group hover:border-[#7d1e1e] transition-all"
            >
              <div className="tape-corner-tr" />
              <div className="flex items-center justify-between mb-4">
                <Users className="w-6 h-6 text-[#7da38d] group-hover:text-[#ffffff] transition-colors" />
                <span className="text-[10px] font-typewriter tracking-widest text-[#7d1e1e]">
                  {characters.length} {characters.length === 1 ? 'DOSSIER' : 'DOSSIERS'}
                </span>
              </div>
              <h3 className="font-typewriter font-bold text-base text-[#eae5d8] mb-1 group-hover:text-[#ffffff] tracking-wider">
                CHARACTER FILES
              </h3>
              <p className="font-sketch text-xs text-[#8c9a91]">
                Character profiles, personality logs, and variants.
              </p>
            </div>

            {/* Lore */}
            <div
              onClick={() => onNavigate('lore')}
              className="dashed-archive-box p-6 cursor-pointer group hover:border-[#7d1e1e] transition-all"
            >
              <div className="tape-corner-tr" />
              <div className="flex items-center justify-between mb-4">
                <ScrollText className="w-6 h-6 text-[#7da38d] group-hover:text-[#ffffff] transition-colors" />
                <span className="text-[10px] font-typewriter tracking-widest text-[#7d1e1e]">
                  {lore.length} {lore.length === 1 ? 'RECORD' : 'RECORDS'}
                </span>
              </div>
              <h3 className="font-typewriter font-bold text-base text-[#eae5d8] mb-1 group-hover:text-[#ffffff] tracking-wider">
                LORE DOSSIERS
              </h3>
              <p className="font-sketch text-xs text-[#8c9a91]">
                World-building, artifacts, faction histories, and notes.
              </p>
            </div>

            {/* Artwork */}
            <div
              onClick={() => onNavigate('artwork')}
              className="dashed-archive-box p-6 cursor-pointer group hover:border-[#7d1e1e] transition-all"
            >
              <div className="tape-corner-tr" />
              <div className="flex items-center justify-between mb-4">
                <ImageIcon className="w-6 h-6 text-[#7da38d] group-hover:text-[#ffffff] transition-colors" />
                <span className="text-[10px] font-typewriter tracking-widest text-[#7d1e1e]">
                  {artworks.length} {artworks.length === 1 ? 'PIECE' : 'PIECES'}
                </span>
              </div>
              <h3 className="font-typewriter font-bold text-base text-[#eae5d8] mb-1 group-hover:text-[#ffffff] tracking-wider">
                ART GALLERY
              </h3>
              <p className="font-sketch text-xs text-[#8c9a91]">
                Illustrations, concept sketches, and raw doodles.
              </p>
            </div>
          </section>

          {/* Recent Artwork Strip if present */}
          {artworks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#202c24] pb-2">
                <h3 className="font-display font-bold text-lg text-[#eae5d8] tracking-wider flex items-center space-x-2">
                  <span>RECENT ARTWORK</span>
                </h3>
                <button
                  onClick={() => onNavigate('artwork')}
                  className="text-xs font-typewriter text-[#88988e] hover:text-[#e4ded0] transition-colors"
                >
                  VIEW GALLERY →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {artworks.slice(0, 6).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onNavigate('artwork')}
                    className="relative group cursor-pointer aspect-square bg-[#0b100d] border border-[#212f26] overflow-hidden rounded-sm"
                  >
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <span className="text-[11px] font-display font-bold text-white truncate">
                        {art.title}
                      </span>
                      <span className="text-[9px] font-typewriter text-[#a7b5ac]">
                        {art.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
};
