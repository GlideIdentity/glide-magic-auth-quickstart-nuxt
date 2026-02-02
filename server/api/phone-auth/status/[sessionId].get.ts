/**
 * Status Proxy Endpoint
 * 
 * Proxies status polling requests to the Glide Magical Auth API.
 * Uses the status_url from the prepare response (stored server-side).
 * 
 * WHY USE A PROXY?
 * 1. Debugging: See polling requests in your server logs
 * 2. CORS: Avoid cross-origin issues in some environments
 * 
 * TO BYPASS THIS PROXY:
 * Comment out the 'polling' endpoint in your SDK config on the frontend.
 * The SDK will then call the Magical Auth status URL directly.
 */
import { getStatusUrl } from '~/server/utils/sessionStore'

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')
  
  if (!sessionId) {
    setResponseStatus(event, 400)
    return { error: 'Missing session ID' }
  }

  // Get the status URL that was stored during prepare
  const statusUrl = getStatusUrl(sessionId)
  
  if (!statusUrl) {
    console.warn(`[Status Proxy] No stored status URL for session: ${sessionId.substring(0, 8)}...`)
    setResponseStatus(event, 404)
    return { 
      error: 'SESSION_NOT_FOUND',
      message: 'Session not found. It may have expired or prepare was not called.'
    }
  }

  try {
    console.log(`[Status Proxy] Polling session: ${sessionId.substring(0, 8)}...`)
    
    const response = await fetch(statusUrl, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.log(`[Status Proxy] Status check returned ${response.status}`)
      const errorText = await response.text()
      setResponseStatus(event, response.status)
      return { error: 'Status check failed', details: errorText }
    }

    const data = await response.json()
    console.log(`[Status Proxy] Status:`, data.status)
    
    return data
  } catch (error: any) {
    console.error('[Status Proxy] Error:', error.message)
    setResponseStatus(event, 500)
    return { error: 'Failed to check status', message: error.message }
  }
})
