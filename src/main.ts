import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import createBus from '@/services/bus'
import createGame from '@/services/game'

const app = createApp(App)
const bus = createBus()
const game = createGame(bus)

app.use(router)
app.provide('bus', bus)
app.provide('game', game)
app.mount('#app')
