// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'Nodejs-LoginForm', // 👈 replace with your repo name
  plugins: [react()],
});
