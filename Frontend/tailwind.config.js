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
          green: '#166534',
          greenLight: '#22c55e',
          border: '#e5e7eb',
          muted: '#6b7280',
          text: '#1f2937',
          terracotta: '#b91c1c',
          sand: '#fef3c7',
        },
      },
    },
  },
  plugins: [],
}
