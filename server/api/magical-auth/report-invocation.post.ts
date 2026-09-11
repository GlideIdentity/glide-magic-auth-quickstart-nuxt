import { getMagicalAuthClient } from '~/server/utils/glideClient'

/**
 * POST /api/magical-auth/report-invocation
 * 
 * Reports that an authentication flow was started.
 * Used for Authentication Success Rate (ASR) tracking.
 * This call can be made asynchronously without blocking the flow.
 */
export default defineEventHandler(async (event) => {
  const magicalAuth = getMagicalAuthClient()
  
  if (!magicalAuth) {
    console.warn('⚠️ Invoke: MagicalAuth client not configured')
    return { success: false, reason: 'client_not_configured' }
  }

  try {
    const body = await readBody(event)
    const sessionId = body?.session_id
    
    if (!sessionId) {
      console.warn('⚠️ Invoke: Missing session_id in request body')
      return { success: false, reason: 'missing_session_id' }
    }
    
    console.log('📊 Invoke: Reporting for session:', sessionId.substring(0, 8) + '...')
    
    // The new SDK takes sessionId as a string parameter (not an object)
    const result = await magicalAuth.reportInvocation(sessionId)
    
    console.log('✅ Invoke: Reported successfully')
    return { success: !!result }
  } catch (error: unknown) {
    // Log the error but NEVER fail the response — invocation reporting is non-blocking
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Invoke: Failed -', msg)
    return { success: false, error: msg }
  }
})
