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
    
    console.log('🔄 Process request:', { use_case: body.use_case })
    
    // Determine which method to call based on use_case
    let result
    if (body.use_case === 'GetPhoneNumber') {
      result = await glide.magicAuth.getPhoneNumber({
        session: body.session,
        credential: body.credential,
      })
    } else if (body.use_case === 'VerifyPhoneNumber') {
      result = await glide.magicAuth.verifyPhoneNumber({
        session: body.session,
        credential: body.credential,
      })
    } else {
      setResponseStatus(event, 400)
      return {
        error: 'INVALID_USE_CASE',
        message: `Invalid use_case: ${body.use_case}`,
        status: 400,
      }
    }
    
    console.log('✅ Process success:', { 
      phone_number: result.phone_number ? '***' + result.phone_number.slice(-4) : undefined,
      verified: 'verified' in result ? result.verified : undefined
    })
    
    return result
  } catch (error: any) {
    console.error('❌ Process error:', error)
    
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
