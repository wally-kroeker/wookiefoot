/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#1a1a1a',
            },
            h2: {
              fontSize: '2rem',
              fontWeight: '600',
              marginBottom: '0.75rem',
              color: '#1a1a1a',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1a1a1a',
            },
            // Specific styles for lyrics display
            '.lyrics': {
              fontSize: '1.125rem',
              lineHeight: '1.75',
              whiteSpace: 'pre-wrap',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system',
              '& p': {
                marginBottom: '1rem',
              },
            },
            // Album and song titles
            '.song-title': {
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '1rem',
            },
            '.album-title': {
              fontSize: '2.25rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '1.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
