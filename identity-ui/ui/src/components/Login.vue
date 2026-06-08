<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['submit', 'disconnect'])

const login = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const loginInput = ref(null)

const submit = () => {
  if (loading.value) return
  error.value = ''

  if (!login.value.trim() || !password.value) {
    error.value = 'Введите логин и пароль'
    return
  }

  loading.value = true
  emit('submit', { identifier: login.value.trim(), password: password.value })
}

const showError = (msg) => {
  loading.value = false
  error.value = msg || 'Ошибка входа'
  password.value = ''
}

defineExpose({ showError })

onMounted(() => {
  if (loginInput.value) loginInput.value.focus()
})
</script>

<template>
  <div class="login-root">
    <div class="grain"></div>
    <div class="vignette"></div>

    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="login-card">
      <div class="bg-glow"></div>

      <div class="brand">
        <div class="mark">
          <span class="mark-bracket">[</span>
          <h1 class="mark-title">IDENTITY</h1>
          <span class="mark-bracket">]</span>
        </div>
        <p class="mark-sub">ROLEPLAY&nbsp;&nbsp;PROJECT</p>
      </div>

      <div class="divider"></div>

      <div class="form">
        <div class="field">
          <label>ЛОГИН</label>
          <input
            ref="loginInput"
            v-model="login"
            type="text"
            autocomplete="off"
            spellcheck="false"
            @keyup.enter="submit"
            :disabled="loading"
          />
        </div>

        <div class="field">
          <label>ПАРОЛЬ</label>
          <input
            v-model="password"
            type="password"
            autocomplete="off"
            @keyup.enter="submit"
            :disabled="loading"
          />
        </div>

        <transition name="fade">
          <p v-if="error" class="error">{{ error }}</p>
        </transition>

        <button class="submit" @click="submit" :disabled="loading">
          <span v-if="!loading">ВОЙТИ</span>
          <span v-else class="spinner"></span>
        </button>
      </div>

      <p class="hint">Регистрация временно недоступна</p>
    </div>

    <button class="disconnect-btn" @click="emit('disconnect')">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
      ОТКЛЮЧИТЬСЯ ОТ СЕРВЕРА
    </button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:wght@300;400;500&display=swap');

.login-root {
  --bg: #060607;
  --fg: #f2f2f4;
  --dim: rgba(242, 242, 244, 0.4);
  --faint: rgba(242, 242, 244, 0.12);
  --accent: #c8a24c;

  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 9vw;
  font-family: 'Archivo', sans-serif;
  animation: rootIn 0.8s ease;
}

@keyframes rootIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.grain {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: 0.035;
  pointer-events: none;
  z-index: 2;
  animation: grainShift 0.6s steps(2) infinite;
}

@keyframes grainShift {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-3%, 2%); }
  100% { transform: translate(2%, -2%); }
}

.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
}

.corner {
  position: absolute;
  width: 38px;
  height: 38px;
  border-color: var(--faint);
  border-style: solid;
  border-width: 0;
  z-index: 3;
}
.corner-tl { top: 30px; left: 30px; border-top-width: 1px; border-left-width: 1px; }
.corner-tr { top: 30px; right: 30px; border-top-width: 1px; border-right-width: 1px; }
.corner-bl { bottom: 30px; left: 30px; border-bottom-width: 1px; border-left-width: 1px; }
.corner-br { bottom: 30px; right: 30px; border-bottom-width: 1px; border-right-width: 1px; }

.login-card {
  position: relative;
  z-index: 5;
  width: 400px;
  padding: 52px 48px;
  background: rgba(8, 8, 10, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
  animation: cardIn 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(26px); }
  to { opacity: 1; transform: translateY(0); }
}

.bg-glow {
  position: absolute;
  top: -30%;
  left: 50%;
  width: 460px;
  height: 460px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(200, 162, 76, 0.1) 0%, transparent 65%);
  pointer-events: none;
  animation: glowPulse 6s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.brand {
  position: relative;
  z-index: 2;
}

.mark {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.mark-bracket {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 40px;
  color: var(--accent);
  opacity: 0.7;
  line-height: 1;
}

.mark-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 46px;
  letter-spacing: 0.2em;
  line-height: 1;
  margin: 0;
  padding-left: 0.2em;
  background: linear-gradient(180deg, #fff 0%, #b8b8bc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mark-sub {
  font-size: 10px;
  letter-spacing: 0.5em;
  color: var(--dim);
  margin: 12px 0 0;
  padding-left: 0.5em;
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, var(--accent), transparent);
  margin: 32px 0;
  opacity: 0.5;
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.form {
  position: relative;
  z-index: 2;
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}

.field {
  margin-bottom: 22px;
}

.field label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--dim);
  margin-bottom: 9px;
}

.field input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  padding: 14px 15px;
  color: var(--fg);
  font-family: 'Archivo', sans-serif;
  font-size: 14px;
  letter-spacing: 0.04em;
  outline: none;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
}

.field input:focus {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 1px rgba(200, 162, 76, 0.3);
}

.field input:disabled {
  opacity: 0.5;
}

.error {
  font-size: 12px;
  color: #e06b5e;
  letter-spacing: 0.03em;
  margin: -4px 0 16px;
}

.submit {
  width: 100%;
  height: 48px;
  margin-top: 4px;
  background: linear-gradient(180deg, #d8b25c 0%, #c8a24c 100%);
  border: none;
  border-radius: 2px;
  color: #0a0a0c;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: filter 0.2s, transform 0.1s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(200, 162, 76, 0.2);
}

.submit:hover:not(:disabled) {
  filter: brightness(1.08);
  box-shadow: 0 10px 30px rgba(200, 162, 76, 0.35);
}

.submit:active:not(:disabled) {
  transform: scale(0.985);
}

.submit:disabled {
  cursor: default;
  opacity: 0.75;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(10, 10, 12, 0.25);
  border-top-color: #0a0a0c;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hint {
  position: relative;
  z-index: 2;
  margin: 30px 0 0;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.28);
  text-align: center;
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.disconnect-btn {
  position: absolute;
  bottom: 48px;
  left: 9vw;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'Archivo', sans-serif;
  font-size: 10px;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: color 0.25s;
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}

.disconnect-btn:hover {
  color: #e06b5e;
}
</style>
