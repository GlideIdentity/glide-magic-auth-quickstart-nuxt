<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  result: { type: Object, required: true },
});

const emit = defineEmits(['dismiss']);

const AUTO_DISMISS_MS = 12000;

function maskPhone(phone) {
  if (!phone || phone.length < 6) return phone || '';
  return phone.slice(0, 3) + ' *** *** ' + phone.slice(-4);
}

function simRiskConfig(riskLevel) {
  switch (riskLevel) {
    case 'RISK_LEVEL_HIGH':
      return { label: 'High Risk', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', description: 'Recent SIM change detected' };
    case 'RISK_LEVEL_MEDIUM':
      return { label: 'Medium', color: '#d97706', bg: 'rgba(217,119,6,0.1)', description: 'SIM changed within 30 days' };
    case 'RISK_LEVEL_LOW':
      return { label: 'Low Risk', color: '#059669', bg: 'rgba(5,150,105,0.1)', description: 'No recent SIM change' };
    default:
      return { label: 'Unknown', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', description: 'Could not determine risk' };
  }
}

function deviceRiskConfig(riskLevel) {
  switch (riskLevel) {
    case 'RISK_LEVEL_HIGH':
      return { label: 'High Risk', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', description: 'Recent device change detected' };
    case 'RISK_LEVEL_MEDIUM':
      return { label: 'Medium', color: '#d97706', bg: 'rgba(217,119,6,0.1)', description: 'Device changed within 30 days' };
    case 'RISK_LEVEL_LOW':
      return { label: 'Low Risk', color: '#059669', bg: 'rgba(5,150,105,0.1)', description: 'No recent device change' };
    default:
      return { label: 'Unknown', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', description: 'Could not determine risk' };
  }
}

const phase = ref(0);
const countdown = ref(Math.ceil(AUTO_DISMISS_MS / 1000));

let timers = [];
let countdownInterval = null;

function handleDismiss() {
  phase.value = 0;
  const t = setTimeout(() => emit('dismiss'), 350);
  timers.push(t);
}

const isVerified = computed(() => props.result.verified !== false);
const simSwap = computed(() => props.result.sim_swap);
const deviceSwap = computed(() => props.result.device_swap);
const simRisk = computed(() => simSwap.value?.risk_level ? simRiskConfig(simSwap.value.risk_level) : null);
const deviceRisk = computed(() => deviceSwap.value?.risk_level ? deviceRiskConfig(deviceSwap.value.risk_level) : null);
const hasSignals = computed(() => simSwap.value || deviceSwap.value);

onMounted(() => {
  timers.push(setTimeout(() => { phase.value = 1; }, 10));
  timers.push(setTimeout(() => { phase.value = 2; }, 80));
  timers.push(setTimeout(() => { phase.value = 3; }, 350));
  timers.push(setTimeout(() => { handleDismiss(); }, AUTO_DISMISS_MS));

  countdownInterval = setInterval(() => {
    countdown.value = Math.max(0, countdown.value - 1);
  }, 1000);
});

onUnmounted(() => {
  timers.forEach(clearTimeout);
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<template>
  <div
    :class="['ro-backdrop', phase >= 1 && 'ro-in', phase === 0 && 'ro-out']"
    @click="handleDismiss"
  >
    <div :class="['ro-card', phase >= 2 && 'ro-card-in']" @click.stop>

      <!-- Glow -->
      <div
        :class="['ro-glow', isVerified ? 'ro-glow-success' : 'ro-glow-fail', phase >= 3 && 'ro-glow-in']"
      />

      <!-- Animated icon -->
      <div :class="['ro-icon-wrap', phase >= 3 && 'ro-reveal']">
        <svg v-if="isVerified" class="ro-check-svg" viewBox="0 0 52 52">
          <circle class="ro-check-ring" cx="26" cy="26" r="25" fill="none" />
          <path class="ro-check-tick" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <svg v-else class="ro-x-svg" viewBox="0 0 52 52">
          <circle class="ro-x-ring" cx="26" cy="26" r="25" fill="none" />
          <path class="ro-x-lines" fill="none" d="M16 16l20 20M36 16l-20 20" />
        </svg>
      </div>

      <!-- Title -->
      <h3 :class="['ro-title', phase >= 3 && 'ro-reveal ro-d1']">
        {{ result.verified !== undefined ? (isVerified ? 'Phone Verified' : 'Verification Failed') : 'Phone Number Retrieved' }}
      </h3>

      <!-- Phone -->
      <p :class="['ro-phone', phase >= 3 && 'ro-reveal ro-d2']">
        {{ maskPhone(result.phone_number) }}
      </p>

      <!-- Anti-fraud signals -->
      <div v-if="hasSignals" :class="['ro-signals', phase >= 3 && 'ro-reveal ro-d3']">
        <div class="ro-signals-label">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Anti-Fraud Signals
        </div>

        <!-- SIM Swap -->
        <div v-if="simSwap" class="ro-signal-row">
          <div class="ro-sim-icon">
            <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
              <rect x="6" y="2" width="28" height="36" rx="3" stroke="currentColor" stroke-width="1.5" />
              <path d="M6 12h10l4-4h8" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <rect x="13" y="18" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2" />
              <line x1="20" y1="18" x2="20" y2="30" stroke="currentColor" stroke-width="1" opacity="0.5" />
              <line x1="13" y1="24" x2="27" y2="24" stroke="currentColor" stroke-width="1" opacity="0.5" />
            </svg>
          </div>
          <div class="ro-signal-body">
            <div class="ro-signal-name">SIM Swap Check</div>
            <template v-if="simSwap.checked">
              <span
                v-if="simRisk"
                class="ro-badge"
                :style="{ background: simRisk.bg, color: simRisk.color, borderColor: simRisk.color }"
              >{{ simRisk.label }}</span>
              <div class="ro-signal-desc">{{ simRisk?.description }}</div>
              <div v-if="simSwap.age_band" class="ro-signal-sub">Last change: {{ simSwap.age_band }}</div>
              <div v-if="simSwap.carrier_name" class="ro-signal-sub">Carrier: {{ simSwap.carrier_name }}</div>
            </template>
            <template v-else>
              <span class="ro-badge ro-badge-na">Unavailable</span>
              <div v-if="simSwap.reason" class="ro-signal-sub">Reason: {{ simSwap.reason }}</div>
            </template>
          </div>
        </div>

        <!-- Device Swap -->
        <div v-if="deviceSwap" class="ro-signal-row" style="margin-top: 0.5rem;">
          <div class="ro-sim-icon">
            <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
              <rect x="10" y="2" width="20" height="36" rx="3" stroke="currentColor" stroke-width="1.5" />
              <line x1="16" y1="6" x2="24" y2="6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
              <circle cx="20" cy="33" r="2" stroke="currentColor" stroke-width="1.2" />
              <rect x="13" y="10" width="14" height="18" rx="1" stroke="currentColor" stroke-width="1" opacity="0.5" />
            </svg>
          </div>
          <div class="ro-signal-body">
            <div class="ro-signal-name">Device Swap Check</div>
            <template v-if="deviceSwap.checked">
              <span
                v-if="deviceRisk"
                class="ro-badge"
                :style="{ background: deviceRisk.bg, color: deviceRisk.color, borderColor: deviceRisk.color }"
              >{{ deviceRisk.label }}</span>
              <div class="ro-signal-desc">{{ deviceRisk?.description }}</div>
              <div v-if="deviceSwap.age_band" class="ro-signal-sub">Last change: {{ deviceSwap.age_band }}</div>
              <div v-if="deviceSwap.carrier_name" class="ro-signal-sub">Carrier: {{ deviceSwap.carrier_name }}</div>
            </template>
            <template v-else>
              <span class="ro-badge ro-badge-na">Unavailable</span>
              <div v-if="deviceSwap.reason" class="ro-signal-sub">Reason: {{ deviceSwap.reason }}</div>
            </template>
          </div>
        </div>
      </div>

      <!-- Audience -->
      <div v-if="result.aud" :class="['ro-aud', phase >= 3 && 'ro-reveal ro-d4']">
        <span>aud</span> {{ result.aud }}
      </div>

      <!-- Dismiss -->
      <button :class="['ro-btn', phase >= 3 && 'ro-reveal ro-d5']" @click="handleDismiss">
        Dismiss <span class="ro-countdown">({{ countdown }}s)</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.ro-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  transition: background 0.35s ease, backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease;
  padding: 1rem;
}

.ro-backdrop.ro-in {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ro-backdrop.ro-out {
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

.ro-card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 2.25rem 1.75rem 1.75rem;
  width: 92%;
  max-width: 380px;
  text-align: center;
  box-shadow:
    0 24px 48px -12px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transform: translateY(50px) scale(0.92);
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.ro-card-in {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.ro-out .ro-card {
  transform: translateY(24px) scale(0.96);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.25s ease;
}

.ro-glow {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%) scale(0.4);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0;
  filter: blur(40px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.ro-glow-success {
  background: radial-gradient(circle, rgba(5, 150, 105, 0.4), transparent 70%);
}

.ro-glow-fail {
  background: radial-gradient(circle, rgba(220, 38, 38, 0.3), transparent 70%);
}

.ro-glow-in {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.ro-reveal {
  animation: ro-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.ro-d1 { animation-delay: 0.08s; }
.ro-d2 { animation-delay: 0.16s; }
.ro-d3 { animation-delay: 0.28s; }
.ro-d4 { animation-delay: 0.36s; }
.ro-d5 { animation-delay: 0.44s; }

@keyframes ro-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.ro-icon-wrap {
  margin: 0 auto 0.75rem;
  width: 68px;
  height: 68px;
  opacity: 0;
}

.ro-icon-wrap.ro-reveal {
  animation-delay: 0s;
}

.ro-check-svg,
.ro-x-svg {
  width: 68px;
  height: 68px;
}

.ro-check-ring {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke: #059669;
  animation: ro-ring 0.7s 0.15s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.ro-check-tick {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke: #059669;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: ro-draw 0.35s 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.ro-x-ring {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke: #dc2626;
  animation: ro-ring 0.7s 0.15s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.ro-x-lines {
  stroke-dasharray: 56;
  stroke-dashoffset: 56;
  stroke-width: 3;
  stroke: #dc2626;
  stroke-linecap: round;
  animation: ro-draw 0.35s 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

@keyframes ro-ring {
  to { stroke-dashoffset: 0; }
}

@keyframes ro-draw {
  to { stroke-dashoffset: 0; }
}

.ro-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.15rem;
  letter-spacing: -0.01em;
  opacity: 0;
}

.ro-phone {
  font-size: 1rem;
  color: #475569;
  font-family: 'SF Mono', 'JetBrains Mono', Monaco, 'Cascadia Code', monospace;
  font-weight: 500;
  letter-spacing: 1px;
  margin: 0 0 1.25rem;
  opacity: 0;
}

.ro-signals {
  text-align: left;
  margin: 0 0 0.75rem;
  opacity: 0;
}

.ro-signals-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 0.4rem;
}

.ro-signal-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 14px;
  padding: 0.75rem;
}

.ro-sim-icon {
  flex-shrink: 0;
  color: #94a3b8;
  padding-top: 2px;
}

.ro-signal-body {
  flex: 1;
  min-width: 0;
}

.ro-signal-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: #1e293b;
  margin-bottom: 3px;
}

.ro-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 99px;
  border: 1px solid transparent;
  margin-bottom: 3px;
  animation: ro-badge-pop 0.35s 1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.ro-badge-na {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.2);
}

@keyframes ro-badge-pop {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
}

.ro-signal-desc {
  font-size: 0.78rem;
  color: #475569;
}

.ro-signal-sub {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 1px;
}

.ro-aud {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  opacity: 0;
}

.ro-aud span {
  font-weight: 700;
  font-family: 'SF Mono', monospace;
  background: rgba(100, 116, 139, 0.08);
  padding: 1px 5px;
  border-radius: 4px;
  margin-right: 4px;
}

.ro-btn {
  background: rgba(241, 245, 249, 0.9);
  color: #475569;
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 10px 36px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  opacity: 0;
}

.ro-btn:hover {
  background: rgba(226, 232, 240, 0.9);
}

.ro-btn:active {
  transform: scale(0.97);
}

.ro-countdown {
  font-variant-numeric: tabular-nums;
  opacity: 0.45;
  margin-left: 8px;
}

@media (max-width: 480px) {
  .ro-card {
    padding: 2rem 1.25rem 1.5rem;
    border-radius: 20px;
    max-width: 340px;
  }

  .ro-icon-wrap {
    width: 60px;
    height: 60px;
  }

  .ro-check-svg,
  .ro-x-svg {
    width: 60px;
    height: 60px;
  }
}
</style>
