import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/react') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'chart-vendor';
          }
          if (id.includes('node_modules/fuse') || id.includes('node_modules/date-fns') || id.includes('node_modules/framer-motion')) {
            return 'utils-vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['fuse.js', 'date-fns'],
  },
});
