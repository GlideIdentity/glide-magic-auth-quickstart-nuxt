import { getGlideClient } from '~/server/utils/glideClient'

export default defineEventHandler(async (event) => {
  const glide = getGlideClient()
  
  if (!glide) {
    setResponseStatus(event, 503)
    return {
      error: 'SERVICE_UNAVAILABLE',
      message: 'Server not configured. Please set GLIDE_API_KEY environment variable.',
      status: 503,
    }
  }

  try {
    const body = await readBody(event)
    
    console.log('📱 Prepare request:', { use_case: body.use_case })
    
    const response = await glide.magicAuth.prepare(body)
    
    console.log('✅ Prepare success:', { 
      strategy: response.authentication_strategy,
      session_key: response.session?.session_key 
    })
    
    return response
  } catch (error: any) {
    console.error('❌ Prepare error:', error)
    
    // Pass through server errors as-is
    const status = error.status || 500
    setResponseStatus(event, status)
    return {
      error: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      status,
    }
  }
})
