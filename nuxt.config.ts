// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false, // Disable SSR for Web Credentials API compatibility
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (only available on server-side)
    glideApiKey: process.env.GLIDE_API_KEY,
    glideApiBaseUrl: process.env.GLIDE_API_BASE_URL || 'https://api.glideidentity.app',
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
