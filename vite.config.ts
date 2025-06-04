import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env': {
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
        VITE_OPENAI_API_KEY: env.VITE_OPENAI_API_KEY,
      }
    },
    // Configure server to be accessible on your network
    server: {
      host: '0.0.0.0',  // Listen on all network interfaces
      port: 8080,
      proxy: {
        // Proxy API requests to the backend server
        '/api': {
          target: 'http://localhost:3001', // Your Express server URL
          changeOrigin: true,
        },
      },
      // Add headers required for SharedArrayBuffer and adjust CSP for transformers.js
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'credentialless', // Changed from require-corp to allow Supabase images
        'Content-Security-Policy': "script-src 'self' blob: 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co/ https://js.stripe.com; frame-src 'self' https://js.stripe.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self';",
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ['@xenova/transformers'], // Optimize the transformers library
    },

    base: '/cake-ordering-gateway/', // Match your GitHub repository name exactly
    build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
  };
});