import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Lock, X, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isSetup, login, setupMasterPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isSetup) {
        if (password.length < 50) {
          setError(`Passphrase must be at least 50 characters (currently ${password.length})`);
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passphrases do not match');
          setLoading(false);
          return;
        }
        const res = await setupMasterPassword(password);
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Failed to setup creator account.');
        }
      } else {
        const res = await login(password);
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Invalid passphrase.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0d1310] border border-[#263a2e] rounded-sm p-6 sm:p-8 shadow-2xl">
        {/* Subtle Top Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 tape-strip rotate-1 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#788880] hover:text-[#e0ded8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-[#17251d] border border-[#2c4234] rounded text-[#8de2ad]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[#e6e2d6] tracking-wider">
              {isSetup ? 'CREATOR AUTHENTICATION' : 'INITIALIZE CREATOR KEY'}
            </h3>
            <p className="text-xs font-typewriter text-[#88988e]">
              {isSetup
                ? 'Enter your master creator passphrase'
                : 'Set your secure creator password'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-[#241313] border border-[#522121] rounded flex items-center space-x-2 text-xs text-[#f2a7a7]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#e65c5c]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-typewriter text-[#a1b0a7] uppercase tracking-wider">
                {isSetup ? 'Master Passphrase' : 'New Master Passphrase (min 50 chars)'}
              </label>
              {!isSetup && (
                <span className={`text-[10px] font-mono ${password.length >= 50 ? 'text-[#8de2ad]' : 'text-[#e68484]'}`}>
                  {password.length}/50 min
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080c0a] border border-[#223328] focus:border-[#426450] focus:outline-none px-3.5 py-2.5 text-sm text-[#e6e2d6] rounded font-mono"
              />
              <Lock className="w-4 h-4 absolute right-3 top-3 text-[#586b60]" />
            </div>
          </div>

          {!isSetup && (
            <div>
              <label className="block text-xs font-typewriter text-[#a1b0a7] mb-1.5 uppercase tracking-wider">
                Confirm Master Passphrase
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080c0a] border border-[#223328] focus:border-[#426450] focus:outline-none px-3.5 py-2.5 text-sm text-[#e6e2d6] rounded font-mono"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1d3527] hover:bg-[#274835] border border-[#3b5e48] text-[#f0f6f2] font-display text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Key className="w-4 h-4 text-[#8de2ad]" />
              <span>{loading ? 'VERIFYING...' : isSetup ? 'ENTER ARCHIVE' : 'SAVE & LOG IN'}</span>
            </button>
          </div>
        </form>

        <div className="mt-5 text-center text-[10px] font-typewriter text-[#55675e]">
          Protected Area — Only the verified archive author may publish or modify records.
        </div>
      </div>
    </div>
  );
};
