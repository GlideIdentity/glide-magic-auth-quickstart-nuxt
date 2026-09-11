import { getMagicalAuthClient, isGlideConfigured } from '~/server/utils/glideClient'

export default defineEventHandler(async (event) => {
  const magicalAuth = getMagicalAuthClient()
  const hasCredentials = isGlideConfigured()
  
  return {
    status: 'ok',
    sdk: '@glideidentity/glide-be-node-magical-auth',
    sdkInitialized: !!magicalAuth,
    env: {
      hasClientId: !!process.env.GLIDE_CLIENT_ID,
      hasClientSecret: !!process.env.GLIDE_CLIENT_SECRET,
      apiBaseUrl: process.env.GLIDE_API_BASE_URL || 'https://api.glideidentity.app',
    },
  }
})
