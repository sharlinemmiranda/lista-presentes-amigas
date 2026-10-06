/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sorean: ['Sorean', 'Sorean ExtBd', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
