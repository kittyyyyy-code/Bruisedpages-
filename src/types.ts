export interface ComicPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  caption?: string;
}

export interface Comic {
  id: string;
  title: string;
  slug: string;
  chapterNumber?: number | string;
  description: string;
  coverUrl: string;
  pages: ComicPage[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Character {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description: string;
  personality?: string;
  age?: string;
  species?: string;
  lore?: string;
  funFacts?: string[];
  comicAppearances?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoreEntry {
  id: string;
  title: string;
  slug: string;
  category: string;
  imageUrl?: string;
  content: string;
  relatedCharacterIds?: string[];
  relatedComicIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ArtworkCategory =
  | 'Illustration'
  | 'Sketch'
  | 'Character Art'
  | 'Concept Art'
  | 'Doodle'
  | 'Other';

export interface Artwork {
  id: string;
  title: string;
  category: ArtworkCategory;
  imageUrl: string;
  notes?: string;
  createdAt: string;
  tags?: string[];
}

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  aboutBio: string;
  aboutStatement: string;
  creatorName: string;
  contactEmail?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    bluesky?: string;
    patreon?: string;
    kofi?: string;
    website?: string;
  };
  customBannerText?: string;
  isPasswordSet: boolean;
}

export interface ArchiveData {
  comics: Comic[];
  characters: Character[];
  lore: LoreEntry[];
  artworks: Artwork[];
  settings: SiteSettings;
}
