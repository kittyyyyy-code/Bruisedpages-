import React, { useState } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from './EmptyState';
import { Users, User, PlusCircle, X, Sparkles, BookOpen, Tag } from 'lucide-react';
import { Character } from '../types';

interface CharactersViewProps {
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
  onReadComic?: (comicId: string) => void;
}

export const CharactersView: React.FC<CharactersViewProps> = ({
  onNavigate,
  onOpenLogin,
  onReadComic,
}) => {
  const { characters, comics } = useArchive();
  const { isAdmin } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  if (characters.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          title="NO CHARACTER FILES YET."
          subtitle="The character index is waiting for entries. Individual dossiers, personality logs, and lore notes will appear here once added."
          actionText="Create Character Dossier"
          onAction={() => onNavigate('dashboard')}
          onOpenLogin={onOpenLogin}
          icon={<Users className="w-7 h-7" />}
          category="characters"
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
            <span className="ink-stamp text-[10px]">PERSONNEL DOSSIERS</span>
            <span className="text-xs font-typewriter text-[#7b8c82]">
              FILED PROFILES: {characters.length}
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#eae5d8] tracking-wider">
            CHARACTER FILES
          </h2>
          <p className="font-sketch text-sm text-[#9aa8a0] mt-1">
            Archival records, traits, and background dossiers for original characters.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-1.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#8de2ad]" />
            <span>NEW CHARACTER</span>
          </button>
        )}
      </div>

      {/* Characters Dossier Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {characters.map((char) => (
          <div
            key={char.id}
            onClick={() => setSelectedCharacter(char)}
            className="rough-panel rounded-sm overflow-hidden flex flex-col cursor-pointer group hover:border-[#3d5a47] transition-all"
          >
            {/* Character Portrait */}
            <div className="relative aspect-[4/5] bg-[#070c09] overflow-hidden border-b border-[#1f2d24]">
              {char.imageUrl ? (
                <img
                  src={char.imageUrl}
                  alt={char.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#586960] text-center">
                  <User className="w-16 h-16 mb-2 opacity-40" />
                  <span className="font-sketch text-xs tracking-wider">NO PORTRAIT ATTACHED</span>
                </div>
              )}

              {/* Species / Variant Pill */}
              {char.species && (
                <div className="absolute top-3 left-3 bg-[#0d1511]/90 border border-[#2a3c30] px-2.5 py-0.5 text-[10px] font-typewriter text-[#9fe1b6] backdrop-blur-xs">
                  {char.species}
                </div>
              )}
            </div>

            {/* Dossier Summary */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-typewriter text-[#7b8c82]">
                  {char.age && <span>AGE: {char.age}</span>}
                  <span>FILE ID: {char.id.slice(-6).toUpperCase()}</span>
                </div>

                <h3 className="font-display font-black text-2xl text-[#eae5d8] group-hover:text-[#f8f5ee] transition-colors">
                  {char.name}
                </h3>

                <p className="font-body text-sm text-[#abb9af] line-clamp-3 leading-relaxed">
                  {char.description || 'No overview filed.'}
                </p>
              </div>

              {/* View Dossier trigger */}
              <div className="pt-2 border-t border-[#1a251e] flex items-center justify-between text-xs font-typewriter text-[#889a8f] group-hover:text-[#cde2d6]">
                <span>VIEW COMPLETE DOSSIER</span>
                <span>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Dossier Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0b100d] border border-[#263a2e] rounded-sm shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            {/* Distress top tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-5 tape-strip rotate-1 pointer-events-none" />

            <button
              onClick={() => setSelectedCharacter(null)}
              className="absolute top-4 right-4 text-[#788a80] hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Portrait Left */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-[4/5] bg-[#070b09] border border-[#223328] overflow-hidden rounded-sm">
                  {selectedCharacter.imageUrl ? (
                    <img
                      src={selectedCharacter.imageUrl}
                      alt={selectedCharacter.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#55675d]">
                      <User className="w-16 h-16 opacity-40" />
                    </div>
                  )}
                </div>

                {/* Quick Info Box */}
                <div className="p-3.5 bg-[#0e1612] border border-[#1e2d23] space-y-1.5 text-xs font-typewriter text-[#8d9e94]">
                  {selectedCharacter.species && (
                    <div><strong className="text-[#c4d6cb]">SPECIES:</strong> {selectedCharacter.species}</div>
                  )}
                  {selectedCharacter.age && (
                    <div><strong className="text-[#c4d6cb]">AGE:</strong> {selectedCharacter.age}</div>
                  )}
                  {selectedCharacter.personality && (
                    <div><strong className="text-[#c4d6cb]">TRAITS:</strong> {selectedCharacter.personality}</div>
                  )}
                </div>
              </div>

              {/* Details Right */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <div className="ink-stamp text-[9px] mb-1">OFFICIAL DOSSIER</div>
                  <h2 className="font-display font-black text-3xl text-[#eae5d8]">
                    {selectedCharacter.name}
                  </h2>
                </div>

                {/* Overview */}
                <div className="space-y-1">
                  <h4 className="font-display text-xs tracking-wider text-[#9fe1b6] uppercase">
                    Description & Background
                  </h4>
                  <p className="font-body text-base text-[#bcc8bf] leading-relaxed whitespace-pre-line">
                    {selectedCharacter.description || 'No background description provided.'}
                  </p>
                </div>

                {/* Extended Lore */}
                {selectedCharacter.lore && (
                  <div className="space-y-1 pt-2 border-t border-[#1c2920]">
                    <h4 className="font-display text-xs tracking-wider text-[#9fe1b6] uppercase">
                      Archive Lore
                    </h4>
                    <p className="font-body text-sm text-[#b0beb4] leading-relaxed whitespace-pre-line">
                      {selectedCharacter.lore}
                    </p>
                  </div>
                )}

                {/* Fun Facts */}
                {selectedCharacter.funFacts && selectedCharacter.funFacts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#1c2920]">
                    <h4 className="font-display text-xs tracking-wider text-[#9fe1b6] uppercase">
                      Notes & Fun Facts
                    </h4>
                    <ul className="space-y-1.5 list-disc list-inside font-sketch text-xs text-[#abb9b0]">
                      {selectedCharacter.funFacts.map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comic Appearances */}
                {selectedCharacter.comicAppearances && selectedCharacter.comicAppearances.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#1c2920]">
                    <h4 className="font-display text-xs tracking-wider text-[#9fe1b6] uppercase">
                      Comic Appearances
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.comicAppearances.map((app, idx) => {
                        const matchedComic = comics.find((c) => c.id === app || c.title === app);
                        return (
                          <span
                            key={idx}
                            onClick={() => {
                              if (matchedComic && onReadComic) {
                                setSelectedCharacter(null);
                                onReadComic(matchedComic.id);
                              }
                            }}
                            className={`px-2.5 py-1 text-xs font-typewriter rounded border ${
                              matchedComic
                                ? 'bg-[#15241b] border-[#2f4837] text-[#9ee1b7] cursor-pointer hover:bg-[#1e3427]'
                                : 'bg-[#101713] border-[#223026] text-[#8e9f95]'
                            }`}
                          >
                            <BookOpen className="w-3 h-3 inline mr-1 opacity-70" />
                            {matchedComic ? matchedComic.title : app}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
