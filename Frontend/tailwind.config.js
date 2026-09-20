export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        safari: {
          bone: '#f5f0e8',
          green: '#166534',
          greenLight: '#22c55e',
          border: '#e5e7eb',
          muted: '#6b7280',
          text: '#1f2937',
          terracotta: '#b91c1c',
          sand: '#fef3c7',
        },
        sacramento: {
          50: '#e6f0ed',
          100: '#b3d1c7',
          200: '#80b3a1',
          300: '#4d947b',
          400: '#26755f',
          500: '#043927',
          600: '#033220',
          700: '#022a1a',
          800: '#022214',
          900: '#011a0e',
          DEFAULT: '#043927',
        },
        castleton: {
          50: '#e8f0ed',
          100: '#b8d1c7',
          200: '#8ab3a1',
          300: '#5c947b',
          400: '#2e755f',
          500: '#00563F',
          600: '#004d38',
          700: '#004431',
          800: '#003b2a',
          900: '#003223',
          DEFAULT: '#00563F',
        },
        offwhite: {
          50: '#fefcf8',
          100: '#fdfaf2',
          200: '#fcf5e8',
          300: '#faf0de',
          400: '#f8ebd4',
          500: '#f8f4eb',
          600: '#f5f0e8',
          DEFAULT: '#f8f4eb',
        },
        // New color palette
        forest: {
          DEFAULT: '#2E7D32',
          hover: '#1B5E20',
          dark: '#43A047',
          darkHover: '#66BB6A',
        },
        warm: {
          sand: '#F8F6F0',
        },
        gold: {
          DEFAULT: '#D4A017',
          dark: '#E6C15A',
        },
        charcoal: {
          DEFAULT: '#263238',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1D2B22',
        },
        bg: {
          light: '#F8F6F0',
          dark: '#101813',
        },
        border: {
          light: '#E6E2D8',
          dark: '#2F4437',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}