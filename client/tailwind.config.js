// สีแบรนด์ RMUTL (น้ำตาล-ทอง) ใช้แทนชุดสี blue/purple/indigo เดิมทั้งแอป
const brand = {
  50: '#faf6ef',
  100: '#f1e8d6',
  200: '#e2d0aa',
  300: '#d1b57d',
  400: '#bd9c5b',
  500: '#a88f58',
  600: '#8a6f3a',
  700: '#6f5830',
  800: '#54402c',
  900: '#3a2b1f',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'rmutl-brown': '#4b382a',
        'rmutl-gold': '#a88f58',
        'rmutl-tan': '#a19282',
        // Enhanced color palette
        primary: brand,
        blue: brand,
        indigo: brand,
        purple: brand,
        violet: brand,
        pink: brand,
        sky: brand,
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        chat: {
          bg: 'var(--chat-bg, #1c1510)',
          sidebar: 'var(--chat-sidebar, #261d16)',
          'message-user': 'var(--chat-message-user, #8a6f3a)',
          'message-bot': 'var(--chat-message-bot, #33281f)',
          input: 'var(--chat-input, #3d3025)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        thai: ['Sarabun', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(168, 143, 88, 0.3)',
        'glow-lg': '0 0 40px rgba(168, 143, 88, 0.4)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
