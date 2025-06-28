import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  base: '/soundboard_launchpad_mini_mkii/', // For GitHub Pages deployment
  plugins: [
    react(),
    tailwindcss(),
  ],
})
