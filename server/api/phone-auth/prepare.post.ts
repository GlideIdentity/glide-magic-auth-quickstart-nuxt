import { getGlideClient } from '~/server/utils/glideClient'
import { storeStatusUrl, extractStatusUrl } from '~/server/utils/sessionStore'

// Default T-Mobile US PLMN (used when client doesn't provide one)
const DEFAULT_PLMN = { mcc: '310', mnc: '260' }

export default defineEventHandler(async (event) => {
  const glide = getGlideClient()
  
  if (!glide) {
    setResponseStatus(event, 503)
    return {
      error: 'SERVICE_UNAVAILABLE',
      message: 'Server not configured. Please set GLIDE_CLIENT_ID and GLIDE_CLIENT_SECRET environment variables.',
      status: 503,
    }
  }

  try {
    const body = await readBody(event)
    
    const prepareRequest = { ...body }
    
    // Apply default PLMN for GetPhoneNumber if not provided
    const isGetPhoneNumber = prepareRequest.use_case === 'GetPhoneNumber'
    if (isGetPhoneNumber && !prepareRequest.plmn) {
      prepareRequest.plmn = DEFAULT_PLMN
      console.log('📶 PLMN not provided in request, defaulting to T-Mobile US (MCC: 310, MNC: 260)')
    }
    
    console.log('📱 Prepare request:', { use_case: prepareRequest.use_case })
    
    const response = await glide.magicalAuth.prepare(prepareRequest)
    
    console.log('✅ Prepare success:', { 
      strategy: response.authentication_strategy,
      session_key: response.session?.session_key 
    })
    
    // Store status_url for the polling proxy endpoint
    const statusUrl = extractStatusUrl(response)
    if (statusUrl && response.session?.session_key) {
      storeStatusUrl(response.session.session_key, statusUrl)
    }
    
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
      ...(error.details && { details: error.details }),
    }
  }
})
