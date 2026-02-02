/**
 * Session Store for Status URL Caching
 * 
 * Stores the status_url from prepare responses so the status proxy
 * can forward requests to the correct backend URL.
 * 
 * WHY THIS EXISTS:
 * The prepare response returns a status_url for polling. When using
 * a proxy endpoint for debugging/CORS, we need to forward to that URL.
 * This store bridges the prepare and status endpoints.
 */

import type { PrepareResponse, LinkData, DesktopData } from '@glideidentity/glide-be-sdk-node'

// In-memory store: sessionKey -> status_url
const sessionStore = new Map<string, string>()

// Auto-expire time in milliseconds (5 minutes)
const EXPIRY_MS = 5 * 60 * 1000

/**
 * Store a status URL for a session.
 * Automatically expires after 5 minutes.
 */
export function storeStatusUrl(sessionKey: string, statusUrl: string): void {
  sessionStore.set(sessionKey, statusUrl)
  
  // Auto-expire to prevent memory leaks
  setTimeout(() => {
    sessionStore.delete(sessionKey)
  }, EXPIRY_MS)
  
  console.log(`[SessionStore] Stored status URL for session: ${sessionKey.substring(0, 8)}...`)
}

/**
 * Get the stored status URL for a session.
 * Returns undefined if not found or expired.
 */
export function getStatusUrl(sessionKey: string): string | undefined {
  return sessionStore.get(sessionKey)
}

/**
 * Extract status_url from a prepare response based on strategy
 */
export function extractStatusUrl(response: PrepareResponse): string | undefined {
  const { authentication_strategy: strategy, data } = response
  
  if (strategy === 'link') {
    return (data as LinkData)?.status_url
  }
  if (strategy === 'desktop') {
    return (data as DesktopData)?.data?.status_url
  }
  // TS43 doesn't use polling
  return undefined
}
