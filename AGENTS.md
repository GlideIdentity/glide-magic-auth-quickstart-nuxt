# Agent Instructions

This is a quickstart for Glide Identity's Magical Auth — carrier-grade phone authentication using SIM cards. It is a full-stack Nuxt 3 application with a Vue frontend and Nitro API routes as the backend.

## Architecture

```
Nuxt 3 App (port 3000)
  ├── Frontend (Vue 3, pages/index.vue)
  │   └── usePhoneAuth composable from @glideidentity/glide-fe-sdk-web/vue
  │   └── Makes API calls to /api/magical-auth/* (same-origin, no proxy needed)
  │
  └── Backend (Nitro API routes, server/)
      └── Uses Glide BE SDK (@glideidentity/glide-be-node-magical-auth)
      └── OAuth2 client credentials authentication to Glide API
      └── Endpoints: /api/magical-auth/prepare, /process, /report-invocation, /complete
      └── GET /glide-complete — device binding completion redirect page
```

## File Map

```
pages/
  index.vue                — Main page (flow UI, SDK composable usage)

components/
  SdkConfigPanel.vue       — Debug config panel for SDK settings

server/
  api/magical-auth/
    prepare.post.ts        — Start auth session, set device binding cookie
    process.post.ts        — Process credential (verify or get phone number)
    report-invocation.post.ts — Report invocation for metrics
    complete.post.ts       — Complete device-bound session
  api/health.get.ts        — Health check
  routes/glide-complete.get.ts — Device binding completion redirect page
  utils/glideClient.ts     — Shared Glide SDK client instance

nuxt.config.ts             — Nuxt configuration
env.example                — Environment variable template
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from template
cp env.example .env

# 3. Add your Glide OAuth2 credentials to .env
#    GLIDE_CLIENT_ID=<your_client_id>
#    GLIDE_CLIENT_SECRET=<your_client_secret>

# 4. Start dev server
npm run dev
```

App runs on http://localhost:3000 (frontend and API on the same port).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GLIDE_CLIENT_ID` | Yes | OAuth2 client ID from Glide |
| `GLIDE_CLIENT_SECRET` | Yes | OAuth2 client secret from Glide |
| `GLIDE_API_BASE_URL` | No | Glide API base URL. Default: `https://api.glideidentity.app`. Staging: `https://api-stg.glideidentity.app` |
| `GLIDE_DEBUG` | No | Set `true` for verbose SDK logging |

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/magical-auth/prepare` | Start auth session, set device binding cookie |
| POST | `/api/magical-auth/report-invocation` | Report invocation for metrics |
| POST | `/api/magical-auth/process` | Process credential (verify or get phone number) |
| GET | `/glide-complete` | Device binding completion redirect page |
| POST | `/api/magical-auth/complete` | Complete device-bound session |

## Device Binding (Link Protocol)

For the Link/App Clip authentication strategy (iOS), the SDK implements device binding to prevent phishing:

1. **Prepare**: Backend generates `fe_code`, computes `fe_hash = SHA256(fe_code)`, sends `fe_hash` to Glide, sets `fe_code` as HttpOnly cookie `_glide_bind_{session_prefix}`
2. **Carrier auth**: User authenticates via App Clip, Glide redirects to `/glide-complete#agg_code=xxx&session_key=yyy`
3. **Completion page**: Reads `agg_code` from URL fragment, writes localStorage signal for the original tab, POSTs to `/api/magical-auth/complete`
4. **Complete**: Backend reads `fe_code` from cookie + `agg_code` from body, forwards to Glide for dual-code validation

The completion page is served by the backend using the SDK's `getCompletionPageHtml()` helper.

## Deployment

**When is deployment needed?**
- **TS43** (Android): Works from localhost — no deployment required. The `aud` field validates the web origin.
- **Desktop** (QR): Works from localhost — SDK handles waiting internally via process endpoint.
- **Link** (iOS App Clips): **Requires a public HTTPS URL.** The `_glide_bind_*` HttpOnly cookie is domain-scoped, and the completion redirect page must be on the same domain that set the cookie.

## Common Tasks

### Add a new backend endpoint

Add a new file in `server/api/magical-auth/` following Nuxt's file-based routing convention (e.g., `new-endpoint.post.ts` for `POST /api/magical-auth/new-endpoint`).

### Change the frontend UI

Edit `pages/index.vue`. The SDK composable `usePhoneAuth` handles all auth logic — UI is just state management around it.

## Do NOT

- Do not hardcode API keys or secrets — always use environment variables
- Do not modify the Glide SDK packages directly — they are npm dependencies
- Do not expose `feCode` in API response bodies — it must only travel via HttpOnly cookie
- Do not change the `/glide-complete` path — it must match what's registered as `completion_redirect_url` in Glide
