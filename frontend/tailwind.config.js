/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kalshi: {
          bg: '#0d0d0d',
          card: '#1a1a1a',
          border: '#2a2a2a',
          green: '#00d26a',
          red: '#ff4757',
        }
      }
    },
  },
  plugins: [],
}
