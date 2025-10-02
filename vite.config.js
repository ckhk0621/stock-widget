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

        // Add hash for cache-busting (production)
        // WordPress will need to update script URLs when version changes
        entryFileNames: 'stock-widget.[hash].js',
        chunkFileNames: 'stock-widget-[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) {
            return 'stock-widget.[hash].css';
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

  // Server configuration for development (http://localhost:3008)
  server: {
    port: 3008,
    open: true,
    cors: true
  },

  // Preview server configuration (http://localhost:3008)
  preview: {
    port: 3008,
    cors: true
  }
})
