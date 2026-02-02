import { GlideClient, LogLevel } from '@glideidentity/glide-be-sdk-node'
import type { LogFormat } from '@glideidentity/glide-be-sdk-node'

// Create a singleton instance of the Glide client
let glideClient: GlideClient | null = null

/**
 * Get or create the shared Glide client instance
 * This ensures we only create one client for the entire server
 */
export function getGlideClient(): GlideClient | null {
  // Return existing client if already initialized
  if (glideClient) {
    return glideClient
  }

  // Check if we have OAuth2 credentials
  const clientId = process.env.GLIDE_CLIENT_ID
  const clientSecret = process.env.GLIDE_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    console.warn('GLIDE_CLIENT_ID and/or GLIDE_CLIENT_SECRET not found in environment variables')
    return null
  }

  // Create and cache the client instance
  glideClient = new GlideClient({
    clientId,
    clientSecret,
    logLevel: LogLevel.DEBUG,
    logFormat: (process.env.GLIDE_LOG_FORMAT as LogFormat) || 'text',
    // Only set baseUrl if explicitly provided (defaults to production)
    ...(process.env.GLIDE_API_BASE_URL && { baseUrl: process.env.GLIDE_API_BASE_URL }),
  })

  console.log('✅ Glide client initialized')
  return glideClient
}

/**
 * Check if the Glide client is configured
 */
export function isGlideConfigured(): boolean {
  return !!(process.env.GLIDE_CLIENT_ID && process.env.GLIDE_CLIENT_SECRET)
}
