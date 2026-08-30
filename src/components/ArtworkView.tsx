import React, { useState } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from './EmptyState';
import { Image as ImageIcon, PlusCircle, X, ZoomIn, Calendar, Tag } from 'lucide-react';
import { Artwork, ArtworkCategory } from '../types';

interface ArtworkViewProps {
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
}

const CATEGORIES: ('ALL' | ArtworkCategory)[] = [
  'ALL',
  'Illustration',
  'Sketch',
  'Character Art',
  'Concept Art',
  'Doodle',
  'Other',
];

export const ArtworkView: React.FC<ArtworkViewProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { artworks } = useArchive();
  const { isAdmin } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'ALL' | ArtworkCategory>('ALL');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const filteredArtworks = artworks.filter((art) => {
    if (activeCategory === 'ALL') return true;
    return art.category === activeCategory;
  });

  if (artworks.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          title="NO ARTWORK IN THE GALLERY YET."
          subtitle="The gallery walls are currently bare. Sketches, concept paintings, and illustrations will appear here once published."
          actionText="Upload Artwork"
          onAction={() => onNavigate('dashboard')}
          onOpenLogin={onOpenLogin}
          icon={<ImageIcon className="w-7 h-7" />}
          category="artwork"
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
            <span className="ink-stamp text-[10px]">VISUAL EXHIBIT</span>
            <span className="text-xs font-typewriter text-[#7b8c82]">
              PIECES CATALOGED: {artworks.length}
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#eae5d8] tracking-wider">
            ARTWORK & SKETCHBOOK
          </h2>
          <p className="font-sketch text-sm text-[#9aa8a0] mt-1">
            Original illustrations, loose ink sketches, developmental concepts, and studies.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-1.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#8de2ad]" />
            <span>UPLOAD ARTWORK</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const count = cat === 'ALL' ? artworks.length : artworks.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-typewriter tracking-wider rounded border transition-all flex items-center space-x-1.5 ${
                activeCategory === cat
                  ? 'bg-[#1a2d21] border-[#37523f] text-[#a4e6bc]'
                  : 'bg-[#0c120f] border-[#1e2a22] text-[#7d8e83] hover:text-[#d3ded7]'
              }`}
            >
              <span>{cat.toUpperCase()}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="text-center py-16 text-[#7b8c82] font-typewriter text-sm">
          No artwork logged under "{activeCategory}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredArtworks.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArtwork(art)}
              className="rough-panel rounded-sm overflow-hidden flex flex-col group cursor-pointer hover:border-[#3d5a47] transition-all"
            >
              {/* Image Container with tape corners */}
              <div className="relative aspect-square bg-[#070b09] overflow-hidden">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Category badge */}
                <div className="absolute top-2.5 left-2.5 bg-[#0c130f]/90 border border-[#233429] px-2 py-0.5 text-[9px] font-typewriter text-[#9ce0b3] backdrop-blur-xs">
                  {art.category}
                </div>

                {/* Hover zoom icon overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-2.5 bg-black/70 rounded-full text-white border border-white/20">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Title and date info */}
              <div className="p-3.5 bg-[#0d1310] border-t border-[#1e2a22] flex items-center justify-between">
                <div className="overflow-hidden pr-2">
                  <h4 className="font-display font-bold text-xs text-[#eae5d8] group-hover:text-[#f8f5ee] truncate">
                    {art.title}
                  </h4>
                  {art.notes && (
                    <p className="font-sketch text-[11px] text-[#8e9f94] truncate mt-0.5">
                      {art.notes}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-typewriter text-[#65766c] shrink-0">
                  {new Date(art.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-5xl max-h-[95vh] flex flex-col bg-[#0b100d] border border-[#2a3e31] rounded-sm overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/70 hover:bg-black/95 text-white rounded-full border border-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High Res Artwork */}
            <div className="flex-1 overflow-auto max-h-[75vh] flex items-center justify-center bg-[#050806] p-2">
              <img
                src={selectedArtwork.imageUrl}
                alt={selectedArtwork.title}
                className="max-w-full max-h-[72vh] object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Info Footer */}
            <div className="p-4 sm:p-6 bg-[#0d1410] border-t border-[#1f2d24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="ink-stamp text-[9px]">{selectedArtwork.category}</span>
                  <span className="text-xs font-typewriter text-[#889a8f]">
                    CATALOG DATE: {new Date(selectedArtwork.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-[#eae5d8]">
                  {selectedArtwork.title}
                </h3>
                {selectedArtwork.notes && (
                  <p className="font-sketch text-xs text-[#abb8af] mt-1">
                    {selectedArtwork.notes}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <a
                  href={selectedArtwork.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#17251d] hover:bg-[#25392d] border border-[#2b4032] text-[#dce6df] font-typewriter text-xs rounded transition-colors inline-block"
                >
                  OPEN ORIGINAL FILE ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
