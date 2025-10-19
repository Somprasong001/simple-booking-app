/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: { 500: '#0D9488' },
        slate: { 
          50: '#F8FAFC',
          200: '#E2E8F0',
          500: '#64748B',
          800: '#1E293B'
        }
      },
    },
  },
  plugins: [],
}