<script setup lang="ts">
import { inject, onMounted, reactive, ref } from 'vue';
import ResultsSlot from '@/components/game/ResultsSlot.vue'
import type ICard from '@/models/Card';
import { SlotType } from '@/models/Slot';
import type { IBus, IMoveMessage } from '@/services/bus';

const props = defineProps<{
    cards: ICard[][]
}>()
const data = reactive({
    instance: ref(0)
})

const bus = inject<IBus>('bus')
if (!bus) throw Error('Bus service is not provided')

onMounted(() => {
    bus.moves().subscribe(onCardMove)
})

function onCardMove(msg: IMoveMessage) {
    if (msg.from.type === SlotType.Result || msg.to.type === SlotType.Result) {
        data.instance++
    }
}
</script>

<template>
    <div class="columns" :key="'results' + data.instance">
        <ResultsSlot v-for="index in 8" :key="index" :index="index - 1" :cards="props.cards[index - 1]" />
    </div>
</template>

<style scoped>
.columns {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: calc(var(--default-gap) / 4);
}
</style>