import React, { useState, useEffect, useRef } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Columns,
  Scroll,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Layers,
  Settings,
  Share2,
} from 'lucide-react';

interface ComicReaderViewProps {
  comicId: string;
  onBack: () => void;
  onSelectComic: (comicId: string) => void;
}

export const ComicReaderView: React.FC<ComicReaderViewProps> = ({
  comicId,
  onBack,
  onSelectComic,
}) => {
  const { comics } = useArchive();
  const { isAdmin } = useAuth();
  const currentComic = comics.find((c) => c.id === comicId || c.slug === comicId);

  const [currentPage, setCurrentPage] = useState(0);
  const [readingMode, setReadingMode] = useState<'vertical' | 'paged'>('paged');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 100%, 125%, 80%
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pages = currentComic?.pages || [];
  const publishedComics = comics.filter((c) => c.published || isAdmin);
  const currentComicIndex = publishedComics.findIndex((c) => c.id === comicId);
  const prevComic = currentComicIndex > 0 ? publishedComics[currentComicIndex - 1] : null;
  const nextComic = currentComicIndex < publishedComics.length - 1 ? publishedComics[currentComicIndex + 1] : null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onBack();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (readingMode === 'paged' && currentPage < pages.length - 1) {
          setCurrentPage((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (readingMode === 'paged' && currentPage > 0) {
          setCurrentPage((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, readingMode, onBack]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Scroll to page in vertical mode
  const scrollToPage = (index: number) => {
    setCurrentPage(index);
    if (readingMode === 'vertical') {
      pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!currentComic) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-display text-2xl text-[#eae5d8] mb-3">COMIC NOT FOUND</h2>
        <p className="font-typewriter text-xs text-[#8e9f94] mb-6">
          The requested chronicle has not been filed in this archive.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-[#17251d] hover:bg-[#253a2e] text-[#dce6df] font-typewriter text-xs rounded border border-[#2d4234]"
        >
          ← RETURN TO ARCHIVE
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#050706] text-[#dcd7c9] flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="sticky top-0 z-30 bg-[#080d0a]/95 backdrop-blur-md border-b border-[#1b261f] px-4 py-3 flex items-center justify-between shadow-lg">
        {/* Left: Back & Comic Info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 text-[#8da094] hover:text-[#f2eee3] hover:bg-[#152119] border border-[#202d24] rounded transition-all flex items-center space-x-1"
            title="Return to Comics Archive (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-typewriter hidden sm:inline">ARCHIVE</span>
          </button>

          <div className="border-l border-[#1f2d23] pl-3">
            <h2 className="font-display font-bold text-sm sm:text-base text-[#eae5d8] truncate max-w-[200px] sm:max-w-md">
              {currentComic.title}
            </h2>
            {currentComic.chapterNumber && (
              <span className="text-[10px] font-typewriter text-[#88988f]">
                CHAPTER {currentComic.chapterNumber}
              </span>
            )}
          </div>
        </div>

        {/* Center: Page Counter & Quick Jump */}
        {pages.length > 0 && (
          <div className="flex items-center space-x-2 bg-[#0e1612] px-3 py-1 border border-[#223328] rounded">
            <span className="font-typewriter text-xs text-[#9eb1a5]">PAGE</span>
            <select
              value={currentPage}
              onChange={(e) => scrollToPage(Number(e.target.value))}
              className="bg-[#141f19] text-xs font-typewriter text-[#eae5d8] border border-[#2c4033] rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
            >
              {pages.map((_, idx) => (
                <option key={idx} value={idx}>
                  {String(idx + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="font-typewriter text-xs text-[#718579]">
              / {String(pages.length).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Right: Reading Mode, Zoom, Fullscreen Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Mode Switch */}
          <div className="flex items-center bg-[#0d1410] border border-[#1f2e24] rounded p-0.5">
            <button
              onClick={() => setReadingMode('paged')}
              title="Page by Page Mode"
              className={`p-1.5 rounded text-xs transition-colors flex items-center space-x-1 ${
                readingMode === 'paged'
                  ? 'bg-[#1b2b21] text-[#9de2b4]'
                  : 'text-[#6f8075] hover:text-[#d0dcd4]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="text-[10px] font-typewriter hidden md:inline">SINGLE</span>
            </button>
            <button
              onClick={() => setReadingMode('vertical')}
              title="Vertical Scroll / Webtoon Mode"
              className={`p-1.5 rounded text-xs transition-colors flex items-center space-x-1 ${
                readingMode === 'vertical'
                  ? 'bg-[#1b2b21] text-[#9de2b4]'
                  : 'text-[#6f8075] hover:text-[#d0dcd4]'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span className="text-[10px] font-typewriter hidden md:inline">SCROLL</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center space-x-1 bg-[#0d1410] border border-[#1f2e24] rounded px-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
              className="p-1 text-[#788a7e] hover:text-[#d0dcd4]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-typewriter text-[#88988e] w-8 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 15, 150))}
              className="p-1 text-[#788a7e] hover:text-[#d0dcd4]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-[#8da094] hover:text-[#f2eee3] bg-[#0e1612] border border-[#202e24] rounded"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Comic Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 overflow-y-auto">
        {pages.length === 0 ? (
          /* Empty Comic State */
          <div className="text-center py-20 max-w-md mx-auto p-8 rough-panel">
            <BookOpen className="w-12 h-12 mx-auto text-[#5e7166] mb-4 opacity-60" />
            <h3 className="font-display text-xl text-[#eae5d8] mb-2">NO PAGES ATTACHED</h3>
            <p className="font-sketch text-sm text-[#93a298] mb-6">
              This comic entry was registered without page images.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-[#17251d] hover:bg-[#253a2e] text-[#dce6df] font-typewriter text-xs rounded border border-[#2d4234]"
            >
              RETURN TO ARCHIVE
            </button>
          </div>
        ) : readingMode === 'paged' ? (
          /* Paged Reading Mode (Single Page Presentation) */
          <div
            className="flex flex-col items-center max-w-full transition-all duration-200"
            style={{ width: `${Math.min(zoomLevel, 100)}%`, maxWidth: `${(zoomLevel / 100) * 1000}px` }}
          >
            {/* Page Display */}
            <div className="relative group bg-[#0a0f0c] border border-[#1e2a22] shadow-2xl overflow-hidden rounded-xs min-h-[500px] flex items-center justify-center w-full">
              <img
                src={pages[currentPage]?.imageUrl}
                alt={`Page ${currentPage + 1}`}
                className="w-full h-auto max-h-[88vh] object-contain mx-auto select-none"
                referrerPolicy="no-referrer"
              />

              {/* Page Click Navigation Areas */}
              <div
                onClick={() => currentPage > 0 && setCurrentPage((p) => p - 1)}
                className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize"
                title="Previous Page (Left Arrow)"
              />
              <div
                onClick={() => currentPage < pages.length - 1 && setCurrentPage((p) => p + 1)}
                className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize"
                title="Next Page (Right Arrow / Space)"
              />

              {/* On-screen floating arrows on hover */}
              {currentPage > 0 && (
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {currentPage < pages.length - 1 && (
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Page Caption if present */}
              {pages[currentPage]?.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/80 p-3 text-center text-xs font-sketch text-[#dcd7c9] border-t border-[#263a2e]">
                  {pages[currentPage].caption}
                </div>
              )}
            </div>

            {/* Bottom Paged Navigation Buttons */}
            <div className="w-full mt-4 flex items-center justify-between px-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-5 py-2.5 bg-[#121c16] hover:bg-[#1d2d23] disabled:opacity-30 disabled:pointer-events-none border border-[#24362b] text-[#dce6df] font-typewriter text-xs rounded transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PREVIOUS PAGE</span>
              </button>

              <span className="font-typewriter text-xs text-[#829388]">
                PAGE {currentPage + 1} OF {pages.length}
              </span>

              <button
                disabled={currentPage === pages.length - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-5 py-2.5 bg-[#121c16] hover:bg-[#1d2d23] disabled:opacity-30 disabled:pointer-events-none border border-[#24362b] text-[#dce6df] font-typewriter text-xs rounded transition-colors flex items-center space-x-1"
              >
                <span>NEXT PAGE</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Vertical Webtoon Continuous Scroll Mode */
          <div
            className="flex flex-col items-center space-y-4 w-full"
            style={{ maxWidth: `${(zoomLevel / 100) * 850}px` }}
          >
            {pages.map((page, idx) => (
              <div
                key={page.id || idx}
                ref={(el) => (pageRefs.current[idx] = el)}
                className="relative bg-[#0a0f0c] border border-[#1b2720] shadow-xl w-full overflow-hidden"
              >
                <img
                  src={page.imageUrl}
                  alt={`Page ${idx + 1}`}
                  className="w-full h-auto object-contain block"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 text-[9px] font-typewriter text-[#88988e] rounded">
                  {idx + 1}
                </div>
                {page.caption && (
                  <div className="p-3 bg-[#0d1410] border-t border-[#1e2d24] text-center font-sketch text-xs text-[#a4b4aa]">
                    {page.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Chapter Transition Footer */}
        <div className="w-full max-w-2xl mt-14 pt-8 border-t border-[#1d2921] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {prevComic ? (
            <button
              onClick={() => onSelectComic(prevComic.id)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#0f1712] hover:bg-[#19271f] border border-[#223328] text-[#ccd8d0] font-typewriter text-xs rounded flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREV: {prevComic.title}</span>
            </button>
          ) : <div />}

          <button
            onClick={onBack}
            className="text-xs font-display tracking-wider text-[#8b9c91] hover:text-[#f0ece1] underline decoration-[#35483b] underline-offset-4"
          >
            BACK TO COMICS ARCHIVE
          </button>

          {nextComic ? (
            <button
              onClick={() => onSelectComic(nextComic.id)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#17261d] hover:bg-[#243b2d] border border-[#2e4736] text-[#e3f0e8] font-typewriter text-xs rounded flex items-center justify-center space-x-2"
            >
              <span>NEXT: {nextComic.title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
};
