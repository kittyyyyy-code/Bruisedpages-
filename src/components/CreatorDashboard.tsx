import React, { useState, useRef } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Users,
  ScrollText,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Upload,
  Check,
  Eye,
  EyeOff,
  Download,
  FileCode,
  Save,
  AlertTriangle,
  Layers,
  Key,
  HelpCircle,
  X,
} from 'lucide-react';
import { Comic, ComicPage, Character, LoreEntry, Artwork, ArtworkCategory } from '../types';

type DashboardTab = 'comics' | 'characters' | 'lore' | 'artwork' | 'settings';

export const CreatorDashboard: React.FC = () => {
  const {
    comics,
    characters,
    lore,
    artworks,
    settings,
    saveComic,
    deleteComic,
    togglePublishComic,
    saveCharacter,
    deleteCharacter,
    saveLore,
    deleteLore,
    saveArtwork,
    deleteArtwork,
    saveSettings,
    uploadImage,
  } = useArchive();

  const { changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('comics');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // =================== COMICS FORM STATE ===================
  const [editingComic, setEditingComic] = useState<Partial<Comic> | null>(null);
  const [comicPages, setComicPages] = useState<ComicPage[]>([]);
  const [isUploadingPages, setIsUploadingPages] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pagesInputRef = useRef<HTMLInputElement>(null);

  const startNewComic = () => {
    setEditingComic({
      title: '',
      slug: '',
      chapterNumber: '',
      description: '',
      coverUrl: '',
      published: false,
    });
    setComicPages([]);
  };

  const editExistingComic = (comic: Comic) => {
    setEditingComic({ ...comic });
    setComicPages([...(comic.pages || [])]);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const url = await uploadImage(file);
      setEditingComic((prev) => (prev ? { ...prev, coverUrl: url } : prev));
      showNotice('Cover image uploaded successfully.');
    } catch (err: any) {
      showNotice('Cover upload failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMultiPagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingPages(true);
    try {
      const newUploadedPages: ComicPage[] = [];
      const fileList = (Array.from(files) as File[]).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const url = await uploadImage(file);
        newUploadedPages.push({
          id: `page-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          pageNumber: comicPages.length + i + 1,
          imageUrl: url,
          caption: '',
        });
      }

      setComicPages((prev) => [...prev, ...newUploadedPages]);
      showNotice(`Successfully uploaded ${newUploadedPages.length} comic pages.`);
    } catch (err: any) {
      showNotice('Error uploading pages: ' + err.message, 'error');
    } finally {
      setIsUploadingPages(false);
      if (pagesInputRef.current) pagesInputRef.current.value = '';
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === comicPages.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...comicPages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // update page numbers
    const reindexed = updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setComicPages(reindexed);
  };

  const removePage = (index: number) => {
    const updated = comicPages.filter((_, idx) => idx !== index);
    const reindexed = updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setComicPages(reindexed);
  };

  const handleSaveComic = async (publishStatus?: boolean) => {
    if (!editingComic?.title?.trim()) {
      showNotice('Comic title is required.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const payload: Partial<Comic> = {
        ...editingComic,
        pages: comicPages,
        published: publishStatus !== undefined ? publishStatus : (editingComic.published ?? false),
        publishedAt: (publishStatus ?? editingComic.published)
          ? editingComic.publishedAt || new Date().toISOString()
          : undefined,
      };

      const res = await saveComic(payload);
      if (res.success) {
        showNotice(`Comic "${editingComic.title}" saved successfully.`);
        setEditingComic(null);
        setComicPages([]);
      } else {
        showNotice('Failed to save comic: ' + res.error, 'error');
      }
    } catch (err: any) {
      showNotice('Error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // =================== CHARACTERS FORM STATE ===================
  const [editingCharacter, setEditingCharacter] = useState<Partial<Character> | null>(null);
  const [funFactsList, setFunFactsList] = useState<string[]>([]);
  const [newFunFact, setNewFunFact] = useState('');
  const charImageInputRef = useRef<HTMLInputElement>(null);

  const startNewCharacter = () => {
    setEditingCharacter({
      name: '',
      species: '',
      age: '',
      personality: '',
      description: '',
      lore: '',
      imageUrl: '',
      comicAppearances: [],
    });
    setFunFactsList([]);
  };

  const editExistingCharacter = (char: Character) => {
    setEditingCharacter({ ...char });
    setFunFactsList([...(char.funFacts || [])]);
  };

  const handleCharImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const url = await uploadImage(file);
      setEditingCharacter((prev) => (prev ? { ...prev, imageUrl: url } : prev));
      showNotice('Character portrait uploaded.');
    } catch (err: any) {
      showNotice('Portrait upload failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCharacter = async () => {
    if (!editingCharacter?.name?.trim()) {
      showNotice('Character name is required.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const payload: Partial<Character> = {
        ...editingCharacter,
        funFacts: funFactsList,
      };
      const res = await saveCharacter(payload);
      if (res.success) {
        showNotice(`Character "${editingCharacter.name}" saved.`);
        setEditingCharacter(null);
      } else {
        showNotice('Failed to save character: ' + res.error, 'error');
      }
    } catch (err: any) {
      showNotice('Error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // =================== LORE FORM STATE ===================
  const [editingLore, setEditingLore] = useState<Partial<LoreEntry> | null>(null);
  const loreImageInputRef = useRef<HTMLInputElement>(null);

  const startNewLore = () => {
    setEditingLore({
      title: '',
      category: 'World',
      content: '',
      imageUrl: '',
      relatedCharacterIds: [],
      relatedComicIds: [],
    });
  };

  const editExistingLore = (l: LoreEntry) => {
    setEditingLore({ ...l });
  };

  const handleLoreImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const url = await uploadImage(file);
      setEditingLore((prev) => (prev ? { ...prev, imageUrl: url } : prev));
      showNotice('Lore visual uploaded.');
    } catch (err: any) {
      showNotice('Upload failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveLore = async () => {
    if (!editingLore?.title?.trim()) {
      showNotice('Lore title is required.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await saveLore(editingLore);
      if (res.success) {
        showNotice(`Lore document "${editingLore.title}" saved.`);
        setEditingLore(null);
      } else {
        showNotice('Failed to save lore: ' + res.error, 'error');
      }
    } catch (err: any) {
      showNotice('Error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // =================== ARTWORK FORM STATE ===================
  const [editingArtwork, setEditingArtwork] = useState<Partial<Artwork> | null>(null);
  const [artworkCategory, setArtworkCategory] = useState<ArtworkCategory>('Illustration');
  const [artworkTitle, setArtworkTitle] = useState('');
  const [artworkNotes, setArtworkNotes] = useState('');
  const artFileInputRef = useRef<HTMLInputElement>(null);

  const handleArtUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadImage(file);
        const autoTitle = artworkTitle.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        await saveArtwork({
          title: autoTitle,
          category: artworkCategory,
          imageUrl: url,
          notes: artworkNotes,
          createdAt: new Date().toISOString(),
        });
      }
      showNotice(`Successfully uploaded artwork file(s).`);
      setArtworkTitle('');
      setArtworkNotes('');
      if (artFileInputRef.current) artFileInputRef.current.value = '';
    } catch (err: any) {
      showNotice('Artwork upload failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // =================== SETTINGS & PASSWORD ===================
  const [settingsForm, setSettingsForm] = useState(settings);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const ok = await saveSettings(settingsForm);
    setIsProcessing(false);
    if (ok) showNotice('Site settings updated.');
    else showNotice('Failed to update settings.', 'error');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPass) {
      showNotice('New passphrases do not match.', 'error');
      return;
    }
    if (newPassword.length < 50) {
      showNotice(`Passphrase must be at least 50 characters (currently ${newPassword.length}).`, 'error');
      return;
    }
    setIsProcessing(true);
    const res = await changePassword(currPassword, newPassword);
    setIsProcessing(false);
    if (res.success) {
      showNotice('Master creator passphrase updated.');
      setCurrPassword('');
      setNewPassword('');
      setConfirmNewPass('');
    } else {
      showNotice(res.error || 'Failed to update passphrase.', 'error');
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bruised_pages_token')}`,
        },
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bruised-pages-archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotice('Archive backup downloaded.');
    } catch (err: any) {
      showNotice('Export failed: ' + err.message, 'error');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bruised_pages_token')}`,
        },
        body: JSON.stringify(json),
      });
      if (res.ok) {
        showNotice('Archive restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotice('Failed to restore backup.', 'error');
      }
    } catch (err: any) {
      showNotice('Import error: ' + err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div
          className={`fixed top-24 right-6 z-50 p-4 rounded-sm border shadow-xl flex items-center space-x-3 text-xs font-typewriter ${
            feedbackMsg.type === 'success'
              ? 'bg-[#0f2116] border-[#31543c] text-[#a6ebbe]'
              : 'bg-[#291111] border-[#5e2222] text-[#f7a8a8]'
          }`}
        >
          {feedbackMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#202c24] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="ink-stamp text-[10px]">CREATOR CONTROL DESK</span>
            <span className="text-xs font-typewriter text-[#88e2a8]">● AUTHENTICATED AS MASTER ARCHIVIST</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#eae5d8] tracking-wider uppercase">
            CREATOR DASHBOARD
          </h1>
          <p className="font-sketch text-sm text-[#9aa8a0] mt-1">
            Create, edit, organize, and publish your original comics, characters, lore, and artwork.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 bg-[#121c16] hover:bg-[#1b2b22] border border-[#263a2e] text-[#cde0d5] text-xs font-typewriter rounded flex items-center space-x-1.5 transition-colors"
            title="Download JSON backup of all comics, lore, and art"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT ARCHIVE</span>
          </button>
        </div>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1d2721] pb-2">
        <button
          onClick={() => {
            setActiveTab('comics');
            setEditingComic(null);
          }}
          className={`px-4 py-2 text-xs font-display font-bold tracking-wider uppercase rounded transition-all flex items-center space-x-2 ${
            activeTab === 'comics'
              ? 'bg-[#1b2e22] border border-[#3b5e48] text-[#a4e6bc]'
              : 'bg-[#0d1310] border border-[#1b251f] text-[#86978e] hover:text-[#dce7e0]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>COMICS ({comics.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('characters');
            setEditingCharacter(null);
          }}
          className={`px-4 py-2 text-xs font-display font-bold tracking-wider uppercase rounded transition-all flex items-center space-x-2 ${
            activeTab === 'characters'
              ? 'bg-[#1b2e22] border border-[#3b5e48] text-[#a4e6bc]'
              : 'bg-[#0d1310] border border-[#1b251f] text-[#86978e] hover:text-[#dce7e0]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>CHARACTERS ({characters.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('lore');
            setEditingLore(null);
          }}
          className={`px-4 py-2 text-xs font-display font-bold tracking-wider uppercase rounded transition-all flex items-center space-x-2 ${
            activeTab === 'lore'
              ? 'bg-[#1b2e22] border border-[#3b5e48] text-[#a4e6bc]'
              : 'bg-[#0d1310] border border-[#1b251f] text-[#86978e] hover:text-[#dce7e0]'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>LORE ({lore.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('artwork')}
          className={`px-4 py-2 text-xs font-display font-bold tracking-wider uppercase rounded transition-all flex items-center space-x-2 ${
            activeTab === 'artwork'
              ? 'bg-[#1b2e22] border border-[#3b5e48] text-[#a4e6bc]'
              : 'bg-[#0d1310] border border-[#1b251f] text-[#86978e] hover:text-[#dce7e0]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>ARTWORK ({artworks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-display font-bold tracking-wider uppercase rounded transition-all flex items-center space-x-2 ${
            activeTab === 'settings'
              ? 'bg-[#1b2e22] border border-[#3b5e48] text-[#a4e6bc]'
              : 'bg-[#0d1310] border border-[#1b251f] text-[#86978e] hover:text-[#dce7e0]'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>SETTINGS & BACKUP</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* =================== TAB 1: COMICS ===================== */}
      {/* ======================================================== */}
      {activeTab === 'comics' && (
        <div className="space-y-8">
          {editingComic ? (
            /* COMIC EDITOR */
            <div className="rough-panel rounded-sm p-6 sm:p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-[#202c24] pb-4">
                <div className="flex items-center space-x-2">
                  <span className="ink-stamp text-[10px]">
                    {editingComic.id ? 'EDITING COMIC' : 'NEW COMIC ENTRY'}
                  </span>
                  <h2 className="font-display font-black text-2xl text-[#eae5d8]">
                    {editingComic.title || 'Untitled Comic Chapter'}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingComic(null)}
                  className="text-xs font-typewriter text-[#88988f] hover:text-white px-3 py-1.5 bg-[#121c16] border border-[#223328] rounded"
                >
                  CANCEL
                </button>
              </div>

              {/* Top Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Cover Image Upload Column */}
                <div className="md:col-span-4 space-y-3">
                  <label className="block text-xs font-typewriter text-[#9daea4] uppercase">
                    Cover Image
                  </label>
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="aspect-[3/4] bg-[#080d0a] border-2 border-dashed border-[#293d30] hover:border-[#4b6f58] rounded-sm flex flex-col items-center justify-center p-4 cursor-pointer relative group overflow-hidden"
                  >
                    {editingComic.coverUrl ? (
                      <>
                        <img
                          src={editingComic.coverUrl}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-typewriter">
                          <Upload className="w-6 h-6 mb-1" />
                          <span>REPLACE COVER</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-2 text-[#63756b]">
                        <Upload className="w-8 h-8 mx-auto" />
                        <span className="block text-xs font-typewriter">CLICK TO UPLOAD COVER</span>
                        <span className="block text-[10px]">JPG, PNG, WEBP</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </div>

                {/* Metadata Fields Column */}
                <div className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                        Comic Title *
                      </label>
                      <input
                        type="text"
                        value={editingComic.title || ''}
                        onChange={(e) => setEditingComic({ ...editingComic, title: e.target.value })}
                        placeholder="e.g. Chapter 01: The Bleeding Horizon"
                        className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-display"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                        Chapter / Issue #
                      </label>
                      <input
                        type="text"
                        value={editingComic.chapterNumber ?? ''}
                        onChange={(e) => setEditingComic({ ...editingComic, chapterNumber: e.target.value })}
                        placeholder="e.g. 01 or Prologue"
                        className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-typewriter"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                      Synopsis / Chapter Description
                    </label>
                    <textarea
                      rows={4}
                      value={editingComic.description || ''}
                      onChange={(e) => setEditingComic({ ...editingComic, description: e.target.value })}
                      placeholder="Write a brief synopsis or logline for this comic issue..."
                      className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#ccd8cf] px-3.5 py-2.5 rounded font-body"
                    />
                  </div>

                  {/* Status Indicator */}
                  <div className="p-3 bg-[#0e1612] border border-[#1f2d24] rounded flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-typewriter">
                      <span className="text-[#889a8f]">CURRENT STATE:</span>
                      {editingComic.published ? (
                        <span className="text-[#8ee2ae] font-bold">● PUBLISHED (LIVE)</span>
                      ) : (
                        <span className="text-[#f0a3a3] font-bold">○ DRAFT (HIDDEN FROM VISITORS)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comic Pages Batch Manager */}
              <div className="space-y-4 pt-6 border-t border-[#1f2d24]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#eae5d8] flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-[#88e2a8]" />
                      <span>COMIC PAGES ({comicPages.length})</span>
                    </h3>
                    <p className="text-xs font-sketch text-[#8b9b91]">
                      Upload single or multiple sequential pages. Reorder, caption, or replace pages anytime.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => pagesInputRef.current?.click()}
                      disabled={isUploadingPages}
                      className="px-4 py-2 bg-[#1b3324] hover:bg-[#254632] border border-[#3b6148] text-[#eef7f2] font-display text-xs font-bold tracking-wider uppercase rounded flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingPages ? 'UPLOADING...' : 'UPLOAD MULTIPLE PAGES'}</span>
                    </button>
                    <input
                      ref={pagesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultiPagesUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Pages List / Grid */}
                {comicPages.length === 0 ? (
                  <div
                    onClick={() => pagesInputRef.current?.click()}
                    className="p-10 border-2 border-dashed border-[#233529] hover:border-[#3d5946] rounded-sm text-center cursor-pointer bg-[#080d0a]"
                  >
                    <Upload className="w-10 h-10 mx-auto text-[#5a6e62] mb-2" />
                    <h4 className="font-display text-base text-[#dce7e0]">NO PAGES ATTACHED YET</h4>
                    <p className="font-sketch text-xs text-[#829288] mt-1">
                      Click here to select and upload your comic artwork files (multi-file supported).
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {comicPages.map((page, idx) => (
                      <div
                        key={page.id || idx}
                        className="bg-[#0a0f0c] border border-[#223328] rounded overflow-hidden flex flex-col relative group"
                      >
                        {/* Page Preview */}
                        <div className="relative aspect-[3/4] bg-black">
                          <img
                            src={page.imageUrl}
                            alt={`Page ${idx + 1}`}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/80 text-[10px] font-typewriter text-[#a2e6bc] px-1.5 py-0.5 rounded border border-white/10">
                            PG {idx + 1}
                          </div>
                        </div>

                        {/* Controls (Move up/down, delete) */}
                        <div className="p-2 bg-[#0e1612] border-t border-[#1f2d24] flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => movePage(idx, 'up')}
                              className="p-1 hover:bg-[#1a2920] disabled:opacity-20 text-[#889a8f] hover:text-white rounded"
                              title="Move Earlier"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === comicPages.length - 1}
                              onClick={() => movePage(idx, 'down')}
                              className="p-1 hover:bg-[#1a2920] disabled:opacity-20 text-[#889a8f] hover:text-white rounded"
                              title="Move Later"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removePage(idx)}
                            className="p-1 hover:bg-[#2e1515] text-[#e68484] rounded"
                            title="Remove Page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-6 border-t border-[#202c24] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleSaveComic(false)}
                    className="px-5 py-2.5 bg-[#142019] hover:bg-[#1d2d24] border border-[#2b3e32] text-[#dce6df] font-typewriter text-xs rounded transition-all flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE AS DRAFT</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleSaveComic(true)}
                    className="px-6 py-2.5 bg-[#6b1b1b] hover:bg-[#852222] text-[#fef9f9] font-display text-xs font-bold tracking-widest uppercase rounded shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>PUBLISH COMIC</span>
                  </button>
                </div>

                <button
                  onClick={() => setEditingComic(null)}
                  className="text-xs font-typewriter text-[#7b8c82] hover:text-[#e4ded0]"
                >
                  DISCARD CHANGES
                </button>
              </div>
            </div>
          ) : (
            /* COMICS LISTING IN DASHBOARD */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-[#eae5d8]">
                    REGISTERED COMICS ({comics.length})
                  </h3>
                  <p className="font-sketch text-xs text-[#8e9f94]">
                    Manage draft and live chapters.
                  </p>
                </div>

                <button
                  onClick={startNewComic}
                  className="px-5 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4 text-[#8de2ad]" />
                  <span>CREATE NEW COMIC</span>
                </button>
              </div>

              {comics.length === 0 ? (
                <div className="rough-panel p-10 text-center rounded-sm">
                  <BookOpen className="w-10 h-10 mx-auto text-[#55695e] mb-3 opacity-60" />
                  <h4 className="font-display text-lg text-[#eae5d8]">NO COMICS CREATED YET</h4>
                  <p className="font-sketch text-xs text-[#8c9d92] mt-1 mb-6">
                    Click "Create New Comic" above to publish your first chapter or upload pages.
                  </p>
                  <button
                    onClick={startNewComic}
                    className="px-6 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase"
                  >
                    START FIRST COMIC
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {comics.map((comic) => (
                    <div
                      key={comic.id}
                      className="rough-panel p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-18 bg-black border border-[#223328] overflow-hidden shrink-0 rounded-xs">
                          {comic.coverUrl ? (
                            <img
                              src={comic.coverUrl}
                              alt={comic.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#55675c]">
                              <BookOpen className="w-6 h-6 opacity-40" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 text-[11px] font-typewriter text-[#7b8c82]">
                            {comic.chapterNumber && (
                              <span className="px-1.5 py-0.5 bg-[#14221a] border border-[#263b2f] text-[#9ae0b1] rounded">
                                CH. {comic.chapterNumber}
                              </span>
                            )}
                            <span>•</span>
                            <span>{comic.pages?.length || 0} PAGES</span>
                            <span>•</span>
                            {comic.published ? (
                              <span className="text-[#8de2ad] font-bold">PUBLISHED</span>
                            ) : (
                              <span className="text-[#f29f9f]">DRAFT</span>
                            )}
                          </div>
                          <h4 className="font-display font-bold text-base text-[#eae5d8]">
                            {comic.title}
                          </h4>
                          <p className="font-body text-xs text-[#9aa9a0] line-clamp-1">
                            {comic.description || 'No description'}
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => togglePublishComic(comic.id, !comic.published)}
                          className={`px-3 py-1.5 text-xs font-typewriter rounded border transition-colors flex items-center space-x-1 ${
                            comic.published
                              ? 'bg-[#15231b] border-[#294232] text-[#8de2ad] hover:bg-[#1f3529]'
                              : 'bg-[#291717] border-[#4d2222] text-[#f2a7a7] hover:bg-[#381f1f]'
                          }`}
                        >
                          {comic.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{comic.published ? 'UNPUBLISH' : 'PUBLISH'}</span>
                        </button>

                        <button
                          onClick={() => editExistingComic(comic)}
                          className="p-2 bg-[#121c16] hover:bg-[#1d2d24] border border-[#24352a] text-[#dce6df] rounded"
                          title="Edit Comic"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete comic "${comic.title}"?`)) {
                              await deleteComic(comic.id);
                              showNotice('Comic deleted.');
                            }
                          }}
                          className="p-2 bg-[#1c1212] hover:bg-[#2b1919] border border-[#3b2020] text-[#f28e8e] rounded"
                          title="Delete Comic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ================= TAB 2: CHARACTERS ==================== */}
      {/* ======================================================== */}
      {activeTab === 'characters' && (
        <div className="space-y-8">
          {editingCharacter ? (
            /* CHARACTER EDITOR */
            <div className="rough-panel rounded-sm p-6 sm:p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-[#202c24] pb-4">
                <div className="flex items-center space-x-2">
                  <span className="ink-stamp text-[10px]">
                    {editingCharacter.id ? 'EDITING DOSSIER' : 'NEW CHARACTER DOSSIER'}
                  </span>
                  <h2 className="font-display font-black text-2xl text-[#eae5d8]">
                    {editingCharacter.name || 'Unnamed Character'}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingCharacter(null)}
                  className="text-xs font-typewriter text-[#88988f] hover:text-white px-3 py-1.5 bg-[#121c16] border border-[#223328] rounded"
                >
                  CANCEL
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Portrait */}
                <div className="md:col-span-4 space-y-3">
                  <label className="block text-xs font-typewriter text-[#9daea4] uppercase">
                    Character Portrait
                  </label>
                  <div
                    onClick={() => charImageInputRef.current?.click()}
                    className="aspect-[4/5] bg-[#080d0a] border-2 border-dashed border-[#293d30] hover:border-[#4b6f58] rounded-sm flex flex-col items-center justify-center p-4 cursor-pointer relative group overflow-hidden"
                  >
                    {editingCharacter.imageUrl ? (
                      <>
                        <img
                          src={editingCharacter.imageUrl}
                          alt="Portrait"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-typewriter">
                          <Upload className="w-6 h-6 mb-1" />
                          <span>REPLACE PORTRAIT</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-2 text-[#63756b]">
                        <Upload className="w-8 h-8 mx-auto" />
                        <span className="block text-xs font-typewriter">UPLOAD PORTRAIT</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={charImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCharImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Fields */}
                <div className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                        Character Name *
                      </label>
                      <input
                        type="text"
                        value={editingCharacter.name || ''}
                        onChange={(e) => setEditingCharacter({ ...editingCharacter, name: e.target.value })}
                        placeholder="e.g. Samuel Graves"
                        className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-display"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                        Age
                      </label>
                      <input
                        type="text"
                        value={editingCharacter.age || ''}
                        onChange={(e) => setEditingCharacter({ ...editingCharacter, age: e.target.value })}
                        placeholder="e.g. 29, Unknown"
                        className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-typewriter"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                        Species / Variant
                      </label>
                      <input
                        type="text"
                        value={editingCharacter.species || ''}
                        onChange={(e) => setEditingCharacter({ ...editingCharacter, species: e.target.value })}
                        placeholder="e.g. Human, Specter, Variant A"
                        className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-typewriter"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                        Personality & Key Traits
                      </label>
                      <input
                        type="text"
                        value={editingCharacter.personality || ''}
                        onChange={(e) => setEditingCharacter({ ...editingCharacter, personality: e.target.value })}
                        placeholder="e.g. Morbid, calculating, loyal"
                        className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-typewriter"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                      Description & Background
                    </label>
                    <textarea
                      rows={3}
                      value={editingCharacter.description || ''}
                      onChange={(e) => setEditingCharacter({ ...editingCharacter, description: e.target.value })}
                      placeholder="Summary background of this character..."
                      className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#ccd8cf] px-3.5 py-2.5 rounded font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                      Deep Lore & Archive Notes
                    </label>
                    <textarea
                      rows={3}
                      value={editingCharacter.lore || ''}
                      onChange={(e) => setEditingCharacter({ ...editingCharacter, lore: e.target.value })}
                      placeholder="Extended lore notes, secrets, psychological profile..."
                      className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#ccd8cf] px-3.5 py-2.5 rounded font-body"
                    />
                  </div>

                  {/* Fun Facts List Manager */}
                  <div className="space-y-2 pt-2 border-t border-[#1f2d24]">
                    <label className="block text-xs font-typewriter text-[#9daea4] uppercase">
                      Fun Facts & Minor Trivia
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newFunFact}
                        onChange={(e) => setNewFunFact(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newFunFact.trim()) {
                            e.preventDefault();
                            setFunFactsList([...funFactsList, newFunFact.trim()]);
                            setNewFunFact('');
                          }
                        }}
                        placeholder="Add a fun fact and press Add..."
                        className="flex-1 bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-xs text-[#eae5d8] px-3 py-2 rounded font-sketch"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFunFact.trim()) {
                            setFunFactsList([...funFactsList, newFunFact.trim()]);
                            setNewFunFact('');
                          }
                        }}
                        className="px-3 py-2 bg-[#17251d] hover:bg-[#233a2e] border border-[#2c4033] text-[#dce6df] text-xs font-typewriter rounded"
                      >
                        ADD
                      </button>
                    </div>

                    {funFactsList.length > 0 && (
                      <ul className="space-y-1.5 pt-2">
                        {funFactsList.map((fact, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between p-2 bg-[#0a0f0c] border border-[#1e2a22] rounded text-xs font-sketch text-[#b8c7be]"
                          >
                            <span>• {fact}</span>
                            <button
                              type="button"
                              onClick={() => setFunFactsList(funFactsList.filter((_, i) => i !== idx))}
                              className="text-[#e68484] hover:text-[#ff9999] p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#202c24] flex items-center justify-between">
                <button
                  disabled={isProcessing}
                  onClick={handleSaveCharacter}
                  className="px-6 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-widest uppercase rounded shadow-lg flex items-center space-x-2"
                >
                  <Save className="w-4 h-4 text-[#8de2ad]" />
                  <span>SAVE CHARACTER DOSSIER</span>
                </button>

                <button
                  onClick={() => setEditingCharacter(null)}
                  className="text-xs font-typewriter text-[#7b8c82] hover:text-[#e4ded0]"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            /* CHARACTERS LIST */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-[#eae5d8]">
                    FILED CHARACTERS ({characters.length})
                  </h3>
                  <p className="font-sketch text-xs text-[#8e9f94]">
                    Character dossiers and personnel records.
                  </p>
                </div>

                <button
                  onClick={startNewCharacter}
                  className="px-5 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4 text-[#8de2ad]" />
                  <span>NEW CHARACTER</span>
                </button>
              </div>

              {characters.length === 0 ? (
                <div className="rough-panel p-10 text-center rounded-sm">
                  <Users className="w-10 h-10 mx-auto text-[#55695e] mb-3 opacity-60" />
                  <h4 className="font-display text-lg text-[#eae5d8]">NO CHARACTER DOSSIERS FILED</h4>
                  <p className="font-sketch text-xs text-[#8c9d92] mt-1 mb-6">
                    Add original character profiles with images, traits, and background lore.
                  </p>
                  <button
                    onClick={startNewCharacter}
                    className="px-6 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase"
                  >
                    CREATE FIRST CHARACTER
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      className="rough-panel p-4 rounded-sm flex items-start justify-between space-x-4"
                    >
                      <div className="flex items-start space-x-3 overflow-hidden">
                        <div className="w-14 h-16 bg-black border border-[#223328] overflow-hidden shrink-0 rounded-xs">
                          {char.imageUrl ? (
                            <img
                              src={char.imageUrl}
                              alt={char.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#55675c]">
                              <Users className="w-6 h-6 opacity-40" />
                            </div>
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <h4 className="font-display font-bold text-base text-[#eae5d8] truncate">
                            {char.name}
                          </h4>
                          <span className="text-[11px] font-typewriter text-[#7b8c82] block">
                            {char.species || 'Species unlisted'} {char.age ? `• ${char.age}` : ''}
                          </span>
                          <p className="font-body text-xs text-[#9aa9a0] line-clamp-2 mt-1">
                            {char.description || 'No description.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5 shrink-0">
                        <button
                          onClick={() => editExistingCharacter(char)}
                          className="p-1.5 bg-[#121c16] hover:bg-[#1d2d24] border border-[#24352a] text-[#dce6df] rounded"
                          title="Edit Character"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete character "${char.name}"?`)) {
                              await deleteCharacter(char.id);
                              showNotice('Character deleted.');
                            }
                          }}
                          className="p-1.5 bg-[#1c1212] hover:bg-[#2b1919] border border-[#3b2020] text-[#f28e8e] rounded"
                          title="Delete Character"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* =================== TAB 3: LORE ======================== */}
      {/* ======================================================== */}
      {activeTab === 'lore' && (
        <div className="space-y-8">
          {editingLore ? (
            /* LORE EDITOR */
            <div className="rough-panel rounded-sm p-6 sm:p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-[#202c24] pb-4">
                <div className="flex items-center space-x-2">
                  <span className="ink-stamp text-[10px]">
                    {editingLore.id ? 'EDITING LORE' : 'NEW LORE ENTRY'}
                  </span>
                  <h2 className="font-display font-black text-2xl text-[#eae5d8]">
                    {editingLore.title || 'Untitled Lore Document'}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingLore(null)}
                  className="text-xs font-typewriter text-[#88988f] hover:text-white px-3 py-1.5 bg-[#121c16] border border-[#223328] rounded"
                >
                  CANCEL
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      value={editingLore.title || ''}
                      onChange={(e) => setEditingLore({ ...editingLore, title: e.target.value })}
                      placeholder="e.g. The Fracture of 1984, The Cold City Faction"
                      className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-display"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingLore.category || 'World'}
                      onChange={(e) => setEditingLore({ ...editingLore, category: e.target.value })}
                      placeholder="e.g. World, Factions, Timeline, Artifacts"
                      className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-typewriter"
                    />
                  </div>
                </div>

                {/* Optional Image */}
                <div>
                  <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                    Illustration / Document Visual (Optional)
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => loreImageInputRef.current?.click()}
                      className="px-4 py-2 bg-[#121c16] hover:bg-[#1a2920] border border-[#26392c] text-[#dce6df] text-xs font-typewriter rounded flex items-center space-x-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editingLore.imageUrl ? 'REPLACE IMAGE' : 'UPLOAD IMAGE'}</span>
                    </button>
                    {editingLore.imageUrl && (
                      <span className="text-xs font-typewriter text-[#8de2ad]">Image attached</span>
                    )}
                  </div>
                  <input
                    ref={loreImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLoreImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                    Manuscript & Narrative Content *
                  </label>
                  <textarea
                    rows={8}
                    value={editingLore.content || ''}
                    onChange={(e) => setEditingLore({ ...editingLore, content: e.target.value })}
                    placeholder="Write detailed lore entries, historical records, or world building notes..."
                    className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#ccd8cf] px-3.5 py-2.5 rounded font-body leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#202c24] flex items-center justify-between">
                <button
                  disabled={isProcessing}
                  onClick={handleSaveLore}
                  className="px-6 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-widest uppercase rounded shadow-lg flex items-center space-x-2"
                >
                  <Save className="w-4 h-4 text-[#8de2ad]" />
                  <span>SAVE LORE DOCUMENT</span>
                </button>

                <button
                  onClick={() => setEditingLore(null)}
                  className="text-xs font-typewriter text-[#7b8c82] hover:text-[#e4ded0]"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            /* LORE LIST */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-[#eae5d8]">
                    LORE MANUSCRIPTS ({lore.length})
                  </h3>
                  <p className="font-sketch text-xs text-[#8e9f94]">
                    Historical records and world-building dossiers.
                  </p>
                </div>

                <button
                  onClick={startNewLore}
                  className="px-5 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4 text-[#8de2ad]" />
                  <span>NEW LORE ENTRY</span>
                </button>
              </div>

              {lore.length === 0 ? (
                <div className="rough-panel p-10 text-center rounded-sm">
                  <ScrollText className="w-10 h-10 mx-auto text-[#55695e] mb-3 opacity-60" />
                  <h4 className="font-display text-lg text-[#eae5d8]">NO LORE LOGGED YET</h4>
                  <p className="font-sketch text-xs text-[#8c9d92] mt-1 mb-6">
                    File world background records, timeline events, and notes.
                  </p>
                  <button
                    onClick={startNewLore}
                    className="px-6 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-wider uppercase"
                  >
                    CREATE FIRST LORE ENTRY
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lore.map((entry) => (
                    <div
                      key={entry.id}
                      className="rough-panel p-4 rounded-sm flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-2 text-[11px] font-typewriter text-[#7b8c82]">
                          <span className="px-2 py-0.5 bg-[#121c17] border border-[#233429] text-[#9ae0b1] rounded">
                            {entry.category || 'General'}
                          </span>
                          <span>•</span>
                          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-display font-bold text-base text-[#eae5d8] mt-0.5">
                          {entry.title}
                        </h4>
                        <p className="font-body text-xs text-[#9aa9a0] line-clamp-1">
                          {entry.content}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => editExistingLore(entry)}
                          className="p-2 bg-[#121c16] hover:bg-[#1d2d24] border border-[#24352a] text-[#dce6df] rounded"
                          title="Edit Lore"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete lore entry "${entry.title}"?`)) {
                              await deleteLore(entry.id);
                              showNotice('Lore entry deleted.');
                            }
                          }}
                          className="p-2 bg-[#1c1212] hover:bg-[#2b1919] border border-[#3b2020] text-[#f28e8e] rounded"
                          title="Delete Lore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ================== TAB 4: ARTWORK ====================== */}
      {/* ======================================================== */}
      {activeTab === 'artwork' && (
        <div className="space-y-8">
          {/* Artwork Uploader Box */}
          <div className="rough-panel rounded-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#202c24] pb-4">
              <div className="flex items-center space-x-2">
                <span className="ink-stamp text-[10px]">GALLERY INTAKE</span>
                <h3 className="font-display font-black text-xl text-[#eae5d8]">
                  UPLOAD NEW ARTWORK
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                  Artwork Title (Optional, defaults to file name)
                </label>
                <input
                  type="text"
                  value={artworkTitle}
                  onChange={(e) => setArtworkTitle(e.target.value)}
                  placeholder="e.g. Study in Charcoal No. 4"
                  className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-display"
                />
              </div>

              <div>
                <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                  Category
                </label>
                <select
                  value={artworkCategory}
                  onChange={(e) => setArtworkCategory(e.target.value as ArtworkCategory)}
                  className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-typewriter"
                >
                  <option value="Illustration">Illustration</option>
                  <option value="Sketch">Sketch</option>
                  <option value="Character Art">Character Art</option>
                  <option value="Concept Art">Concept Art</option>
                  <option value="Doodle">Doodle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                Artist Notes / Medium (Optional)
              </label>
              <input
                type="text"
                value={artworkNotes}
                onChange={(e) => setArtworkNotes(e.target.value)}
                placeholder="e.g. Ink and gouache on aged watercolor paper"
                className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-xs text-[#ccd8cf] px-3.5 py-2.5 rounded font-sketch"
              />
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => artFileInputRef.current?.click()}
              className="border-2 border-dashed border-[#293d30] hover:border-[#466a53] bg-[#070b09] rounded p-8 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-[#62766a] mb-2" />
              <span className="font-display font-bold text-sm text-[#dce7e0] block">
                CLICK OR DRAG IMAGES HERE TO UPLOAD
              </span>
              <span className="font-sketch text-xs text-[#829287] block mt-1">
                Supports multiple image files simultaneously (JPG, PNG, WEBP, GIF).
              </span>
            </div>
            <input
              ref={artFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleArtUpload}
              className="hidden"
            />
          </div>

          {/* Current Gallery Grid */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-[#eae5d8]">
              CATALOGED ARTWORK ({artworks.length})
            </h3>

            {artworks.length === 0 ? (
              <div className="text-center py-12 rough-panel">
                <ImageIcon className="w-8 h-8 mx-auto text-[#55695e] mb-2 opacity-50" />
                <p className="font-sketch text-xs text-[#88988e]">
                  No artwork uploaded yet. Use the upload box above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {artworks.map((art) => (
                  <div
                    key={art.id}
                    className="rough-panel rounded overflow-hidden flex flex-col relative group"
                  >
                    <div className="aspect-square bg-black relative">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 text-[8px] font-typewriter text-[#9ce0b3] rounded">
                        {art.category}
                      </div>
                    </div>
                    <div className="p-2 bg-[#0c120f] border-t border-[#1e2a22] flex items-center justify-between text-xs">
                      <span className="font-display font-bold text-[11px] text-[#eae5d8] truncate pr-1">
                        {art.title}
                      </span>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete artwork "${art.title}"?`)) {
                            await deleteArtwork(art.id);
                            showNotice('Artwork deleted.');
                          }
                        }}
                        className="text-[#e68484] hover:text-[#ff9999] p-1 shrink-0"
                        title="Delete Piece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ================= TAB 5: SETTINGS ====================== */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Site Metadata & About Info */}
          <div className="lg:col-span-7 rough-panel rounded-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#202c24] pb-4">
              <h3 className="font-display font-bold text-xl text-[#eae5d8]">
                SITE METADATA & ABOUT BIO
              </h3>
              <p className="font-sketch text-xs text-[#8e9f94]">
                Customize your website identity, artist bio, and manifesto.
              </p>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                  Site Title
                </label>
                <input
                  type="text"
                  value={settingsForm.siteTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteTitle: e.target.value })}
                  className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-display"
                />
              </div>

              <div>
                <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-sketch"
                />
              </div>

              <div>
                <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                  Creator / Author Name
                </label>
                <input
                  type="text"
                  value={settingsForm.creatorName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, creatorName: e.target.value })}
                  placeholder="e.g. Your Name / Pen Name"
                  className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#eae5d8] px-3.5 py-2.5 rounded font-display"
                />
              </div>

              <div>
                <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                  About Biography
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.aboutBio || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aboutBio: e.target.value })}
                  placeholder="Your personal biography, publishing background, comic history..."
                  className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#ccd8cf] px-3.5 py-2.5 rounded font-body"
                />
              </div>

              <div>
                <label className="block text-xs font-typewriter text-[#9daea4] uppercase mb-1">
                  Artistic Statement / Manifesto
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.aboutStatement || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aboutStatement: e.target.value })}
                  placeholder="Your creative vision, aesthetic themes, inspirations..."
                  className="w-full bg-[#080c0a] border border-[#233328] focus:border-[#426450] text-sm text-[#ccd8cf] px-3.5 py-2.5 rounded font-body"
                />
              </div>

              {/* Social & Contact Links */}
              <div className="space-y-3 pt-3 border-t border-[#1f2d24]">
                <label className="block text-xs font-typewriter text-[#9daea4] uppercase">
                  Contact & Social Profiles (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={settingsForm.contactEmail || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    placeholder="Contact Email"
                    className="bg-[#080c0a] border border-[#233328] text-xs font-typewriter px-3 py-2 rounded"
                  />
                  <input
                    type="url"
                    value={settingsForm.socialLinks?.twitter || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socialLinks: { ...settingsForm.socialLinks, twitter: e.target.value },
                      })
                    }
                    placeholder="Twitter / X URL"
                    className="bg-[#080c0a] border border-[#233328] text-xs font-typewriter px-3 py-2 rounded"
                  />
                  <input
                    type="url"
                    value={settingsForm.socialLinks?.instagram || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socialLinks: { ...settingsForm.socialLinks, instagram: e.target.value },
                      })
                    }
                    placeholder="Instagram URL"
                    className="bg-[#080c0a] border border-[#233328] text-xs font-typewriter px-3 py-2 rounded"
                  />
                  <input
                    type="url"
                    value={settingsForm.socialLinks?.patreon || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socialLinks: { ...settingsForm.socialLinks, patreon: e.target.value },
                      })
                    }
                    placeholder="Patreon URL"
                    className="bg-[#080c0a] border border-[#233328] text-xs font-typewriter px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-[#1d3527] hover:bg-[#284836] border border-[#3b5e48] text-[#f2f7f4] font-display text-xs font-bold tracking-widest uppercase rounded shadow-lg flex items-center space-x-2"
                >
                  <Save className="w-4 h-4 text-[#8de2ad]" />
                  <span>SAVE SITE SETTINGS</span>
                </button>
              </div>
            </form>
          </div>

          {/* Master Password & Archive Backup */}
          <div className="lg:col-span-5 space-y-6">
            {/* Change Password */}
            <div className="rough-panel rounded-sm p-6 space-y-4">
              <div className="border-b border-[#202c24] pb-3 flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#8de2ad]" />
                <h4 className="font-display font-bold text-base text-[#eae5d8]">
                  CHANGE MASTER PASSPHRASE
                </h4>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-typewriter text-[#889a8f] uppercase mb-1">
                    Current Passphrase
                  </label>
                  <input
                    type="password"
                    required
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080c0a] border border-[#233328] text-xs font-mono px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-typewriter text-[#889a8f] uppercase">
                      New Passphrase (min 50 chars)
                    </label>
                    <span className={`text-[10px] font-mono ${newPassword.length >= 50 ? 'text-[#8de2ad]' : 'text-[#e68484]'}`}>
                      {newPassword.length}/50 min
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080c0a] border border-[#233328] text-xs font-mono px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-typewriter text-[#889a8f] uppercase mb-1">
                    Confirm New Passphrase
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080c0a] border border-[#233328] text-xs font-mono px-3 py-2 rounded"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2 bg-[#17251d] hover:bg-[#23382c] border border-[#2b3e32] text-[#dce6df] text-xs font-typewriter rounded"
                >
                  UPDATE PASSPHRASE
                </button>
              </form>
            </div>

            {/* Archive Import & Export */}
            <div className="rough-panel rounded-sm p-6 space-y-4">
              <div className="border-b border-[#202c24] pb-3 flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-[#8de2ad]" />
                <h4 className="font-display font-bold text-base text-[#eae5d8]">
                  ARCHIVE BACKUP & RESTORE
                </h4>
              </div>

              <p className="font-sketch text-xs text-[#8c9c92] leading-relaxed">
                Download a complete JSON snapshot of all your comics, characters, lore, and artworks, or restore from a previous backup file.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 bg-[#17251d] hover:bg-[#23382c] border border-[#2b3e32] text-[#dce6df] text-xs font-typewriter rounded flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT COMPLETE JSON BACKUP</span>
                </button>

                <label className="w-full py-2.5 bg-[#101713] hover:bg-[#18231d] border border-[#1f2d24] text-[#a4b4aa] text-xs font-typewriter rounded flex items-center justify-center space-x-2 cursor-pointer transition-colors block text-center">
                  <Upload className="w-4 h-4 inline mr-1" />
                  <span>RESTORE FROM BACKUP FILE</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
