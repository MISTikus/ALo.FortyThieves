<script setup lang="ts">
import { inject, onMounted, reactive, ref } from 'vue';
import { SlotType } from '@/models/Slot'
import DeckSlot from '@/components/game/DeckSlot.vue'
import type ICard from '@/models/Card';
import type { IBus, IMoveMessage } from '@/services/bus';

const props = defineProps<{
    closed: ICard[]
    opened: ICard[]
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
    <div class="deck" :key="'deck' + data.instance">
        <DeckSlot :type="SlotType.DeckClosed" :cards="props.closed" />
        <DeckSlot :type="SlotType.DeckOpened" :cards="props.opened" />
    </div>
</template>

<style scoped>
.deck {
    display: flex;
    flex-direction: row;
    gap: calc(var(--default-gap) / 4);
}
</style>