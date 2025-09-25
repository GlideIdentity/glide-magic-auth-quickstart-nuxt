# SDK Integration Guide - Parameter Mapping

## Root Cause Analysis

The issue you encountered is **NOT** in the Vue adapter or Nuxt app. It's a **parameter name mismatch** between:
1. What the **web-client-sdk** sends
2. What the **glide-sdk** (backend) expects

## The Parameter Mapping Issue

### What web-client-sdk sends (both Vue & React):
```javascript
{
  response: credentialResponse,    // The credential from browser
  sessionInfo: session,            // The session from prepare step
  phoneNumber: phoneNumber,        // Optional, for verification
  useCase: 'GetPhoneNumber'        // or 'VerifyPhoneNumber'
}
```

### What glide-sdk v5.0.0-beta.1 expects:
```javascript
{
  sessionInfo: sessionInfo,  // ✅ Same name
  credential: response,       // ⚠️ Different name! (credential vs response)
}
```

## The Solution for SDK Users

### Backend Integration Pattern

Your backend endpoint MUST translate the parameter names:

```typescript
// ✅ CORRECT - Backend endpoint implementation
app.post('/api/phone-auth/process', async (req, res) => {
  const { response, sessionInfo, phoneNumber, useCase } = req.body;
  
  // Translation layer: web-client-sdk → glide-sdk
  if (useCase === 'GetPhoneNumber') {
    const result = await glide.magicAuth.getPhoneNumber({
      sessionInfo: sessionInfo,    // Keep as sessionInfo
      credential: response         // Rename: response → credential
    });
    return res.json(result);
  }
  
  if (useCase === 'VerifyPhoneNumber') {
    const result = await glide.magicAuth.verifyPhoneNumber({
      sessionInfo: sessionInfo,    // Keep as sessionInfo
      credential: response         // Rename: response → credential
    });
    return res.json(result);
  }
});
```

### Common Mistakes to Avoid

```typescript
// ❌ WRONG - Direct pass-through without translation
const result = await glide.magicAuth.getPhoneNumber({
  session: sessionInfo,           // Wrong: should be sessionInfo
  credential_response: response   // Wrong: should be credential
});

// ❌ WRONG - Using snake_case
const result = await glide.magicAuth.getPhoneNumber({
  session_info: sessionInfo,      // Wrong: should be sessionInfo
  credential: response
});
```

## Framework-Specific Notes

### For Nuxt/Vue Users
The Vue adapter works identically to React. No special handling needed on the frontend.

### For Next.js/React Users
Same integration pattern as shown above.

### For Angular Users
The Angular adapter also sends the same format.

## Quick Reference Table

| web-client-sdk sends | glide-sdk expects | Your backend should |
|---------------------|-------------------|-------------------|
| `response` | `credential` | Rename `response` → `credential` |
| `sessionInfo` | `sessionInfo` | Keep as is |
| `phoneNumber` | Not used directly | Use to determine which method to call |
| `useCase` | Not used directly | Use to determine which method to call |

## Testing Your Integration

1. **Enable debug logging** in both SDKs:
   ```env
   GLIDE_DEBUG=true
   VITE_GLIDE_DEBUG=true
   ```

2. **Check the network tab** to ensure your backend receives:
   ```json
   {
     "response": { "vp_token": {...} },
     "sessionInfo": { "session_key": "...", ... },
     "useCase": "GetPhoneNumber"
   }
   ```

3. **Verify your backend logs** show correct SDK calls:
   ```
   Calling glide.magicAuth.getPhoneNumber with:
   {
     sessionInfo: { ... },
     credential: { ... }
   }
   ```

## Summary

The issue is a simple parameter name mismatch that needs to be handled in your backend integration layer. This is NOT a bug in either SDK but rather a translation requirement between the frontend and backend SDK parameter conventions.

**Key takeaway**: Always implement a translation layer in your backend to map `response` → `credential`.
