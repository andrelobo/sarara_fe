import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(), // Dividir dependências em chunks separados
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'BarChef',
        short_name: 'BarChef',
        description: 'App para gerenciamento de bebidas e ingredientes',
        theme_color: '#b9e091',
        background_color: '#040404',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2015', // Melhor suporte para navegadores modernos
    minify: 'esbuild', // Usa o esbuild para minificar, mais eficiente
    cssCodeSplit: true, // Divide o CSS em arquivos menores
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Separar React em um chunk dedicado
        },
      },
    },
  },
  server: {
    compress: true, // Habilitar compressão durante o desenvolvimento
  },
});
