// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false, // Disable SSR for Web Credentials API compatibility
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Magical Auth Quick Start',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/Glide-Logomark.svg' }
      ]
    }
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    // OAuth2 credentials are read directly from process.env in glideClient.ts
    glideDebug: process.env.GLIDE_DEBUG === 'true',
    // Public keys (exposed to client-side)
    public: {
      // Any public config here
    }
  },
  nitro: {
    esbuild: {
      options: {
        target: 'ES2022'
      }
    }
  }
})
