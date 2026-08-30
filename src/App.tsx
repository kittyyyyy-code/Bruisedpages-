import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ArchiveProvider, useArchive } from './context/ArchiveContext';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { ComicsView } from './components/ComicsView';
import { ComicReaderView } from './components/ComicReaderView';
import { CharactersView } from './components/CharactersView';
import { LoreView } from './components/LoreView';
import { ArtworkView } from './components/ArtworkView';
import { AboutView } from './components/AboutView';
import { CreatorDashboard } from './components/CreatorDashboard';
import { LoginModal } from './components/LoginModal';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeComicId, setActiveComicId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const { isAdmin } = useAuth();
  const { settings } = useArchive();

  const handleReadComic = (comicId: string) => {
    setActiveComicId(comicId);
    setCurrentTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitReader = () => {
    setActiveComicId(null);
    setCurrentTab('comics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0c0b] text-[#c2c5c0] flex flex-col selection:bg-[#4a0e0e] selection:text-[#ffffff] relative">
      {/* Film grain / texture overlay */}
      <div className="fixed inset-0 grain-overlay pointer-events-none z-50 opacity-30" />
      {/* Artistic Flair Inset Vignette */}
      <div className="fixed inset-0 flair-vignette pointer-events-none z-40" />

      {/* Main Navigation (hidden during fullscreen reader mode) */}
      {currentTab !== 'reader' && (
        <Navigation
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            if (tab === 'dashboard' && !isAdmin) {
              setIsLoginModalOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onSelectComic={handleReadComic}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 relative z-10">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={(tab) => {
              if (tab === 'dashboard' && !isAdmin) {
                setIsLoginModalOpen(true);
              } else {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onReadComic={handleReadComic}
          />
        )}

        {currentTab === 'comics' && (
          <ComicsView
            onReadComic={handleReadComic}
            onNavigate={(tab) => {
              if (tab === 'dashboard' && !isAdmin) {
                setIsLoginModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'reader' && activeComicId && (
          <ComicReaderView
            comicId={activeComicId}
            onBack={handleExitReader}
            onSelectComic={handleReadComic}
          />
        )}

        {currentTab === 'characters' && (
          <CharactersView
            onNavigate={(tab) => {
              if (tab === 'dashboard' && !isAdmin) {
                setIsLoginModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onReadComic={handleReadComic}
          />
        )}

        {currentTab === 'lore' && (
          <LoreView
            onNavigate={(tab) => {
              if (tab === 'dashboard' && !isAdmin) {
                setIsLoginModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onReadComic={handleReadComic}
          />
        )}

        {currentTab === 'artwork' && (
          <ArtworkView
            onNavigate={(tab) => {
              if (tab === 'dashboard' && !isAdmin) {
                setIsLoginModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'about' && (
          <AboutView
            onNavigate={(tab) => {
              if (tab === 'dashboard' && !isAdmin) {
                setIsLoginModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          isAdmin ? (
            <CreatorDashboard />
          ) : (
            <div className="py-20 text-center">
              <p className="font-typewriter text-xs text-[#88988e] mb-4">
                Creator authentication required to access dashboard.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 bg-[#17251d] text-[#dce6df] font-typewriter text-xs rounded border border-[#2d4234] hover:bg-[#4a0e0e] transition-colors"
              >
                OPEN LOGIN
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer (hidden in reader mode) */}
      {currentTab !== 'reader' && (
        <footer className="border-t border-[#1a231d] bg-[#070b09]/80 backdrop-blur-sm py-10 px-4 text-center space-y-3 mt-16 relative z-10">
          <div className="flex items-center justify-center space-x-3 text-xs font-typewriter tracking-[0.2em] text-[#7a857e] uppercase">
            <span className="font-bold text-[#c2c5c0]">{settings.siteTitle || 'BRUISED PAGES'}</span>
            <span>•</span>
            <span>INDEPENDENT ARCHIVE</span>
            <span>•</span>
            <span className="text-[#7d1e1e]">REF: ARCH-2026</span>
          </div>
          <p className="font-sketch text-xs text-[#59695f] max-w-md mx-auto italic">
            {settings.tagline || 'A HOME FOR MY COMICS, CHARACTERS & STORIES.'}
          </p>
          <div className="text-[10px] font-typewriter text-[#48564e] pt-2">
            All original works, illustrations & stories © {new Date().getFullYear()}{' '}
            {settings.creatorName ? `${settings.creatorName}.` : 'Author.'} All rights reserved.
          </div>
        </footer>
      )}

      {/* Login / Initial Setup Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setCurrentTab('dashboard');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ArchiveProvider>
        <MainApp />
      </ArchiveProvider>
    </AuthProvider>
  );
}
