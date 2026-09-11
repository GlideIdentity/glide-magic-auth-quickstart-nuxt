import { getMagicalAuthClient } from '~/server/utils/glideClient'
import {
  MagicalAuthError,
  ErrorCode,
  parseBindingCookie,
} from '@glideidentity/glide-be-node-magical-auth'

/**
 * POST /api/magical-auth/complete
 * 
 * Called by the completion redirect page after carrier authentication.
 * Reads fe_code from the _glide_bind HttpOnly cookie (auto-attached by the browser),
 * agg_code and session_key from the POST body, and forwards all three to the
 * aggregator's /complete endpoint via the SDK. Returns 204 on success.
 */
export default defineEventHandler(async (event) => {
  const magicalAuth = getMagicalAuthClient()
  
  if (!magicalAuth) {
    setResponseStatus(event, 503)
    return { error: 'SERVICE_UNAVAILABLE', message: 'Server not configured.', status: 503 }
  }

  const body = await readBody(event)
  const { session_key, agg_code } = body

  if (!session_key || !agg_code) {
    setResponseStatus(event, 400)
    return { error: ErrorCode.VALIDATION_ERROR, message: 'session_key and agg_code are required', status: 400 }
  }

  // Read fe_code from the session-scoped HttpOnly cookie (set during prepare)
  const cookieHeader = getHeader(event, 'cookie')
  const feCode = cookieHeader ? parseBindingCookie(cookieHeader, session_key) : undefined

  if (!feCode) {
    console.error('❌ Complete: device binding cookie missing or invalid')
    setResponseStatus(event, 403)
    return {
      error: ErrorCode.MISSING_BINDING_COOKIE,
      message: 'Device binding cookie is missing. The prepare and complete must happen in the same browser.',
      status: 403,
    }
  }

  try {
    console.log('🔐 Complete request for session:', session_key.substring(0, 8) + '...')

    // The SDK validates the binding codes and completes the session
    await magicalAuth.complete({ session_key, fe_code: feCode, agg_code })

    console.log('✅ Complete succeeded')

    // The device binding cookie is intentionally not cleared here — it is needed
    // by the process step (/verify-phone-number or /get-phone-number) for continued
    // device binding validation. The cookie auto-expires after 5 minutes.
    setResponseStatus(event, 204)
    return null
  } catch (error: unknown) {
    console.error('❌ Complete error:', error)

    if (error instanceof MagicalAuthError) {
      setResponseStatus(event, error.status || 500)
      return { error: error.code, message: error.message, status: error.status }
    }

    setResponseStatus(event, 500)
    return { error: ErrorCode.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred', status: 500 }
  }
})
