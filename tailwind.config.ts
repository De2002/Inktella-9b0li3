import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F0ECFF',
          100: '#E3DCFF',
          200: '#C8BAFF',
          300: '#A98EFF',
          400: '#8866FF',
          500: '#6C4EF6',
          600: '#5538E8',
          700: '#4228D0',
          800: '#3320A8',
          900: '#251880',
        },
        ink: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        tella: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F5',
          200: '#F3EFE8',
          300: '#E8E2D9',
          400: '#D4CCBF',
          500: '#B8AE9E',
        },
        'ink-dark': {
          50: '#2A2825',
          100: '#1E1C1A',
          200: '#161412',
          300: '#0F0E0D',
          400: '#0A0908',
        },
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Playfair Display, Georgia, serif',
            lineHeight: '1.8',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
