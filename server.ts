import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Setup data directory and database file
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DbSchema {
  adminPasswordHash: string;
  adminSalt: string;
  sessions: { [token: string]: number }; // token -> expiry
  comics: any[];
  characters: any[];
  lore: any[];
  artworks: any[];
  settings: {
    siteTitle: string;
    tagline: string;
    aboutBio: string;
    aboutStatement: string;
    creatorName: string;
    contactEmail?: string;
    socialLinks?: Record<string, string>;
    customBannerText?: string;
  };
}

const defaultDb: DbSchema = {
  adminPasswordHash: '',
  adminSalt: '',
  sessions: {},
  comics: [],
  characters: [],
  lore: [],
  artworks: [],
  settings: {
    siteTitle: 'BRUISED PAGES',
    tagline: 'A HOME FOR MY COMICS, CHARACTERS & STORIES.',
    aboutBio: '',
    aboutStatement: '',
    creatorName: '',
    socialLinks: {},
  },
};

function readDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return { ...defaultDb, ...parsed, settings: { ...defaultDb.settings, ...(parsed.settings || {}) } };
    }
  } catch (err) {
    console.error('Error reading DB:', err);
  }
  return defaultDb;
}

function saveDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Initial DB check
let db = readDb();
if (process.env.CREATOR_PASSPHRASE && !db.adminPasswordHash) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(process.env.CREATOR_PASSPHRASE, salt, 10000, 64, 'sha512').toString('hex');
  db.adminPasswordHash = hash;
  db.adminSalt = salt;
  saveDb(db);
}

// Helper: Hash password
function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Rate Limiting & Lockout Tracker for Creator Logins
interface LoginAttemptRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkLoginLockout(ip: string): { locked: boolean; remainingSeconds: number } {
  const record = loginAttempts.get(ip);
  if (!record) return { locked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { locked: true, remainingSeconds };
  }

  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(ip);
    return { locked: false, remainingSeconds: 0 };
  }

  if (now - record.lastAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { locked: false, remainingSeconds: 0 };
  }

  return { locked: false, remainingSeconds: 0 };
}

function recordFailedLogin(ip: string): { locked: boolean; remainingAttempts: number; remainingSeconds: number } {
  const now = Date.now();
  let record = loginAttempts.get(ip);
  if (!record || (now - record.lastAttempt > ATTEMPT_WINDOW_MS && !record.lockedUntil)) {
    record = { failedAttempts: 0, lockedUntil: null, lastAttempt: now };
  }

  record.failedAttempts += 1;
  record.lastAttempt = now;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(ip, record);
    return { locked: true, remainingAttempts: 0, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  loginAttempts.set(ip, record);
  return {
    locked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.failedAttempts,
    remainingSeconds: 0,
  };
}

function recordSuccessfulLogin(ip: string) {
  loginAttempts.delete(ip);
}

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: check auth token
function isAuthenticated(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  db = readDb();
  const expiry = db.sessions[token];
  if (!expiry) return false;
  if (Date.now() > expiry) {
    delete db.sessions[token];
    saveDb(db);
    return false;
  }
  return true;
}

// Admin Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized: Creator access required' });
  }
  next();
}

// =================== AUTH ENDPOINTS ===================

app.get('/api/auth/status', (req: Request, res: Response) => {
  db = readDb();
  const isSetup = Boolean(db.adminPasswordHash);
  const authenticated = isAuthenticated(req);
  res.json({ isSetup, authenticated });
});

app.post('/api/auth/setup', (req: Request, res: Response) => {
  db = readDb();
  if (db.adminPasswordHash) {
    return res.status(400).json({ error: 'Creator passphrase is already initialized.' });
  }
  const { password } = req.body;
  if (!password || password.length < 50) {
    return res.status(400).json({ error: 'Passphrase must be at least 50 characters long.' });
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  db.adminPasswordHash = hash;
  db.adminSalt = salt;
  
  // Issue session token
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  saveDb(db);

  res.json({ success: true, token });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const lockout = checkLoginLockout(clientIp);
  if (lockout.locked) {
    const minutes = Math.ceil(lockout.remainingSeconds / 60);
    return res.status(429).json({
      error: `Too many failed login attempts. Temporary lockout active for ${minutes} minute${minutes === 1 ? '' : 's'} (${lockout.remainingSeconds}s remaining).`,
      locked: true,
      remainingSeconds: lockout.remainingSeconds,
    });
  }

  db = readDb();
  const { password } = req.body;
  if (!db.adminPasswordHash) {
    return res.status(400).json({ error: 'Creator account not setup yet.' });
  }

  const hash = hashPassword(password || '', db.adminSalt);
  if (hash !== db.adminPasswordHash) {
    const failResult = recordFailedLogin(clientIp);
    if (failResult.locked) {
      const minutes = Math.ceil(failResult.remainingSeconds / 60);
      return res.status(429).json({
        error: `Too many failed attempts. Temporary lockout activated for ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        locked: true,
        remainingSeconds: failResult.remainingSeconds,
      });
    }
    return res.status(401).json({
      error: `Invalid creator passphrase. (${failResult.remainingAttempts} attempt${failResult.remainingAttempts === 1 ? '' : 's'} remaining before temporary lockout).`,
      remainingAttempts: failResult.remainingAttempts,
    });
  }

  recordSuccessfulLogin(clientIp);
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = Date.now() + 30 * 24 * 60 * 60 * 1000;
  saveDb(db);
  res.json({ success: true, token });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db = readDb();
    delete db.sessions[token];
    saveDb(db);
  }
  res.json({ success: true });
});

app.post('/api/auth/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  db = readDb();
  const currentHash = hashPassword(currentPassword || '', db.adminSalt);
  if (currentHash !== db.adminPasswordHash) {
    return res.status(400).json({ error: 'Current passphrase incorrect.' });
  }
  if (!newPassword || newPassword.length < 50) {
    return res.status(400).json({ error: 'New passphrase must be at least 50 characters long.' });
  }
  const newSalt = crypto.randomBytes(16).toString('hex');
  db.adminSalt = newSalt;
  db.adminPasswordHash = hashPassword(newPassword, newSalt);
  saveDb(db);
  res.json({ success: true });
});

// =================== FILE UPLOAD ENDPOINT ===================

app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const { dataUrl, filename, mimeType } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a regular URL, return as is
      if (dataUrl.startsWith('http') || dataUrl.startsWith('/uploads/')) {
        return res.json({ url: dataUrl });
      }
      return res.status(400).json({ error: 'Invalid data URL format' });
    }

    const detectedType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = '.png';
    if (detectedType.includes('jpeg') || detectedType.includes('jpg')) ext = '.jpg';
    else if (detectedType.includes('webp')) ext = '.webp';
    else if (detectedType.includes('gif')) ext = '.gif';
    else if (detectedType.includes('svg')) ext = '.svg';

    const safeName = (filename ? path.parse(filename).name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() : 'page');
    const uniqueFile = `${safeName}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFile);

    fs.writeFileSync(filePath, buffer);
    res.json({ url: `/uploads/${uniqueFile}` });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to save file: ' + err.message });
  }
});

// =================== ARCHIVE & DATA ENDPOINTS ===================

// Full archive endpoint
app.get('/api/archive', (req: Request, res: Response) => {
  db = readDb();
  const isAdmin = isAuthenticated(req);
  const comics = isAdmin ? db.comics : db.comics.filter((c: any) => c.published);
  res.json({
    comics,
    characters: db.characters,
    lore: db.lore,
    artworks: db.artworks,
    settings: {
      ...db.settings,
      isPasswordSet: Boolean(db.adminPasswordHash),
    },
  });
});

// Comics
app.get('/api/comics', (req: Request, res: Response) => {
  db = readDb();
  const isAdmin = isAuthenticated(req);
  const comics = isAdmin ? db.comics : db.comics.filter((c: any) => c.published);
  res.json(comics);
});

app.get('/api/comics/:id', (req: Request, res: Response) => {
  db = readDb();
  const comic = db.comics.find((c: any) => c.id === req.params.id || c.slug === req.params.id);
  if (!comic) return res.status(404).json({ error: 'Comic not found' });
  if (!comic.published && !isAuthenticated(req)) {
    return res.status(404).json({ error: 'Comic not found' });
  }
  res.json(comic);
});

app.post('/api/comics', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  const newComic = {
    ...req.body,
    id: req.body.id || `comic-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: req.body.pages || [],
  };
  db.comics.unshift(newComic);
  saveDb(db);
  res.status(201).json(newComic);
});

app.put('/api/comics/:id', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  const index = db.comics.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Comic not found' });
  db.comics[index] = {
    ...db.comics[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  res.json(db.comics[index]);
});

app.delete('/api/comics/:id', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  db.comics = db.comics.filter((c: any) => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Characters
app.get('/api/characters', (_req: Request, res: Response) => {
  db = readDb();
  res.json(db.characters);
});

app.post('/api/characters', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  const newChar = {
    ...req.body,
    id: req.body.id || `char-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.characters.unshift(newChar);
  saveDb(db);
  res.status(201).json(newChar);
});

app.put('/api/characters/:id', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  const index = db.characters.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Character not found' });
  db.characters[index] = {
    ...db.characters[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  res.json(db.characters[index]);
});

app.delete('/api/characters/:id', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  db.characters = db.characters.filter((c: any) => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Lore
app.get('/api/lore', (_req: Request, res: Response) => {
  db = readDb();
  res.json(db.lore);
});

app.post('/api/lore', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  const newLore = {
    ...req.body,
    id: req.body.id || `lore-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.lore.unshift(newLore);
  saveDb(db);
  res.status(201).json(newLore);
});

app.put('/api/lore/:id', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  const index = db.lore.findIndex((l: any) => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Lore entry not found' });
  db.lore[index] = {
    ...db.lore[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  res.json(db.lore[index]);
});

app.delete('/api/lore/:id', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  db.lore = db.lore.filter((l: any) => l.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Artworks
app.get('/api/artworks', (_req: Request, res: Response) => {
  db = readDb();
  res.json(db.artworks);
});

app.post('/api/artworks', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  const newArt = {
    ...req.body,
    id: req.body.id || `art-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
  };
  db.artworks.unshift(newArt);
  saveDb(db);
  res.status(201).json(newArt);
});

app.put('/api/artworks/:id', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  const index = db.artworks.findIndex((a: any) => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Artwork not found' });
  db.artworks[index] = {
    ...db.artworks[index],
    ...req.body,
  };
  saveDb(db);
  res.json(db.artworks[index]);
});

app.delete('/api/artworks/:id', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  db.artworks = db.artworks.filter((a: any) => a.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Site Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  db = readDb();
  res.json({
    ...db.settings,
    isPasswordSet: Boolean(db.adminPasswordHash),
  });
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  db = readDb();
  db.settings = {
    ...db.settings,
    ...req.body,
  };
  saveDb(db);
  res.json({
    ...db.settings,
    isPasswordSet: Boolean(db.adminPasswordHash),
  });
});

// Export full archive backup
app.get('/api/export', requireAdmin, (_req: Request, res: Response) => {
  db = readDb();
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    comics: db.comics,
    characters: db.characters,
    lore: db.lore,
    artworks: db.artworks,
    settings: db.settings,
  };
  res.json(exportData);
});

// Import archive backup
app.post('/api/import', requireAdmin, (req: Request, res: Response) => {
  try {
    const importData = req.body;
    db = readDb();
    if (Array.isArray(importData.comics)) db.comics = importData.comics;
    if (Array.isArray(importData.characters)) db.characters = importData.characters;
    if (Array.isArray(importData.lore)) db.lore = importData.lore;
    if (Array.isArray(importData.artworks)) db.artworks = importData.artworks;
    if (importData.settings) db.settings = { ...db.settings, ...importData.settings };
    saveDb(db);
    res.json({ success: true, message: 'Archive restored successfully' });
  } catch (err: any) {
    res.status(400).json({ error: 'Import failed: ' + err.message });
  }
});

// =================== VITE / SPA HANDLING ===================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BRUISED PAGES server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
