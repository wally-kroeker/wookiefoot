# WookieFoot Refactor Spec — Publish Readiness

**Date:** 2026-03-16
**Goal:** Fix all issues preventing public launch of wookiefoot.kroeker.fun
**Sources:** Architect review (code/architecture) + Designer review (UX/UI/screenshots)
**Strategy:** 6 independent work packages, parallelizable, each targeting different files

---

## Work Package 1: Fix Build & Data Layer (CRITICAL — must land first)

**Owner files:** `src/lib/utils/markdown.ts`, `src/app/api/lyrics/index.ts`, `song_index.csv` reading

**Tasks:**

1. **Delete dead Pages Router file** — Remove `src/app/api/lyrics/index.ts` entirely. It's a Pages Router API route (`NextApiRequest`/`NextApiResponse`) coexisting with the App Router `route.ts`, causing build failure: `PageNotFoundError: Cannot find module for page: /api/lyrics`.

2. **Refactor data layer to read CSV directly from filesystem** — The core architectural flaw: `src/lib/utils/markdown.ts` calls `fetch(getBaseUrl() + '/api/lyrics')` to read a CSV that's already on disk. This forces `export const dynamic = 'force-dynamic'` on every page because `localhost` isn't available at build time.

   **What to do:**
   - Extract the CSV-reading logic from `src/app/api/lyrics/route.ts` (it uses `fs.readFileSync` + CSV parsing) into a shared utility, e.g. `src/lib/data/songs.ts`
   - Refactor `getSongIndex()`, `getSongBySlug()`, `getAllAlbums()`, `getNavigationData()` in `markdown.ts` to call the shared utility directly instead of fetching the API
   - Keep the API route (`route.ts`) for client-side search, but have it also call the shared utility
   - Remove `export const dynamic = 'force-dynamic'` from ALL pages:
     - `src/app/page.tsx` (line 13)
     - `src/app/albums/page.tsx` (line 12)
     - `src/app/albums/[id]/page.tsx` (line 10)
     - `src/app/lyrics/[slug]/page.tsx` (line 10)
     - `src/app/lyrics/page.tsx` (line 11)
   - Add `generateStaticParams()` to dynamic routes (`albums/[id]` and `lyrics/[slug]`) so they can be statically generated

3. **Fix N+1 query pattern** — `getSongBySlug()` triggers 4+ CSV reads per page load. With filesystem reads this is fast but wasteful. Add simple module-level caching (read CSV once per build/request cycle).

4. **Fix frontmatter schema mismatch** — `LyricsMetadata` in `src/types/album.ts` expects `album:` but markdown files use `albumId:`. Update `processSongMarkdown()` in `markdown.ts` (line 123) to read `metadata.albumId` instead of `metadata.album`. Update the `LyricsMetadata` type to match.

5. **Clear build cache and verify** — Run `rm -rf .next && pnpm build` and confirm zero errors.

**Verification:** `pnpm build` succeeds. All pages render without `force-dynamic`. Dynamic routes have `generateStaticParams()`.

---

## Work Package 2: Security Fixes (CRITICAL)

**Owner files:** `src/components/ui/SongResult.tsx`, `src/app/lyrics/[slug]/page.tsx`, `src/app/search/SearchContent.tsx`, `src/app/api/lyrics-submission/route.ts`, `src/lib/utils/markdown.ts`

**Tasks:**

1. **Add rehype-sanitize to markdown pipeline** — In `src/lib/utils/markdown.ts`, add `rehype-sanitize` after the rehype conversion step (after line 98). This prevents XSS via markdown content.

   ```bash
   pnpm add rehype-sanitize
   ```

2. **Sanitize search snippets** — In `src/app/search/SearchContent.tsx`, the lyrics text used to construct `<mark>`-wrapped snippets (lines 47, 58, 72) must be HTML-escaped before wrapping. Use a simple escape function for `<`, `>`, `&`, `"` characters before inserting into the `<mark>` template.

3. **Fix lyrics submission API security** — In `src/app/api/lyrics-submission/route.ts`:
   - Add `await mkdir(submissionDir, { recursive: true })` before writing
   - Replace `exec()` with `execFile()` to prevent shell injection
   - Sanitize `submitterEmail` before embedding in YAML frontmatter (strip newlines, quotes)
   - Add basic rate limiting or honeypot field

4. **Audit all `dangerouslySetInnerHTML` usage** — Ensure every instance only receives sanitized HTML from the rehype pipeline, never raw user input.

**Verification:** No `dangerouslySetInnerHTML` without prior sanitization. Lyrics submission cannot inject shell commands or YAML.

---

## Work Package 3: SEO & Metadata (MAJOR)

**Owner files:** `src/app/robots.ts` (new), `src/app/sitemap.ts` (new), `src/app/layout.tsx`, all page.tsx files

**Tasks:**

1. **Create `src/app/robots.ts`** — Standard robots.txt allowing all crawlers, pointing to sitemap.

2. **Create `src/app/sitemap.ts`** — Generate sitemap from song index. Include:
   - Homepage (priority 1.0)
   - `/albums` (priority 0.9)
   - Each album page (priority 0.8)
   - Each lyrics page (priority 0.7)
   - `/search` (priority 0.5)

3. **Add JSON-LD structured data** — On lyrics pages, add `MusicRecording` schema:
   ```json
   {
     "@type": "MusicRecording",
     "name": "Song Title",
     "byArtist": { "@type": "MusicGroup", "name": "WookieFoot" },
     "inAlbum": { "@type": "MusicAlbum", "name": "Album Name" },
     "duration": "PT3M52S",
     "lyrics": { "@type": "CreativeWork", "text": "..." }
   }
   ```

4. **Add Open Graph images** — Create a default OG image (1200x630) for social sharing. Add to layout metadata. Consider per-album OG images using album covers.

5. **Add favicon** — Create a simple "W" lettermark or WookieFoot-themed favicon. Add `src/app/favicon.ico` and apple-touch-icon.

**Verification:** `curl localhost:3001/robots.txt` returns valid robots. `curl localhost:3001/sitemap.xml` lists all pages. Social share previews show image and proper metadata.

---

## Work Package 4: CSS & Rendering Fixes (CRITICAL)

**Owner files:** `src/app/search/`, `src/app/community/`, `src/app/not-found.tsx`, `src/app/lyrics/page.tsx`, `src/app/globals.css`

**Tasks:**

1. **Fix CSS not loading on client-rendered pages** — The search, community, 404, and lyrics listing pages render completely unstyled. Investigate why Tailwind CSS doesn't apply:
   - Check if these pages/components are properly importing or inheriting the global CSS
   - Check if `'use client'` components are breaking CSS hydration
   - Check if Suspense boundaries are causing CSS to not load
   - Test after WP1's build cache clear — the esprima error may be the root cause

2. **Fix 404 page** — `src/app/not-found.tsx` renders blank content between header and footer. Ensure the 404 content (large "404" text, message, navigation buttons) actually renders.

3. **Fix hero gradient contrast** — Homepage hero gradient ends at `#D4910A` (gold) which gives ~2.2:1 contrast with white text. Either:
   - Darken the gold end to `#8B6914`
   - Add `text-shadow: 0 1px 3px rgba(0,0,0,0.3)` to hero text
   - Add a semi-transparent dark overlay

4. **Fix navigation fallback** — Header nav items concatenate without CSS ("HomeAlbumsLyricsCommunitySearch"). Add ` | ` separators or ensure `gap` is used instead of `space-x-1` for more robust spacing.

5. **Fix footer link spacing** — Same issue as header — links concatenate without CSS.

**Verification:** All pages render with proper styling. 404 page shows content. Hero text passes WCAG AA contrast.

---

## Work Package 5: Mobile & Responsive (MAJOR)

**Owner files:** `src/app/page.tsx`, `src/app/albums/page.tsx`, `src/components/` various

**Tasks:**

1. **Fix mobile album grid** — Albums page 2-column grid makes covers too small at 375px. Switch to single column below 480px:
   ```
   grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
   ```

2. **Fix mobile homepage Connect section** — Cards cramped in 2-column at mobile. Switch to:
   ```
   grid-cols-1 sm:grid-cols-2
   ```

3. **Fix mobile hero padding** — Reduce from `p-10` to `p-6` on mobile. Consider `text-4xl` instead of `text-5xl` for the h1 on mobile.

4. **Ensure album cover images have consistent aspect ratios** — Add `aspect-square` or `aspect-ratio: 1` to album cover containers. Use `object-fit: cover`.

5. **Equalize card heights** — Album grid cards should be equal height. Use CSS Grid `auto-rows` or flex `h-full`.

**Verification:** Test at 375px viewport. All grids single-column on mobile. Album covers consistent size. Cards equal height.

---

## Work Package 6: Cleanup & Polish (MINOR)

**Owner files:** Various — dead code removal, dependency cleanup

**Tasks:**

1. **Remove dead code in markdown.ts:**
   - `remarkLyricsPlugin` (line 70) — defined but never used in the unified pipeline
   - `formatTags()` (line 185) — never called
   - `getYouTubeEmbedUrl()` (line 189) — never called
   - `getRelatedSongs()` (line 312) — never called
   - `getSafeHtml()` (line 322) — never called
   - `titleToSlug()` (line 47) — never called (CSV provides slugs)
   - `albumToDirectoryName()` (line 59) — never called

2. **Remove unused components:**
   - `src/components/ui/Typography.tsx`
   - `src/components/ui/icons/ControlDots.tsx`
   - `src/components/effects/ScrollReveal.tsx`

3. **Remove unused dependencies:**
   ```bash
   pnpm remove react-intersection-observer
   ```

4. **Evaluate framer-motion** — It loads ~100KB for a 0.3s page fade in `src/app/template.tsx`. Consider replacing with CSS transitions or removing entirely. Also check if `ScrollReveal.tsx` (which imports it) is used.

5. **Consolidate slug logic** — Create `src/lib/utils/slugify.ts` with one canonical implementation. Replace the 4 independent slug functions:
   - `markdown.ts` `titleToSlug()`
   - `markdown.ts` `albumToDirectoryName()`
   - `image-processing.ts` `sanitizeAlbumName()`
   - `BandcampLink.tsx` `toSlug()`

6. **Consolidate Bandcamp URL logic** — Both `markdown.ts` and `BandcampLink.tsx` implement `getBandcampAlbumUrl()` independently. Use one.

7. **Fix inconsistent types** — Standardize `Album.id`, `Track.id`, and `Song.id` to all be `string`.

8. **Add skip-to-content link** — Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` before the header in layout.tsx. Add `id="main-content"` to `<main>`.

9. **Add loading skeletons** — Add `loading.tsx` for `/albums/[id]` and `/lyrics/[slug]` routes with card/text placeholders.

10. **Add external link indicators** — External links (YouTube, Bandcamp, Shangri-La) should have a small arrow icon and/or "(opens in new tab)" text.

**Verification:** `pnpm build` clean with no warnings. No unused imports. Bundle size reduced.

---

## Execution Order

```
WP1 (Build & Data Layer) ← MUST land first, unblocks everything
    ↓
WP2, WP3, WP4, WP5 ← run in parallel after WP1
    ↓
WP6 (Cleanup) ← run last, touches many files
```

**Estimated scope:** ~30-40 files modified, ~500-800 lines changed, ~200-400 lines deleted.

---

## Post-Refactor Checklist

- [ ] `pnpm build` succeeds with zero errors
- [ ] All pages render with proper styling (desktop + mobile)
- [ ] No `force-dynamic` exports remain
- [ ] All `dangerouslySetInnerHTML` uses sanitized input
- [ ] robots.txt and sitemap.xml accessible
- [ ] Favicon visible
- [ ] Hero text passes WCAG AA contrast
- [ ] Mobile layouts tested at 375px
- [ ] OG metadata shows in social share preview
- [ ] 404 page renders properly
- [ ] Search page renders with CSS
