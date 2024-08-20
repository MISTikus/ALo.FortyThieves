<script setup lang="ts">
import { computed, inject, ref, onMounted, reactive } from 'vue'
import type { IBus } from '@/services/bus'
import { CardSuit, CardValue } from '@/models/Card'
import { SlotType, type ISlot } from '@/models/Slot'
import type ICard from '@/models/Card';

const bus = inject<IBus>('bus')
if (!bus) throw Error('Bus service is not provided')

const props = defineProps<{
    card: ICard
    index: number
    style?: string,
    cardSlot: ISlot,
    topAdd: number,
    leftAdd: number
}>()
const emit = defineEmits<{
    (e: 'card-clicked', card: ICard): void
}>()
const id = ref<HTMLDivElement>()
const cardId = `card-${props.card.title}`

const classes = computed(() => {
    var result = "card card-suit"
    result += " card-suit-" + CardSuit[props.card.suit].toLowerCase();;
    result += " card-value-" + CardValue[props.card.value].toLowerCase();
    return result
})
const cardStyle = ref('')

const style = computed(() => (props.style || "") + cardStyle.value)

onMounted(() => {
    const parent = id.value?.parentElement
    const parentPosition = parent?.getBoundingClientRect()
    cardStyle.value = `top: ${parentPosition!.top + props.topAdd}px; left: ${parentPosition!.left + props.leftAdd}px;`
})

function hover() {
    if (props.cardSlot.type === SlotType.DeckClosed) return
    if (props.cardSlot.type === SlotType.Result) return
    bus!.cardHovered(props.card, props.cardSlot)
}
function leave() {
    bus!.cardDescended(true)
}

function onCardClicked() {
    emit('card-clicked', props.card)
}
</script>

<template>
    <div @click="onCardClicked" ref="id">
        <div v-if="props.card.isClosed" class="card back back-dark-modern" @mouseover="hover()" @mouseleave="leave()"
            :style="props.style"></div>
        <div :id="cardId" v-if="!props.card.isClosed" :class="classes" :style="style" @mouseover="hover()"
            @mouseleave="leave()">
        </div>
    </div>
</template>

<style scoped>
.card {
    position: absolute;
    border: 2px solid gray;
    border-radius: 8px;
}

.card-suit {
    background-repeat: no-repeat;
    background-size: 1760px 200px;
    background-position-y: -10px;
}

.card-suit-hearts {
    background-image: url('../../assets/svg/dark/hearts.svg');
}

.card-suit-diamonds {
    background-image: url('../../assets/svg/dark/diamonds.svg');
}

.card-suit-clubs {
    background-image: url('../../assets/svg/dark/clubs.svg');
}

.card-suit-spades {
    background-image: url('../../assets/svg/dark/spades.svg');
}

.card-value-ace {
    background-position-x: -1px;
}

.card-value-two {
    background-position-x: -137px;
}

.card-value-three {
    background-position-x: -273px;
}

.card-value-four {
    background-position-x: -409px;
}

.card-value-five {
    background-position-x: -545px;
}

.card-value-six {
    background-position-x: -681px;
}

.card-value-seven {
    background-position-x: -817px;
}

.card-value-eight {
    background-position-x: -953px;
}

.card-value-nine {
    background-position-x: -1089px;
}

.card-value-ten {
    background-position-x: -1225px;
}

.card-value-jack {
    background-position-x: -1361px;
}

.card-value-queen {
    background-position-x: -1497px;
}

.card-value-king {
    background-position-x: -1633px;
}

.back {
    background-image: url('../../assets/svg/card-back.svg');
    background-size: 611px 432px;
    background-repeat: no-repeat;
}

.back-light-diamonds {
    background-position: -104px -28px
}

.back-light-dotted {
    background-position: -383px -28px;
}

.back-dark-modern {
    background-position: -243px -28px;
}

.back-dark-complecated {
    background-position: -244px -231px;
}
</style>