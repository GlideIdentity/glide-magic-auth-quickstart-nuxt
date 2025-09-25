import { GlideClient, LogLevel, MagicAuthError, MagicAuthPrepareRequest, MagicAuthPrepareResponse } from 'glide-sdk'

// Initialize Glide client
const apiKey = process.env.GLIDE_API_KEY
const apiBaseUrl = process.env.GLIDE_API_BASE_URL || 'https://api.glideidentity.app'

let glide: GlideClient | null = null
if (apiKey) {
  glide = new GlideClient({
    apiKey: apiKey,
    debug: true,
    logLevel: LogLevel.DEBUG
  })
}

export default defineEventHandler(async (event) => {
  // Check if local server is configured
  if (!glide) {
    setResponseStatus(event, 503)
    return {
      error: 'LOCAL_SERVER_NOT_CONFIGURED',
      message: 'Local server is not configured. Please set GLIDE_API_KEY environment variable or use the external server option.',
      details: {
        hasApiKey: !!process.env.GLIDE_API_KEY
      }
    }
  }

  try {
    const body = await readBody<MagicAuthPrepareRequest>(event)
    console.log('/api/phone-auth/prepare', body)
    
    const { use_case, phone_number, plmn, consent_data, client_info } = body

    // Pre-process the request parameters
    const prepareParams: any = {
      use_case
    }

    // Always include phone_number if provided
    if (phone_number) {
      console.log('Including phone number:', phone_number)
      prepareParams.phone_number = phone_number
    }

    // Include PLMN if provided with both mcc and mnc
    if (plmn && plmn.mcc && plmn.mnc) {
      console.log('Including PLMN:', plmn)
      prepareParams.plmn = plmn
    }

    // For GetPhoneNumber use case, if neither phone_number nor PLMN was provided, use default T-Mobile PLMN
    if (use_case === 'GetPhoneNumber' && !phone_number && (!plmn || !plmn.mcc || !plmn.mnc)) {
      console.log('No phone_number or PLMN provided for GetPhoneNumber, using default T-Mobile PLMN')
      prepareParams.plmn = {
        mcc: '310',
        mnc: '260'  // T-Mobile USA
      }
    }

    // Add consent data if provided
    if (consent_data) {
      prepareParams.consent_data = {
        consent_text: consent_data.consent_text,
        policy_link: consent_data.policy_link,
        policy_text: consent_data.policy_text
      }
    }

    // Add client_info if provided (for browser/platform detection)
    if (client_info) {
      console.log('Including client_info:', client_info)
      prepareParams.client_info = client_info
    }

    console.log('Calling glide.magicAuth.prepare with:', prepareParams)
    const response: MagicAuthPrepareResponse = await glide.magicAuth.prepare(prepareParams)
    console.log('Response from SDK:', response)

    // The Node SDK v5.0.0-beta.1 returns the response in the correct format
    if (response.authentication_strategy && response.data && response.session) {
      console.log('Forwarding response from SDK:', response)
      return response
    } else {
      throw new Error('Unexpected response format from Glide SDK')
    }
  } catch (error: any) {
    console.log('Caught error:', error)
    
    if (error instanceof MagicAuthError) {
      // You now have access to all error details
      console.log('MagicAuthError details:', {
        code: error.code,
        message: error.message,
        status: error.status,
        requestId: error.requestId,
        traceId: error.traceId,
        spanId: error.spanId,
        details: error.details
      })
      
      // Return the structured error to frontend with proper status
      const httpStatus = error.status || 500
      setResponseStatus(event, httpStatus)
      return {
        error: error.code,
        message: error.message,
        requestId: error.requestId,
        timestamp: error.timestamp,
        traceId: error.traceId,
        spanId: error.spanId,
        details: error.details,
        status: error.status // Include status in response for client to use
      }
    }
    
    // Handle other errors
    setResponseStatus(event, 500)
    return {
      error: 'UNEXPECTED_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
})