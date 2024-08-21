<script setup lang="ts">
import { computed, inject, ref, onMounted, reactive } from 'vue'
import { Descended, type IBus, type ICardChangedMessage, type ICardHoverMessage, type IMoveMessage } from '@/services/bus'
import { CardSuit, CardValue } from '@/models/Card'
import { SlotType, type ISlot } from '@/models/Slot'
import type ICard from '@/models/Card';
import type { IGame } from '@/services/game';

const game = inject<IGame>('game')
const bus = inject<IBus>('bus')
if (!game) throw Error('Game service is not provided')
if (!bus) throw Error('Bus service is not provided')

const props = defineProps<{
    card: ICard
    style?: string,
}>()
const data = reactive({
    card: ref(props.card),
    id: ref(0),
})

const emit = defineEmits<{
    (e: 'card-clicked', card: ICard): void
}>()
const id = ref<HTMLDivElement>()

const classes = computed(() => {
    var result = "card card-suit"
    result += " card-suit-" + CardSuit[props.card.suit].toLowerCase()
    result += " card-value-" + CardValue[props.card.value].toLowerCase()
    result += isActive.value ? " card-active" : ""
    return result
})
const cardStyle = ref('')

const style = computed(() => (props.style || "") + cardStyle.value)
const isActive = computed(() => data.card.canInteract)

onMounted(() => {
    bus.moves().subscribe(onMove)
    bus.onCardChanged().subscribe(onCardChanged)
    bus.onHover().subscribe(onHover)
    bus.onDescent().subscribe(onDescent)
})

function onMove(msg: IMoveMessage): void {
    if (msg.card.title !== props.card.title) return
    data.card = msg.card
    data.id++
}

function onCardChanged(msg: ICardChangedMessage): void {
    if (msg.card.title !== props.card.title) return
    data.card = msg.card
    data.id++
}

function onHover(msg: ICardHoverMessage) {
    if (msg.card === null || msg.card.title !== props.card.title) return
    cardStyle.value = `border:2px solid ${msg.color}`
}

function onDescent() {
    cardStyle.value = ''
}

function hovered() {
    bus!.cardHovered(data.card, data.card.slot)
}
function leaved() {
    bus!.cardDescended(Descended)
}

function onCardClicked() {
    emit('card-clicked', data.card)
}
</script>

<template>
    <div @click="onCardClicked" ref="id" :id="`card-${data.card.title}`" :debug="data.card.debugData" :updater="data.id"
        class="card">
        <div v-if="data.card.isClosed" class="card back back-dark-modern" @mouseover="hovered()" @mouseleave="leaved()"
            :style="props.style"></div>
        <div v-if="data.card.isClosed === false" :class="classes" :style="style" @mouseover="hovered()"
            @mouseleave="leaved()">
        </div>
    </div>
</template>

<style scoped>
.card {
    position: absolute;
    width: var(--card-width);
    height: var(--card-height);
    border-radius: 8px;
    transition:
        top 0.2s ease,
        left 0.2s ease;
}

.card-active:hover {
    border: 2px solid purple !important;
    border-radius: 8px;
}

.card .card-suit {
    background-repeat: no-repeat;
    background-size: 1760px 200px;
    background-position-y: -10px;
    border: 2px solid gray;
}

.card .card-suit-hearts {
    background-image: url('../../assets/svg/dark/hearts.svg');
}

.card .card-suit-diamonds {
    background-image: url('../../assets/svg/dark/diamonds.svg');
}

.card .card-suit-clubs {
    background-image: url('../../assets/svg/dark/clubs.svg');
}

.card .card-suit-spades {
    background-image: url('../../assets/svg/dark/spades.svg');
}

.card .card-value-ace {
    background-position-x: -1px;
}

.card .card-value-two {
    background-position-x: -137px;
}

.card .card-value-three {
    background-position-x: -273px;
}

.card .card-value-four {
    background-position-x: -409px;
}

.card .card-value-five {
    background-position-x: -545px;
}

.card .card-value-six {
    background-position-x: -681px;
}

.card .card-value-seven {
    background-position-x: -817px;
}

.card .card-value-eight {
    background-position-x: -953px;
}

.card .card-value-nine {
    background-position-x: -1089px;
}

.card .card-value-ten {
    background-position-x: -1225px;
}

.card .card-value-jack {
    background-position-x: -1361px;
}

.card .card-value-queen {
    background-position-x: -1497px;
}

.card .card-value-king {
    background-position-x: -1633px;
}

.card .back {
    background-image: url('../../assets/svg/card-back.svg');
    background-size: 584px 428px;
    background-repeat: no-repeat;
}

.back-light-diamonds {
    background-position: -104px -28px
}

.back-light-dotted {
    background-position: -383px -28px;
}

.back-dark-modern {
    background-position: -227px -29px;
}

.back-dark-complecated {
    background-position: -244px -231px;
}
</style>