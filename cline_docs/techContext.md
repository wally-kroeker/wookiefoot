# WookieFoot Fan Website Technical Context

## Technologies Used

### Core Technologies
- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **Content**: Markdown with gray-matter
- **Build Tools**: Node.js, npm

### Development Tools
- **IDE**: VS Code with Cline AI
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript

### Infrastructure
- **Hosting**: Internal Nginx/Apache servers
- **Security**: Cloudflare Tunnel
- **Static Assets**: Local file system
- **Deployment**: Docker containerization

## Development Setup

### Prerequisites
- Node.js
- npm/yarn
- Git
- VS Code + extensions
- Docker (for deployment)

### Project Configuration
- **TypeScript Config**: tsconfig.json
- **ESLint Config**: eslint.config.mjs
- **Tailwind Config**: tailwind.config.js
- **Next.js Config**: next.config.ts
- **PostCSS Config**: postcss.config.mjs

### Content Management
- Markdown files with frontmatter
- Organized by album directories
- Standardized naming conventions
- Automated validation tools

### Asset Management
- Image processing utilities
- Thumbnail generation
- Size optimization
- Quality validation

## Technical Constraints

### Performance Requirements
- Page load time < 2 seconds
- Optimized image delivery
- Efficient search functionality
- Responsive across devices

### Content Limitations
- Static site generation
- No server-side operations
- Markdown-based content
- Local asset hosting

### Infrastructure Requirements
- Internal server hosting
- Cloudflare tunnel setup
- Docker containerization
- SSL/TLS security

### Browser Support
- Modern browsers
- Mobile responsiveness
- Progressive enhancement
- Accessibility compliance

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies
3. Run development server
4. Use VS Code + Cline AI

### Content Updates
1. Update Markdown files
2. Validate content structure
3. Process new assets
4. Update song index

### Deployment Process
1. Build static site
2. Docker containerization
3. Server deployment
4. Cloudflare configuration

## Tooling

### Content Tools
- Lyrics processing scripts
- Asset optimization tools
- Validation utilities
- Index management

### Development Tools
- Hot reload
- TypeScript checking
- ESLint validation
- Prettier formatting

### Build Tools
- Next.js build system
- Asset optimization
- Static generation
- Docker builds

## Documentation
- Inline code comments
- README documentation
- Infrastructure guides
- Contribution guidelines