import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://costmn-be.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    target: ['es2015', 'ios11'],
    cssTarget: ['chrome61', 'safari13.1', 'ios11'],
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer({
          overrideBrowserslist: [
            '> 1%',
            'last 2 versions',
            'iOS >= 11',
            'Safari >= 13.1',
          ],
        }),
      ],
    },
  },
})
