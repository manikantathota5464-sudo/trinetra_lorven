/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trinethra: {
          navy: '#0C2540',
          navyLight: '#18385A',
          cream: '#FAF8F5',
          creamDark: '#F4F0E8',
          accent: '#0C2540',
        }
      }
    },
  },
  plugins: [],
}
