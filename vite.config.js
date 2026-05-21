import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['barchef-mark.svg', 'robots.txt', 'barchef.webp', 'barchef512.webp'],
      manifest: {
        name: 'BarChef',
        short_name: 'BarChef',
        description: 'Gestao inteligente para bares e restaurantes.',
        theme_color: '#0E2A24',
        background_color: '#0E2A24',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/barchef.webp',
            sizes: '192x192',
            type: 'image/webp',
            purpose: 'any maskable',
          },
          {
            src: '/barchef512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2015',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    compress: true,
  },
});
