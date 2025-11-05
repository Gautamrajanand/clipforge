import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Podcastle-inspired primary teal
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6', // Main teal
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        // Pastel feature card colors
        'card-pink': {
          light: '#FFF1F2',
          DEFAULT: '#FFE4E6',
          dark: '#FDE2E4',
        },
        'card-blue': {
          light: '#EFF6FF',
          DEFAULT: '#DBEAFE',
          dark: '#BFDBFE',
        },
        'card-mint': {
          light: '#ECFDF5',
          DEFAULT: '#D1FAE5',
          dark: '#A7F3D0',
        },
        'card-purple': {
          light: '#FAF5FF',
          DEFAULT: '#E9D5FF',
          dark: '#D8B4FE',
        },
        'card-yellow': {
          light: '#FFFBEB',
          DEFAULT: '#FEF3C7',
          dark: '#FDE68A',
        },
        'card-peach': {
          light: '#FFF7ED',
          DEFAULT: '#FFEDD5',
          dark: '#FED7AA',
        },
        // Lime/yellow-green for CTAs (Podcastle style)
        'lime-cta': {
          light: '#ECFCCB',
          DEFAULT: '#C4F82A',
          dark: '#A3E635',
        },
        // Dark backgrounds for hero sections
        'dark-bg': {
          DEFAULT: '#2D3748',
          light: '#374151',
          dark: '#1F2937',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
