import { getMagicalAuthClient } from '~/server/utils/glideClient'
import {
  UseCase,
  MagicalAuthError,
  ErrorCode,
  parseBindingCookie,
  type GetPhoneNumberRequest,
  type VerifyPhoneNumberRequest,
} from '@glideidentity/glide-be-node-magical-auth'

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
    
    console.log('🔐 Process request:', { use_case: body.use_case })

    if (!body.use_case || !body.session || !body.credential) {
      setResponseStatus(event, 400)
      return { error: ErrorCode.VALIDATION_ERROR, message: 'use_case, session, and credential are required', status: 400 }
    }

    // Read the device binding code from the HttpOnly cookie set during prepare.
    // This extends device binding verification to the process step (link protocol only).
    const sessionKey = body.session?.session_key
    const cookieHeader = getHeader(event, 'cookie')
    const feCode = sessionKey && cookieHeader ? parseBindingCookie(cookieHeader, sessionKey) : undefined
    if (feCode) {
      console.log('🔒 Device binding cookie found for process step')
    }

    let result
    if (body.use_case === UseCase.GET_PHONE_NUMBER) {
      result = await magicalAuth.getPhoneNumber({
        session: body.session,
        credential: body.credential,
        ...(feCode && { fe_code: feCode }),
      } as GetPhoneNumberRequest)
      console.log('✅ GetPhoneNumber success:', { 
        phone_number: result.phone_number ? '***' + result.phone_number.slice(-4) : undefined 
      })
    } else if (body.use_case === UseCase.VERIFY_PHONE_NUMBER) {
      result = await magicalAuth.verifyPhoneNumber({
        session: body.session,
        credential: body.credential,
        ...(feCode && { fe_code: feCode }),
      } as VerifyPhoneNumberRequest)
      console.log('✅ VerifyPhoneNumber success:', { 
        verified: result.verified,
        has_sim_swap: !!result.sim_swap,
        has_device_swap: !!result.device_swap,
      })
    } else {
      setResponseStatus(event, 400)
      return {
        error: ErrorCode.VALIDATION_ERROR,
        message: `Invalid use_case: ${body.use_case}`,
        status: 400,
      }
    }
    
    // The device binding cookie auto-expires (5 min Max-Age), so explicit clearing
    // is optional. Developers can clear it here for immediate cleanup if desired.

    return result
  } catch (error: unknown) {
    console.error('❌ Process error:', error)
    
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
