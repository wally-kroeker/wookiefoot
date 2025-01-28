# Contributing to WookieFoot Fan Website

Thank you for your interest in contributing to the WookieFoot fan website project! This document provides guidelines for contributing to the project.

## Project Status

Current implementation status (as of 2025-01-28):
- Total Songs: 145
- Complete Lyrics: 42 (29.0%)
- Failed Status: 83
- Skipped Status: 20

## Development Setup

1. Clone the repository
```bash
git clone https://github.com/wally-kroeker/wookiefoot.git
cd wookiefoot
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

## Development Workflow

1. Create a new branch for your feature/fix
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

2. Make your changes following our coding standards
3. Test your changes locally
4. Commit your changes with a descriptive message
5. Push your branch and create a pull request

## Content Management

### Lyrics Files
- Location: `src/content/lyrics/[album]/[song].md`
- Format: Markdown with frontmatter
- Validation: Through `lib/utils/lyrics-verification.ts`

### Adding New Lyrics
1. Create a new markdown file in the appropriate album directory
2. Include required frontmatter:
   ```markdown
   ---
   title: "Song Title"
   album: "Album Name"
   track: 1
   year: "YYYY"
   ---
   ```
3. Run validation script:
   ```bash
   npm run verify-lyrics
   ```

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting (enforced by ESLint/Prettier)
- Write meaningful commit messages
- Document new components and functions

## Testing

Before submitting a PR, ensure:
- Lyrics display correctly
- Navigation works as expected
- Responsive design functions on all devices
- No TypeScript errors
- All tests pass

## Project Structure

```
wookiefoot/
├── src/
│   ├── app/           # Next.js 13+ app directory
│   ├── components/    # Reusable UI components
│   ├── content/       # Markdown files for lyrics
│   ├── lib/          # Utility functions
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── config files      # Various configuration files
```

## Getting Help

- Review existing documentation in the `docs/` directory
- Check the project journal for recent changes
- Create an issue for questions or problems

## License

This is an open-source, non-monetized project. All contributions will be under the same license.
