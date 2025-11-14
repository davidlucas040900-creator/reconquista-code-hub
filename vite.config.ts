import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ═══════════════════════════════════════════════════════════
  // SERVER CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  server: {
    host: '::',
    port: 8080,
    strictPort: false,
    open: false,
    cors: true,
    // Proxy para Supabase (se necessário em dev)
    // proxy: {
    //   '/api': {
    //     target: process.env.VITE_SUPABASE_URL,
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //   },
    // },
  },

  // ═══════════════════════════════════════════════════════════
  // PREVIEW CONFIGURATION (para npm run preview)
  // ═══════════════════════════════════════════════════════════
  preview: {
    host: '::',
    port: 8080,
    strictPort: false,
    open: false,
  },

  // ═══════════════════════════════════════════════════════════
  // PLUGINS
  // ═══════════════════════════════════════════════════════════
  plugins: [
    react({
      // SWC optimizations
      jsxImportSource: '@emotion/react',
      plugins: [],
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  // ═══════════════════════════════════════════════════════════
  // PATH ALIASES
  // ═══════════════════════════════════════════════════════════
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ═══════════════════════════════════════════════════════════
  // BUILD OPTIMIZATION
  // ═══════════════════════════════════════════════════════════
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: 'esbuild',
    target: 'es2020',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Rollup options para otimização de chunks
    rollupOptions: {
      output: {
        // Manual chunk splitting para melhor cache
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          'supabase-vendor': ['@supabase/supabase-js'],
          'video-vendor': ['plyr', 'plyr-react'],
          
          // Feature chunks
          'auth': [
            './src/contexts/AuthContext',
            './src/hooks/useAuth',
          ],
        },
        
        // Naming pattern para assets
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        // Naming pattern para chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Compression
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // CommonJS options
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

  // ═══════════════════════════════════════════════════════════
  // OPTIMIZATION
  // ═══════════════════════════════════════════════════════════
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'plyr-react',
    ],
    exclude: ['lovable-tagger'],
  },

  // ═══════════════════════════════════════════════════════════
  // ENVIRONMENT VARIABLES
  // ═══════════════════════════════════════════════════════════
  envPrefix: 'VITE_',

  // ═══════════════════════════════════════════════════════════
  // ESBUILD OPTIONS
  // ═══════════════════════════════════════════════════════════
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },

  // ═══════════════════════════════════════════════════════════
  // CSS OPTIONS
  // ═══════════════════════════════════════════════════════════
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
}));
