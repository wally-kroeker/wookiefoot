# WookieFoot Fan Website

## Project Overview

A fan website for the band WookieFoot that provides a structured platform for browsing song lyrics categorized by album and song. The site features interactive discussion capabilities and is built with scalability in mind for future feature expansions.

### Core Features
- Organized lyrics by album and song
- Interactive discussion area for each song
- Lightweight and fast performance
- AI-assisted development integration
- Self-hosted deployment

## Technology Stack

- **Framework**: Next.js (React-based) for scalability and SEO
- **Hosting**: Internal Nginx/Apache servers
- **Content Management**: Markdown files for lyrics organization
- **Styling**: Tailwind CSS
- **Development**: AI-assisted (Cline) development workflow

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

## Development Phases

### Phase 1 - Project Setup
- Initialize Next.js project with TypeScript
- Configure Tailwind CSS
- Set up project directory structure
- Initialize Git repository

### Phase 2 - Core Structure
- Create base layouts and components
- Implement navigation structure
- Set up Markdown processing
- Configure static assets

### Phase 3 - Features
- Album/song browsing system
- Lyrics display with Markdown
- Comment system integration
- Search functionality
- Media embeds

### Phase 4 - Styling and UI
- Implement responsive design
- Create consistent theme
- Optimize for mobile

### Phase 5 - Performance and SEO
- Implement metadata
- Optimize images and assets
- Add loading states
- Configure caching

## Key Components

1. `layout.tsx` - Main layout wrapper
2. `page.tsx` files for routing
3. `AlbumList.tsx` - Component for album display
4. `SongLyrics.tsx` - Component for lyrics display
5. `CommentSection.tsx` - Discussion feature
6. `SearchBar.tsx` - Search functionality
7. `MediaEmbed.tsx` - YouTube/Spotify integration

## Dependencies

```json
{
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "tailwindcss": "latest",
    "gray-matter": "^4.0.3",
    "markdown-it": "^13.0.1",
    "@tailwindcss/typography": "^0.5.9"
  },
  "devDependencies": {
    "typescript": "latest",
    "@types/react": "latest",
    "@types/node": "latest",
    "autoprefixer": "latest",
    "postcss": "latest"
  }
}
```

## Future Expansion Considerations

- User submissions
- Lyric annotations
- Fan-generated content
- Enhanced media integration

## Development Workflow

1. Use GitHub Issues for progress tracking
2. Document AI-assisted development insights
3. Regular testing and performance monitoring
4. Continuous integration and deployment setup

## Collaboration Guidelines

- Follow Git workflow best practices
- Document code changes thoroughly
- Review and test before deployment
- Maintain consistent code style

## Getting Started

(Development setup instructions will be added during project initialization)

## License

This is an open-source, non-monetized project.