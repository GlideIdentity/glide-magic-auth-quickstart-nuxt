import { getCompletionPageHtml } from '@glideidentity/glide-be-node-magical-auth'

/**
 * GET /glide-complete
 * 
 * Completion redirect page — served after carrier authentication.
 * 
 * The aggregator redirects the phone browser to this URL with agg_code and
 * session_key in the URL fragment. The page extracts them, writes a localStorage
 * signal for the original tab, and POSTs to /api/magical-auth/complete (the browser
 * auto-attaches the _glide_bind HttpOnly cookie).
 * 
 * This route is outside /api because the aggregator redirects directly to it.
 */
export default defineEventHandler(async (event) => {
  try {
    // The SDK provides the completion page HTML — no inline HTML needed
    const html = getCompletionPageHtml('/api/magical-auth/complete')

    setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    setHeader(event, 'Cache-Control', 'no-store')
    setHeader(event, 'X-Content-Type-Options', 'nosniff')
    setHeader(event, 'X-Frame-Options', 'DENY')
    setHeader(event, 'Referrer-Policy', 'no-referrer')
    return html
  } catch (error) {
    console.error('❌ Failed to generate completion page:', error)
    setResponseStatus(event, 500)
    return 'Internal server error'
  }
})
