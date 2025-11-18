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
      '.jeerasakananta.dev', // Allow all subdomains
    ],
  },
  plugins: [
    react({
      // Enable fast refresh for better development experience
      fastRefresh: true,
    }),
  ],

  css: {
    postcss: {
      plugins: [
        tailwindcss, // Tailwind CSS plugin
        autoprefixer, // Autoprefixer plugin
      ],
    },
  },

  // Build optimizations
  build: {
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@headlessui/react'],
          'markdown-vendor': ['marked'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'esbuild',
    // Generate source maps for production debugging (optional)
    sourcemap: false,
    // Target modern browsers for smaller bundle size
    target: 'es2015',
  },

  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
