import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 8000, // Use port 8000
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'chat.jeerasakananta.dev',
      '.jeerasakananta.dev' // Allow all subdomains
    ],
  },
  plugins: [react()],

  css: {
    postcss: {
      plugins: [
        tailwindcss, // Tailwind CSS plugin
        autoprefixer, // Autoprefixer plugin
      ],
    },
  },
});
