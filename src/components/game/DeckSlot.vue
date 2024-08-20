<script setup lang="ts">
import { inject, onMounted, reactive, ref } from 'vue'
import CardSlot from '@/components/game/CardSlot.vue'
import CardItem from '@/components/game/CardItem.vue'
import { SlotType } from '@/models/Slot'
import type { IGame } from '@/services/game';
import type { IBus, ICardHoveredMessage, IMoveMessage } from '@/services/bus';
import type ICard from '@/models/Card';

const game = inject<IGame>('game')
const bus = inject<IBus>('bus')
if (!game) throw Error('Game service is not provided')
if (!bus) throw Error('Bus service is not provided')

const props = defineProps<{
    type: SlotType
    cards: ICard[]
}>()
const total = 64
const type = props.type
const index = 0
const cardSlot = { type, index }
const data = reactive({
    topCardStyle: ref(""),
    instance: ref(0)
})
const id = ref<HTMLDivElement>()
const slotId = `slot-${props.type}-${0}`

const update = () => data.instance++;

onMounted(() => {
    bus.onCardHover().subscribe(onCardHovered)
    bus.onCardDescended().subscribe(onCardLeave)
    bus.moves().subscribe(onCardMove)
})

function getCardStyle(index: number) {
    return index == props.cards.length - 1 ? data.topCardStyle : ""
}

function getTopAdd(index: number) {
    if (index / total < 0.33)
        return -1
    if (index / total < 0.66)
        return -2
    return -3
}

function getLeftAdd(index: number) {
    if (index / total < 0.33)
        return 1
    if (index / total < 0.66)
        return 2
    return 3
}

function onCardClicked(card: ICard): void {
    game!.onCardClicked(card, cardSlot)
}

function onCardHovered(msg: ICardHoveredMessage): void {
    if (msg.from.type === SlotType.DeckClosed && props.type === SlotType.DeckOpened) {
        data.topCardStyle = "border:2px solid green;"
        return
    }
}

function onCardLeave(): void {
    data.topCardStyle = ""
}

function onCardMove(msg: IMoveMessage): void {
    if ((msg.from.type === props.type)
        || (msg.to.type === props.type)) {
        update();
    }
}
</script>

<template>
    <div ref="id" :id="slotId">
        <CardSlot v-if="props.cards.length === 0" :key="data.instance" :style="data.topCardStyle" />
        <div v-if="props.cards.length > 0" :key="data.instance" class="card column">
            <CardItem v-for="(card, index) in props.cards" :key="card.title" :card="card" :index="0"
                :top-add="getTopAdd(index)" :left-add="getLeftAdd(index)" :style="getCardStyle(index)"
                :cardSlot="cardSlot" @card-clicked="onCardClicked" />
        </div>
    </div>
</template>

<style scoped>
.column {
    /* position: relative; */
    display: flex;
    flex-direction: column;
}
</style>