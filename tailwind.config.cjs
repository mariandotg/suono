/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.{html,js, ts}', './src/**/*.{html,js, ts}'],
  theme: {
    extend: {
      borderRadius: {
        base: '8px',
      },
      colors: {
        accent: '#FF6600',
        background: '#000000',
        text: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
