# ADR-002: Implement Lyrics Submission Feature on 404 Page

## Status

ACCEPTED

## Context

We need to allow users to submit lyrics for songs that are missing from our website. This feature will enhance user engagement and help populate our lyrics database. The 404 error page for lyrics (when a song is not found) is a suitable place to integrate this submission form.

## Decision

We will implement a lyrics submission form on the 404 error page for lyrics. This form will include fields for song title, album name (optional), submitter email, and lyrics content. Upon submission, the following will occur:

1.  **Data Storage**: Submitted lyrics will be saved as markdown files in the `public/content/submissions` directory. Each submission will be stored in a separate file with a unique filename based on song title and timestamp. The file will include frontmatter containing submission metadata (song title, album name, submitter email, submission timestamp) and the lyrics content in markdown format.
2.  **Email Notification**: An email notification will be sent to `wallyk@gmail.com` upon each new submission. The email will contain:
    *   Song title and album name
    *   Submitter email
    *   Link to the submission file for review
    *   Instructions for reviewing and processing the submission

## Consequences

### Positive:

*   **Enhanced User Engagement**: Allows users to contribute to the website content.
*   **Content Growth**: Facilitates the collection of missing lyrics.
*   **Improved 404 Page**: Makes the 404 page more useful and interactive.
*   **Admin Notification**: Ensures timely review of submitted lyrics.

### Negative:

*   **Potential Spam/Abuse**: Form needs basic validation to prevent spam submissions. More advanced spam prevention might be needed in the future.
*   **Moderation Overhead**: Requires manual review and moderation of submitted lyrics before publishing.

## Code Location

*   **404 Error Page**: `src/app/lyrics/[slug]/not-found.tsx`
*   **Lyrics Submission Form Component**: `src/components/forms/LyricsSubmissionForm.tsx`
*   **API Endpoint**: `src/app/api/lyrics-submission/route.ts`
*   **Email Notification Script**: `scripts/notify-lyrics-submission.cjs`
*   **Submission Storage Directory**: `public/content/submissions`

## Status

Implemented and tested. Email notifications are working.