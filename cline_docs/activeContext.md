# Active Context

## Current Task
- Fix inconsistencies in `song_index.csv` to ensure proper parsing and functionality.


## Changes Made
1. Implemented lyrics submission form on the 404 error page (`src/app/lyrics/[slug]/not-found.tsx`) using `LyricsSubmissionForm` component.
2. Enhanced `LyricsSubmissionForm` component (`src/components/forms/LyricsSubmissionForm.tsx`) to include song title, album name, email, and lyrics fields, and handle form submission.
3. Created API endpoint `/api/lyrics-submission` (`src/app/api/lyrics-submission/route.ts`) to handle form submissions, save lyrics to markdown files in `public/content/submissions`, and trigger email notifications.
4. Configured email notifications using `nodemailer` and `scripts/notify-lyrics-submission.cjs` to send emails to `wallyk@gmail.com` upon new lyric submissions.
5. Fixed ES module error by renaming `scripts/notify-lyrics-submission.js` to `scripts/notify-lyrics-submission.cjs` and updating import paths.
6. Corrected file parsing in `scripts/notify-lyrics-submission.cjs` to properly read markdown submission files.
7. Removed `disabled` attribute and added `onChange` handlers to input fields in `LyricsSubmissionForm.tsx` to enable text input.
8. Corrected syntax errors in `LyricsSubmissionForm.tsx`.
9. Commented out non-critical console error in `NotFound.tsx`.

## Next Steps
- Inspect the `src/content/lyrics/activate/` directory to check if Markdown files exist for the songs listed on lines 19-22 of `song_index.csv`.
- Populate or mark the missing data in `song_index.csv`.
- Modify `song_index.csv` to correct the problematic lines, ensuring each has 15 columns.
- Test the development server again (`npm run dev`) to check if the errors are resolved.
- Update project documentation (`cline_docs`).
- Commit and push changes to GitHub.
