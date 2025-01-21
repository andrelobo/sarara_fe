import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(), // Dividir dependências em chunks separados
  ],
  build: {
    target: 'es2015', // Melhor suporte para navegadores modernos
    minify: 'esbuild', // Usa o esbuild para minificar, é mais rápido e eficiente
    cssCodeSplit: true, // Dividir o CSS em arquivos menores
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'], // Separar React em um chunk dedicado
        },
      },
    },
  },
  server: {
    // Opcional: Habilitar compressão durante o desenvolvimento
    compress: true,
  },
});
