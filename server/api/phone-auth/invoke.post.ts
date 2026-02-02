import { getGlideClient } from '~/server/utils/glideClient'

/**
 * POST /api/phone-auth/invoke
 * 
 * Reports that an authentication flow was started.
 * This call can be made asynchronously without blocking the flow.
 */
export default defineEventHandler(async (event) => {
  const glide = getGlideClient()
  
  if (!glide) {
    console.warn('⚠️ Invoke: Glide client not configured')
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
    
    const result = await glide.magicalAuth.reportInvocation({ session_id: sessionId })
    
    console.log('✅ Invoke: Reported successfully')
    return { success: result.success }
  } catch (error: any) {
    console.error('❌ Invoke: Failed -', error.message || error)
    return { success: false, error: error.message || 'Unknown error' }
  }
})
