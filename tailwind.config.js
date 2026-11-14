/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",        // for Next.js /app directory
    "./pages/**/*.{js,ts,jsx,tsx}",      // in case you're using /pages
    "./components/**/*.{js,ts,jsx,tsx}", // your custom components
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Geist',
          'Inter',
          'Satoshi',
          'Manrope',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
