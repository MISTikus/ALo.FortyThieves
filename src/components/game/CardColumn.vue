<script setup lang="ts">
import { inject, reactive, ref } from 'vue'
import CardSlot from '@/components/game/CardSlot.vue'
import CardItem from '@/components/game/CardItem.vue'
import type { SlotType } from '@/models/Slot'
import type { IGame } from '@/services/game'
import type { IBus, ICardHoveredMessage, IMoveMessage } from '@/services/bus'
import type ICard from '@/models/Card'

const game = inject<IGame>('game')
const bus = inject<IBus>('bus')
if (!game) throw Error('Game service is not provided')
if (!bus) throw Error('Bus service is not provided')

bus.onCardHover().subscribe(onCardHovered)
bus.onCardDescended().subscribe(onCardLeave)
bus.moves().subscribe(onCardMove)

const instance = ref(0)
const update = () => instance.value++;

const props = defineProps<{
    cards: ICard[]
    type: SlotType
    index: number
}>()

const type = props.type
const index = props.index
const cardSlot = { type, index }

const id = ref<HTMLDivElement>()
const slotId = `slot-${props.type}-${props.index}`
const cardRefs = ref<HTMLDivElement[]>([])
const data = reactive({
    topCardStyle: ref(''),
})

function onCardHovered(msg: ICardHoveredMessage): void {
    if (props.cards.length === 0 ||
        (props.cards[props.cards.length - 1].suit === msg.card.suit && props.cards[props.cards.length - 1].value - msg.card.value === 1))
        data.topCardStyle = "border:2px solid green;"
}

function onCardLeave(): void {
    data.topCardStyle = ''
}
function getCardStyle(index: number): string {
    return index == props.cards.length - 1 ? data.topCardStyle : ''
}
function getTopAdd(index: number) { return index * 30 }

function onCardClicked(card: ICard): void {
    game!.onCardClicked(card, cardSlot)
}

function onCardMove(msg: IMoveMessage): void {
    if ((msg.to.type === props.type && msg.to.index == props.index)) {
        // setTimeout(() => update(), 200)
        update()
    }

    if (msg.from.type === props.type && msg.from.index === props.index) {
        const toRect = document.querySelector(`#slot-${msg.to.type}-${msg.to.index}`)?.getBoundingClientRect()
        // const children = id.value?.querySelector('.column')?.lastElementChild
        const last = id.value?.querySelector('.column')?.lastElementChild as HTMLDivElement
        if (last) {
            last.style.top = `${toRect?.top}px`
            last.style.left = `${toRect?.left}px`
            setTimeout(() => update(), 200)
        }
        else
            update();
    }
}
</script>

<template>
    <div ref="id" :id="slotId">
        <CardSlot v-if="props.cards.length === 0" :style="data.topCardStyle" />
        <div v-if="props.cards.length > 0" :key="instance" class="column">
            <CardItem ref="cardRefs" v-for="(card, index) in props.cards" :key="card.title" :card="card" :index="index"
                :left-add="0" :top-add="getTopAdd(index)" :cardSlot="cardSlot" :style="getCardStyle(index)"
                @card-clicked="onCardClicked" />
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