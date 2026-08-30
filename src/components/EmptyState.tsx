import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, PlusCircle, Sparkles, FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
  onOpenLogin?: () => void;
  icon?: React.ReactNode;
  category?: 'comics' | 'characters' | 'lore' | 'artwork' | 'general';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  onOpenLogin,
  icon,
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="relative my-12 max-w-2xl mx-auto px-4">
      {/* Main Empty Container */}
      <div className="dashed-archive-box rounded-xs p-8 sm:p-12 text-center relative overflow-hidden">
        {/* Tape corner decals */}
        <div className="tape-corner-tr" />
        <div className="tape-corner-bl" />

        {/* Subtle background halftone watermark */}
        <div className="absolute inset-0 halftone-bg opacity-30 pointer-events-none" />

        {/* Vintage Stamp */}
        <div className="mb-6 flex justify-center">
          <div className="ink-stamp text-xs sm:text-sm">
            ARCHIVE STATUS : UNFILED
          </div>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#0a0f0c] border border-[#263b2f] flex items-center justify-center text-[#738b7d]">
          {icon || <FileQuestion className="w-7 h-7" />}
        </div>

        {/* Title */}
        <h3 className="font-typewriter font-bold text-2xl sm:text-3xl text-[#eae5d8] tracking-wider mb-2 uppercase flair-header-shadow">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="font-typewriter text-xs sm:text-sm text-[#9ea9a2] max-w-md mx-auto mb-8 tracking-widest uppercase opacity-75 leading-relaxed">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAdmin && onAction ? (
            <button
              onClick={onAction}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1a1a1a] hover:bg-[#4a0e0e] border border-[#333333] hover:border-[#7d1e1e] text-[#f2f7f4] font-typewriter text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <PlusCircle className="w-4 h-4 text-[#8de2ad]" />
              <span>{actionText || 'Add New Entry'}</span>
            </button>
          ) : !isAdmin && onOpenLogin ? (
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#121814] hover:bg-[#4a0e0e] border border-[#2b3d32] hover:border-[#7d1e1e] text-[#d6ded9] hover:text-white font-typewriter text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-2"
            >
              <Shield className="w-3.5 h-3.5 text-[#889b90]" />
              <span>CREATOR LOGIN / ADMIN</span>
            </button>
          ) : null}
        </div>

        {/* Subtle Bottom Instruction Note */}
        <div className="mt-8 pt-6 border-t border-[#1a241e] text-[10px] font-typewriter tracking-wider text-[#64746b] uppercase">
          {isAdmin
            ? 'You are logged in as Creator. Upload files anytime via the Creator Dashboard.'
            : 'Independent publishing platform. Content will populate once published by the author.'}
        </div>
      </div>
    </div>
  );
};
