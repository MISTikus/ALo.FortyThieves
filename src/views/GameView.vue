<script setup lang="ts">
import GameField from '@/components/game/GameField.vue'
import type { IBus } from '@/services/bus';
import createGame from '@/services/game'
import type { IStorage } from '@/services/storage';
import { inject, onBeforeUnmount } from 'vue';

const bus = inject<IBus>('bus')
const storage = inject<IStorage>('storage')
if (!bus) throw Error('Bus is not provided')
if (!storage) throw Error('Storage is not provided')

bus.gameStarted()
const data = storage.read()
if (!data) throw Error('No storage data available')
const game = createGame(bus, data)

const total = (data.stats?.total || 0) + 1
data.stats = { total: total, win: data.stats?.win || 0 }
storage.write(data)

onBeforeUnmount(() => {
  game.onStop()
  //storage.write(game.state)
})
</script>

<template>
  <main>
    <GameField :game="game" />
  </main>
</template>
