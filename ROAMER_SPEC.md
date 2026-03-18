# WookieFoot Roamer Spec — Parallel Refactor Tasks

Each task is designed for a Haiku agent: one file, one job, clear instructions.

---

## PHASE 1: Build & Data (sequential — must complete before Phase 2+)

### Task 1A: Delete dead API file
- **File:** `src/app/api/lyrics/index.ts`
- **Action:** DELETE this file entirely. It's a dead Pages Router file that breaks the build.
- **Verify:** File no longer exists.

> NOTE: This was already done. Skip this task.

### Task 1B: Fix frontmatter schema mismatch
- **File:** `src/types/album.ts`
- **Action:** Find the `LyricsMetadata` interface. Change `album: string` to `albumId: string`.
- **File 2:** `src/lib/utils/markdown.ts`
- **Action:** Find `metadata.album` (around line 123) and change it to `metadata.albumId`.
- **Verify:** The field name matches what the markdown files actually use.

---

## PHASE 2: Critical Fixes (parallel — after Phase 1)

### Task 2A: Fix nav link contrast
- **File:** `src/components/layout/Header.tsx`
- **Action:** Find the nav link styling. The links use a light olive/green color that fails WCAG AA contrast against the cream background. Change the nav link text color to `text-[#2C1810]` (dark brown) for both desktop and mobile nav links. Keep the hover state as-is or make it `text-[#2D5016]` (forest green) on hover.
- **Verify:** Nav links are clearly readable dark brown text.

### Task 2B: Fix hero gradient hard edge
- **File:** `src/app/page.tsx`
- **Action:** Find the hero section with the green-to-gold gradient background. The gradient ends with a hard horizontal line. Add a bottom fade by either:
  - Adding a `pb-8` and a pseudo-element with gradient to transparent, OR
  - Simply adding `rounded-b-3xl` to the hero container to soften the edge
- **Verify:** Hero section no longer has an abrupt hard edge at the bottom.

### Task 2C: Fix orphaned "lyrics" tag on song pages
- **File:** `src/app/lyrics/[slug]/page.tsx`
- **Action:** Find where tags are rendered below the lyrics content. There's a bare word "lyrics" showing as plain text. Either:
  - Wrap it in a styled tag/badge: `<span className="inline-block px-3 py-1 text-sm rounded-full bg-[#2D5016]/10 text-[#2D5016]">{tag}</span>`
  - Or hide the tags section entirely if there's only one generic tag
- **Verify:** No orphaned plain text "lyrics" below the song content.

### Task 2D: Fix album track list click affordance
- **File:** `src/app/albums/[id]/page.tsx`
- **Action:** Find where track titles are rendered in the track listing. Add hover styling so users know songs are clickable:
  - Add `hover:text-[#2D5016] hover:underline cursor-pointer transition-colors` to each track title link
- **Verify:** Track titles show underline and color change on hover.

### Task 2E: Fix mobile CTA buttons on homepage
- **File:** `src/app/page.tsx`
- **Action:** Find the two hero CTA buttons ("Explore Albums" and "Watch on YouTube"). On mobile they should be full width. Add `w-full sm:w-auto` to both button containers. Also increase the outline button border: change `border` to `border-2`.
- **Verify:** Both buttons are full-width on mobile, outline button border is more visible.

### Task 2F: Fix album cover aspect ratios
- **File:** `src/app/albums/page.tsx` (or wherever the album grid renders covers)
- **Action:** Find the album cover `<img>` or `<Image>` elements. Wrap them in a container with `aspect-square` and add `object-cover` to the image. This ensures all album covers display as uniform squares.
- **Verify:** All album covers in the grid are the same size/shape.

---

## PHASE 3: Major Polish (parallel — after Phase 1)

### Task 3A: Style homepage Connect cards
- **File:** `src/app/page.tsx`
- **Action:** Find the Connect section with YouTube/Shangri-La/Be The Change/Bandcamp cards. They're currently flat text blocks. Add card styling to match the rest of the site:
  - Add `border border-[#D4C5A9] rounded-xl p-6 hover:shadow-md transition-shadow` to each card container
  - Make the section heading larger: `text-2xl font-display`
- **Verify:** Connect cards have visible borders and hover shadow.

### Task 3B: Fix footer link contrast
- **File:** `src/components/layout/Footer.tsx`
- **Action:** Find the external links (YouTube, Bandcamp, Shangri-La Festival). They use very light gray text. Change to a darker color: replace any `text-gray-400` or `text-gray-500` with `text-[#6B5E4F]` (warm medium brown). Also change the footer heading color if it's too light.
- **Verify:** Footer links are clearly readable.

### Task 3C: Fix mobile lyrics navigation truncation
- **File:** `src/components/navigation/AlbumNavigation.tsx`
- **Action:** Find where prev/next song titles are displayed. On mobile, "Earthling" truncates to "Ear..." which is useless. Increase the truncation threshold: change any `truncate` class to allow at least 10 characters, or use `max-w-[120px] sm:max-w-[200px] truncate` instead of aggressive truncation.
- **Verify:** Previous/next song names show enough text to be recognizable on mobile.

### Task 3D: Add dark mode toggle aria-label
- **File:** `src/components/layout/ThemeToggle.tsx`
- **Action:** Find the toggle button element. Add `aria-label="Toggle dark mode"` and `title="Toggle dark mode"` to the button.
- **Verify:** Button has proper accessibility attributes.

### Task 3E: Improve search empty state
- **File:** `src/app/search/SearchContent.tsx`
- **Action:** Find the empty/initial state before any search query is entered. Below the search input, add a helpful message:
  ```tsx
  <p className="text-center text-[#6B5E4F] mt-8">
    Search across {/* total song count */} songs by title, album, or lyrics
  </p>
  ```
- **Verify:** Search page shows helpful text instead of blank space.

---

## PHASE 4: Security & SEO (parallel — after Phase 1)

### Task 4A: Add rehype-sanitize to markdown pipeline
- **File:** `src/lib/utils/markdown.ts`
- **Action:** At the top, add `import rehypeSanitize from 'rehype-sanitize';`. In the unified pipeline (around line 94-100), add `.use(rehypeSanitize)` after `remarkRehype` and before `rehypeStringify`.
- **Pre-req:** Run `pnpm add rehype-sanitize` first.
- **Verify:** Pipeline includes sanitization step.

### Task 4B: Create robots.txt
- **File:** `src/app/robots.ts` (CREATE NEW)
- **Action:** Create this file with:
  ```typescript
  import { MetadataRoute } from 'next';
  export default function robots(): MetadataRoute.Robots {
    return {
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://wookiefoot.kroeker.fun/sitemap.xml',
    };
  }
  ```
- **Verify:** File exists and exports a robots function.

### Task 4C: Create sitemap
- **File:** `src/app/sitemap.ts` (CREATE NEW)
- **Action:** Create this file:
  ```typescript
  import { MetadataRoute } from 'next';
  import fs from 'fs';
  import path from 'path';
  import { parse } from 'csv-parse/sync';

  export default function sitemap(): MetadataRoute.Sitemap {
    const csvPath = path.join(process.cwd(), 'song_index.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const songs = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
    const baseUrl = 'https://wookiefoot.kroeker.fun';

    const albumDirs = [...new Set(songs.map((s: any) => s['Album Directory']))];

    const songUrls = songs
      .filter((s: any) => s['Has Lyrics'] === 'TRUE')
      .map((s: any) => ({
        url: `${baseUrl}/lyrics/${s['Song Slug']}`,
        lastModified: new Date(),
        priority: 0.7,
      }));

    const albumUrls = albumDirs.map((dir: string) => ({
      url: `${baseUrl}/albums/${dir}`,
      lastModified: new Date(),
      priority: 0.8,
    }));

    return [
      { url: baseUrl, lastModified: new Date(), priority: 1.0 },
      { url: `${baseUrl}/albums`, lastModified: new Date(), priority: 0.9 },
      { url: `${baseUrl}/search`, lastModified: new Date(), priority: 0.5 },
      { url: `${baseUrl}/community`, lastModified: new Date(), priority: 0.5 },
      ...albumUrls,
      ...songUrls,
    ];
  }
  ```
- **Verify:** File exists and exports sitemap function.

### Task 4D: Add favicon
- **File:** `src/app/favicon.ico` or `public/favicon.ico`
- **Action:** Check if a favicon already exists in `public/`. If not, create a simple one. Also add to layout metadata if not already present.
- **Verify:** Favicon shows in browser tab.

---

## PHASE 5: Cleanup (last — after all others)

### Task 5A: Remove dead code from markdown.ts
- **File:** `src/lib/utils/markdown.ts`
- **Action:** Delete these unused functions (they are never imported or called anywhere):
  - `remarkLyricsPlugin` (around line 70)
  - `formatTags` (around line 185)
  - `getYouTubeEmbedUrl` (around line 189)
  - `getRelatedSongs` (around line 312)
  - `getSafeHtml` (around line 322)
  - `titleToSlug` (around line 47)
  - `albumToDirectoryName` (around line 59)
- **IMPORTANT:** Only delete the function definitions. Do NOT delete any function that is imported or called elsewhere. Check each one first.
- **Verify:** File is shorter. No import errors.

### Task 5B: Remove unused components
- **File:** `src/components/ui/Typography.tsx` — DELETE
- **File:** `src/components/ui/icons/ControlDots.tsx` — DELETE (if exists)
- **File:** `src/components/effects/ScrollReveal.tsx` — DELETE
- **IMPORTANT:** Before deleting, search for any imports of these components. Only delete if truly unused.
- **Verify:** Files removed, no broken imports.

### Task 5C: Remove unused dependency
- **Action:** Run `pnpm remove react-intersection-observer`
- **Verify:** Package removed from package.json.

### Task 5D: Add skip-to-content link
- **File:** `src/app/layout.tsx`
- **Action:** Add this as the first child inside `<body>`, before the Header:
  ```tsx
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2D5016] focus:text-white focus:rounded">
    Skip to content
  </a>
  ```
  Also add `id="main-content"` to the `<main>` element.
- **Verify:** Pressing Tab on page load reveals a "Skip to content" link.
