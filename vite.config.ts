import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ═══════════════════════════════════════════════════════════
  // BASE PATH (importante para Vercel)
  // ═══════════════════════════════════════════════════════════
  base: '/',

  // ═══════════════════════════════════════════════════════════
  // SERVER CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  server: {
    host: '::',
    port: 8080,
    strictPort: false,
    open: false,
    cors: true,
  },

  // ═══════════════════════════════════════════════════════════
  // PREVIEW CONFIGURATION
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
      // ✅ SWC otimizado para React puro (sem Emotion)
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
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2020',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Rollup options para otimização de chunks
    rollupOptions: {
      output: {
        // ✅ Manual chunk splitting corrigido
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }

          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }

          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }

          // Video player
          if (id.includes('node_modules/plyr')) {
            return 'video-vendor';
          }

          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }

          // Other large dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // Naming pattern para assets
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        },
        
        // Naming pattern para chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Compression
    cssCodeSplit: true,
    
    // Report compressed size (desabilitar em CI para velocidade)
    reportCompressedSize: mode !== 'production',
    
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
      'lucide-react',
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
    // Remove console.log e debugger em produção
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Otimizações de minificação
    ...(mode === 'production' && {
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    }),
  },

  // ═══════════════════════════════════════════════════════════
  // CSS OPTIONS
  // ═══════════════════════════════════════════════════════════
  css: {
    devSourcemap: mode === 'development',
    modules: {
      localsConvention: 'camelCase',
    },
    // Minificação CSS
    ...(mode === 'production' && {
      preprocessorOptions: {
        css: {
          charset: false,
        },
      },
    }),
  },

  // ═══════════════════════════════════════════════════════════
  // DEFINE (constantes globais)
  // ═══════════════════════════════════════════════════════════
  define: {
    __DEV__: JSON.stringify(mode === 'development'),
    __PROD__: JSON.stringify(mode === 'production'),
  },
}));
