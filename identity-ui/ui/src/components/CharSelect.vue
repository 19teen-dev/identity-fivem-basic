<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  characters: { type: Array, default: () => [] }
})

const emit = defineEmits(['preview', 'play', 'back', 'logout'])

const SLOTS = 3
const selected = ref(null)
const confirming = ref(false)

const slots = computed(() => {
  const arr = []
  for (let i = 0; i < SLOTS; i++) {
    arr.push(props.characters[i] || null)
  }
  return arr
})

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d)) return '—'
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const statusLabel = (s) => {
  if (s === 0) return 'НА РАССМОТРЕНИИ'
  if (s === 1) return 'ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ'
  if (s === 2) return 'АКТИВЕН'
  if (s === 3) return 'ЗАБЛОКИРОВАН'
  return ''
}

const pickSlot = (char) => {
  if (!char) return
  selected.value = char
  confirming.value = true
  emit('preview', char)
}

const back = () => {
  confirming.value = false
  selected.value = null
  emit('back')
}

const play = () => {
  if (!selected.value) return
  emit('play', selected.value.id)
}
</script>

<template>
  <div class="cs-root">
    <div class="grain"></div>
    <div class="vignette"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <header class="cs-header">
      <div class="mark">
        <span class="mark-bracket">[</span>
        <span class="mark-title">IDENTITY</span>
        <span class="mark-bracket">]</span>
      </div>
      <p class="cs-crumb">
        <span :class="{ dim: confirming }">ВЫБОР ПЕРСОНАЖА</span>
        <template v-if="confirming && selected">
          <span class="crumb-sep">/</span>
          <span class="crumb-active">{{ selected.firstname }} {{ selected.lastname }}</span>
        </template>
      </p>
    </header>

    <button class="logout-btn" @click="emit('logout')">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
      ВЫЙТИ ИЗ АККАУНТА
    </button>

    <transition name="info">
      <aside v-if="confirming && selected" class="cs-info">
        <div class="info-line"><span>ИМЯ</span><b>{{ selected.firstname }} {{ selected.lastname }}</b></div>
        <div class="info-line"><span>ДАТА РОЖДЕНИЯ</span><b>{{ selected.dateofbirth }}</b></div>
        <div class="info-line"><span>НАЦИОНАЛЬНОСТЬ</span><b>{{ selected.nationality }}</b></div>
        <div class="info-line"><span>РОСТ</span><b>{{ selected.height }} см</b></div>
        <div class="info-line"><span>ВЕС</span><b>{{ selected.weight }} кг</b></div>
        <div class="info-divider"></div>
        <div class="info-line"><span>НАЛИЧНЫЕ</span><b>${{ selected.cash }}</b></div>
        <div class="info-line"><span>БАНК</span><b>${{ selected.bank }}</b></div>
      </aside>
    </transition>

    <transition name="cards">
      <div v-if="!confirming" class="cs-cards">
        <div
          v-for="(char, i) in slots"
          :key="i"
          class="card"
          :class="{ empty: !char, filled: !!char }"
          @click="pickSlot(char)"
        >
          <div class="card-index">0{{ i + 1 }}</div>
          <template v-if="char">
            <div class="card-body">
              <h2 class="card-name">{{ char.firstname }}</h2>
              <h3 class="card-surname">{{ char.lastname }}</h3>
            </div>
            <div class="card-hover">
              <div class="card-status" :class="'st-' + char.charstatus">{{ statusLabel(char.charstatus) }}</div>
              <p class="card-last">Последний вход<br><b>{{ fmtDate(char.lastPlayed) }}</b></p>
            </div>
          </template>
          <template v-else>
            <div class="card-empty">
              <span class="empty-mark">+</span>
              <p>СЛОТ ПУСТ</p>
              <small>Создание на сайте проекта</small>
            </div>
          </template>
        </div>
      </div>
    </transition>

    <transition name="actions">
      <div v-if="confirming" class="cs-actions">
        <button class="btn btn-ghost" @click="back">НАЗАД</button>
        <button class="btn btn-play" @click="play">ИГРАТЬ</button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:wght@300;400;500;600&display=swap');

.cs-root {
  --bg: #060607;
  --fg: #f2f2f4;
  --dim: rgba(242, 242, 244, 0.4);
  --faint: rgba(242, 242, 244, 0.12);
  --accent: #c8a24c;

  position: fixed;
  inset: 0;
  font-family: 'Archivo', sans-serif;
  color: var(--fg);
  animation: rootIn 0.6s ease;
  pointer-events: none;
}

.cs-root > * { pointer-events: auto; }
.grain, .vignette, .corner { pointer-events: none; }

@keyframes rootIn { from { opacity: 0; } to { opacity: 1; } }

.grain {
  position: absolute; inset: -50%; width: 200%; height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: 0.03; z-index: 2;
  animation: grainShift 0.6s steps(2) infinite;
}
@keyframes grainShift {
  0% { transform: translate(0,0); } 50% { transform: translate(-3%,2%); } 100% { transform: translate(2%,-2%); }
}

.vignette {
  position: absolute; inset: 0; z-index: 1;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%);
}

.corner {
  position: absolute; width: 38px; height: 38px;
  border-color: var(--faint); border-style: solid; border-width: 0; z-index: 3;
}
.corner-tl { top: 30px; left: 30px; border-top-width: 1px; border-left-width: 1px; }
.corner-tr { top: 30px; right: 30px; border-top-width: 1px; border-right-width: 1px; }
.corner-bl { bottom: 30px; left: 30px; border-bottom-width: 1px; border-left-width: 1px; }
.corner-br { bottom: 30px; right: 30px; border-bottom-width: 1px; border-right-width: 1px; }

.cs-header {
  position: absolute; top: 52px; left: 60px; z-index: 5;
  animation: fadeDown 0.8s cubic-bezier(0.16,1,0.3,1);
}

.logout-btn {
  position: absolute; top: 56px; right: 60px; z-index: 6;
  display: flex; align-items: center; gap: 8px;
  background: none; border: none;
  color: rgba(242,242,244,0.35);
  font-family: 'Archivo', sans-serif; font-size: 10px; letter-spacing: 0.18em;
  cursor: pointer; transition: color 0.25s;
  animation: fadeDown 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both;
}
.logout-btn:hover { color: #e06b5e; }
@keyframes fadeDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }

.mark { display: flex; align-items: center; gap: 10px; }
.mark-bracket { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: var(--accent); opacity: 0.7; }
.mark-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 0.2em; padding-left: 0.2em;
  background: linear-gradient(180deg,#fff,#b8b8bc); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.cs-crumb { margin: 14px 0 0; font-size: 11px; letter-spacing: 0.3em; color: var(--dim); }
.cs-crumb .dim { opacity: 0.5; }
.crumb-sep { margin: 0 10px; color: var(--faint); }
.crumb-active { color: var(--accent); }

.cs-info {
  position: absolute; top: 50%; left: 60px; transform: translateY(-50%); z-index: 5;
  width: 280px; padding: 28px 30px;
  background: rgba(8,8,10,0.7); border: 1px solid rgba(255,255,255,0.06);
  border-left: 2px solid var(--accent);
}
.info-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
.info-line span { font-size: 9px; letter-spacing: 0.2em; color: var(--dim); }
.info-line b { font-size: 14px; font-weight: 500; }
.info-divider { height: 1px; background: var(--faint); margin: 18px 0; }

.cs-cards {
  position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); z-index: 5;
  display: flex; gap: 22px;
}

.card {
  position: relative; width: 220px; height: 150px;
  background: rgba(8,8,10,0.72); border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer; overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s;
}
.card.filled:hover {
  transform: translateY(-26px);
  border-color: var(--accent);
  box-shadow: 0 24px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,162,76,0.3);
}
.card.empty { background: rgba(5,5,6,0.6); cursor: default; border-style: dashed; border-color: rgba(255,255,255,0.07); }

.card-index {
  position: absolute; top: 12px; right: 14px;
  font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--faint); letter-spacing: 0.05em;
}

.card-body { padding: 26px 22px; }
.card-name { font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 0.06em; margin: 0; line-height: 0.95; }
.card-surname { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 0.08em; margin: 2px 0 0; color: var(--dim); font-weight: 400; }

.card-hover {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 16px 22px;
  background: linear-gradient(180deg, transparent, rgba(200,162,76,0.08));
  opacity: 0; transform: translateY(10px); transition: opacity 0.3s, transform 0.3s;
}
.card.filled:hover .card-hover { opacity: 1; transform: translateY(0); }
.card-status { font-size: 8px; letter-spacing: 0.18em; margin-bottom: 6px; color: var(--accent); }
.card-status.st-2 { color: #7bc86c; }
.card-status.st-3 { color: #e06b5e; }
.card-last { font-size: 9px; letter-spacing: 0.12em; color: var(--dim); margin: 0; line-height: 1.5; }
.card-last b { color: var(--fg); font-weight: 500; }

.card-empty {
  height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  color: rgba(255,255,255,0.25);
}
.empty-mark { font-size: 30px; font-weight: 300; line-height: 1; }
.card-empty p { font-size: 11px; letter-spacing: 0.25em; margin: 0; }
.card-empty small { font-size: 9px; letter-spacing: 0.1em; opacity: 0.6; }

.cs-actions {
  position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); z-index: 5;
  display: flex; gap: 16px;
}
.btn {
  height: 50px; padding: 0 44px; border: none; cursor: pointer;
  font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.16em;
  transition: filter 0.2s, transform 0.1s;
}
.btn:active { transform: scale(0.97); }
.btn-ghost { background: rgba(255,255,255,0.05); color: var(--fg); border: 1px solid var(--faint); }
.btn-ghost:hover { background: rgba(255,255,255,0.1); }
.btn-play {
  background: linear-gradient(180deg,#d8b25c,#c8a24c); color: #0a0a0c;
  box-shadow: 0 8px 24px rgba(200,162,76,0.25);
}
.btn-play:hover { filter: brightness(1.08); }

.info-enter-active, .info-leave-active { transition: opacity 0.4s, transform 0.4s; }
.info-enter-from, .info-leave-to { opacity: 0; transform: translateY(-50%) translateX(-20px); }
.cards-enter-active, .cards-leave-active { transition: opacity 0.4s, transform 0.4s; }
.cards-enter-from, .cards-leave-to { opacity: 0; transform: translateX(-50%) translateY(30px); }
.actions-enter-active { transition: opacity 0.5s 0.2s, transform 0.5s 0.2s; }
.actions-enter-from { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
