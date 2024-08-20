<script setup lang="ts">
import { inject, ref, reactive, onMounted, computed } from 'vue'
import CardSlot from '@/components/game/CardSlot.vue'
import CardItem from '@/components/game/CardItem.vue'
import { SlotType } from '@/models/Slot'
import { CardValue } from '@/models/Card'
import type ICard from '@/models/Card'
import type { IGame } from '@/services/game'
import type { IBus, ICardHoveredMessage, IMoveMessage } from '@/services/bus'

const game = inject<IGame>('game')
const bus = inject<IBus>('bus')
if (!game) throw Error('Game service is not provided')
if (!bus) throw Error('Bus service is not provided')

const props = defineProps<{
    index: number
    cards: ICard[]
}>()
const data = reactive({
    topCardStyle: ref(""),
    instance: ref(0)
})
const id = ref<HTMLDivElement>()
const slotId = `slot-${SlotType.Result}-${props.index}`

const type = SlotType.Result
const index = props.index
const cardSlot = { type, index }

const update = () => data.instance++;

const cardStyle = ref('')

onMounted(() => {
    bus.onCardHover().subscribe(onCardHovered)
    bus.onCardDescended().subscribe(onCardLeave)
    bus.moves().subscribe(onCardMove)

    const parent = id.value?.parentElement
    const parentPosition = parent?.getBoundingClientRect()
    cardStyle.value = `top: ${parentPosition!.top}px; left: ${parentPosition!.left}px;`
})

function getCardStyle(index: number) {
    return index == props.cards.length - 1 ? data.topCardStyle : ""
}

function onCardClicked(card: ICard): void {
    game!.onCardClicked(card, cardSlot)
}

function onCardHovered(msg: ICardHoveredMessage): void {
    if (props.cards.length === 0 && msg.card.value === CardValue.Ace) {
        data.topCardStyle = "border:2px solid green;"
        return
    }
    const topCard = props.cards[props.cards.length - 1]
    if (!topCard) return

    if (topCard.suit === msg.card.suit
        && ((topCard.value === CardValue.Ace && msg.card.value === CardValue.Two) || topCard.value - msg.card.value === -1)) {
        data.topCardStyle = "border:2px solid green;"
        return
    }
}

function onCardLeave(): void {
    data.topCardStyle = ""
}

function onCardMove(msg: IMoveMessage): void {
    if ((msg.from.type === type)
        || (msg.to.type === type)) {
        update();
    }
}
</script>

<template>
    <div ref="id" :id="slotId">
        <CardSlot v-if="props.cards.length === 0" :key="data.instance" :style="data.topCardStyle" />
        <div v-if="props.cards.length > 0" :key="data.instance" class="column">
            <CardItem v-for="card in props.cards" :key="card.title" :card="card" :index="0"
                :style="cardStyle + getCardStyle(index)" :top-add="0" :left-add="0" :cardSlot="cardSlot"
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