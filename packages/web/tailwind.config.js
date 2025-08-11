/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'base-100': '#121212',
        'base-200': '#1E1E1E',
        'base-300': '#282828',
        'text-primary': '#E0E0E0',
        'text-secondary': '#B3B3B3',
        'brand-primary': '#4f46e5',
        'brand-secondary': '#7c3aed',
      }
    },
  },
  plugins: [],
}
