module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './src/**/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        highlight: 'highlight 4s infinite',
      },
      keyframes: {
        highlight: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(20px, -30px) scale(1.08)',
          },
          '66%': {
            transform: 'translate(-15px, 15px) scale(0.95)',
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
