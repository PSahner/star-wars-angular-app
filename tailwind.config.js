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
        'sw-yellow': '#FFE81F',
        'sw-dark-blue': '#10172C',
        'sw-navy-blue': '#00305A',
        'sw-silver': '#BBBBBB',
        'sw-dark-silver': '#A0A0A0',
        'sw-platinum': '#F1F1F1',
        'sw-dark-platinum': '#DBDCE0',
        'sw-granite': '#8C8A93',
        'sw-brandy': '#822717',
        'sw-white': '#FFFFFF'
      },
      fontFamily: {
        'star-wars': ['Star Wars', 'Arial', 'sans-serif'],
        'roboto': ['Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
