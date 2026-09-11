import { getMagicalAuthClient } from '~/server/utils/glideClient'
import {
  UseCase,
  MagicalAuthError,
  ErrorCode,
  BINDING_COOKIE_MAX_AGE,
  getBindingCookieName,
  type PrepareRequest,
} from '@glideidentity/glide-be-node-magical-auth'

// Default T-Mobile US PLMN (used when client doesn't provide one)
const DEFAULT_PLMN = { mcc: '310', mnc: '260' }

export default defineEventHandler(async (event) => {
  const magicalAuth = getMagicalAuthClient()
  
  if (!magicalAuth) {
    setResponseStatus(event, 503)
    return {
      error: 'SERVICE_UNAVAILABLE',
      message: 'Server not configured. Please set GLIDE_CLIENT_ID and GLIDE_CLIENT_SECRET environment variables.',
      status: 503,
    }
  }

  try {
    const body = await readBody(event)
    
    if (!body.use_case) {
      setResponseStatus(event, 400)
      return { error: ErrorCode.VALIDATION_ERROR, message: 'use_case is required', status: 400 }
    }

    const prepareRequest = { ...body }
    
    // Apply default PLMN for GetPhoneNumber if not provided
    if (prepareRequest.use_case === UseCase.GET_PHONE_NUMBER && !prepareRequest.plmn) {
      prepareRequest.plmn = DEFAULT_PLMN
      console.log('📶 PLMN not provided in request, defaulting to T-Mobile US (MCC: 310, MNC: 260)')
    }
    
    console.log('📱 Prepare request:', { use_case: prepareRequest.use_case })
    
    // SDK auto-generates fe_code/fe_hash for device binding (link strategy)
    const response = await magicalAuth.prepare(prepareRequest as PrepareRequest)
    
    console.log('✅ Prepare success:', { 
      strategy: response.authentication_strategy,
      session_key: response.session?.session_key 
    })
    
    // Device binding: set HttpOnly cookie with fe_code for link strategy.
    // Each session gets its own cookie (_glide_bind_{sessionKey}), so parallel
    // sessions and retries don't interfere. Old cookies expire via Max-Age.
    if (response.feCode && response.session?.session_key) {
      const sessionKey = response.session.session_key
      const isSecure = getRequestURL(event).protocol === 'https:' 
        || getHeader(event, 'x-forwarded-proto') === 'https'
      const cookieName = getBindingCookieName(sessionKey)
      setCookie(event, cookieName, response.feCode.toLowerCase(), {
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecure,
        path: '/',
        maxAge: BINDING_COOKIE_MAX_AGE,
      })
      console.log('🔒 Device binding cookie set for link strategy')
    }

    // Strip feCode from the response — it must NEVER be sent to the client
    const { feCode: _stripped, ...clientResponse } = response
    return clientResponse
  } catch (error: unknown) {
    console.error('❌ Prepare error:', error)
    
    if (error instanceof MagicalAuthError) {
      setResponseStatus(event, error.status || 500)
      return {
        error: error.code,
        message: error.message,
        requestId: error.requestId,
        status: error.status,
      }
    }

    setResponseStatus(event, 500)
    return {
      error: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500,
    }
  }
})
