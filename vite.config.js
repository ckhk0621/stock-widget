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

    // Optimize for embedding with code splitting
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: (id) => {
          // React core in separate chunk (rarely changes)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Chart library in separate chunk (large, rarely changes)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/lightweight-charts')) {
            return 'vendor-charts';
          }
          // Other dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Add hash for cache-busting (production)
        // WordPress will need to update script URLs when version changes
        entryFileNames: 'stock-widget.[hash].js',
        chunkFileNames: '[name].[hash].js',
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
