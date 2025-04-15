import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    // proxy: {
    //   '/auth': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false
    //   },
    //   '/products': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false
    //   },
    //   '/orders': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false
    //   },
    //   '/cart': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false
    //   },
    //   '/qa': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false
    //   },
    //   '/analytics': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false
    //   }
    // }
  }
})