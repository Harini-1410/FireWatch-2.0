/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          dark: '#070a12',
          card: '#111827',
          panel: '#131b2e',
          border: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
