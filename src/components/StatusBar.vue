<script setup lang="ts">
import { defineProps, onMounted, reactive, inject } from 'vue';
import type { IBus } from '@/services/bus';
import RoutesBar from '@/components/RoutesBar.vue';

const bus = inject<IBus>('bus')
if (!bus) throw Error('Bus is not provided')

const props = defineProps<{ timerEnabled: boolean }>()

let data = reactive({ time: 0, cardsLeft: 0 });

onMounted(() => {
    bus.deckStatus().subscribe(msg => {
        data.cardsLeft = msg.cardsLeft
    });
    bus.onGameStarted().subscribe(() => {
        data.time = 0;
        data.cardsLeft = 0;
        if (props.timerEnabled && data.time === 0) {
            addTimer()
        }
    });

    if (props.timerEnabled) {
        addTimer()
    }
})

function addTimer() {
    if (!props.timerEnabled) {
        data.time = 0;
        data.cardsLeft = 0;
        return
    }
    data.time++;
    bus?.gameTimeChanged(data.time);
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
    <RoutesBar />
    <div class="card-width tac">Time: {{ toTime(data.time) }}</div>
    <div class="card-width tac">Left: {{ data.cardsLeft }}</div>
</template>

<style scoped>
.card-width {
    max-width: var(--card-width);
    width: var(--card-width);
}

.tac {
    text-align: center;
}
</style>