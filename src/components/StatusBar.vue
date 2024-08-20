<script setup lang="ts">
import { onMounted, reactive, inject } from 'vue';
import type { IBus } from '@/services/bus';
import type { IGame } from '@/services/game';

const game = inject<IGame>('game')
const bus = inject<IBus>('bus')
if (!game) throw Error('Game service is not provided')
if (!bus) throw Error('Bus service is not provided')

let data = reactive({ time: 0, cardsLeft: 0 });

onMounted(() => {
    bus.deckStatus().subscribe(msg => {
        data.cardsLeft = msg.cardsLeft
    });

    addTimer()
})

function addTimer() {
    data.time++;
    game!.time++;
    setTimeout(() => {
        addTimer()
    }, 1000);
}

function toTime(time: number): string {
    const mins = Math.floor(time / 60)
    const secs = time % 60
    return '' + (mins > 9 ? mins : '0' + mins) + ":" + (secs > 9 ? secs : '0' + secs)
}
</script>

<template>
    <div>Time: {{ toTime(data.time) }}</div>
    <div>Left: {{ data.cardsLeft }}</div>
</template>