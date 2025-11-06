import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#1A2B3C',
          800: '#152434',
          900: '#0A1520',
        },
        accent: {
          green: '#4A9B5A',      // Earthy Green
          'green-light': '#6BCB77',
          'green-dark': '#2D5A3D',
          orange: '#D97706',      // Warm Orange
          'orange-light': '#F59E0B',
          'orange-dark': '#B45309',
          brown: '#92400E',       // Rich Brown
          'brown-light': '#A16207',
          yellow: '#FCD34D',      // Golden Yellow
          teal: '#14B8A6',        // Earthy Teal
          'teal-light': '#5EEAD4',
        },
        earth: {
          green: '#4A9B5A',
          'green-light': '#6BCB77',
          'green-dark': '#2D5A3D',
          orange: '#D97706',
          'orange-light': '#F59E0B',
          'orange-dark': '#B45309',
          brown: '#92400E',
          'brown-light': '#A16207',
          yellow: '#FCD34D',
          teal: '#14B8A6',
          'teal-light': '#5EEAD4',
        },
        retro: {
          paper: '#E5E5E5',   // Light text
          ink: '#E5E5E5',     // Light text
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch',
          },
        },
      },
      boxShadow: {
        'retro': '3px 3px 0 0 rgba(0, 0, 0, 0.1)',
        'retro-lg': '5px 5px 0 0 rgba(0, 0, 0, 0.1)',
      },
      borderWidth: {
        '3': '3px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-earth': 'linear-gradient(135deg, #4A9B5A 0%, #D97706 25%, #92400E 50%, #14B8A6 75%, #4A9B5A 100%)',
        'gradient-green-orange': 'linear-gradient(135deg, #4A9B5A 0%, #D97706 100%)',
        'gradient-teal-brown': 'linear-gradient(135deg, #14B8A6 0%, #92400E 100%)',
        'gradient-earth-radial': 'radial-gradient(circle at 30% 50%, #4A9B5A 0%, #D97706 30%, #14B8A6 60%, #0A1520 100%)',
        'noise': "url('/assets/ui/noise.svg')",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        gradient: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(139, 47, 201, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(139, 47, 201, 0.8)' },
        },
        'glow-pink': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255, 20, 147, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(255, 20, 147, 0.8)' },
        },
        'glow-blue': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(0, 217, 255, 0.8)' },
        },
        'cosmic-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'star-twinkle': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float-delayed 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'gradient': 'gradient 2s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'glow-pink': 'glow-pink 3s ease-in-out infinite',
        'glow-blue': 'glow-blue 3s ease-in-out infinite',
        'cosmic-shift': 'cosmic-shift 15s ease infinite',
        'star-twinkle': 'star-twinkle 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cosmic': 'linear-gradient(135deg, #8B2FC9 0%, #FF1493 25%, #00D9FF 50%, #39FF14 75%, #8B2FC9 100%)',
        'gradient-purple-pink': 'linear-gradient(135deg, #8B2FC9 0%, #FF1493 100%)',
        'gradient-blue-green': 'linear-gradient(135deg, #00D9FF 0%, #39FF14 100%)',
        'gradient-cosmic-radial': 'radial-gradient(circle at 30% 50%, #8B2FC9 0%, #FF1493 30%, #00D9FF 60%, #0A1520 100%)',
        'noise': "url('/assets/ui/noise.svg')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
