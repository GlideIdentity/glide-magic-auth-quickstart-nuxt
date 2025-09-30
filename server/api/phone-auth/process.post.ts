import { 
  GlideClient, 
  MagicAuthError,
  MagicAuthErrorCode,
  UseCase
} from 'glide-sdk'
import type {
  GetPhoneNumberRequest,
  GetPhoneNumberResponse,
  VerifyPhoneNumberRequest,
  VerifyPhoneNumberResponse,
  UseCaseType
} from 'glide-sdk'

// Define SessionInfo interface matching what frontend sends
// This matches the API specification
interface SessionInfo {
  session_key: string;
  nonce: string;
  enc_key: string;
}

// Type definition for phone auth process request from frontend
// This represents the HTTP request body structure, not an SDK type
interface PhoneAuthProcessRequest {
  // Required fields (snake_case as per API spec)
  credential: string;  // Credential string from frontend
  session: SessionInfo;  // Session from prepare response
  
  // Optional fields
  phone_number?: string; // For verify use case
  use_case?: UseCaseType;
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
    const body = await readBody<PhoneAuthProcessRequest>(event)
    console.log('/api/phone-auth/process', body)
    
    // Extract fields from request (API spec uses snake_case)
    const { credential, session, phone_number, use_case } = body
    
    // Validate required fields
    if (!credential) {
      setResponseStatus(event, 400)
      return {
        error: MagicAuthErrorCode.MISSING_PARAMETERS,
        message: 'Missing required field: credential',
        status: 400,
        timestamp: new Date().toISOString()
      }
    }

    if (!session) {
      setResponseStatus(event, 400)
      return {
        error: MagicAuthErrorCode.MISSING_PARAMETERS,
        message: 'Missing required field: session',
        status: 400,
        timestamp: new Date().toISOString()
      }
    }
    
    // Determine which SDK method to use based on useCase
    let result: GetPhoneNumberResponse | VerifyPhoneNumberResponse
    
    if (use_case === UseCase.GET_PHONE_NUMBER) {
      console.log('Calling glide.magicAuth.getPhoneNumber')
      // Rebuild credential structure for Node SDK
      const getParams: GetPhoneNumberRequest = {
        sessionInfo: session,
        credential: {
          vp_token: { glide: credential }  // SDK expects this format
        }
      }
      result = await glide.magicAuth.getPhoneNumber(getParams)
      console.log('GetPhoneNumber Response:', result)
    } else if (use_case === UseCase.VERIFY_PHONE_NUMBER) {
      console.log('Calling glide.magicAuth.verifyPhoneNumber')
      // Rebuild credential structure for Node SDK
      const verifyParams: VerifyPhoneNumberRequest = {
        sessionInfo: session,
        credential: {
          vp_token: { glide: credential }  // SDK expects this format
        }
      }
      result = await glide.magicAuth.verifyPhoneNumber(verifyParams)
      console.log('VerifyPhoneNumber Response:', result)
    } else {
      // Fallback - use getPhoneNumber if no phone_number, verifyPhoneNumber if phone_number provided
      if (phone_number) {
        console.log('Using verifyPhoneNumber (fallback)')
        // Rebuild credential structure for Node SDK
        const verifyParams: VerifyPhoneNumberRequest = {
          sessionInfo: session,
          credential: {
            vp_token: { glide: credential }  // SDK expects this format
          }
        }
        result = await glide.magicAuth.verifyPhoneNumber(verifyParams)
      } else {
        console.log('Using getPhoneNumber (fallback)')
        // Rebuild credential structure for Node SDK
        const getParams: GetPhoneNumberRequest = {
          sessionInfo: session,
          credential: {
            vp_token: { glide: credential }  // SDK expects this format
          }
        }
        result = await glide.magicAuth.getPhoneNumber(getParams)
      }
    }
    
    console.log('Response from SDK:', result)
    
    // Return the result directly - it already follows the API spec
    return result
  } catch (error) {
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
    
    // Handle other errors - use 422 for business logic errors, 500 for true server errors
    console.error('Phone auth process error:', error instanceof Error ? error.message : error)
    // Check if it's a network/system error that should be 500
    const isServerError = error instanceof Error && (
      error.message.toLowerCase().includes('network') || 
      error.message.toLowerCase().includes('timeout') ||
      error.message.toLowerCase().includes('econnrefused') ||
      error.message.toLowerCase().includes('enotfound') ||
      error.name === 'TypeError' || // Often indicates system-level issues
      error.name === 'ReferenceError' // Programming errors
    );
    const statusCode = isServerError ? 500 : 422;
    
    setResponseStatus(event, statusCode)
    return { 
      error: isServerError ? MagicAuthErrorCode.INTERNAL_SERVER_ERROR : MagicAuthErrorCode.UNPROCESSABLE_ENTITY,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: statusCode,
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }
  }
})