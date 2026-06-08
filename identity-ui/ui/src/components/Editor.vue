<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({ appearance: { type: Object, default: () => ({}) } })
const emit = defineEmits(['setHeadBlend', 'setFace', 'setHair', 'setOverlay', 'setEyeColor', 'setZone', 'rotate', 'save', 'back'])

const FACE_LABELS = {
  noseWidth: 'Ширина носа', nosePeakHigh: 'Высота переносицы', nosePeakSize: 'Размер носа',
  noseBoneHigh: 'Высота кости носа', nosePeakLowering: 'Кончик носа', noseBoneTwist: 'Изгиб носа',
  eyeBrowHigh: 'Высота бровей', eyeBrowForward: 'Брови вперёд', cheeksBoneHigh: 'Высота скул',
  cheeksBoneWidth: 'Ширина скул', cheeksWidth: 'Полнота щёк', eyesOpening: 'Разрез глаз',
  lipsThickness: 'Полнота губ', jawBoneWidth: 'Ширина челюсти', jawBoneBackLength: 'Длина челюсти',
  chinBoneLowering: 'Высота подбородка', chinBoneLength: 'Длина подбородка', chinBoneSize: 'Размер подбородка',
  chinHole: 'Ямка подбородка', neckThickness: 'Толщина шеи'
}

const SECTIONS = [
  { id: 'heritage', label: 'РОДИТЕЛИ', zone: 'face' },
  { id: 'face', label: 'ЧЕРТЫ ЛИЦА', zone: 'face' },
  { id: 'hair', label: 'ПРИЧЁСКА', zone: 'face' },
  { id: 'eyebrows', label: 'БРОВИ', zone: 'face' },
  { id: 'beard', label: 'БОРОДА', zone: 'face' },
  { id: 'eyes', label: 'ГЛАЗА', zone: 'face' }
]

const ZONES = [
  { id: 'body', label: 'ТЕЛО' },
  { id: 'face', label: 'ЛИЦО' },
  { id: 'torso', label: 'ТОРС' },
  { id: 'legs', label: 'НОГИ' }
]

const HAIR_MAX = 36
const EYEBROW_MAX = 33
const BEARD_MAX = 28
const HAIR_COLOR_MAX = 63
const EYE_COLOR_MAX = 31

const HAIR_PALETTE = [
  '#1a1310','#2a1d15','#3d2817','#5c3a1e','#7a4f28','#9a6a35','#b88a4a','#d4a861',
  '#e8c87d','#3a3a3a','#5a5a5a','#8a8a8a','#bdbdbd','#e0e0e0','#6e2410','#8a2f15'
]
const EYE_PALETTE = [
  '#3d2817','#5c3a1e','#7a5230','#4a6741','#3a7a5c','#2f6e8a','#3a5a9a','#6a4a8a','#8a8a8a','#2a2a2a'
]

const activeSection = ref('heritage')
const activeZone = ref('body')
const saving = ref(false)

const local = reactive({
  headBlend: Object.assign({ shapeFirst: 0, shapeSecond: 0, skinFirst: 0, skinSecond: 0, shapeMix: 0.5, skinMix: 0.5 }, props.appearance.headBlend || {}),
  faceFeatures: Object.assign({}, props.appearance.faceFeatures || {}),
  hair: Object.assign({ style: 0, color: 0, highlight: 0 }, props.appearance.hair || {}),
  headOverlays: {
    eyebrows: Object.assign({ style: 0, opacity: 1.0, color: 0 }, (props.appearance.headOverlays || {}).eyebrows || {}),
    beard: Object.assign({ style: 255, opacity: 0.0, color: 0 }, (props.appearance.headOverlays || {}).beard || {})
  },
  eyeColor: props.appearance.eyeColor || 0
})

watch(() => props.appearance, (a) => {
  if (!a) return
  Object.assign(local.headBlend, a.headBlend || {})
  Object.assign(local.faceFeatures, a.faceFeatures || {})
  Object.assign(local.hair, a.hair || {})
  if (a.headOverlays) {
    Object.assign(local.headOverlays.eyebrows, a.headOverlays.eyebrows || {})
    Object.assign(local.headOverlays.beard, a.headOverlays.beard || {})
  }
  local.eyeColor = a.eyeColor || 0
}, { deep: true })

const selectSection = (s) => {
  activeSection.value = s.id
  if (s.zone) selectZone(s.zone)
}

const selectZone = (id) => {
  activeZone.value = id
  emit('setZone', id)
}

const setBlend = (key, val) => {
  const v = parseInt(val, 10)
  local.headBlend[key] = v
  emit('setHeadBlend', key, v)
}
const setMix = (key, val) => {
  const v = parseFloat(val)
  local.headBlend[key] = v
  emit('setHeadBlend', key, v)
}
const setFace = (key, val) => {
  const v = parseFloat(val)
  local.faceFeatures[key] = v
  emit('setFace', key, v)
}

const cycleHair = (dir) => {
  let s = (local.hair.style || 0) + dir
  if (s < 0) s = HAIR_MAX
  if (s > HAIR_MAX) s = 0
  local.hair.style = s
  emit('setHair', 'style', s)
}
const pickHairColor = (i) => {
  local.hair.color = i
  local.hair.highlight = i
  emit('setHair', 'color', i)
  emit('setHair', 'highlight', i)
}

const cycleEyebrow = (dir) => {
  let s = (local.headOverlays.eyebrows.style || 0) + dir
  if (s < 0) s = EYEBROW_MAX
  if (s > EYEBROW_MAX) s = 0
  local.headOverlays.eyebrows.style = s
  emit('setOverlay', 'eyebrows', 'style', s)
  emit('setOverlay', 'eyebrows', 'opacity', 1.0)
}
const pickEyebrowColor = (i) => {
  local.headOverlays.eyebrows.color = i
  emit('setOverlay', 'eyebrows', 'color', i)
}

const cycleBeard = (dir) => {
  let s = local.headOverlays.beard.style
  if (s === 255) s = 0
  else s = s + dir
  if (s < 0) { local.headOverlays.beard.style = 255; emit('setOverlay', 'beard', 'style', 255); emit('setOverlay', 'beard', 'opacity', 0.0); return }
  if (s > BEARD_MAX) s = 0
  local.headOverlays.beard.style = s
  emit('setOverlay', 'beard', 'style', s)
  emit('setOverlay', 'beard', 'opacity', local.headOverlays.beard.opacity > 0 ? local.headOverlays.beard.opacity : 1.0)
  if (!(local.headOverlays.beard.opacity > 0)) local.headOverlays.beard.opacity = 1.0
}
const setBeardOpacity = (val) => {
  const v = parseFloat(val)
  local.headOverlays.beard.opacity = v
  emit('setOverlay', 'beard', 'opacity', v)
}
const pickBeardColor = (i) => {
  local.headOverlays.beard.color = i
  emit('setOverlay', 'beard', 'color', i)
}

const cycleEye = (dir) => {
  let c = (local.eyeColor || 0) + dir
  if (c < 0) c = EYE_COLOR_MAX
  if (c > EYE_COLOR_MAX) c = 0
  local.eyeColor = c
  emit('setEyeColor', c)
}
const pickEyeColor = (i) => {
  local.eyeColor = i
  emit('setEyeColor', i)
}

const doSave = () => {
  if (saving.value) return
  saving.value = true
  emit('save')
}
const onSaveFailed = () => { saving.value = false }
defineExpose({ onSaveFailed })

let dragging = false
let lastX = 0
const isUiElement = (el) => {
  if (!el || !el.closest) return false
  return el.closest('.ed-options, .sections, .zone-bar, .ed-actions, .ed-header, .rotate-hint')
}
const onStageDown = (e) => {
  if (isUiElement(e.target)) return
  dragging = true
  lastX = e.clientX
  e.preventDefault()
}
const onStageMove = (e) => {
  if (!dragging) return
  const dx = e.clientX - lastX
  lastX = e.clientX
  if (dx !== 0) emit('rotate', dx * 0.5)
}
const onStageUp = () => { dragging = false }

onMounted(() => {
  window.addEventListener('mousedown', onStageDown)
  window.addEventListener('mousemove', onStageMove)
  window.addEventListener('mouseup', onStageUp)
})
onUnmounted(() => {
  window.removeEventListener('mousedown', onStageDown)
  window.removeEventListener('mousemove', onStageMove)
  window.removeEventListener('mouseup', onStageUp)
})

const faceKeys = Object.keys(FACE_LABELS)
</script>

<template>
  <div class="ed-root">
    <div class="grain"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="stage"></div>

    <header class="ed-header">
      <div class="mark">
        <span class="mark-bracket">[</span>
        <span class="mark-title">IDENTITY</span>
        <span class="mark-bracket">]</span>
      </div>
      <p class="ed-sub">СОЗДАНИЕ ПЕРСОНАЖА</p>
    </header>

    <nav class="sections">
      <button
        v-for="s in SECTIONS"
        :key="s.id"
        class="section-tab"
        :class="{ active: activeSection === s.id }"
        @click="selectSection(s)"
      >{{ s.label }}</button>
    </nav>

    <aside class="ed-options">
      <div v-if="activeSection === 'heritage'" class="opt-body">
        <p class="opt-title">НАСЛЕДОВАНИЕ</p>
        <div class="slider-row">
          <label>Отец <b>{{ local.headBlend.shapeFirst }}</b></label>
          <input type="range" min="0" max="45" step="1" :value="local.headBlend.shapeFirst"
            @input="setBlend('shapeFirst', $event.target.value); setBlend('skinFirst', $event.target.value)" />
        </div>
        <div class="slider-row">
          <label>Мать <b>{{ local.headBlend.shapeSecond }}</b></label>
          <input type="range" min="0" max="45" step="1" :value="local.headBlend.shapeSecond"
            @input="setBlend('shapeSecond', $event.target.value); setBlend('skinSecond', $event.target.value)" />
        </div>
        <div class="slider-row">
          <label>Схожесть <b>{{ Math.round(local.headBlend.shapeMix * 100) }}%</b></label>
          <input type="range" min="0" max="1" step="0.05" :value="local.headBlend.shapeMix" @input="setMix('shapeMix', $event.target.value)" />
        </div>
        <div class="slider-row">
          <label>Тон кожи <b>{{ Math.round(local.headBlend.skinMix * 100) }}%</b></label>
          <input type="range" min="0" max="1" step="0.05" :value="local.headBlend.skinMix" @input="setMix('skinMix', $event.target.value)" />
        </div>
      </div>

      <div v-if="activeSection === 'face'" class="opt-body scroll">
        <p class="opt-title">ЧЕРТЫ ЛИЦА</p>
        <div class="slider-row" v-for="key in faceKeys" :key="key">
          <label>{{ FACE_LABELS[key] }}</label>
          <input type="range" min="-1" max="1" step="0.1" :value="local.faceFeatures[key] || 0" @input="setFace(key, $event.target.value)" />
        </div>
      </div>

      <div v-if="activeSection === 'hair'" class="opt-body">
        <p class="opt-title">ПРИЧЁСКА</p>
        <div class="stepper">
          <button class="step-btn" @click="cycleHair(-1)">‹</button>
          <span class="step-val">Стиль {{ local.hair.style }}</span>
          <button class="step-btn" @click="cycleHair(1)">›</button>
        </div>
        <p class="opt-label">ЦВЕТ ВОЛОС</p>
        <div class="palette">
          <button v-for="(c, i) in HAIR_PALETTE" :key="i" class="swatch"
            :class="{ on: local.hair.color === i }" :style="{ background: c }" @click="pickHairColor(i)"></button>
        </div>
      </div>

      <div v-if="activeSection === 'eyebrows'" class="opt-body">
        <p class="opt-title">БРОВИ</p>
        <div class="stepper">
          <button class="step-btn" @click="cycleEyebrow(-1)">‹</button>
          <span class="step-val">Форма {{ local.headOverlays.eyebrows.style }}</span>
          <button class="step-btn" @click="cycleEyebrow(1)">›</button>
        </div>
        <p class="opt-label">ЦВЕТ БРОВЕЙ</p>
        <div class="palette">
          <button v-for="(c, i) in HAIR_PALETTE" :key="i" class="swatch"
            :class="{ on: local.headOverlays.eyebrows.color === i }" :style="{ background: c }" @click="pickEyebrowColor(i)"></button>
        </div>
      </div>

      <div v-if="activeSection === 'beard'" class="opt-body">
        <p class="opt-title">БОРОДА / УСЫ</p>
        <div class="stepper">
          <button class="step-btn" @click="cycleBeard(-1)">‹</button>
          <span class="step-val">{{ local.headOverlays.beard.style === 255 ? 'Нет' : 'Стиль ' + local.headOverlays.beard.style }}</span>
          <button class="step-btn" @click="cycleBeard(1)">›</button>
        </div>
        <template v-if="local.headOverlays.beard.style !== 255">
          <div class="slider-row">
            <label>Насыщенность <b>{{ Math.round(local.headOverlays.beard.opacity * 100) }}%</b></label>
            <input type="range" min="0" max="1" step="0.05" :value="local.headOverlays.beard.opacity" @input="setBeardOpacity($event.target.value)" />
          </div>
          <p class="opt-label">ЦВЕТ</p>
          <div class="palette">
            <button v-for="(c, i) in HAIR_PALETTE" :key="i" class="swatch"
              :class="{ on: local.headOverlays.beard.color === i }" :style="{ background: c }" @click="pickBeardColor(i)"></button>
          </div>
        </template>
      </div>

      <div v-if="activeSection === 'eyes'" class="opt-body">
        <p class="opt-title">ЦВЕТ ГЛАЗ</p>
        <div class="stepper">
          <button class="step-btn" @click="cycleEye(-1)">‹</button>
          <span class="step-val">Цвет {{ local.eyeColor }}</span>
          <button class="step-btn" @click="cycleEye(1)">›</button>
        </div>
        <div class="palette">
          <button v-for="(c, i) in EYE_PALETTE" :key="i" class="swatch"
            :class="{ on: local.eyeColor === i }" :style="{ background: c }" @click="pickEyeColor(i)"></button>
        </div>
      </div>
    </aside>

    <div class="zone-bar">
      <button
        v-for="z in ZONES"
        :key="z.id"
        class="zone-btn"
        :class="{ active: activeZone === z.id }"
        @click="selectZone(z.id)"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5">
          <template v-if="z.id === 'body'">
            <circle cx="12" cy="5" r="2.5"/><path d="M12 7.5 L12 16 M12 9 L7 13 M12 9 L17 13 M12 16 L9 22 M12 16 L15 22"/>
          </template>
          <template v-else-if="z.id === 'face'">
            <circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="0.8" fill="currentColor"/><circle cx="15" cy="10" r="0.8" fill="currentColor"/><path d="M9 15 Q12 17 15 15"/>
          </template>
          <template v-else-if="z.id === 'torso'">
            <path d="M8 4 L6 7 L7 20 L17 20 L18 7 L16 4 M8 4 L12 6 L16 4"/>
          </template>
          <template v-else>
            <path d="M9 4 L9 13 L8 22 L11 22 L12 14 L13 22 L16 22 L15 13 L15 4 Z"/>
          </template>
        </svg>
        <span>{{ z.label }}</span>
      </button>
    </div>

    <div class="rotate-hint">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2 A10 10 0 1 1 4 7 M4 3 L4 7 L8 7"/>
      </svg>
      зажмите ЛКМ и двигайте мышь для поворота
    </div>

    <div class="ed-actions">
      <button class="btn btn-ghost" @click="emit('back')">НАЗАД</button>
      <button class="btn btn-save" @click="doSave" :disabled="saving">
        <span v-if="!saving">СОХРАНИТЬ И ИГРАТЬ</span>
        <span v-else class="spinner"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:wght@300;400;500&display=swap');

.ed-root {
  --bg: #060607; --fg: #f2f2f4; --dim: rgba(242,242,244,0.4);
  --faint: rgba(242,242,244,0.12); --accent: #c8a24c;
  position: fixed; inset: 0; font-family: 'Archivo', sans-serif; color: var(--fg);
  pointer-events: none; animation: rootIn 0.5s ease;
}
.ed-root > *:not(.stage) { pointer-events: auto; }
.grain, .corner { pointer-events: none; }
@keyframes rootIn { from { opacity: 0; } to { opacity: 1; } }

.stage { position: absolute; inset: 0; z-index: 0; pointer-events: auto; cursor: grab; }
.stage:active { cursor: grabbing; }

.grain {
  position: absolute; inset: -50%; width: 200%; height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: 0.03; z-index: 1;
}
.corner { position: absolute; width: 38px; height: 38px; border-color: var(--faint); border-style: solid; border-width: 0; z-index: 6; }
.corner-tl { top: 30px; left: 30px; border-top-width: 1px; border-left-width: 1px; }
.corner-tr { top: 30px; right: 30px; border-top-width: 1px; border-right-width: 1px; }
.corner-bl { bottom: 30px; left: 30px; border-bottom-width: 1px; border-left-width: 1px; }
.corner-br { bottom: 30px; right: 30px; border-bottom-width: 1px; border-right-width: 1px; }

.ed-header { position: absolute; top: 50px; left: 54px; z-index: 5; }
.mark { display: flex; align-items: center; gap: 10px; }
.mark-bracket { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: var(--accent); opacity: 0.7; }
.mark-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 0.2em; padding-left: 0.2em;
  background: linear-gradient(180deg,#fff,#b8b8bc); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.ed-sub { font-size: 10px; letter-spacing: 0.3em; color: var(--dim); margin: 12px 0 0; }

.sections {
  position: absolute; top: 140px; left: 54px; z-index: 5;
  display: flex; flex-direction: column; gap: 2px; width: 180px;
}
.section-tab {
  text-align: left; padding: 14px 18px; background: rgba(8,8,10,0.88);
  border: 1px solid rgba(255,255,255,0.06); border-left: 2px solid transparent; color: var(--dim);
  font-family: 'Archivo', sans-serif; font-size: 11px; letter-spacing: 0.15em; cursor: pointer; transition: all 0.2s;
}
.section-tab:hover { color: var(--fg); background: rgba(8,8,10,0.95); }
.section-tab.active { color: var(--accent); border-left-color: var(--accent); background: rgba(20,17,10,0.92); }

.ed-options {
  position: absolute; top: 50%; right: 54px; transform: translateY(-50%); z-index: 5;
  width: 300px; max-height: 66vh;
  background: rgba(8,8,10,0.82); border: 1px solid rgba(255,255,255,0.07); border-top: 2px solid var(--accent);
  padding: 24px;
}
.opt-body.scroll { max-height: 54vh; overflow-y: auto; padding-right: 8px; }
.opt-body.scroll::-webkit-scrollbar { width: 3px; }
.opt-body.scroll::-webkit-scrollbar-thumb { background: var(--faint); }
.opt-title { font-size: 10px; letter-spacing: 0.25em; color: var(--dim); margin: 0 0 22px; }
.opt-label { font-size: 9px; letter-spacing: 0.22em; color: var(--dim); margin: 22px 0 12px; }

.stepper { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.step-btn {
  width: 40px; height: 40px; background: rgba(255,255,255,0.04); border: 1px solid var(--faint);
  color: var(--fg); font-size: 22px; cursor: pointer; transition: all 0.2s; line-height: 1;
}
.step-btn:hover { border-color: var(--accent); color: var(--accent); }
.step-val { flex: 1; text-align: center; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.1em; }

.palette { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; }
.swatch {
  width: 100%; aspect-ratio: 1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.15s; padding: 0;
}
.swatch:hover { transform: scale(1.12); }
.swatch.on { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 0 8px rgba(200,162,76,0.5); }

.slider-row { margin-bottom: 18px; }
.slider-row label { display: flex; justify-content: space-between; font-size: 11px; color: var(--dim); margin-bottom: 7px; }
.slider-row label b { color: var(--accent); font-weight: 500; }
input[type=range] { -webkit-appearance: none; width: 100%; height: 2px; background: var(--faint); outline: none; cursor: pointer; }
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px rgba(200,162,76,0.5);
}

.zone-bar { position: absolute; bottom: 124px; left: 50%; transform: translateX(-50%); z-index: 5; display: flex; gap: 12px; }
.zone-btn {
  width: 72px; height: 72px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  background: rgba(8,8,10,0.7); border: 1px solid var(--faint); color: var(--dim); cursor: pointer; transition: all 0.2s;
}
.zone-btn span { font-size: 9px; letter-spacing: 0.15em; }
.zone-btn:hover { color: var(--fg); border-color: rgba(255,255,255,0.3); }
.zone-btn.active { color: var(--accent); border-color: var(--accent); background: rgba(200,162,76,0.08); }

.rotate-hint {
  position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%); z-index: 5;
  display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 0.12em; color: var(--dim); text-transform: uppercase;
}

.ed-actions { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); z-index: 5; display: flex; gap: 14px; }
.btn {
  height: 46px; padding: 0 36px; border: none; cursor: pointer;
  font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.14em; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.btn-ghost { background: rgba(255,255,255,0.05); color: var(--fg); border: 1px solid var(--faint); }
.btn-ghost:hover { background: rgba(255,255,255,0.1); }
.btn-save { background: linear-gradient(180deg,#d8b25c,#c8a24c); color: #0a0a0c; box-shadow: 0 8px 24px rgba(200,162,76,0.2); }
.btn-save:hover:not(:disabled) { filter: brightness(1.08); }
.btn-save:disabled { opacity: 0.7; cursor: default; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(10,10,12,0.25); border-top-color: #0a0a0c; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
