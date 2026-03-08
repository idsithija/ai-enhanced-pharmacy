/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00d4ff',
          dark: '#00a8cc',
          light: '#33ddff',
        },
        dark: {
          DEFAULT: '#1e293b',
          deeper: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}
