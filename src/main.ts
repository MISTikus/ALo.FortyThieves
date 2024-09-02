import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import createBus from '@/services/bus'
import createStorage from '@/services/storage'
import createSettings from '@/services/settings'

const app = createApp(App)
const bus = createBus()
const storage = createStorage()
const storageData = storage.read()
if (!storageData) {
  storage.write({
    settings: createSettings(),
    record: null,
    savedGame: null
  })
}

app.use(router)
app.provide('bus', bus)
app.provide('storage', storage)
app.mount('#app')
