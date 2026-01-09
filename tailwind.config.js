/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '600px',
        md: '728px',
        lg: '984px',
        xl: '1240px',
        '2xl': '1385px',
      },
    },
    extend: {
      keyframes: {
        'slide-down': {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'slide-down': 'slide-down 0.3s ease-out',
      },
      screens: {
        'xs': '400px',
      },
      colors: {
        'star-wars-yellow': '#FFE81F',
        'space-gray': '#1a1a1a',
        'light-text': '#10172C',
        'light-gray': '#BBBBBB',
        'light-gray-hover': '#A0A0A0',
      },
      fontFamily: {
        'star-wars': ['Star Wars', 'Arial', 'sans-serif'],
        'roboto': ['Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
