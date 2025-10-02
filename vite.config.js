import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for debugging
    sourcemap: true,

    // Asset handling
    assetsDir: 'assets',

    // Optimize for embedding
    rollupOptions: {
      output: {
        // Single bundle for easy embedding
        manualChunks: undefined,

        // Consistent naming for easier WordPress integration
        entryFileNames: 'stock-widget.js',
        chunkFileNames: 'stock-widget-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) {
            return 'stock-widget.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },

    // Minify for production (using esbuild for faster builds)
    minify: 'esbuild'
  },

  // Base path for assets (change when deploying to subdirectory)
  base: './',

  // Server configuration for development
  server: {
    port: 3000,
    open: true,
    cors: true
  },

  // Preview server configuration
  preview: {
    port: 3000,
    cors: true
  }
})
