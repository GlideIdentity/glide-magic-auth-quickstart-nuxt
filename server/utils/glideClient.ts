import { MagicalAuthClient, type Logger } from '@glideidentity/glide-be-node-magical-auth'

// Create a singleton instance of the Magical Auth client
let magicalAuthClient: MagicalAuthClient | null = null

// Console logger that respects GLIDE_DEBUG env var for debug-level messages
const consoleLogger: Logger = {
  debug: (msg, meta) => { if (process.env.GLIDE_DEBUG === 'true') console.debug(`[SDK] ${msg}`, meta ?? '') },
  info: (msg, meta) => console.info(`[SDK] ${msg}`, meta ?? ''),
  warn: (msg, meta) => console.warn(`[SDK] ${msg}`, meta ?? ''),
  error: (msg, meta) => console.error(`[SDK] ${msg}`, meta ?? ''),
}

/**
 * Get or create the shared MagicalAuth client instance.
 * This ensures we only create one client for the entire server.
 */
export function getMagicalAuthClient(): MagicalAuthClient | null {
  if (magicalAuthClient) {
    return magicalAuthClient
  }

  const clientId = process.env.GLIDE_CLIENT_ID
  const clientSecret = process.env.GLIDE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.warn('GLIDE_CLIENT_ID and/or GLIDE_CLIENT_SECRET not found in environment variables')
    return null
  }

  magicalAuthClient = new MagicalAuthClient({
    clientId,
    clientSecret,
    ...(process.env.GLIDE_API_BASE_URL && { baseUrl: process.env.GLIDE_API_BASE_URL }),
    logger: consoleLogger,
  })

  console.log('✅ MagicalAuth SDK initialized')
  return magicalAuthClient
}

/**
 * Check if the MagicalAuth client is configured
 */
export function isGlideConfigured(): boolean {
  return !!(process.env.GLIDE_CLIENT_ID && process.env.GLIDE_CLIENT_SECRET)
}
