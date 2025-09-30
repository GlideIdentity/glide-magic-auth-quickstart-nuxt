import { GlideClient } from 'glide-sdk'

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

// Initialize Glide client only if API key is available
let glide: GlideClient | null = null
try {
  if (process.env.GLIDE_API_KEY) {
    glide = new GlideClient({
      apiKey: process.env.GLIDE_API_KEY
    })
  }
} catch (error) {
  console.warn('Failed to initialize GlideClient:', error)
}

export default defineEventHandler(async (event): Promise<HealthCheckResponse> => {
  const hasCredentials = !!process.env.GLIDE_API_KEY
  
  return {
    status: 'ok',
    glideInitialized: !!glide,
    glideProperties: glide ? Object.keys(glide) : [],
    env: {
      hasApiKey: !!process.env.GLIDE_API_KEY,
      apiBaseUrl: process.env.GLIDE_API_BASE_URL || 'https://api.glideidentity.app'
    },
    mode: hasCredentials ? 'local' : 'external'
  }
}) 