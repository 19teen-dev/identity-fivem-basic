<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Login from './components/Login.vue'
import CharSelect from './components/CharSelect.vue'
import Editor from './components/Editor.vue'
import Loader from './components/Loader.vue'

const hud = useHud()

const activeInterface = ref('none')
const playing = ref(false)
const loaderVisible = ref(false)
const loginRef = ref(null)
const editorRef = ref(null)
const characters = ref([])
const appearance = ref({})
const playerData = ref({
  name: 'UNKNOWN', id: '0', cash: '0', bank: '0', job: 'UNEMPLOYED'
})

const post = (name, payload = {}) => {
  const resource = window.GetParentResourceName ? window.GetParentResourceName() : 'identity-ui'
  fetch(`https://${resource}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload)
  }).catch(() => {})
}

const handleMessage = (event) => {
  const data = event.data
  if (!data) return

  if (data.type === 'hud') { hud.apply(data.data); return }
  if (data.type === 'hud:layout') { hud.setLayout(data.data); return }
  if (data.type === 'loader') { loaderVisible.value = !!data.show; return }
  if (data.type === 'playing') { playing.value = !!data.value; return }

  if (!data.action) return
  if (data.action === 'openPauseMenu') {
    if (data.playerData) playerData.value = data.playerData
    activeInterface.value = 'pauseMenu'
  }
  if (data.action === 'closeMenu') activeInterface.value = 'none'
  if (data.action === 'showLogin') { playing.value = false; activeInterface.value = 'login' }
  if (data.action === 'loginError') { if (loginRef.value) loginRef.value.showError(data.message) }
  if (data.action === 'loginSuccess') activeInterface.value = 'none'
  if (data.action === 'showCharSelect') {
    playing.value = false
    characters.value = data.characters || []
    activeInterface.value = 'charSelect'
  }
  if (data.action === 'hideCharSelect') activeInterface.value = 'none'
  if (data.action === 'showEditor') {
    playing.value = false
    appearance.value = data.appearance || {}
    activeInterface.value = 'editor'
  }
  if (data.action === 'hideEditor') activeInterface.value = 'none'
  if (data.action === 'editorSaveFailed') {
    if (editorRef.value) editorRef.value.onSaveFailed()
  }
}

const onLoginSubmit = (creds) => post('loginSubmit', creds)
const onCharPreview = (char) => post('charPreview', { id: char.id })
const onCharPlay = (charId) => post('charPlay', { id: charId })
const onCharBack = () => post('charBack', {})
const onDisconnect = () => post('disconnect', {})
const onLogout = () => post('logout', {})
const onEditorSetHeadBlend = (key, value) => post('editorSetHeadBlend', { key, value })
const onEditorSetFace = (key, value) => post('editorSetFace', { key, value })
const onEditorSetHair = (key, value) => post('editorSetHair', { key, value })
const onEditorSetOverlay = (name, key, value) => post('editorSetOverlay', { name, key, value })
const onEditorSetEyeColor = (value) => post('editorSetEyeColor', { value })
const onEditorSetZone = (zone) => post('editorSetZone', { zone })
const onEditorRotate = (delta) => post('editorRotate', { delta })
const onEditorSave = () => post('editorSave', {})
const onEditorBack = () => post('editorBack', {})

onMounted(() => window.addEventListener('message', handleMessage))
onUnmounted(() => window.removeEventListener('message', handleMessage))

const closeCurrentInterface = () => { activeInterface.value = 'none' }
</script>

<template>
  <main id="identity-os">
    <Hud v-if="playing && activeInterface === 'none' && !loaderVisible" />

    <PauseMenu
      v-if="activeInterface === 'pauseMenu'"
      :playerData="playerData"
      @close="closeCurrentInterface"
    />
    <Login
      v-if="activeInterface === 'login'"
      ref="loginRef"
      @submit="onLoginSubmit"
      @disconnect="onDisconnect"
    />
    <CharSelect
      v-if="activeInterface === 'charSelect'"
      :characters="characters"
      @preview="onCharPreview"
      @play="onCharPlay"
      @back="onCharBack"
      @logout="onLogout"
    />
    <Editor
      v-if="activeInterface === 'editor'"
      ref="editorRef"
      :appearance="appearance"
      @setHeadBlend="onEditorSetHeadBlend"
      @setFace="onEditorSetFace"
      @setHair="onEditorSetHair"
      @setOverlay="onEditorSetOverlay"
      @setEyeColor="onEditorSetEyeColor"
      @setZone="onEditorSetZone"
      @rotate="onEditorRotate"
      @save="onEditorSave"
      @back="onEditorBack"
    />

    <Loader :visible="loaderVisible" />
  </main>
</template>
