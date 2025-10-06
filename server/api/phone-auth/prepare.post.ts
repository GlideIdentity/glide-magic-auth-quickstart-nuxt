import { MagicAuthError, MagicAuthErrorCode, UseCase } from 'glide-sdk'
import type { MagicAuthPrepareRequest, MagicAuthPrepareResponse } from 'glide-sdk'
import { getGlideClient } from '~/server/utils/glideClient'

export default defineEventHandler(async (event) => {
  // Get the shared client instance
  const glide = getGlideClient()
  
  // Check if local server is configured
  if (!glide) {
    setResponseStatus(event, 503)
    return {
      error: MagicAuthErrorCode.SERVICE_UNAVAILABLE,
      message: 'Local server is not configured. Please set GLIDE_API_KEY environment variable or use the external server option.',
      status: 503,
      timestamp: new Date().toISOString(),
      details: {
        hasApiKey: !!process.env.GLIDE_API_KEY
      }
    }
  }

  try {
    const body = await readBody<MagicAuthPrepareRequest>(event)
    
    const response = await glide.magicAuth.prepare(body)
    
    return response
  } catch (error) {
    if (error instanceof MagicAuthError) {
      // MagicAuthError already has the correct format - just pass it through
      setResponseStatus(event, error.status || 500)
      return error
    }
    
    // For unexpected errors, return a simple error response
    setResponseStatus(event, 500)
    return {
      error: MagicAuthErrorCode.INTERNAL_SERVER_ERROR,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    }
  }
})