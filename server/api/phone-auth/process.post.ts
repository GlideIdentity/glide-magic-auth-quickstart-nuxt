import { 
  MagicAuthError,
  MagicAuthErrorCode,
  UseCase
} from 'glide-sdk'
import type {
  GetPhoneNumberRequest,
  GetPhoneNumberResponse,
  VerifyPhoneNumberRequest,
  VerifyPhoneNumberResponse
} from 'glide-sdk'
// Import web SDK types for request body (they include use_case)
import type {
  GetPhoneNumberRequest as WebGetPhoneNumberRequest,
  VerifyPhoneNumberRequest as WebVerifyPhoneNumberRequest
} from 'glide-web-client-sdk'
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
    // Get typed request body - will be either GetPhoneNumberRequest or VerifyPhoneNumberRequest
    // from the web SDK, both of which include use_case
    const body = await readBody<WebGetPhoneNumberRequest | WebVerifyPhoneNumberRequest>(event)
    
    // Determine which SDK method to call based on use_case
    // The Node SDK methods automatically add use_case internally
    if (body.use_case === UseCase.GET_PHONE_NUMBER) {
      const requestParams: GetPhoneNumberRequest = {
        session: body.session,
        credential: body.credential
        // Node SDK automatically adds use_case internally
      }
      const result = await glide.magicAuth.getPhoneNumber(requestParams)
      return result
    } else if (body.use_case === UseCase.VERIFY_PHONE_NUMBER) {
      const requestParams: VerifyPhoneNumberRequest = {
        session: body.session,
        credential: body.credential
        // Node SDK automatically adds use_case internally
      }
      const result = await glide.magicAuth.verifyPhoneNumber(requestParams)
      return result
    } else {
      // This should never happen as the union types enforce valid use_case values
      throw new MagicAuthError({
        code: MagicAuthErrorCode.VALIDATION_ERROR,
        message: `Invalid use_case. Must be '${UseCase.GET_PHONE_NUMBER}' or '${UseCase.VERIFY_PHONE_NUMBER}'`,
        status: 400
      })
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