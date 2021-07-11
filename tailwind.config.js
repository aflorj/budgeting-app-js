module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './src/**/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        highlight: 'highlight 7s infinite',
      },
      keyframes: {
        highlight: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      fontFamily: {
        body: ['Inter'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
