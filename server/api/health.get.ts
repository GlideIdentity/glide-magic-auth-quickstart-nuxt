import { getGlideClient, isGlideConfigured } from '~/server/utils/glideClient'

// Health check endpoint response type
// This is a custom endpoint, not an SDK type
interface HealthCheckResponse {
  status: string
  glideInitialized: boolean
  glideProperties: string[]
  env: {
    hasApiKey: boolean
    apiBaseUrl: string
  }
  mode: 'local' | 'external'
}

export default defineEventHandler(async (event): Promise<HealthCheckResponse> => {
  const glide = getGlideClient()
  const hasCredentials = isGlideConfigured()
  
  return {
    status: 'ok',
    glideInitialized: !!glide,
    glideProperties: glide ? Object.keys(glide) : [],
    env: {
      hasApiKey: hasCredentials,
      apiBaseUrl: process.env.GLIDE_API_BASE_URL || 'https://api.glideidentity.app'
    },
    mode: hasCredentials ? 'local' : 'external'
  }
}) 