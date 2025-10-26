# ADR 001: Lyrics Submission Feature

## Context
The website currently shows a 404 error page when lyrics are not available for a song. We want to enable users to submit potential lyrics when they encounter missing content, while maintaining our static-first architecture.

## Decision
We will implement a lyrics submission system with the following components:

### 1. User Interface
- Enhanced 404 page with lyrics submission form
- Client-side form validation
- reCAPTCHA integration for spam prevention
- Success/error state handling

### 2. Submission Processing
- Next.js Edge Runtime API route for form handling
- Email notifications using a transactional email service
- Submission storage in a lightweight external service
- No direct write access to the main content repository

### 3. Technical Implementation
```typescript
// API Route (pages/api/submit-lyrics.ts)
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  // Handle form submission
  // Send email notification
  // Store submission
}
```

### 4. Data Flow
1. User encounters missing lyrics (404 page)
2. User submits lyrics through form
3. Edge function processes submission
4. Administrator receives email notification
5. Submission stored for review
6. Manual content update after verification

## Consequences

### Positive
- Enables community contribution while maintaining content quality
- Preserves static-first architecture
- Minimal infrastructure requirements
- Clear separation between submission and content systems

### Negative
- Requires external services for email and data storage
- Manual review process required
- Additional maintenance overhead

### Risks
- Potential spam submissions
- Email delivery reliability
- External service dependencies

## Implementation Notes
- Implement rate limiting
- Consider fallback options for external service failures
- Document review process for administrators
- Monitor submission volume and adjust systems accordingly