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
      
      <!-- SDK Config Button -->
      <button class="sdk-config-btn" @click="showSdkConfig = true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>SDK Configuration</span>
      </button>
    </header>

    <!-- SDK Configuration Panel (Component) -->
    <SdkConfigPanel
      :is-open="showSdkConfig"
      :config="sdkConfig"
      @close="showSdkConfig = false"
      @apply="applySdkConfig"
      @reset="resetSdkConfig"
    />

    <div class="container">
      <!-- Flow Mode Toggle -->
      <section class="section mode-toggle-section">
        <div class="mode-toggle">
          <button 
            :class="['mode-btn', { active: flowMode === 'highlevel' }]"
            @click="flowMode = 'highlevel'"
          >
            High Level
          </button>
          <button 
            :class="['mode-btn', { active: flowMode === 'granular' }]"
            @click="flowMode = 'granular'"
          >
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
          <div class="section-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <rect x="2" y="4" width="9" height="13" rx="1.5" stroke="currentColor" stroke-width="2" fill="none"/>
              <rect x="4.5" y="7" width="4" height="4" rx="0.5" fill="currentColor"/>
              <rect x="13" y="4" width="9" height="13" rx="1.5" stroke="#999" stroke-width="1.5" fill="none"/>
              <rect x="15.5" y="7" width="4" height="4" rx="0.5" fill="none" stroke="#999" stroke-width="1.5"/>
            </svg>
          </div>
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
            <div class="card-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Verify Phone Number</h3>
            <p>Verify if phone matches SIM card through carrier network</p>
          </div>

          <div 
            :class="`card ${selectedFlow === 'get' ? 'selected' : ''}`"
            @click="selectFlow('get')"
          >
            <div class="card-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                <rect x="7" y="4" width="10" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <line x1="10" y1="17" x2="14" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Get Phone Number</h3>
            <p>Retrieve phone number from SIM card with carrier verification</p>
          </div>
        </div>
      </section>

      <!-- Phone Input Section (only for verify flow) -->
      <section v-if="selectedFlow === 'verify'" class="section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
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
            @keydown.enter="flowMode === 'highlevel' ? startAuthentication() : executeStepOne()"
          />
        </div>
      </section>

      <!-- High-Level Flow -->
      <section v-if="flowMode === 'highlevel'" class="section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="section-title">
            <h2>Start Authentication</h2>
            <p>Click below to initiate the authentication flow</p>
          </div>
        </div>

        <button 
          @click="startAuthentication"
          :disabled="isLoading || (selectedFlow === 'verify' && !phoneInput)"
          :class="['action-button', { 'loading': isLoading }]"
        >
          <span v-if="!isLoading">
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

        <!-- Result Overlay -->
        <ResultOverlay v-if="result" :result="result" @dismiss="reset()" />
      </section>

      <!-- Granular Flow -->
      <section v-else-if="flowMode === 'granular'" class="section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
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
          <p>Initialize the session using <code>prepare()</code></p>
          
          <button 
            @click="executeStepOne"
            :disabled="stepOneResp !== null || isLoading || (selectedFlow === 'verify' && !phoneInput)"
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

        <!-- Step 2: Invoke Secure Prompt -->
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
          <p>Invoke secure prompt using <code>invokeSecurePrompt()</code></p>
          
          <button 
            @click="executeStepTwo"
            :disabled="!stepOneResp || stepTwoResp !== null || isLoading"
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
          <p>Process using <code>{{ selectedFlow === 'verify' ? 'verifyPhoneNumber()' : 'getPhoneNumber()' }}</code></p>
          
          <button 
            @click="executeStepThree"
            :disabled="!stepTwoResp || stepThreeResp !== null || isLoading"
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

        <!-- Result Overlay for Granular -->
        <ResultOverlay v-if="stepThreeResp" :result="stepThreeResp" @dismiss="resetGranularFlow()" />
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
          <div class="section-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
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
import { ref, reactive } from 'vue'
// Use the /vue adapter with usePhoneAuth composable
import { usePhoneAuth, USE_CASE } from '@glideidentity/glide-fe-sdk-web/vue'
import type { PrepareResponse, InvokeResult, InvokeOptions } from '@glideidentity/glide-fe-sdk-web/vue'

// SDK Configuration state
const showSdkConfig = ref(false)
const sdkConfig = reactive({
  modalTheme: 'auto',
  viewMode: 'toggle',
  title: '',
  description: '',
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
})

const defaultSdkConfig = {
  modalTheme: 'auto',
  viewMode: 'toggle',
  title: '',
  description: '',
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
}

// SDK Config handlers
const applySdkConfig = (newConfig: typeof sdkConfig) => {
  Object.assign(sdkConfig, newConfig)
  addDebugLog('info', 'SDK configuration applied', newConfig)
}

const resetSdkConfig = () => {
  Object.assign(sdkConfig, defaultSdkConfig)
  addDebugLog('info', 'SDK configuration reset to defaults')
}

// Initialize usePhoneAuth composable with config
// The composable provides reactive state and methods
const {
  isLoading,
  error,
  result,
  authenticate,
  prepare,
  invokeSecurePrompt,
  getPhoneNumber,
  verifyPhoneNumber,
  reset,
} = usePhoneAuth({
  debug: true,
  // The SDK uses these default endpoints. Override with relative paths
  // or full URLs to match your server setup.
  //
  // endpoints: {
  //   prepare: '/api/magical-auth/prepare',
  //   reportInvocation: '/api/magical-auth/report-invocation',
  //   process: '/api/magical-auth/process',
  // },
  //
  // Mobile DevTools Console — uncomment to enable an on-screen console
  // for mobile testing where browser DevTools are not accessible.
  //
  // devtools: {
  //   showMobileConsole: true,
  // },
})

// Local UI state
const flowMode = ref<'highlevel' | 'granular'>('highlevel')
const selectedFlow = ref<'verify' | 'get'>('verify')
const phoneInput = ref('')
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
const stepTwoResp = ref<InvokeResult | null>(null)
const stepThreeResp = ref<any>(null)
const stepTwoCredential = ref<string | null>(null) // Resolved credential from step 2
const stepOneError = ref<string | null>(null)
const stepTwoError = ref<string | null>(null)
const stepThreeError = ref<string | null>(null)

// Get invoke options from config (read dynamically so changes take effect immediately)
const getInvokeOptions = (): InvokeOptions => ({
  modalOptions: {
    theme: sdkConfig.modalTheme as 'auto' | 'dark' | 'light',
    viewMode: sdkConfig.viewMode as 'toggle' | 'dual' | 'pre-step',
    title: sdkConfig.title || undefined,
    description: sdkConfig.description || undefined,
    showCloseButton: sdkConfig.showCloseButton,
    closeOnBackdropClick: sdkConfig.closeOnBackdrop,
    closeOnEscape: sdkConfig.closeOnEscape,
  }
})

// Debug logging helper
const addDebugLog = (type: 'info' | 'error' | 'success', message: string, data?: any) => {
  debugLogs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
    data
  })
}

// Flow selection handler
const selectFlow = (flow: 'verify' | 'get') => {
  selectedFlow.value = flow
  phoneInput.value = ''
  reset()
  resetGranularFlow()
  addDebugLog('info', `Flow type changed to: ${flow}`)
}

// High-level authentication using authenticate()
const startAuthentication = async () => {
  if (selectedFlow.value === 'verify' && !phoneInput.value) {
    addDebugLog('error', 'Missing phone number')
    return
  }

  try {
    addDebugLog('info', 'Starting authentication', { 
      flow: selectedFlow.value,
      phone: selectedFlow.value === 'verify' ? phoneInput.value : undefined 
    })

    const response = await authenticate({
      use_case: selectedFlow.value === 'get' ? USE_CASE.GET_PHONE_NUMBER : USE_CASE.VERIFY_PHONE_NUMBER,
      phone_number: selectedFlow.value === 'verify' ? phoneInput.value : undefined,
    }, getInvokeOptions())
    
    addDebugLog('success', 'Authentication successful', response)
  } catch (err: any) {
    addDebugLog('error', 'Authentication failed', err)
  }
}

// Granular flow functions
const executeStepOne = async () => {
  stepOneError.value = null
  currentStep.value = 1

  try {
    addDebugLog('info', 'Step 1: Preparing authentication')

    const response = await prepare({
      use_case: selectedFlow.value === 'get' ? USE_CASE.GET_PHONE_NUMBER : USE_CASE.VERIFY_PHONE_NUMBER,
      phone_number: selectedFlow.value === 'verify' ? phoneInput.value : undefined,
    })
    
    stepOneResp.value = response
    currentStep.value = 2
    addDebugLog('success', 'Step 1 completed', { strategy: response.authentication_strategy })
  } catch (err: any) {
    stepOneError.value = err.message || 'Failed to prepare authentication'
    addDebugLog('error', 'Step 1 failed', err)
  }
}

const executeStepTwo = async () => {
  if (!stepOneResp.value) return

  stepTwoError.value = null
  currentStep.value = 2

  try {
    addDebugLog('info', 'Step 2: Invoking secure browser prompt')
    
    const invokeResult = await invokeSecurePrompt(stepOneResp.value!, getInvokeOptions())
    
    addDebugLog('info', 'Waiting for credential...', { strategy: invokeResult.strategy })
    const credential = await invokeResult.credential
    
    // Store the invoke result and credential separately
    stepTwoResp.value = invokeResult
    stepTwoCredential.value = credential
    currentStep.value = 3
    addDebugLog('success', 'Step 2 completed - credential obtained', { 
      strategy: invokeResult.strategy,
      hasCredential: !!credential 
    })
  } catch (err: any) {
    stepTwoError.value = err.message || 'Browser verification failed'
    currentStep.value = 0 // Reset to allow retry
    addDebugLog('error', 'Step 2 failed', err)
  }
}

const executeStepThree = async () => {
  if (!stepOneResp.value || !stepTwoResp.value || !stepTwoCredential.value) return

  stepThreeError.value = null
  currentStep.value = 3

  try {
    addDebugLog('info', 'Step 3: Processing verification')
    
    // Use the already-resolved credential from step 2
    const credential = stepTwoCredential.value
    
    const response = selectedFlow.value === 'get'
      ? await getPhoneNumber(credential, stepTwoResp.value!.session)
      : await verifyPhoneNumber(credential, stepTwoResp.value!.session)
    
    stepThreeResp.value = response
    currentStep.value = 0
    addDebugLog('success', 'Step 3 completed', response)
  } catch (err: any) {
    stepThreeError.value = err.message || 'Verification processing failed'
    addDebugLog('error', 'Step 3 failed', err)
  }
}

const resetGranularFlow = () => {
  currentStep.value = 0
  stepOneResp.value = null
  stepTwoResp.value = null
  stepTwoCredential.value = null
  stepThreeResp.value = null
  stepOneError.value = null
  stepTwoError.value = null
  stepThreeError.value = null
  addDebugLog('info', 'Granular flow reset')
}

// Initialize debug log
addDebugLog('info', 'usePhoneAuth composable initialized')
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
  position: relative;
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

/* SDK Config Button */
.sdk-config-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  left: auto;
  width: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sdk-config-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sdk-config-btn span {
  font-size: 14px;
  font-weight: 500;
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
  border: 1.5px solid #e5e7eb;
  border-radius: 50px;
  padding: 4px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.mode-btn {
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-btn.active {
  background: rgba(17, 24, 39, 0.9);
  color: white;
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
  width: 48px;
  height: 48px;
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #1d1d1f;
}

.section-icon svg {
  width: 24px;
  height: 24px;
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
  background: white;
  border-radius: 18px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card.selected {
  border-color: #007AFF;
  box-shadow: 0 12px 24px rgba(0, 122, 255, 0.15);
}

.card-icon {
  width: 64px;
  height: 64px;
  background: #f5f5f7;
  border-radius: 16px;
  border: 1px solid #e5e5e7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 32px;
  color: #6b7280;
}

.card-icon svg {
  width: 32px;
  height: 32px;
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
  background: rgba(17, 24, 39, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.action-button:hover:not(:disabled) {
  background: rgba(17, 24, 39, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(107, 114, 128, 0.3);
}

.action-button.loading {
  background: rgba(107, 114, 128, 0.3);
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
  background: rgba(17, 24, 39, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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

.step-card code {
  background: #f0f0f5;
  color: #007AFF;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.step-button {
  padding: 10px 20px;
  background: rgba(17, 24, 39, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-button:hover:not(:disabled) {
  background: rgba(17, 24, 39, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.step-button:disabled {
  background: rgba(107, 114, 128, 0.3);
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.5;
}

.step-success {
  margin-top: 12px;
  padding: 10px;
  background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%);
  border: 1.5px solid #bbf7d0;
  border-radius: 12px;
  color: #166534;
  font-size: 14px;
}

.step-error {
  margin-top: 12px;
  padding: 10px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1.5px solid #fecaca;
  border-radius: 12px;
  color: #991b1b;
  font-size: 14px;
}

.reset-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #ffffff;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.reset-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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

/* Mobile responsiveness */
@media (max-width: 768px) {
  .header {
    padding: 40px 20px;
  }
  
  .header h1 {
    font-size: 32px;
  }
  
  .header p {
    font-size: 17px;
  }
  
  .header-company {
    font-size: 18px;
  }
  
  .container {
    padding: 15px;
  }
  
  .sdk-config-btn {
    padding: 8px 12px;
    top: 15px;
    right: 15px;
  }
  
  .sdk-config-btn span {
    display: none;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 30px 15px;
  }
  
  .header h1 {
    font-size: 26px;
    line-height: 1.2;
  }
  
  .header p {
    font-size: 15px;
  }
  
  .header-brand {
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .header-logo {
    width: 28px;
    height: 28px;
  }
  
  .header-company {
    font-size: 16px;
  }
  
  .sdk-config-btn {
    padding: 8px;
    top: 12px;
    right: 12px;
  }
  
  .section {
    padding: 20px;
  }
  
  .section-header h2 {
    font-size: 18px;
  }
  
  .card h3 {
    font-size: 16px;
  }
  
  .card p {
    font-size: 13px;
  }
}
</style>
