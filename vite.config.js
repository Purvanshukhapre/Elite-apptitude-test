import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'https://eliterecruitmentbackend-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://eliterecruitmentbackend-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/feedback': {
        target: 'https://eliterecruitmentbackend-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/result': {
        target: 'https://eliterecruitmentbackend-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
