/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'rmutl-brown': '#4b382a',
        'rmutl-gold': '#a88f58',
        'rmutl-tan': '#a19282',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
