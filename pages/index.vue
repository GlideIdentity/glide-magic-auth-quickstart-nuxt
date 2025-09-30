<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="header-brand">
        <img src="/Glide-Logomark.svg" alt="Glide Identity" class="header-logo" />
        <span class="header-company">Glide Identity</span>
      </div>
      <h1>Magical Auth Quick Start</h1>
      <p>Test carrier-grade phone verification in minutes. No SMS, no delays, no fraud.</p>
    </header>

    <div class="container">
      <!-- Flow Mode Toggle -->
      <section class="section mode-toggle-section">
        <div class="mode-toggle">
          <button 
            :class="['mode-btn', { active: flowMode === 'highlevel' }]"
            @click="flowMode = 'highlevel'"
          >
            <span class="mode-icon">⚡</span>
            High Level
          </button>
          <button 
            :class="['mode-btn', { active: flowMode === 'granular' }]"
            @click="flowMode = 'granular'"
          >
            <span class="mode-icon">🔧</span>
            Granular
          </button>
        </div>
        <p class="mode-description">
          {{ flowMode === 'highlevel' 
            ? 'Simple one-click authentication flow' 
            : 'Step-by-step control over each authentication phase' 
          }}
        </p>
      </section>

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

      <!-- Phone Input Section (only for verify flow) -->
      <section v-if="selectedFlow === 'verify'" class="section">
        <div class="section-header">
          <div class="section-icon">📞</div>
          <div class="section-title">
            <h2>Phone Number to Verify</h2>
            <p>Enter the number you want to verify against the SIM card</p>
          </div>
        </div>

        <div class="input-group">
            <input
            v-model="phoneInput"
              type="tel"
            placeholder="+1 555 123 4567"
            @keydown.enter="flowMode === 'highlevel' ? startAuthentication() : startGranularFlow()"
          />
        </div>
      </section>

      <!-- High-Level Flow -->
      <section v-if="flowMode === 'highlevel'" class="section">
        <div class="section-header">
          <div class="section-icon">🚀</div>
          <div class="section-title">
            <h2>Start Authentication</h2>
            <p>Click below to initiate the authentication flow</p>
          </div>
        </div>

        <button 
          @click="startAuthentication"
          :disabled="loading || (selectedFlow === 'verify' && !phoneInput)"
          :class="['action-button', { 'loading': loading }]"
        >
          <span v-if="!loading">
            {{ selectedFlow === 'verify' ? 'Verify Phone Number' : 'Get Phone Number' }}
          </span>
          <span v-else>Processing...</span>
        </button>

        <!-- Error Display -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          <div>
            <strong>{{ error.code || 'Error' }}</strong>
            <p>{{ error.message }}</p>
          </div>
        </div>

        <!-- Result Display -->
        <div v-if="result" class="result-success">
          <h3>✅ Authentication Successful!</h3>
          <div class="result-details">
            <p><strong>Phone Number:</strong> {{ result.phone_number }}</p>
            <p><strong>Verified:</strong> {{ selectedFlow === 'verify' && 'verified' in result ? (result.verified ? 'Yes' : 'No') : 'Yes' }}</p>
            <p v-if="result.aud"><strong>Audience:</strong> {{ result.aud }}</p>
            </div>
            </div>
      </section>

      <!-- Granular Flow -->
      <section v-else-if="flowMode === 'granular'" class="section">
        <div class="section-header">
          <div class="section-icon">🔧</div>
          <div class="section-title">
            <h2>Granular Authentication Steps</h2>
            <p>Control each step of the authentication process</p>
          </div>
        </div>

        <!-- Step 1: Prepare -->
        <div :class="['step-card', { 
          'active': currentStep === 1, 
          'completed': stepOneResp !== null,
          'error': stepOneError !== null
        }]">
          <div class="step-header">
            <span class="step-number">1</span>
            <h4>Prepare Authentication</h4>
          </div>
          <p>Initialize the authentication session with the server</p>
          
          <button 
            @click="executeStepOne"
            :disabled="stepOneResp !== null || loading || (selectedFlow === 'verify' && !phoneInput)"
            class="step-button"
          >
            {{ stepOneResp ? '✓ Completed' : 'Execute Step' }}
          </button>

          <div v-if="stepOneResp" class="step-success">
            ✓ Session prepared. Strategy: {{ stepOneResp.authentication_strategy }}
          </div>
          <div v-if="stepOneError" class="step-error">
            {{ stepOneError }}
          </div>
        </div>

        <!-- Step 2: Browser Verification -->
        <div :class="['step-card', { 
          'active': currentStep === 2,
          'completed': stepTwoResp !== null,
          'error': stepTwoError !== null,
          'disabled': !stepOneResp
        }]">
          <div class="step-header">
            <span class="step-number">2</span>
            <h4>Browser Verification</h4>
          </div>
          <p>Invoke secure browser prompt for carrier verification</p>
          
          <button 
            @click="executeStepTwo"
            :disabled="!stepOneResp || stepTwoResp !== null || loading"
            class="step-button"
          >
            {{ stepTwoResp ? '✓ Completed' : 'Execute Step' }}
          </button>

          <div v-if="stepTwoResp" class="step-success">
            ✓ Credential obtained from browser
          </div>
          <div v-if="stepTwoError" class="step-error">
            {{ stepTwoError }}
          </div>
        </div>

        <!-- Step 3: Process Result -->
        <div :class="['step-card', { 
          'active': currentStep === 3,
          'completed': stepThreeResp !== null,
          'error': stepThreeError !== null,
          'disabled': !stepTwoResp
        }]">
          <div class="step-header">
            <span class="step-number">3</span>
            <h4>Process Verification</h4>
          </div>
          <p>Send credential to server for final verification</p>
          
          <button 
            @click="executeStepThree"
            :disabled="!stepTwoResp || stepThreeResp !== null || loading"
            class="step-button"
          >
            {{ stepThreeResp ? '✓ Completed' : 'Execute Step' }}
          </button>

          <div v-if="stepThreeResp" class="step-success">
            ✓ Verification complete! Phone: {{ stepThreeResp.phone_number }}
            <span v-if="'verified' in stepThreeResp">
              - Verified: {{ stepThreeResp.verified ? 'Yes' : 'No' }}
              </span>
            </div>
          <div v-if="stepThreeError" class="step-error">
            {{ stepThreeError }}
              </div>
            </div>

        <!-- Reset Button -->
        <button 
          v-if="stepThreeResp || stepOneError || stepTwoError || stepThreeError"
          @click="resetGranularFlow"
          class="reset-button"
        >
          Reset Flow
        </button>

        <!-- Final Result Display for Granular -->
        <div v-if="stepThreeResp" class="result-success">
          <h3>✅ Authentication Successful!</h3>
          <div class="result-details">
            <p><strong>Phone Number:</strong> {{ stepThreeResp.phone_number }}</p>
            <p><strong>Verified:</strong> {{ 'verified' in stepThreeResp ? (stepThreeResp.verified ? 'Yes' : 'No') : 'Yes' }}</p>
            <p v-if="stepThreeResp.aud"><strong>Audience:</strong> {{ stepThreeResp.aud }}</p>
          </div>
        </div>
      </section>

      <!-- Debug Mode Toggle -->
      <section class="section debug-section">
        <label class="debug-toggle">
          <input type="checkbox" v-model="debugMode" />
          <span>Debug Mode</span>
        </label>
      </section>

      <!-- Debug Console -->
      <section v-if="debugMode && debugLogs.length > 0" class="section">
        <div class="section-header">
          <div class="section-icon">🔍</div>
          <div class="section-title">
            <h2>Debug Console</h2>
            <p>Detailed flow information</p>
          </div>
        </div>

        <div class="debug-console">
          <div v-for="(log, index) in debugLogs" :key="index" class="debug-entry">
            <span class="debug-time">{{ log.timestamp }}</span>
            <span :class="`debug-type ${log.type}`">{{ log.type }}</span>
            <div class="debug-message">{{ log.message }}</div>
            <pre v-if="log.data" class="debug-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
          </div>
        </div>
        
        <button @click="debugLogs = []" class="clear-logs-button">
          Clear Logs
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PhoneAuthClient, UseCase } from 'glide-web-client-sdk'
import type { 
  PhoneAuthOptions, 
  PrepareResponse, 
  SecureCredentialResponse,
  GetPhoneNumberResponse,
  VerifyPhoneNumberResponse
} from 'glide-web-client-sdk'

// State management
const flowMode = ref<'highlevel' | 'granular'>('highlevel')
const selectedFlow = ref<'verify' | 'get'>('verify')
const phoneInput = ref('')
const loading = ref(false)
const error = ref<{ code?: string; message: string } | null>(null)
const result = ref<GetPhoneNumberResponse | VerifyPhoneNumberResponse | null>(null)
const debugMode = ref(false)
const debugLogs = ref<Array<{
  timestamp: string
  type: 'info' | 'error' | 'success'
  message: string
  data?: any
}>>([])

// Granular flow state
const currentStep = ref(0)
const stepOneResp = ref<PrepareResponse | null>(null)
const stepTwoResp = ref<SecureCredentialResponse['vp_token'] | null>(null)
const stepThreeResp = ref<GetPhoneNumberResponse | VerifyPhoneNumberResponse | null>(null)
const stepOneError = ref<string | null>(null)
const stepTwoError = ref<string | null>(null)
const stepThreeError = ref<string | null>(null)

// PhoneAuthClient instance
let authClient: PhoneAuthClient | null = null

// Initialize client on mount
onMounted(() => {
  authClient = new PhoneAuthClient({
  endpoints: {
      prepare: '/api/phone-auth/prepare',
      process: '/api/phone-auth/process'
  },
    debug: true, // Enable SDK debug logging to console
    timeout: 30000,
  onCrossDeviceDetected: () => {
      addDebugLog('info', 'Cross-device authentication detected (QR code shown)')
    },
    onRetryAttempt: (attempt, maxAttempts) => {
      addDebugLog('info', `Retry attempt ${attempt} of ${maxAttempts}`)
    }
  })
  addDebugLog('info', 'PhoneAuthClient initialized with debug mode', { endpoints: '/api/phone-auth/*' })
})

// Debug logging helper
const addDebugLog = (type: 'info' | 'error' | 'success', message: string, data?: any) => {
  if (debugMode.value) {
    debugLogs.value.push({
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    })
  }
}

// Flow selection handler
const selectFlow = (flow: 'verify' | 'get') => {
  selectedFlow.value = flow
  phoneInput.value = ''
  error.value = null
  result.value = null
  resetGranularFlow()
  addDebugLog('info', `Flow type changed to: ${flow}`)
}

// High-level authentication
const startAuthentication = async () => {
  if (!authClient) {
    error.value = { code: 'NO_CLIENT', message: 'Authentication client not initialized' }
    return
  }

  if (selectedFlow.value === 'verify' && !phoneInput.value) {
    error.value = { code: 'MISSING_PHONE', message: 'Please enter a phone number to verify' }
    return
  }

  loading.value = true
  error.value = null
  result.value = null

  try {
    addDebugLog('info', 'Starting authentication', { 
      flow: selectedFlow.value,
      phone: selectedFlow.value === 'verify' ? phoneInput.value : undefined 
    })

    const options: PhoneAuthOptions = {
      use_case: selectedFlow.value === 'get' ? UseCase.GET_PHONE_NUMBER : UseCase.VERIFY_PHONE_NUMBER,
      phone_number: selectedFlow.value === 'verify' ? phoneInput.value : undefined,
      plmn: selectedFlow.value === 'get' ? { mcc: '310', mnc: '260' } : undefined, // T-Mobile USA for GetPhoneNumber
      consent_data: {
        consent_text: 'I agree to verify my phone number',
        policy_link: 'https://example.com/privacy',
        policy_text: 'Privacy Policy'
      }
    }

    const response = selectedFlow.value === 'get' 
      ? await authClient.getPhoneNumberComplete(options)
      : await authClient.verifyPhoneNumberComplete(phoneInput.value, options)
    result.value = response
    addDebugLog('success', 'Authentication successful', response)
  } catch (err: any) {
    error.value = { 
      code: err.code || 'UNKNOWN_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
    addDebugLog('error', 'Authentication failed', err)
  } finally {
    loading.value = false
  }
}

// Granular flow functions
const startGranularFlow = () => {
  currentStep.value = 1
  resetGranularFlow()
}

const executeStepOne = async () => {
  if (!authClient) {
    stepOneError.value = 'Authentication client not initialized'
    return
  }

  loading.value = true
  stepOneError.value = null
  currentStep.value = 1

  try {
    addDebugLog('info', 'Step 1: Preparing authentication')

    const options: PhoneAuthOptions = {
      use_case: selectedFlow.value === 'get' ? UseCase.GET_PHONE_NUMBER : UseCase.VERIFY_PHONE_NUMBER,
      phone_number: selectedFlow.value === 'verify' ? phoneInput.value : undefined,
      plmn: selectedFlow.value === 'get' ? { mcc: '310', mnc: '260' } : undefined, // T-Mobile USA for GetPhoneNumber
      consent_data: {
        consent_text: 'I agree to verify my phone number',
        policy_link: 'https://example.com/privacy',
        policy_text: 'Privacy Policy'
      }
    }

    console.log('[Granular] Step 1: Preparing with options:', options)
    const response = await authClient.preparePhoneRequest(options)
    console.log('[Granular] Step 1: Prepare response:', response)
    stepOneResp.value = response
    currentStep.value = 2
    addDebugLog('success', 'Step 1 completed', response)
  } catch (err: any) {
    console.error('[Granular] Step 1: Error during prepare:', err)
    stepOneError.value = err.message || 'Failed to prepare authentication'
    addDebugLog('error', 'Step 1 failed', err)
  } finally {
    loading.value = false
  }
}

const executeStepTwo = async () => {
  if (!authClient || !stepOneResp.value) return

  loading.value = true
  stepTwoError.value = null
  currentStep.value = 2

  try {
    addDebugLog('info', 'Step 2: Invoking secure browser prompt')
    console.log('[Granular] Step 2: About to invoke secure prompt with:', stepOneResp.value)
    
    const credential = await authClient.invokeSecurePrompt(stepOneResp.value)
    console.log('[Granular] Step 2: Received credential:', credential)
    stepTwoResp.value = credential
    currentStep.value = 3
    addDebugLog('success', 'Step 2 completed', credential)
  } catch (err: any) {
    console.error('[Granular] Step 2: Error during secure prompt:', err)
    stepTwoError.value = err.message || 'Browser verification failed'
    addDebugLog('error', 'Step 2 failed', err)
  } finally {
    loading.value = false
  }
}

const executeStepThree = async () => {
  if (!authClient || !stepOneResp.value || !stepTwoResp.value) return

  loading.value = true
  stepThreeError.value = null
  currentStep.value = 3

  try {
    addDebugLog('info', 'Step 3: Processing verification')
    console.log('[Granular] Step 3: Processing with credential:', stepTwoResp.value)
    console.log('[Granular] Step 3: Using session:', stepOneResp.value.session)
    
    const response = selectedFlow.value === 'get'
      ? await authClient.getPhoneNumber(stepTwoResp.value, stepOneResp.value.session)
      : await authClient.verifyPhoneNumber(stepTwoResp.value, stepOneResp.value.session)
    
    console.log('[Granular] Step 3: Final response:', response)
    stepThreeResp.value = response
    currentStep.value = 0
    addDebugLog('success', 'Step 3 completed', response)
  } catch (err: any) {
    console.error('[Granular] Step 3: Error during processing:', err)
    stepThreeError.value = err.message || 'Verification processing failed'
    addDebugLog('error', 'Step 3 failed', err)
  } finally {
    loading.value = false
  }
}

const resetGranularFlow = () => {
  currentStep.value = 0
  stepOneResp.value = null
  stepTwoResp.value = null
  stepThreeResp.value = null
  stepOneError.value = null
  stepTwoError.value = null
  stepThreeError.value = null
  addDebugLog('info', 'Granular flow reset')
}
</script>

<style scoped>
/* Container and Layout */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Header Styles */
.header {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(180deg, #1d1d1f 0%, #2d2d30 100%);
  color: white;
}

.header-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.header-logo {
  width: 40px;
  height: 40px;
}

.header-company {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: white;
}

.header h1 {
  font-size: 48px;
  font-weight: 600;
  margin: 0 0 16px 0;
  letter-spacing: -0.015em;
  color: white;
}

.header p {
  font-size: 21px;
  font-weight: 400;
  color: #86868b;
  max-width: 600px;
  margin: 0 auto;
}

/* Mode Toggle Section */
.mode-toggle-section {
  text-align: center;
  padding: 20px 0 !important;
  border-bottom: 2px solid #e5e5e7;
}

.mode-toggle {
  display: inline-flex;
  gap: 0;
  border: 2px solid #007AFF;
  border-radius: 50px;
  padding: 4px;
  background: white;
}

.mode-btn {
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: #007AFF;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mode-btn.active {
  background: #007AFF;
  color: white;
}

.mode-icon {
  font-size: 14px;
}

.mode-description {
  margin-top: 12px;
  color: #86868b;
  font-size: 14px;
}

/* Section Styles */
.section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
}

.section-icon {
  font-size: 28px;
  line-height: 1;
}

.section-title h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #1d1d1f;
}

.section-title p {
  margin: 0;
  color: #86868b;
  font-size: 14px;
}

/* Card Grid */
.card-grid {
  display: grid;
  gap: 15px;
}

.two-columns {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Cards */
.card {
  padding: 20px;
  border: 2px solid #e5e5e7;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.card:hover {
  border-color: #007AFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card.selected {
  border-color: #007AFF;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.05), rgba(0, 122, 255, 0.1));
}

.card-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1d1d1f;
}

.card p {
  margin: 0;
  font-size: 14px;
  color: #86868b;
}

/* Input Group */
.input-group {
  display: flex;
  gap: 10px;
}

.input-group input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e5e7;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #007AFF;
}

/* Action Button */
.action-button {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.loading {
  background: #86868b;
}

/* Step Cards */
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

.step-card.completed {
  border-color: #34c759;
  background: rgba(52, 199, 89, 0.05);
}

.step-card.error {
  border-color: #ff3b30;
  background: rgba(255, 59, 48, 0.05);
}

.step-card.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #007AFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step-card.completed .step-number {
  background: #34c759;
}

.step-card.error .step-number {
  background: #ff3b30;
}

.step-card h4 {
  margin: 0;
  font-size: 18px;
  color: #1d1d1f;
}

.step-card p {
  margin: 0 0 15px 0;
  color: #86868b;
  font-size: 14px;
}

.step-button {
  padding: 10px 20px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-button:hover:not(:disabled) {
  background: #0051d5;
}

.step-button:disabled {
  background: #86868b;
  cursor: not-allowed;
}

.step-success {
  margin-top: 12px;
  padding: 10px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
  font-size: 14px;
}

.step-error {
  margin-top: 12px;
  padding: 10px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  font-size: 14px;
}

.reset-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #ff3b30;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background: #d70015;
}

/* Result Display */
.result-success {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(52, 199, 89, 0.05));
  border: 2px solid #34c759;
  border-radius: 12px;
}

.result-success h3 {
  margin: 0 0 15px 0;
  color: #00a854;
  font-size: 20px;
}

.result-details {
  background: white;
  padding: 15px;
  border-radius: 8px;
}

.result-details p {
  margin: 8px 0;
  font-size: 14px;
  color: #1d1d1f;
}

/* Error Message */
.error-message {
  margin-top: 20px;
  padding: 15px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-icon {
  font-size: 20px;
}

.error-message strong {
  color: #991b1b;
  display: block;
  margin-bottom: 4px;
}

.error-message p {
  margin: 0;
  color: #7f1d1d;
  font-size: 14px;
}

/* Debug Section */
.debug-section {
  background: #f5f5f7;
  display: flex;
  justify-content: center;
}

.debug-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.debug-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.debug-toggle span {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

/* Debug Console */
.debug-console {
  background: #1d1d1f;
  color: #f5f5f7;
  padding: 15px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
}

.debug-entry {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
}

.debug-entry:last-child {
  border-bottom: none;
}

.debug-time {
  color: #86868b;
  margin-right: 10px;
}

.debug-type {
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  margin-right: 10px;
}

.debug-type.info {
  background: #007AFF;
  color: white;
}

.debug-type.success {
  background: #34c759;
  color: white;
}

.debug-type.error {
  background: #ff3b30;
  color: white;
}

.debug-message {
  margin-top: 5px;
  color: #f5f5f7;
}

.debug-data {
  margin-top: 8px;
  padding: 10px;
  background: #2d2d2f;
  border-radius: 4px;
  color: #34c759;
  overflow-x: auto;
}

.clear-logs-button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #ff3b30;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.clear-logs-button:hover {
  background: #d70015;
}
</style>