import { GlideClient } from 'glide-sdk'
import type { LogFormat } from 'glide-sdk'
import dotenv from 'dotenv'

// Load environment variables once
dotenv.config()

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

  // Check if we have an API key
  const apiKey = process.env.GLIDE_API_KEY
  if (!apiKey) {
    console.warn('GLIDE_API_KEY not found in environment variables')
    return null
  }

  // Create and cache the client instance
  glideClient = new GlideClient({
    apiKey: apiKey,
    internal: {
      apiBaseUrl: process.env.GLIDE_API_BASE_URL || 'https://api.glideidentity.app',
      authBaseUrl: process.env.GLIDE_AUTH_BASE_URL || 'https://oidc.gateway-x.io'
    },
    // Clean configuration - SDK handles the priority correctly
    debug: process.env.GLIDE_DEBUG === 'true',
    logFormat: (process.env.GLIDE_LOG_FORMAT as LogFormat) || 'pretty'
  })

  console.log('Glide client initialized (singleton)')
  return glideClient
}

/**
 * Check if the Glide client is configured
 */
export function isGlideConfigured(): boolean {
  return !!process.env.GLIDE_API_KEY
}
