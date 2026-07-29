import { defineConfig } from 'vite';
import { resolve } from 'path';
import sitemap from 'vite-plugin-sitemap';

const SITE_URL = 'https://tusharjadhav.dev';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  plugins: [
    sitemap({
      hostname: SITE_URL,
      dynamicRoutes: ['/', '/#about', '/#skills', '/#projects', '/#contact'],
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8,
      exclude: ['/404.html'],
    }),
  ],
});