<template>
  <div>
    <!-- Navigation -->
    <nav style="background: #f5f5f7; padding: 10px; text-align: center; border-bottom: 1px solid #e5e5e7;">
      <NuxtLink to="/" style="margin: 0 10px; color: #007AFF;">High-Level Flow</NuxtLink>
      <span>|</span>
      <NuxtLink to="/granular" style="margin: 0 10px; font-weight: bold; color: #007AFF;">Granular Step-by-Step</NuxtLink>
    </nav>
    
    <!-- Header -->
    <header class="header">
      <div class="header-brand">
        <img src="/Glide-Logomark.svg" alt="Glide Identity" class="header-logo" />
        <span class="header-company">Glide Identity</span>
      </div>
      <h1>Magical Auth Quick Start - Granular Flow</h1>
      <p>Control each step of the phone verification process manually.</p>
    </header>

    <div class="container">
      <!-- Flow Type Section -->
      <section class="section">
        <div class="section-header">
          <div class="section-icon">📱</div>
          <div class="section-title">
            <h2>Flow Type</h2>
            <p>Choose what you want to do with the phone verification</p>
          </div>
        </div>

        <div class="card-grid two-columns">
          <div 
            :class="`card ${selectedFlow === 'verify' ? 'selected' : ''}`"
            @click="selectFlow('verify')"
          >
            <div class="card-icon">✓</div>
            <h3>Verify Phone Number</h3>
            <p>Verify if phone matches SIM card through carrier network</p>
          </div>

          <div 
            :class="`card ${selectedFlow === 'get' ? 'selected' : ''}`"
            @click="selectFlow('get')"
          >
            <div class="card-icon">📲</div>
            <h3>Get Phone Number</h3>
            <p>Retrieve phone number from SIM card with carrier verification</p>
          </div>
        </div>
      </section>

      <!-- Action Section -->
      <section class="section">
        <div class="section-header">
          <div class="section-icon">⚡</div>
          <div class="section-title">
            <h2>{{ selectedFlow === 'get' ? 'Get Your Number' : 'Verify Number' }}</h2>
            <p>{{ selectedFlow === 'get' ? 
              'Click below to retrieve your phone number securely' : 
              'Enter a phone number in E.164 format to verify ownership' }}</p>
          </div>
        </div>

        <div v-if="selectedFlow === 'verify'" class="form-group">
          <div class="input-wrapper">
            <input
              type="tel"
              placeholder="Enter phone number in E.164 format (e.g., +16287892016)"
              v-model="phoneInput"
              @input="handlePhoneChange"
              :disabled="isLoading"
              :class="phoneError ? 'input-error' : ''"
            />
            <div v-if="phoneError" class="phone-error">
              {{ phoneError }}
            </div>
            <div class="format-hint">
              E.164 format: +[country code][phone number] (no spaces or dashes)
            </div>
          </div>
        </div>

        <!-- Granular Step Buttons -->
        <div class="steps-container">
          <h3 style="margin-bottom: 20px;">Manual Step Execution</h3>
          
          <div class="step-card" :class="{ 'active': activeStep >= 1, 'error': stepErrors.step1 }">
            <h4>Step 1: Prepare Request</h4>
            <p>Initialize authentication request with the server</p>
            <button 
              class="button-primary" 
              @click="executeStep1" 
              :disabled="stepLoading.step1 || (selectedFlow === 'verify' && (!phoneInput || !!phoneError))"
            >
              <span v-if="stepLoading.step1" class="loading-spinner"></span>
              {{ stepLoading.step1 ? 'Preparing...' : 'Execute Step 1' }}
            </button>
            <div v-if="stepOneResp" class="step-success">
              ✅ Request prepared (session: {{ stepOneResp?.session?.session_key?.substring(0, 8) }}...)
            </div>
            <div v-if="stepErrors.step1" class="step-error">
              ❌ {{ stepErrors.step1 }}
            </div>
          </div>

          <div class="step-card" :class="{ 'active': activeStep >= 2, 'error': stepErrors.step2, 'disabled': activeStep < 1 }">
            <h4>Step 2: Digital Credentials API</h4>
            <p>Invoke browser's secure authentication prompt</p>
            <button 
              class="button-primary" 
              @click="executeStep2" 
              :disabled="!stepOneResp || stepLoading.step2"
            >
              <span v-if="stepLoading.step2" class="loading-spinner"></span>
              {{ stepLoading.step2 ? 'Authenticating...' : 'Execute Step 2' }}
            </button>
            <div v-if="stepTwoResp" class="step-success">
              ✅ Credential received
            </div>
            <div v-if="stepErrors.step2" class="step-error">
              ❌ {{ stepErrors.step2 }}
            </div>
          </div>

          <div class="step-card" :class="{ 'active': activeStep >= 3, 'error': stepErrors.step3, 'disabled': activeStep < 2 }">
            <h4>Step 3: Process Response</h4>
            <p>Send credential to server for verification</p>
            <button 
              class="button-primary" 
              @click="executeStep3" 
              :disabled="!stepTwoResp || !stepOneResp || stepLoading.step3"
            >
              <span v-if="stepLoading.step3" class="loading-spinner"></span>
              {{ stepLoading.step3 ? 'Processing...' : 'Execute Step 3' }}
            </button>
            <div v-if="stepThreeResp" class="step-success">
              ✅ {{ selectedFlow === 'verify' ? 'Verification complete' : 'Phone number retrieved' }}: {{ stepThreeResp?.phone_number || (stepThreeResp as any)?.phoneNumber }}
            </div>
            <div v-if="stepErrors.step3" class="step-error">
              ❌ {{ stepErrors.step3 }}
            </div>
          </div>

          <!-- Reset button -->
          <button 
            v-if="activeStep > 0"
            class="button-secondary"
            @click="resetSteps"
            style="margin-top: 20px;"
          >
            Reset All Steps
          </button>
        </div>

        <!-- Debug Data Display -->
        <details v-if="activeStep > 0" style="margin-top: 30px; padding: 20px; background: #f5f5f7; border-radius: 12px;">
          <summary style="cursor: pointer; font-weight: 600; color: #1d1d1f;">🔍 Debug: View Step Responses</summary>
          
          <div v-if="stepOneResp" style="margin-top: 20px;">
            <h4 style="color: #007AFF;">Step 1 Response (PrepareResponseDto):</h4>
            <pre style="background: white; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 12px;">{{ JSON.stringify(stepOneResp, null, 2) }}</pre>
          </div>
          
          <div v-if="stepTwoResp" style="margin-top: 20px;">
            <h4 style="color: #007AFF;">Step 2 Response (Credential):</h4>
            <pre style="background: white; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 12px;">{{ JSON.stringify(stepTwoResp, null, 2) }}</pre>
          </div>
          
          <div v-if="stepThreeResp" style="margin-top: 20px;">
            <h4 style="color: #007AFF;">Step 3 Response (PhoneAuthResult):</h4>
            <pre style="background: white; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 12px;">{{ JSON.stringify(stepThreeResp, null, 2) }}</pre>
          </div>
        </details>

        <!-- Progress Bar -->
        <div v-if="isLoading" class="progress-container">
          <div class="progress-bar">
            <div class="progress-line">
              <div 
                :class="`progress-line-fill ${error ? 'error' : ''}`"
                :style="{ 
                  width: currentStep === 'requesting' ? '33%' : 
                         currentStep === 'authenticating' ? '66%' : 
                         currentStep === 'processing' ? '100%' : '0%'
                }"
              />
            </div>
            
            <div class="progress-step">
              <div :class="`progress-dot ${
                currentStep === 'requesting' ? 'active' : 
                (currentStep === 'authenticating' || currentStep === 'processing') ? 'completed' : ''
              } ${error && currentStep === 'requesting' ? 'error' : ''}`">
                {{ (currentStep === 'authenticating' || currentStep === 'processing') && !error ? '✓' : '1' }}
              </div>
              <span :class="`progress-label ${
                currentStep === 'requesting' ? 'active' : 
                (currentStep === 'authenticating' || currentStep === 'processing') ? 'completed' : ''
              } ${error && currentStep === 'requesting' ? 'error' : ''}`">
                Preparing Request
              </span>
            </div>

            <div class="progress-step">
              <div :class="`progress-dot ${
                currentStep === 'authenticating' ? 'active' : 
                currentStep === 'processing' ? 'completed' : ''
              } ${error && currentStep === 'authenticating' ? 'error' : ''}`">
                {{ currentStep === 'processing' && !error ? '✓' : '2' }}
              </div>
              <span :class="`progress-label ${
                currentStep === 'authenticating' ? 'active' : 
                currentStep === 'processing' ? 'completed' : ''
              } ${error && currentStep === 'authenticating' ? 'error' : ''}`">
                Carrier Approval
              </span>
            </div>

            <div class="progress-step">
              <div :class="`progress-dot ${
                currentStep === 'processing' ? 'active' : ''
              } ${error && currentStep === 'processing' ? 'error' : ''}`">
                {{ error && currentStep === 'processing' ? '✕' : '3' }}
              </div>
              <span :class="`progress-label ${
                currentStep === 'processing' ? 'active' : ''
              } ${error && currentStep === 'processing' ? 'error' : ''}`">
                Processing
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <div v-if="error && resultFlow === selectedFlow" :class="`message ${error.code === PhoneAuthErrorCode.CARRIER_NOT_ELIGIBLE ? 'message-warning' : 'message-error'}`">
        <span class="message-icon">{{ error.code === PhoneAuthErrorCode.CARRIER_NOT_ELIGIBLE ? '⚠️' : '✕' }}</span>
        <div class="message-content">
          <h4>{{ error.code === PhoneAuthErrorCode.CARRIER_NOT_ELIGIBLE ? 'Carrier Not Supported' : 'Error' }}</h4>
          <p>{{ isPhoneAuthError(error) && isUserError(error) ? getUserMessage(error) : (error.message || 'An error occurred') }}</p>
          <div v-if="error.details?.reason" class="carrier-info">
            <strong>Reason:</strong> {{ error.details?.reason || 'Not supported by carrier' }}
          </div>
          <p v-if="error.code && error.code !== PhoneAuthErrorCode.CARRIER_NOT_ELIGIBLE" class="error-code">
            <small>Error Code: {{ error.code }}</small>
            <small v-if="error.requestId"><br />Request ID: {{ error.requestId }}</small>
          </p>
          <details v-if="error.browserError" class="browser-error-details">
            <summary>Browser Error Details</summary>
            <pre>{{ JSON.stringify(error.browserError, null, 2) }}</pre>
          </details>
        </div>
      </div>

      <div v-if="result && resultFlow === selectedFlow" class="message message-success">
        <span class="message-icon">✓</span>
        <div class="message-content">
          <h4>Success</h4>
          <p><strong>Phone Number:</strong> {{ result.phone_number}}</p>
          <p><strong>Verified:</strong> {{ selectedFlow === 'verify' ? (result.verified ? 'Yes' : 'No') : 'Yes' }}</p>
          <div v-if="result.sessionInfo" class="session-info">
            <p><strong>Session Details:</strong></p>
            <pre class="session-data">{{ 
              typeof result.sessionInfo === 'object' 
                ? JSON.stringify(result.sessionInfo, null, 2) 
                : result.sessionInfo
            }}</pre>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <section class="section">
        <div class="section-header">
          <div class="section-icon">ℹ️</div>
          <div class="section-title">
            <h2>How It Works</h2>
            <p>Secure authentication powered by carrier networks</p>
          </div>
        </div>

        <div class="card-grid">
          <div class="card">
            <div class="card-icon">🔐</div>
            <h3>No SMS Required</h3>
            <p>Direct carrier verification without sending any text messages</p>
          </div>

          <div class="card">
            <div class="card-icon">⚡</div>
            <h3>Instant Verification</h3>
            <p>Get results in seconds, not minutes</p>
          </div>

          <div class="card">
            <div class="card-icon">🛡️</div>
            <h3>Fraud Resistant</h3>
            <p>Can't be intercepted or spoofed like SMS codes</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="powered-by">
        <span>Powered by</span>
        <img src="/Glide-Logomark.svg" alt="Glide" class="powered-by-logo" />
        <span>Glide Identity</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  usePhoneAuth,
  PhoneAuthErrorCode, 
  isPhoneAuthError,
  isUserError,
  getUserMessage,
  serializeError,
  isErrorCode,
  type PhoneAuthOptions,
  type PhoneAuthResult,
  type SessionInfo,
  type PrepareResponseDto,
  type SecureCredentialResponse,
  type AuthenticationStrategyType
} from 'glide-web-client-sdk/vue'

// Import API response types
import type { 
  GetPhoneNumberResponse, 
  VerifyPhoneNumberResponse 
} from 'glide-web-client-sdk/vue'

// Reactive state
const phoneInput = ref<string>('')
const selectedFlow = ref<'verify' | 'get'>('verify')
const phoneError = ref<string>('')
const resultFlow = ref<'verify' | 'get' | null>(null)

// Granular step state - storing responses from each step
const stepOneResp = ref<any | null>(null)  // Response from prepare (using any due to type mismatch)
const stepTwoResp = ref<any | null>(null)  // Credential from browser
const stepThreeResp = ref<any | null>(null)  // Final result
const activeStep = ref<number>(0)
const stepLoading = ref({ step1: false, step2: false, step3: false })
const stepErrors = ref<{ step1: string | null, step2: string | null, step3: string | null }>({ 
  step1: null, 
  step2: null, 
  step3: null 
})

// URL Configuration:
// Option 1: Local server routes (requires running the local Nuxt server with your own Glide credentials)
const prepareRequest = '/api/phone-auth/prepare'
const processResponse = '/api/phone-auth/process'

// Option 2: Pre-made external server (for quick testing with hosted credentials)
// const prepareRequest = 'https://checkout-demo-server.glideidentity.dev/generate-get-request'
// const processResponse = 'https://checkout-demo-server.glideidentity.dev/processCredential'

// Initialize phone auth with improved defaults (v4.0.0-beta.2)
const {
  isLoading,
  error,
  result,
  currentStep,
  isSupported,
  reset,
  client,  // Get the client instance for granular control
} = usePhoneAuth({
  endpoints: {
    prepare: prepareRequest,
    process: processResponse
  },
  debug: true, // Enable debug mode for detailed logging
  // Note: Callbacks might not be supported in the current type definitions
  // Uncomment when SDK types are updated:
  // onCrossDeviceDetected: () => {
  //   console.log('🔍 Cross-device flow detected (QR code shown)')
  // },
  // onRetryAttempt: (attempt: number, max: number) => {
  //   console.log(`🔄 Retry attempt ${attempt}/${max}`)
  // }
} as any) // Type cast until SDK types are fixed

// Check browser support on mount
onMounted(() => {
  if (!isSupported?.value) {
    console.warn('Browser does not support Digital Credentials API')
  }
})

// Optional: Watch for step changes to log progress
// Uncomment if you want to see step-by-step progress in console
// watch(currentStep, (newStep, oldStep) => {
//   console.log(`Phone auth step changed: ${oldStep} → ${newStep}`)
// })

// Phone validation
const validatePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // E.164 format: + followed by up to 15 digits total
  const e164Regex = /^\+[1-9]\d{1,14}$/
  
  if (!phone.trim()) {
    return 'Phone number is required'
  }
  
  if (!cleaned.startsWith('+')) {
    return 'Phone number must be in E.164 format (start with +)'
  }
  
  if (cleaned.length < 8) {
    return 'Phone number too short for E.164 format'
  }
  
  if (cleaned.length > 16) {
    return 'Phone number too long for E.164 format (max 15 digits)'
  }
  
  if (!e164Regex.test(cleaned)) {
    return 'Please enter a valid E.164 format phone number'
  }
  
  return ''
}

// Computed properties
const getLoadingText = () => {
  if (currentStep.value === 'requesting') return 'Preparing request...'
  if (currentStep.value === 'authenticating') return 'Waiting for carrier approval...'
  if (currentStep.value === 'processing') return 'Processing response...'
  return 'Loading...'
}

// Methods
const handlePhoneChange = (): void => {
  // Validate phone number as user types
  if (phoneInput.value) {
    phoneError.value = validatePhoneNumber(phoneInput.value)
  } else {
    phoneError.value = ''
  }
}

const selectFlow = (flow: 'verify' | 'get'): void => {
  selectedFlow.value = flow
  phoneError.value = ''
}

// Granular Step Functions
const executeStep1 = async (): Promise<void> => {
  stepLoading.value.step1 = true
  stepErrors.value.step1 = null
  
  // Validate phone number for verify flow
  if (selectedFlow.value === 'verify') {
    phoneError.value = validatePhoneNumber(phoneInput.value)
    if (phoneError.value) {
      stepLoading.value.step1 = false
      return
    }
  }
  
  try {
    console.log('Step 1: Preparing request...')
    
    const options: PhoneAuthOptions = {
      useCase: selectedFlow.value === 'get' ? 'GetPhoneNumber' : 'VerifyPhoneNumber',
      phoneNumber: selectedFlow.value === 'verify' ? phoneInput.value : undefined,
      plmn: selectedFlow.value === 'get' ? { mcc: '310', mnc: '260' } : undefined, // T-Mobile USA for GetPhoneNumber
      consentData: {
        consentText: 'I consent to the terms and conditions',
        policyLink: 'https://www.example.com/privacy',
        policyText: 'Privacy policy'
      }
    }
    
    const prepareResponse = await client.preparePhoneRequest(options)
    
    // Store the full response to pass to next step
    stepOneResp.value = prepareResponse
    activeStep.value = 1
    resultFlow.value = selectedFlow.value
    
    console.log('Step 1 complete - Full response stored:', {
      strategy: prepareResponse.authentication_strategy,
      sessionKey: prepareResponse.session?.session_key?.substring(0, 8) + '...',
      hasData: !!prepareResponse.data,
      hasSession: !!prepareResponse.session
    })
  } catch (err: any) {
    console.error('Step 1 failed:', err)
    stepErrors.value.step1 = err.message || 'Failed to prepare request'
    // error.value = err // Cannot assign to readonly - remove this
  } finally {
    stepLoading.value.step1 = false
  }
}

const executeStep2 = async (): Promise<void> => {
  if (!stepOneResp.value) {
    stepErrors.value.step2 = 'Complete Step 1 first'
    return
  }
  
  stepLoading.value.step2 = true
  stepErrors.value.step2 = null
  
  // Retry logic for flaky Digital Credentials API
  const maxRetries = 2
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    console.log(`Step 2: Invoking Digital Credentials API (attempt ${attempt}/${maxRetries})...`)
    console.log('=== GRANULAR FLOW DEBUG ===')
    console.log('Full prepare response being passed:', JSON.stringify(stepOneResp.value, null, 2))
    console.log('Client instance ID:', client)
    console.log('Client config:', (client as any).config)
    console.log('Using prepare response:', {
      strategy: stepOneResp.value.authentication_strategy,
      hasData: !!stepOneResp.value.data,
      hasSession: !!stepOneResp.value.session
    })
    
    // Pass the prepare response from step 1 (SDK now handles reactive objects internally)
    const credentialResponse = await client.invokeSecurePrompt(stepOneResp.value)
      
      // Store the credential response for step 3
      stepTwoResp.value = credentialResponse
      activeStep.value = 2
      
      console.log('Step 2 complete - Credential received and stored')
      return // Success - exit the function
    } catch (err: any) {
      lastError = err
      console.error(`Step 2 attempt ${attempt} failed:`, err)
      
      // Only retry on USER_DENIED errors
      if (err.code !== 'USER_DENIED' || attempt === maxRetries) {
        break
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  // All attempts failed
  stepErrors.value.step2 = lastError?.message || 'Failed to get credential'
  stepLoading.value.step2 = false
}

const executeStep3 = async (): Promise<void> => {
  if (!stepTwoResp.value || !stepOneResp.value) {
    stepErrors.value.step3 = 'Complete Steps 1 and 2 first'
    return
  }
  
  stepLoading.value.step3 = true
  stepErrors.value.step3 = null
  
  try {
    console.log('Step 3: Processing response with data from previous steps...')
    console.log('Using credential from Step 2 and session from Step 1:', {
      hasCredential: !!stepTwoResp.value,
      sessionKey: stepOneResp.value.session?.session_key?.substring(0, 8) + '...'
    })
    
    // Use the SDK's low-level methods for Step 3
    // The SDK methods accept credential and session directly
    let finalResult: any;
    
    if (selectedFlow.value === 'get') {
      // Call the SDK's getPhoneNumber method with credential and session
      const getResult = await client.getPhoneNumber(
        stepTwoResp.value,  // The vp_token credential from Step 2
        stepOneResp.value.session  // Session from Step 1
      );
      console.log('Step 3 complete - GetPhoneNumber result:', {
        phoneNumber: getResult.phone_number
      });
      finalResult = getResult;
    } else {
      // Call the SDK's verifyPhoneNumber method with credential and session
      const verifyResult = await client.verifyPhoneNumber(
        stepTwoResp.value,  // The vp_token credential from Step 2
        stepOneResp.value.session  // Session from Step 1
      );
      console.log('Step 3 complete - VerifyPhoneNumber result:', {
        phoneNumber: verifyResult.phone_number,
        verified: verifyResult.verified
      });
      finalResult = verifyResult;
    }
    
    // Store final result
    stepThreeResp.value = finalResult
    // result.value = finalResult // Cannot assign to readonly - remove this
    activeStep.value = 3
  } catch (err: any) {
    console.error('Step 3 failed:', err)
    stepErrors.value.step3 = err.message || 'Failed to process response'
    // error.value = err // Cannot assign to readonly - remove this
  } finally {
    stepLoading.value.step3 = false
  }
}

const resetSteps = (): void => {
  // Reset all step state
  stepOneResp.value = null
  stepTwoResp.value = null
  stepThreeResp.value = null
  activeStep.value = 0
  stepLoading.value = { step1: false, step2: false, step3: false }
  stepErrors.value = { step1: null, step2: null, step3: null }
  // result.value = null // Cannot assign to readonly - remove this
  // error.value = null // Cannot assign to readonly - remove this
  resultFlow.value = null
  
  // Reset the client
  if (reset) {
    reset()
  }
  
  console.log('All steps reset')
}


</script>

<style scoped>
/* Step Cards Styles */
.steps-container {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.step-card {
  background: white;
  border: 2px solid #e5e5e7;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.step-card.active {
  border-color: #007AFF;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
}

.step-card.error {
  border-color: #d70015;
  box-shadow: 0 4px 12px rgba(215, 0, 21, 0.1);
}

.step-card.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.step-card h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.step-card p {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #86868b;
}

.step-success {
  margin-top: 12px;
  padding: 10px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
  font-size: 14px;
  font-weight: 500;
}

.step-error {
  margin-top: 12px;
  padding: 10px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  font-size: 14px;
  font-weight: 500;
}
</style>

