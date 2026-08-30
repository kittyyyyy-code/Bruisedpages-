import React from 'react';
import { useArchive } from '../context/ArchiveContext';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Globe, Sparkles, Feather, FileText, ExternalLink } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, onOpenLogin }) => {
  const { settings } = useArchive();
  const { isAdmin } = useAuth();

  const hasAboutContent = Boolean(
    settings.aboutBio || settings.aboutStatement || settings.creatorName
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="inline-block">
          <span className="ink-stamp text-xs">COLOPHON & DOSSIER</span>
        </div>
        <h1 className="font-typewriter font-bold text-3xl sm:text-5xl text-[#eae5d8] tracking-wider uppercase flair-header-shadow">
          ABOUT BRUISED PAGES
        </h1>
        <p className="font-typewriter italic text-xs sm:text-sm text-[#9daaa1] max-w-xl mx-auto tracking-widest uppercase opacity-75">
          An autonomous, independent home for original comics, serialized narratives, and dark visual archives.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="dashed-archive-box rounded-xs p-6 sm:p-10 relative overflow-hidden space-y-8">
        {/* Tape corner decals */}
        <div className="tape-corner-tr" />
        <div className="tape-corner-bl" />

        {/* Artist Statement & Bio */}
        {hasAboutContent ? (
          <div className="space-y-8">
            {settings.creatorName && (
              <div className="border-b border-[#202c24] pb-4">
                <span className="text-[10px] font-typewriter tracking-widest text-[#7c8e84] uppercase">AUTHOR / ILLUSTRATOR</span>
                <h2 className="font-typewriter font-bold text-2xl text-[#f0ece2] tracking-wide">
                  {settings.creatorName}
                </h2>
              </div>
            )}

            {settings.aboutBio && (
              <div className="space-y-2">
                <h3 className="font-typewriter text-xs font-bold uppercase tracking-[0.2em] text-[#9fe1b6] flex items-center space-x-2">
                  <Feather className="w-3.5 h-3.5" />
                  <span>CREATOR BIOGRAPHY</span>
                </h3>
                <div className="font-body text-base sm:text-lg text-[#cad6ce] leading-relaxed whitespace-pre-line">
                  {settings.aboutBio}
                </div>
              </div>
            )}

            {settings.aboutStatement && (
              <div className="space-y-2 pt-4 border-t border-[#1c2921]">
                <h3 className="font-typewriter text-xs font-bold uppercase tracking-[0.2em] text-[#9fe1b6] flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>ARTISTIC STATEMENT & MANIFESTO</span>
                </h3>
                <div className="font-body text-base sm:text-lg text-[#b8c7be] leading-relaxed whitespace-pre-line italic">
                  "{settings.aboutStatement}"
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty about state with helpful instructions */
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#0a0f0c] border border-[#23352a] flex items-center justify-center text-[#7c9487]">
              <User className="w-7 h-7" />
            </div>
            <h3 className="font-typewriter font-bold text-xl text-[#eae5d8] tracking-wider uppercase flair-header-shadow">
              NO AUTHOR BIO FILED YET
            </h3>
            <p className="font-typewriter text-xs sm:text-sm text-[#8c9c92] max-w-md mx-auto tracking-widest uppercase opacity-75">
              This space is reserved for your personal artist statement, publishing background, and project manifestos.
            </p>
            {isAdmin ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#4a0e0e] border border-[#333] hover:border-[#7d1e1e] text-[#f2f7f4] font-typewriter text-xs font-bold tracking-[0.2em] uppercase transition-all"
              >
                EDIT ABOUT DETAILS IN DASHBOARD
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-6 py-3 bg-[#121814] hover:bg-[#4a0e0e] border border-[#223328] hover:border-[#7d1e1e] text-[#c9d6ce] hover:text-white font-typewriter text-xs tracking-[0.2em] uppercase transition-all"
              >
                CREATOR LOGIN
              </button>
            )}
          </div>
        )}

        {/* Social / Contact Links */}
        <div className="pt-6 border-t border-[#1f2d24] space-y-4">
          <h4 className="font-display text-xs font-bold tracking-wider text-[#98a99f] uppercase">
            DISPATCHES & EXTERNAL LINKS
          </h4>

          <div className="flex flex-wrap gap-3">
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="px-3.5 py-2 bg-[#101713] hover:bg-[#1a251f] border border-[#223227] text-[#cad6ce] text-xs font-typewriter rounded flex items-center space-x-2 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#889b90]" />
                <span>{settings.contactEmail}</span>
              </a>
            )}

            {settings.socialLinks?.twitter && (
              <a
                href={settings.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#101713] hover:bg-[#1a251f] border border-[#223227] text-[#cad6ce] text-xs font-typewriter rounded flex items-center space-x-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#889b90]" />
                <span>X / TWITTER</span>
              </a>
            )}

            {settings.socialLinks?.instagram && (
              <a
                href={settings.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#101713] hover:bg-[#1a251f] border border-[#223227] text-[#cad6ce] text-xs font-typewriter rounded flex items-center space-x-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#889b90]" />
                <span>INSTAGRAM</span>
              </a>
            )}

            {settings.socialLinks?.bluesky && (
              <a
                href={settings.socialLinks.bluesky}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#101713] hover:bg-[#1a251f] border border-[#223227] text-[#cad6ce] text-xs font-typewriter rounded flex items-center space-x-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#889b90]" />
                <span>BLUESKY</span>
              </a>
            )}

            {settings.socialLinks?.patreon && (
              <a
                href={settings.socialLinks.patreon}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#1d1414] hover:bg-[#2b1b1b] border border-[#442525] text-[#f2bebe] text-xs font-typewriter rounded flex items-center space-x-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#e68484]" />
                <span>PATREON</span>
              </a>
            )}

            {settings.socialLinks?.kofi && (
              <a
                href={settings.socialLinks.kofi}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#101713] hover:bg-[#1a251f] border border-[#223227] text-[#cad6ce] text-xs font-typewriter rounded flex items-center space-x-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#889b90]" />
                <span>KO-FI</span>
              </a>
            )}

            {settings.socialLinks?.website && (
              <a
                href={settings.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#101713] hover:bg-[#1a251f] border border-[#223227] text-[#cad6ce] text-xs font-typewriter rounded flex items-center space-x-2 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#889b90]" />
                <span>EXTERNAL WEBSITE</span>
              </a>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-[#1a251e] flex flex-col sm:flex-row items-center justify-between text-[11px] font-typewriter text-[#64756b] gap-2">
          <span>BRUISED PAGES INDIE ENGINE</span>
          <span>AUTONOMOUS PERSONAL ARCHIVE</span>
        </div>
      </div>
    </div>
  );
};
