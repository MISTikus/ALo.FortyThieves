import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import createBus from '@/services/bus'
import createGame from '@/services/game'
import createSettings from '@/services/settings'

const app = createApp(App)
const settings = createSettings()
const bus = createBus()
const game = createGame(bus, settings)

app.use(router)
app.provide('bus', bus)
app.provide('game', game)
app.provide('settings', settings)
app.mount('#app')
