import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useArchive } from '../context/ArchiveContext';
import { BookOpen, Users, ScrollText, Image, User, Shield, LogOut, Menu, X, Key, Home } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenLogin: () => void;
  onSelectComic?: (comicId: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenLogin,
}) => {
  const { isAdmin, logout, isSetup } = useAuth();
  const { settings, comics } = useArchive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'comics', label: 'COMICS', icon: BookOpen, count: comics.length },
    { id: 'characters', label: 'CHARACTERS', icon: Users },
    { id: 'lore', label: 'LORE', icon: ScrollText },
    { id: 'artwork', label: 'ARTWORK', icon: Image },
    { id: 'about', label: 'ABOUT', icon: User },
  ];

  return (
    <header className="relative border-b border-[#202923] bg-[#090d0b]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Subtle top red distress line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#7d1e1e] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer group flex flex-col justify-center"
            id="brand-logo"
          >
            <div className="flex items-center space-x-2.5">
              <span className="font-typewriter font-black text-2xl sm:text-3xl text-[#e6e1d5] tracking-wider group-hover:text-[#ffffff] transition-colors flair-title-shadow">
                {settings.siteTitle || 'BRUISED PAGES'}
              </span>
              <span className="text-[9px] uppercase font-typewriter tracking-[0.25em] px-1.5 py-0.5 bg-[#14221a] border border-[#2b3d32] text-[#8e9f93] rounded-xs">
                ARCHIVE
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-typewriter italic text-[#808d84] tracking-widest mt-0.5 max-w-sm sm:max-w-md truncate uppercase">
              {settings.tagline || 'A HOME FOR MY COMICS, CHARACTERS & STORIES.'}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    setCurrentTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative px-3 py-1.5 font-typewriter text-xs font-medium tracking-[0.2em] transition-all flex items-center space-x-1.5 border ${
                    isActive
                      ? 'text-[#ffffff] bg-[#4a0e0e]/50 border-[#7d1e1e] shadow-sm'
                      : 'text-[#9ca8a0] border-transparent hover:text-[#ffffff] hover:bg-[#121915] hover:border-[#26352c]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Rotated status indicator from theme */}
            <div className="hidden xl:block ml-2 mr-1">
              <div className="px-2 py-1 border border-[#1e2722] bg-[#070a08] transform -rotate-1 shadow-sm text-left">
                <div className="text-[8px] uppercase tracking-tighter text-[#7d1e1e] font-typewriter font-bold leading-tight">
                  SYS: ONLINE
                </div>
                <div className="text-[8px] uppercase tracking-tighter text-[#5c6e63] font-typewriter leading-tight">
                  COMICS: {comics.length}
                </div>
              </div>
            </div>

            {/* Admin Portal / Access button */}
            <div className="pl-3 ml-2 border-l border-[#202923] flex items-center">
              {isAdmin ? (
                <div className="flex items-center space-x-2">
                  <button
                    id="nav-dashboard"
                    onClick={() => {
                      setCurrentTab('dashboard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 text-xs font-typewriter tracking-widest border transition-all flex items-center space-x-1.5 ${
                      currentTab === 'dashboard'
                        ? 'bg-[#4a0e0e] border-[#7d1e1e] text-white shadow-md'
                        : 'bg-[#15241b] border-[#364d3d] text-[#c5dacb] hover:bg-[#4a0e0e] hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#98e2ac]" />
                    <span>DASHBOARD</span>
                  </button>
                  <button
                    id="nav-logout"
                    onClick={logout}
                    title="Log Out Creator Session"
                    className="p-1.5 text-[#8b978f] hover:text-[#e68484] hover:bg-[#1a1212] border border-[#2b2424] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="nav-creator-login"
                  onClick={onOpenLogin}
                  title="Creator Login"
                  className="px-3 py-1.5 text-[11px] font-typewriter tracking-widest text-[#a3b1a8] hover:text-white bg-[#121915] hover:bg-[#4a0e0e] border border-[#233128] hover:border-[#7d1e1e] transition-all flex items-center space-x-1.5"
                >
                  <Key className="w-3 h-3 text-[#7d1e1e]" />
                  <span>{isSetup ? 'CREATOR LOGIN' : 'SETUP CREATOR'}</span>
                </button>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            {isAdmin && (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-2 py-1 text-xs bg-[#6b1b1b] text-white font-typewriter rounded flex items-center space-x-1"
              >
                <Shield className="w-3 h-3" />
                <span>ADMIN</span>
              </button>
            )}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#9ca8a0] hover:text-[#f0ece1] bg-[#121915] border border-[#202b24] rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#202923] bg-[#0c110e] space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left font-display text-sm tracking-wider flex items-center space-x-2.5 ${
                    isActive
                      ? 'text-[#f0ece1] bg-[#18261e] border-l-2 border-[#8c2828]'
                      : 'text-[#9ca8a0] hover:text-[#dcd7c9] hover:bg-[#121a16]'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-[#1e2621] px-4">
              {isAdmin ? (
                <div className="flex items-center justify-between py-1">
                  <button
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-typewriter text-[#98e2ac] flex items-center space-x-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>CREATOR DASHBOARD</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-[#e68484] flex items-center space-x-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>LOGOUT</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-typewriter text-[#9daaa2] bg-[#141e18] border border-[#243329] rounded"
                >
                  {isSetup ? 'CREATOR LOGIN' : 'SETUP CREATOR'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
