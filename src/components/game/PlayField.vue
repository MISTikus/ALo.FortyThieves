<script setup lang="ts">
import CardColumn from '@/components/game/CardColumn.vue'
import type ICard from '@/models/Card';
import { SlotType } from '@/models/Slot'
import type { IBus, IMoveMessage } from '@/services/bus';
import { inject, onMounted, reactive, ref } from 'vue';

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
        // data.instance++
    }
}
</script>

<template>
    <div class="columns" :key="data.instance">
        <CardColumn v-for="index in 10" :key="index" :index="index - 1" :type="SlotType.PlayField"
            :cards="props.cards[index - 1]" />
    </div>
</template>

<style scoped>
.columns {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
}
</style>