/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '400px',
      },
      colors: {
        'star-wars-yellow': '#FFE81F',
        'star-wars-black': '#000000',
        'space-gray': '#1a1a1a',
      },
      fontFamily: {
        'star-wars': ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
