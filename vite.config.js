import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/webweb/',
  server: {
    port: 3000,
    open: false
  }
});
