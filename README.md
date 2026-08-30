# BRUISED PAGES

> **An autonomous, independent dark comic platform, character dossier archive, lore encyclopedia, and visual arts gallery.**

---

## 📖 Overview

**BRUISED PAGES** is a self-hosted, full-stack web application designed for independent comic creators, manga artists, graphic novelists, and worldbuilders. It provides readers with an immersive reading experience while giving creators full administrative control to manage, publish, and curate comics, character files, lore archives, and artwork galleries.

---

## ✨ Features

- **📖 Comics Archive & Multi-Mode Reader**:
  - Support for multi-chapter series, single-shot comics, and graphic novel formats.
  - **Reading modes**: Single Page, Dual-Page Spread (manga / western comic style), and Continuous Vertical Webcomic Scroll.
  - Interactive page drawer with thumbnail previews, keyboard arrow navigation, and fullscreen reading mode.
  - Draft protection: keep in-progress works hidden until ready for public release.

- **👤 Character Dossier System**:
  - Rich character profiles featuring role tags, status badges, aliases, and visual portraits.
  - Personality traits, key fun facts, psychological notes, and linked comic appearances.

- **📜 Lore & Worldbuilding Archives**:
  - Categorized lore documents (Factions, Locations, Magic/Tech, Artifacts, Historical Events).
  - Cross-references linking directly to characters and comic storylines.

- **🎨 Artwork & Illustration Gallery**:
  - Categorized portfolio display for concept art, finished illustrations, cover variants, and sketchbooks.
  - Lightbox modal with zoom and high-resolution viewing.

- **🛡️ Creator Dashboard & Security**:
  - **Server-Side Authentication**: Protected by PBKDF2 with SHA-512 hashing and random cryptographic salts.
  - **50-Character Passphrase Policy**: Enforced high-entropy master passphrases for administrative operations.
  - **Brute-Force Protection**: IP-aware rate limiting that temporarily locks out creator authentication for 15 minutes after 5 consecutive failed attempts.
  - **Session Isolation**: Secure 32-byte cryptographic bearer tokens for all administrative write/delete endpoints.
  - **Archive Backup & Migration**: One-click JSON data export and import for hassle-free data backups.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend / API**: Node.js, Express, Vite middleware
- **Build System**: Vite, esbuild, TypeScript Compiler (`tsc`)
- **Storage**: Local JSON database with multipart image storage and backup utilities

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js**: v18.0.0 or later (Node 20+ recommended)
- **npm**: v9.0.0 or later

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/bruised-pages.git
   cd bruised-pages
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   *(Edit `.env` to configure optional variables like `PORT` or `CREATOR_PASSPHRASE`)*

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Initialize Creator Access**:
   - Click **SETUP CREATOR** in the upper-right navigation bar.
   - Enter your master passphrase (minimum 50 characters) to initialize your administrative session.

---

## 📦 Production Build & Deployment

### Build the Application

To build the client SPA and bundle the Express server into a standalone CommonJS output:

```bash
npm run build
```

This compiles:
- Frontend assets into `dist/`
- Backend server bundle into `dist/server.cjs`

### Run in Production

```bash
npm start
```
The server will start on the port specified by the `PORT` environment variable (defaults to `3000`).

---

## 🌐 Cloud Hosting & Deployment Guides

### Deploying to Render / Railway / Fly.io / Heroku

1. Connect your GitHub repository to your hosting provider.
2. Set the following build and start commands:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Configure the environment variables in your provider's dashboard (see table below).
4. *(Optional)* Add a persistent disk mounted to `/data` if your host uses an ephemeral filesystem, ensuring uploaded images and database files persist across restarts.

### Deploying to Google Cloud Run / Docker

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## ⚙️ Environment Variables

Configure these environment variables in your `.env` file or cloud hosting provider:

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `3000` | The port on which the Express server listens. |
| `NODE_ENV` | No | `development` | Set to `production` in live environments. |
| `CREATOR_PASSPHRASE` | No | *Prompt in UI* | Optional pre-set master creator passphrase (must be >= 50 chars). If unset, use the in-app setup wizard. |
| `GEMINI_API_KEY` | No | *(None)* | Server-only Google Gemini API key (if AI capabilities are enabled). |
| `APP_URL` | No | *(Auto)* | Public canonical URL for your deployment. |

---

## 📂 Project Structure

```text
├── data/                  # Persistent data directory (auto-created)
│   ├── uploads/           # Uploaded images & comic pages (git-ignored)
│   └── db.json            # Local JSON database (git-ignored)
├── src/
│   ├── components/        # UI Views & modular components
│   │   ├── AboutView.tsx
│   │   ├── ArtworkView.tsx
│   │   ├── CharactersView.tsx
│   │   ├── ComicReaderView.tsx
│   │   ├── ComicsView.tsx
│   │   ├── CreatorDashboard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── HomeView.tsx
│   │   ├── LoginModal.tsx
│   │   ├── LoreView.tsx
│   │   └── Navigation.tsx
│   ├── context/           # React Context (AuthContext, ArchiveContext)
│   ├── types.ts           # Shared TypeScript interfaces & models
│   ├── App.tsx            # Main Application routing & layout
│   ├── main.tsx           # React DOM Entrypoint
│   └── index.css          # Global Tailwind styles & artistic flair theme
├── index.html             # HTML Entry point
├── server.ts              # Express backend, authentication, upload & SPA middleware
├── package.json           # Dependencies & build scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── .env.example           # Environment variable template
└── .gitignore             # Git ignore definitions
```

---

## 🔒 Security Best Practices

- **Never commit `.env` or `data/db.json`** to your public repository.
- Ensure your creator master passphrase is at least 50 characters in length.
- Back up your archive regularly using the **Export Backup** tool in the Creator Dashboard.

---

## 📄 License

This project is open source and available under the **MIT License**.
