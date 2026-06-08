<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const STATUSES = ['ИНИЦИАЛИЗАЦИЯ', 'ЗАГРУЗКА ПЕРСОНАЖА', 'ПОДГОТОВКА МИРА', 'ПОЧТИ ГОТОВО', 'ГОТОВО']
const shown = ref(0)
const statusIdx = ref(0)
const show = ref(false)
let raf = 0
let start = 0
let finishing = false

const easeOut = (t) => 1 - Math.pow(1 - t, 2.2)

const tick = () => {
  if (!finishing) {
    const elapsed = Date.now() - start
    const t = Math.min(elapsed / 8000, 1)
    const goal = easeOut(t) * 90
    if (goal > shown.value) shown.value = goal
    if (shown.value >= 25 && statusIdx.value < 1) statusIdx.value = 1
    if (shown.value >= 55 && statusIdx.value < 2) statusIdx.value = 2
    if (shown.value >= 80 && statusIdx.value < 3) statusIdx.value = 3
  } else {
    shown.value += (100 - shown.value) * 0.12 + 0.5
    if (shown.value >= 99.5) {
      shown.value = 100
      statusIdx.value = 4
      setTimeout(() => { show.value = false }, 400)
      return
    }
  }
  raf = requestAnimationFrame(tick)
}

const startLoad = () => {
  shown.value = 0
  statusIdx.value = 0
  finishing = false
  show.value = true
  start = Date.now()
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(tick)
}

const finishLoad = () => {
  if (!show.value) return
  finishing = true
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(tick)
}

watch(() => props.visible, (v) => {
  if (v) startLoad()
  else finishLoad()
}, { immediate: true })

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <transition name="loader-fade">
    <div v-if="show" class="loader-root">
      <div class="grain"></div>
      <div class="vignette"></div>
      <div class="view">
        <div class="bg-glow"></div>
        <div class="content">
          <div class="mark">
            <span class="mark-bracket">[</span>
            <h1 class="mark-title">IDENTITY</h1>
            <span class="mark-bracket">]</span>
          </div>
          <p class="mark-sub">ROLEPLAY&nbsp;&nbsp;PROJECT</p>
          <div class="loader-block">
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: shown + '%' }"></div>
            </div>
            <p class="status">{{ STATUSES[statusIdx] }}</p>
          </div>
        </div>
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.loader-root {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: var(--brand-bg);
  font-family: 'Archivo', sans-serif;
  color: var(--brand-fg);
  overflow: hidden;
}

.loader-fade-enter-active, .loader-fade-leave-active {
  transition: opacity 0.5s ease;
}
.loader-fade-enter-from, .loader-fade-leave-to {
  opacity: 0;
}

.view {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 900px;
  height: 900px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(200, 162, 76, 0.08) 0%, rgba(200, 162, 76, 0.02) 35%, transparent 65%);
  animation: glowPulse 6s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
}

.grain {
  position: fixed;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  z-index: 100;
  animation: grainShift 0.6s steps(2) infinite;
}

@keyframes grainShift {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-3%, 2%); }
  100% { transform: translate(2%, -2%); }
}

.vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.7) 100%);
}

.content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mark {
  display: flex;
  align-items: center;
  gap: 18px;
  animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.mark-bracket {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 52px;
  color: var(--brand-accent);
  opacity: 0.7;
  line-height: 1;
}

.mark-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 64px;
  letter-spacing: 0.28em;
  line-height: 1;
  margin: 0;
  padding-left: 0.28em;
  background: linear-gradient(180deg, #fff 0%, #b8b8bc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mark-sub {
  font-size: 12px;
  letter-spacing: 0.65em;
  color: var(--brand-dim);
  margin: 14px 0 0;
  padding-left: 0.65em;
  animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.loader-block {
  margin-top: 64px;
  width: 420px;
  animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.bar-track {
  width: 100%;
  height: 2px;
  background: var(--brand-faint);
  position: relative;
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  inset: 0;
  width: 0%;
  background: linear-gradient(90deg, var(--brand-accent), #e6c878);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 12px rgba(200, 162, 76, 0.6);
}

.status {
  margin: 18px 0 0;
  font-size: 10px;
  letter-spacing: 0.35em;
  color: var(--brand-dim);
  text-transform: uppercase;
  text-align: center;
}

.corner {
  position: fixed;
  width: 40px;
  height: 40px;
  border-color: var(--brand-faint);
  border-style: solid;
  border-width: 0;
  z-index: 20;
}

.corner-tl { top: 32px; left: 32px; border-top-width: 1px; border-left-width: 1px; }
.corner-tr { top: 32px; right: 32px; border-top-width: 1px; border-right-width: 1px; }
.corner-bl { bottom: 32px; left: 32px; border-bottom-width: 1px; border-left-width: 1px; }
.corner-br { bottom: 32px; right: 32px; border-bottom-width: 1px; border-right-width: 1px; }
</style>
