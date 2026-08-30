import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Comic, Character, LoreEntry, Artwork, SiteSettings } from '../types';
import { useAuth } from './AuthContext';

interface ArchiveContextType {
  comics: Comic[];
  characters: Character[];
  lore: LoreEntry[];
  artworks: Artwork[];
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refreshArchive: () => Promise<void>;
  
  // Comic actions
  saveComic: (comic: Partial<Comic>) => Promise<{ success: boolean; comic?: Comic; error?: string }>;
  deleteComic: (id: string) => Promise<boolean>;
  togglePublishComic: (id: string, published: boolean) => Promise<boolean>;

  // Character actions
  saveCharacter: (char: Partial<Character>) => Promise<{ success: boolean; character?: Character; error?: string }>;
  deleteCharacter: (id: string) => Promise<boolean>;

  // Lore actions
  saveLore: (lore: Partial<LoreEntry>) => Promise<{ success: boolean; lore?: LoreEntry; error?: string }>;
  deleteLore: (id: string) => Promise<boolean>;

  // Artwork actions
  saveArtwork: (art: Partial<Artwork>) => Promise<{ success: boolean; artwork?: Artwork; error?: string }>;
  deleteArtwork: (id: string) => Promise<boolean>;

  // Settings
  saveSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;

  // File Upload Helper
  uploadImage: (file: File) => Promise<string>;
}

const defaultSettings: SiteSettings = {
  siteTitle: 'BRUISED PAGES',
  tagline: 'A HOME FOR MY COMICS, CHARACTERS & STORIES.',
  aboutBio: '',
  aboutStatement: '',
  creatorName: '',
  socialLinks: {},
  isPasswordSet: false,
};

const ArchiveContext = createContext<ArchiveContextType | undefined>(undefined);

export const ArchiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAdmin } = useAuth();
  const [comics, setComics] = useState<Comic[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [lore, setLore] = useState<LoreEntry[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  const refreshArchive = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/archive', {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load archive');
      const data = await res.json();
      setComics(Array.isArray(data.comics) ? data.comics : []);
      setCharacters(Array.isArray(data.characters) ? data.characters : []);
      setLore(Array.isArray(data.lore) ? data.lore : []);
      setArtworks(Array.isArray(data.artworks) ? data.artworks : []);
      if (data.settings) {
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (err: any) {
      console.error('Error loading archive:', err);
      setError(err.message || 'Failed to fetch content.');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    refreshArchive();
  }, [refreshArchive, isAdmin]);

  // Upload file helper
  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              dataUrl,
              filename: file.name,
              mimeType: file.type,
            }),
          });
          const data = await res.json();
          if (res.ok && data.url) {
            resolve(data.url);
          } else {
            // fallback to data url if server upload fails
            resolve(dataUrl);
          }
        } catch (err) {
          console.warn('Direct upload failed, using data URL fallback:', err);
          resolve(reader.result as string);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  // Comic CRUD
  const saveComic = async (comicData: Partial<Comic>) => {
    try {
      const isNew = !comicData.id;
      const url = isNew ? '/api/comics' : `/api/comics/${comicData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(comicData),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || 'Failed to save comic');
      
      await refreshArchive();
      return { success: true, comic: saved };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteComic = async (id: string) => {
    try {
      const res = await fetch(`/api/comics/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) return false;
      await refreshArchive();
      return true;
    } catch (err) {
      return false;
    }
  };

  const togglePublishComic = async (id: string, published: boolean) => {
    try {
      const comic = comics.find((c) => c.id === id);
      if (!comic) return false;
      const updated = {
        ...comic,
        published,
        publishedAt: published ? (comic.publishedAt || new Date().toISOString()) : undefined,
      };
      const res = await fetch(`/api/comics/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updated),
      });
      if (!res.ok) return false;
      await refreshArchive();
      return true;
    } catch {
      return false;
    }
  };

  // Character CRUD
  const saveCharacter = async (charData: Partial<Character>) => {
    try {
      const isNew = !charData.id;
      const url = isNew ? '/api/characters' : `/api/characters/${charData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(charData),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || 'Failed to save character');
      await refreshArchive();
      return { success: true, character: saved };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      const res = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) return false;
      await refreshArchive();
      return true;
    } catch {
      return false;
    }
  };

  // Lore CRUD
  const saveLore = async (loreData: Partial<LoreEntry>) => {
    try {
      const isNew = !loreData.id;
      const url = isNew ? '/api/lore' : `/api/lore/${loreData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(loreData),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || 'Failed to save lore');
      await refreshArchive();
      return { success: true, lore: saved };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteLore = async (id: string) => {
    try {
      const res = await fetch(`/api/lore/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) return false;
      await refreshArchive();
      return true;
    } catch {
      return false;
    }
  };

  // Artwork CRUD
  const saveArtwork = async (artData: Partial<Artwork>) => {
    try {
      const isNew = !artData.id;
      const url = isNew ? '/api/artworks' : `/api/artworks/${artData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
      });
      const resData = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(artData),
      });
      const saved = await resData.json();
      if (!resData.ok) throw new Error(saved.error || 'Failed to save artwork');
      await refreshArchive();
      return { success: true, artwork: saved };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteArtwork = async (id: string) => {
    try {
      const res = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) return false;
      await refreshArchive();
      return true;
    } catch {
      return false;
    }
  };

  // Site Settings
  const saveSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) return false;
      const updated = await res.json();
      setSettings(updated);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ArchiveContext.Provider
      value={{
        comics,
        characters,
        lore,
        artworks,
        settings,
        loading,
        error,
        refreshArchive,
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
      }}
    >
      {children}
    </ArchiveContext.Provider>
  );
};

export const useArchive = () => {
  const context = useContext(ArchiveContext);
  if (!context) throw new Error('useArchive must be used within an ArchiveProvider');
  return context;
};
