
# Yoga Wisdom Portal — Implementation Plan

## Design System
- **Palette**: Warm ivory backgrounds, muted gold accents, deep charcoal text, sage green highlights
- **Typography**: Serif headings (Playfair Display) for spiritual feel, clean sans-serif body (Inter)
- **Style**: Generous whitespace, soft shadows, rounded corners, calm gradients — premium archive aesthetic

## Pages & Layout

### Global
- Responsive navbar with logo, all 9 sections, search bar
- Mobile hamburger menu
- Footer with links, copyright, social icons

### 1. Home
- Hero banner with spiritual imagery and tagline
- Featured content cards (books, videos, podcasts)
- "Latest additions" section
- Quick category navigation tiles

### 2. Books Library
- Grid/list view of books with cover images
- Filters: yoga topic, language, author
- Search within books
- Book detail page with description, metadata, and embedded PDF reader

### 3. Old Books Archive
- Same structure as Books Library but visually distinct (aged/vintage card styling)
- Special "historical significance" badges

### 4. Videos
- Video grid with thumbnails
- Embedded video player (YouTube/Vimeo URLs)
- Filter by topic, language, speaker

### 5. Journals / Blog
- Article listing with featured image, excerpt, date
- Full article reading page with rich text
- Category and tag filters

### 6. Translations
- Multi-language text viewer
- Side-by-side original + translation layout
- Language selector dropdown
- Filter by source language, target language, text

### 7. Podcasts
- Episode listing with audio player
- Show notes and descriptions
- Filter by topic, language

### 8. About Guruji
- Placeholder bio section (you'll provide real content later)
- Photo gallery placeholder
- Timeline/milestones layout

### 9. Contact
- Contact form (name, email, subject, message)
- Location/address info placeholder

### 10. Admin Portal
- Protected login page (email/password auth)
- Dashboard with content counts
- CRUD forms for each content type (books, videos, podcasts, journals, translations, old books)
- PDF file upload for books
- Image upload for covers/thumbnails

## Database (Lovable Cloud / Supabase)

**Tables:**
- `books` — title, author, description, cover_url, pdf_url, topic, language, type (modern/old), created_at
- `videos` — title, description, thumbnail_url, video_url, topic, language, speaker
- `journals` — title, body (rich text), excerpt, featured_image_url, topic, language, tags
- `podcasts` — title, description, audio_url, topic, language, duration
- `translations` — title, source_text, translated_text, source_language, target_language, topic
- `topics` — id, name (e.g., Hatha Yoga, Bhagavad Gita, Pranayama, etc.)
- `languages` — id, name, code
- `user_roles` — secure admin role management

**Storage buckets:** `book-pdfs`, `cover-images`, `audio-files`

## Auth
- Email/password authentication for admin access
- Role-based access control (admin role via `user_roles` table)
- Public pages need no auth

## Features (Phase 1 — this build)
- Full search across all content types
- Topic and language filters on every listing page
- Embedded PDF reader for books
- Video embedding from YouTube/Vimeo URLs
- Audio player for podcasts
- Mobile-responsive layout throughout
- Admin CRUD for all content types with file uploads

## Deferred (Phase 2 — later)
- AI summaries and AI translation (Lovable AI integration)
- Multi-language support for Western languages beyond initial set
