# Technical Specification: Simple Lyrics Submission Feature

## Overview
Implementation plan for enabling user-submitted lyrics through the 404 error page, with email notifications sent to wallyk@gmail.com.

## Components

### 1. Enhanced 404 Page
Location: `src/app/not-found.tsx`
Changes needed:
- Add submission form with fields:
  * Song Title (required)
  * Album Name (optional)
  * Lyrics Content (required)
  * Submitter Email (required)
- Basic client-side validation
- Success/error message display

### 2. Submission Storage
Location: `public/content/submissions/`
- Store submissions as markdown files
- Filename format: `{songTitle}-{timestamp}.md`
- Include metadata in frontmatter

Example submission file:
```markdown
---
songTitle: "Example Song"
albumName: "Example Album"
submitterEmail: "user@example.com"
submittedAt: "2025-01-31T15:32:24"
---

[Submitted lyrics content here]
```

### 3. Email Notifications

#### To Administrator
Location: `scripts/notify-admin-lyrics-submission.js`
- Send email to wallyk@gmail.com containing:
  * Song title and album
  * Submitter's email address
  * Link to submission file
  * Review instructions

#### To Submitter
Location: `scripts/notify-submitter-confirmation.js`
- Send confirmation email to submitter containing:
  * Thank you message
  * Submission details
  * Next steps information

### 4. API Route
Location: `src/app/api/lyrics-submission/route.ts`
Functionality:
- Accept form submission
- Validate required fields including email
- Save markdown file
- Trigger notification scripts
- Return success/error status

## Implementation Steps

1. Storage Setup
   - Create submissions directory
   - Implement file saving logic with email metadata

2. Email Notifications
   - Create admin notification script
   - Create submitter confirmation script
   - Configure SMTP settings
   - Test email delivery

3. Frontend Development
   - Add submission form to 404 page
   - Add email field validation
   - Handle form submission
   - Show submission status

4. Testing
   - Form submission with email validation
   - File storage with complete metadata
   - Both email notifications

## Technical Considerations

### File Storage
- Unique filename generation
- Proper file permissions
- Markdown formatting
- Email address storage security

### Email Notifications
- Simple SMTP configuration
- Basic email templates
- Error handling
- Email validation

### Form Handling
- Required fields validation including email format
- Simple success/error messages
- Clear submission feedback

## Review Process
1. User submits lyrics via form with email
2. Submission saved as markdown file
3. Two emails sent:
   - To admin (wallyk@gmail.com) with review details
   - To submitter with confirmation
4. Admin can contact submitter via email if needed

## Dependencies
- nodemailer for email
- Basic file system operations
- Next.js API routes