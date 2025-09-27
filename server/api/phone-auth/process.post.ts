import { GlideClient, MagicAuthError } from 'glide-sdk'

// Type definitions
interface PhoneAuthProcessRequest {
  response?: any; // The credential response object from the client
  credentialResponse?: any; // Alternative name for credential response
  sessionInfo?: any;  // Full SessionInfo object from prepare response
  session?: any;  // Alternative name for sessionInfo
  phoneNumber?: string;
  phone_number?: string; // Alternative snake_case name
  useCase?: string;
  options?: any;  // Optional options for session metadata
}

interface AuthProcessResponse {
  phone_number?: string;
  phoneNumber?: string;
  verified?: boolean;
  [key: string]: any;
}

// Initialize Glide client
const apiKey = process.env.GLIDE_API_KEY
const apiBaseUrl = process.env.GLIDE_API_BASE_URL || 'https://api.glideidentity.app'

let glide: GlideClient | null = null
if (apiKey) {
  glide = new GlideClient({
    apiKey: apiKey,
    internal: {
      apiBaseUrl: apiBaseUrl,
      authBaseUrl: process.env.GLIDE_AUTH_BASE_URL || 'https://oidc.gateway-x.io'
    }
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
    const body = await readBody<PhoneAuthProcessRequest>(event)
    console.log('/api/phone-auth/process', body)
    
    // Handle both camelCase and snake_case property names
    // Also handle the new 'session' field name from updated SDK
    const response = body.response || body.credentialResponse || body.credential
    const sessionInfo = body.sessionInfo || body.session || body.session_info
    const phoneNumber = body.phoneNumber || body.phone_number
    const useCase = body.useCase || body.use_case
    
    // Determine which SDK method to use based on useCase
    let result: AuthProcessResponse
    
    if (useCase === 'GetPhoneNumber') {
      console.log('Calling glide.magicAuth.getPhoneNumber with sessionInfo:', sessionInfo)
      result = await glide.magicAuth.getPhoneNumber({
        sessionInfo: sessionInfo,
        credential: response
      })
      console.log('GetPhoneNumber Response:', result)
    } else if (useCase === 'VerifyPhoneNumber') {
      console.log('Calling glide.magicAuth.verifyPhoneNumber with sessionInfo:', sessionInfo)
      result = await glide.magicAuth.verifyPhoneNumber({
        sessionInfo: sessionInfo,
        credential: response
      })
      console.log('VerifyPhoneNumber Response:', result)
    } else {
      // Fallback - use getPhoneNumber if no phoneNumber, verifyPhoneNumber if phoneNumber provided
      if (phoneNumber) {
        console.log('Using verifyPhoneNumber (fallback)')
        result = await glide.magicAuth.verifyPhoneNumber({
          sessionInfo: sessionInfo,
          credential: response
        })
      } else {
        console.log('Using getPhoneNumber (fallback)')
        result = await glide.magicAuth.getPhoneNumber({
          sessionInfo: sessionInfo,
          credential: response
        })
      }
    }
    
    console.log('Response from SDK:', result)
    
    // Normalize the response format
    return {
      phone_number: result.phone_number || result.phoneNumber,
      phoneNumber: result.phone_number || result.phoneNumber,
      verified: result.verified !== undefined ? result.verified : undefined,
      success: true,
      ...result
    }
  } catch (error: any) {
    console.error('Phone auth process error:', error)
    
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