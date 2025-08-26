import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    // Enable gzip compression for production
    compression({
      algorithm: "gzip",
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Enable brotli compression for production
    compression({
      algorithm: "brotliCompress",
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Bundle analyzer for performance optimization
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      port: 5173,
      host: "localhost",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Enable source maps for debugging
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],
          utils: ["axios", "lodash", "moment"],
          routing: ["react-router-dom"],
        },
        // Optimize chunk naming
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Target modern browsers
    target: "es2015",
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "lodash",
      "moment",
    ],
    // Exclude problematic dependencies
    exclude: ["@radix-ui/react-icons"],
  },
  // Performance optimizations
  esbuild: {
    // Enable tree shaking
    treeShaking: true,
    // Target modern browsers
    target: "es2015",
  },
  // CSS optimizations
  css: {
    // Enable CSS modules
    modules: {
      localsConvention: "camelCase",
    },
    // PostCSS configuration
    postcss: {
      plugins: [require("autoprefixer"), require("tailwindcss")],
    },
  },
  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    __PROD__: JSON.stringify(process.env.NODE_ENV === "production"),
  },
  // Experimental features for better performance
  experimental: {
    // Enable render worker
    renderWorker: true,
  },
});
