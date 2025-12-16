<template>
  <!-- SDK Configuration Panel Overlay -->
  <div class="sdk-config-overlay" :class="{ active: isOpen }" @click="$emit('close')"></div>
  
  <!-- SDK Configuration Panel -->
  <aside class="sdk-config-panel" :class="{ active: isOpen }">
    <div class="sdk-config-header">
      <h2>SDK Configuration</h2>
      <button class="sdk-config-close" @click="$emit('close')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="sdk-config-content">
      <!-- Core Options -->
      <div class="config-section">
        <h3>Core Options</h3>
        
        <div class="config-field">
          <label>Polling Interval (ms)</label>
          <p class="config-description">How often to check authentication status.</p>
          <input type="number" v-model.number="localConfig.pollingInterval" min="500" max="10000" step="500">
        </div>
        
        <div class="config-field">
          <label>Max Polling Attempts</label>
          <p class="config-description">Maximum retries before timeout.</p>
          <input type="number" v-model.number="localConfig.maxPollingAttempts" min="5" max="120">
        </div>
      </div>
      
      <!-- Modal Options -->
      <div class="config-section">
        <h3>Modal Options</h3>
        <p class="config-section-note">These options affect the QR code modal displayed during desktop authentication.</p>
        
        <div class="config-field">
          <label>Modal Theme</label>
          <p class="config-description">Color theme for the QR code modal. 'Auto' uses system preference.</p>
          <select v-model="localConfig.modalTheme">
            <option value="auto">Auto (System Preference)</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        
        <div class="config-field">
          <label>View Mode</label>
          <p class="config-description">Layout style for the QR code modal</p>
          <select v-model="localConfig.viewMode">
            <option value="toggle">Toggle (iOS/Android switch)</option>
            <option value="dual">Dual (Both QR codes side by side)</option>
            <option value="pre-step">Pre-step (Choose OS first)</option>
          </select>
        </div>
        
        <div class="config-field">
          <label>Title</label>
          <p class="config-description">Custom title text for the modal header</p>
          <input type="text" v-model="localConfig.title" placeholder="Scan to Verify">
        </div>
        
        <div class="config-field">
          <label>Description</label>
          <p class="config-description">Optional subtitle text below the title</p>
          <input type="text" v-model="localConfig.description" placeholder="Optional description...">
        </div>
        
        <div class="config-field config-toggle">
          <div class="config-toggle-info">
            <label>Show Close Button</label>
            <p class="config-description">Display the X button to close the modal</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="localConfig.showCloseButton">
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="config-field config-toggle">
          <div class="config-toggle-info">
            <label>Close on Backdrop Click</label>
            <p class="config-description">Allow closing by clicking outside the modal</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="localConfig.closeOnBackdrop">
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="config-field config-toggle">
          <div class="config-toggle-info">
            <label>Close on Escape Key</label>
            <p class="config-description">Allow closing by pressing the Escape key</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="localConfig.closeOnEscape">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      
      <!-- Developer Note -->
      <div class="config-note">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <p>
          <strong>Developer Note:</strong> You can build your own custom UI by using 
          <code>preventDefaultUI: true</code> in the invoke options. This gives you full control over the QR code display and authentication flow.
        </p>
      </div>
    </div>
    
    <div class="sdk-config-footer">
      <button class="btn-secondary" @click="resetConfig">Reset to Defaults</button>
      <button class="btn-primary" @click="applyConfig">Apply & Close</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

// Props
const props = defineProps<{
  isOpen: boolean
  config: {
    pollingInterval: number
    maxPollingAttempts: number
    modalTheme: string
    viewMode: string
    title: string
    description: string
    showCloseButton: boolean
    closeOnBackdrop: boolean
    closeOnEscape: boolean
  }
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', config: typeof props.config): void
  (e: 'reset'): void
}>()

// Local copy of config for editing
const localConfig = reactive({ ...props.config })

// Sync local config when prop changes
watch(() => props.config, (newConfig) => {
  Object.assign(localConfig, newConfig)
}, { deep: true })

// Apply configuration
const applyConfig = () => {
  emit('apply', { ...localConfig })
  emit('close')
}

// Reset to defaults
const resetConfig = () => {
  emit('reset')
}
</script>

<style scoped>
/* SDK Config Panel Overlay */
.sdk-config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
}

.sdk-config-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* SDK Config Panel */
.sdk-config-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 100%;
  height: 100vh;
  background: #ffffff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sdk-config-panel.active {
  transform: translateX(0);
}

/* Panel Header */
.sdk-config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.sdk-config-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.sdk-config-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: auto !important;
}

.sdk-config-close:hover {
  background: #e5e7eb;
  color: #111827;
}

/* Panel Content */
.sdk-config-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Config Sections */
.config-section {
  margin-bottom: 32px;
}

.config-section h3 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin: 0 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.config-section-note {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

/* Config Fields */
.config-field {
  margin-bottom: 20px;
}

.config-field > label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.config-description {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.config-field input[type="text"],
.config-field input[type="number"],
.config-field select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.config-field input[type="text"]:focus,
.config-field input[type="number"]:focus,
.config-field select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-field input::placeholder {
  color: #9ca3af;
}

/* Toggle Field */
.config-field.config-toggle {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.config-toggle-info {
  flex: 1;
}

.config-toggle-info label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 24px;
}

.switch .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background-color: #3b82f6;
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
}

/* Developer Note */
.config-note {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  margin-top: 24px;
}

.config-note svg {
  flex-shrink: 0;
  color: #0284c7;
  margin-top: 2px;
}

.config-note p {
  font-size: 13px;
  line-height: 1.6;
  color: #0369a1;
  margin: 0;
}

.config-note code {
  background: rgba(2, 132, 199, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
}

/* Panel Footer */
.sdk-config-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-secondary {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: auto !important;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-primary {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  background: #111827;
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: auto !important;
}

.btn-primary:hover {
  background: #1f2937;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .sdk-config-panel {
    width: 100%;
  }
}
</style>
