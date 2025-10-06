import { 
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
import { getGlideClient } from '~/server/utils/glideClient'

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
    const body = await readBody<PhoneAuthProcessRequest>(event)
    
    // Simple happy path - pass request body directly
    if (body.use_case === UseCase.GET_PHONE_NUMBER) {
      // Pass the request body as-is - no reconstruction needed
      const result = await glide.magicAuth.getPhoneNumber(body)
      return result
    } else {
      // Default to verify phone number
      // Pass the request body as-is - no reconstruction needed
      const result = await glide.magicAuth.verifyPhoneNumber(body)
      return result
    }
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