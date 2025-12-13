/**
 * Status Proxy Endpoint
 * 
 * This endpoint proxies status polling requests to the Glide Magic Auth API.
 * 
 * WHY USE A PROXY?
 * 1. Debugging: See polling requests in your server logs
 * 2. CORS: Avoid cross-origin issues in some environments
 * 3. Environment flexibility: Route to different Magic Auth servers
 * 
 * TO BYPASS THIS PROXY:
 * Comment out the 'polling' endpoint in your SDK config on the frontend.
 * The SDK will then call the Magic Auth server directly using the status_url
 * from the prepare response, or fall back to the production endpoint.
 */
export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')
  
  if (!sessionId) {
    setResponseStatus(event, 400)
    return { error: 'Missing session ID' }
  }

  try {
    const apiBaseUrl = process.env.GLIDE_API_BASE_URL || 'https://api.glideidentity.app'
    const statusUrl = `${apiBaseUrl}/public/status/${sessionId}`
    
    console.log(`[Status Proxy] Fetching status for session: ${sessionId}`)
    console.log(`[Status Proxy] Using URL: ${statusUrl}`)
    
    const response = await fetch(statusUrl, {
      headers: {
        'Accept': 'application/json',
        ...(process.env.GLIDE_DEV_ENV && { 'developer': process.env.GLIDE_DEV_ENV })
      }
    })

    if (!response.ok) {
      console.log(`[Status Proxy] Status check returned ${response.status}`)
      const errorText = await response.text()
      setResponseStatus(event, response.status)
      return { error: 'Status check failed', details: errorText }
    }

    const data = await response.json()
    console.log(`[Status Proxy] Status response:`, { status: data.status })
    
    return data
  } catch (error: any) {
    console.error('[Status Proxy] Error:', error)
    setResponseStatus(event, 500)
    return { error: 'Failed to check status', message: error.message }
  }
})

