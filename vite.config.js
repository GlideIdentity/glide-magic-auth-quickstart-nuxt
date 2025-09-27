import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      clientPort: 443
    },
    // Allow all hosts including ngrok
    host: '0.0.0.0',
    // Explicitly allow the ngrok host
    allowedHosts: [
      'localhost',
      '3bd09ff68b5c.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io',
      '.ngrok.app'
    ]
  }
})
