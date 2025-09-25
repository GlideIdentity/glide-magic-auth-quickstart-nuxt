# Backend Integration Template

Copy this template for your backend implementation to avoid parameter mapping issues.

## Node.js/Express Template

```javascript
import { GlideClient } from 'glide-sdk';

// Initialize Glide
const glide = new GlideClient({
  apiKey: process.env.GLIDE_API_KEY
});

// Prepare endpoint
app.post('/api/phone-auth/prepare', async (req, res) => {
  try {
    const result = await glide.magicAuth.prepare(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.code,
      message: error.message
    });
  }
});

// Process endpoint - CRITICAL: Parameter translation required here
app.post('/api/phone-auth/process', async (req, res) => {
  try {
    const { response, sessionInfo, phoneNumber, useCase } = req.body;
    
    let result;
    
    // IMPORTANT: Translate parameters for SDK v5
    if (useCase === 'GetPhoneNumber') {
      result = await glide.magicAuth.getPhoneNumber({
        sessionInfo: sessionInfo,  // web-client sends sessionInfo
        credential: response       // web-client sends 'response', SDK expects 'credential'
      });
    } else if (useCase === 'VerifyPhoneNumber') {
      result = await glide.magicAuth.verifyPhoneNumber({
        sessionInfo: sessionInfo,
        credential: response       // Translation: response → credential
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.code,
      message: error.message
    });
  }
});
```

## Python/FastAPI Template

```python
from glide_sdk import GlideClient
import os

# Initialize Glide
glide = GlideClient(api_key=os.getenv('GLIDE_API_KEY'))

# Prepare endpoint
@app.post("/api/phone-auth/prepare")
async def prepare(request: dict):
    try:
        result = await glide.magic_auth.prepare(request)
        return result
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

# Process endpoint - CRITICAL: Parameter translation required here
@app.post("/api/phone-auth/process")
async def process(request: dict):
    try:
        response = request.get('response')
        session_info = request.get('sessionInfo')
        phone_number = request.get('phoneNumber')
        use_case = request.get('useCase')
        
        # IMPORTANT: Translate parameters for SDK
        if use_case == 'GetPhoneNumber':
            result = await glide.magic_auth.get_phone_number(
                session_info=session_info,  # Keep as is
                credential=response         # Translate: response → credential
            )
        elif use_case == 'VerifyPhoneNumber':
            result = await glide.magic_auth.verify_phone_number(
                session_info=session_info,
                credential=response         # Translate: response → credential
            )
        
        return result
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
```

## Key Points to Remember

1. **web-client-sdk** always sends: `{ response, sessionInfo, phoneNumber, useCase }`
2. **glide-sdk v5** expects: `{ credential, sessionInfo }`
3. **Your backend** must translate: `response` → `credential`

## Common Errors and Solutions

### Error: "Cannot read properties of undefined (reading 'vp_token')"
**Cause**: SDK is looking for `credential` but you're passing `response`
**Fix**: Rename `response` to `credential` when calling SDK methods

### Error: "sessionInfo is required"
**Cause**: SDK is looking for `sessionInfo` but you're passing `session`
**Fix**: Use `sessionInfo` (camelCase) not `session` or `session_info`

## Testing Checklist

- [ ] Frontend sends `response` in request body
- [ ] Backend receives `response` from request
- [ ] Backend passes `credential` to SDK (renamed from `response`)
- [ ] Backend passes `sessionInfo` to SDK (keep same name)
- [ ] SDK successfully processes the request
