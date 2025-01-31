# WookieFoot Fan Website System Patterns

## Architecture Overview

### Core Architecture
- **Framework**: Next.js with TypeScript
- **Routing**: App Router-based architecture
- **Styling**: Tailwind CSS with CSS Modules
- **Content**: Markdown-based with frontmatter

### Directory Structure
```
wookiefoot/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable components
│   ├── content/            # Markdown content
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── scripts/               # Utility scripts
```

## Key Technical Decisions

### 1. Content Management
- **Pattern**: Markdown with Frontmatter
- **Implementation**: 
  - Lyrics stored as .md files
  - Metadata in frontmatter
  - Organized by album directories
  - Standardized naming conventions

### 2. Asset Management
- **Pattern**: Optimized Image Processing
- **Implementation**:
  - Automated thumbnail generation
  - Size and quality optimization
  - Consistent file organization
  - Validation utilities

### 3. Data Fetching
- **Pattern**: Static Generation with Dynamic Paths
- **Implementation**:
  - Album data pre-rendered at build time
  - Dynamic route generation for songs
  - Optimized page loading
  - Efficient data caching

### 4. Component Architecture
- **Pattern**: Modular Component Design
- **Implementation**:
  - Reusable UI components
  - Clear component hierarchy
  - TypeScript type safety
  - Consistent styling patterns

### 5. Search Implementation
- **Pattern**: Static Search with Client-side Filtering
- **Implementation**:
  - Pre-built search index
  - Client-side search logic
  - Optimized for performance
  - Flexible search parameters

## Design Patterns

### 1. Layout Patterns
- Consistent page layouts
- Responsive design system
- Component-based structure
- Reusable layout components

### 2. Navigation Patterns
- Hierarchical navigation
- Breadcrumb system
- Album/song relationships
- Clear user pathways

### 3. Content Display Patterns
- Standardized lyrics formatting
- Album grid/list views
- Media embedding system
- Typography hierarchy

## Technical Constraints
- Static site generation
- No server-side operations
- Markdown-based content
- Internal hosting requirements

## Scalability Considerations
- Efficient content organization
- Optimized build process
- Modular component structure
- Extensible data patterns

## Maintenance Patterns
- Clear documentation
- Consistent code style
- Type safety enforcement
- Automated tooling