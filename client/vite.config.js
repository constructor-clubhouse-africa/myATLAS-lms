import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'myATLAS',
        short_name: 'myATLAS',
        theme_color: '#074e67',
        background_color: '#d7ccc8',
        icons: [
          {
            src: 'myatlas-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'myatlas-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
