<script setup lang="ts">
import { inject, provide, defineProps, onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import { SlotType } from '@/models/Slot';
import CardItem from '@/components/game/CardItem.vue'
import CardSlot from '@/components/game/CardSlot.vue'
import type { IBus, ICardHoverMessage, IFinishMessage, IMoveMessage } from '@/services/bus'
import type { IGame } from '@/services/game'
import type ICard from '@/models/Card';
import type { IStorage } from '@/services/storage';
import { Subscription } from 'rxjs';

const props = defineProps<{
    game: IGame
}>()

const bus = inject<IBus>('bus')
const storage = inject<IStorage>('storage')

if (!props.game) throw Error('Game service is not provided')
if (!bus) throw Error('Bus service is not provided')
if (!storage) throw Error('Bus service is not provided')

const best = storage.read()?.record

provide('bus', bus)
provide('game', props.game)

const closed = ref<HTMLDivElement>()
const opened = ref<HTMLDivElement>()
const startedClass = ref('')
const resultStyles = ref<string[]>([])
const columnStyles = ref<string[]>([])
const closedStyle = ref('')
const openedStyle = ref('')
const subscriptions: Subscription[] = []

onMounted(() => {
    subscriptions.push(bus.finished().subscribe(onFinish))
    subscriptions.push(bus.moves().subscribe(onCardMove))
    subscriptions.push(bus.onHover().subscribe(onHover))
    subscriptions.push(bus.onDescent().subscribe(onDescent))

    setTimeout(() => {
        props.game.deck.forEach((card) => {
            onCardMove({ card, from: { type: SlotType.DeckClosed }, to: { type: SlotType.DeckClosed } })
        })
        startedClass.value = "started"
        props.game.onLoaded()
    }, 1000);

    document.body.oncontextmenu = e => {
        if (e.button !== 2) return;
        e.preventDefault()
        props.game.undo()
    }
})

onBeforeUnmount(() => {
    for (const s of subscriptions) {
        s.unsubscribe()
    }
})

const data = reactive({
    time: ref('00:00'),
    moves: ref(0),
    showModal: ref(false)
})

function onCardMove(msg: IMoveMessage): void {
    const cardItem = document.getElementById(`card-${msg.card.title}`)
    if (!cardItem) throw Error(`card not found: ${msg.card.title}`)
    const toSlot = document.getElementById(`slot-${SlotType[msg.to.type]}-${(msg.to.index ?? -1) + 1}`)
    const toRect = toSlot?.getBoundingClientRect()
    let top = (toRect?.top || 0) - 40;

    if (msg.to.type === SlotType.PlayField) {
        const toAdd = msg.card.index ?? 0 > 0 ? (msg.card.index ?? 0) * 30 : 0
        top += toAdd
    }

    cardItem.style.zIndex = msg.card.index!.toString()
    cardItem.style.top = `${top}px`
    cardItem.style.left = `${toRect?.left || 0}px`
}

function onHover(msg: ICardHoverMessage): void {
    if (msg.card) return
    resultStyles.value = Array(8).map(() => "")
    columnStyles.value = Array(10).map(() => "")
    if (msg.from.type === SlotType.DeckClosed) {
        return
    }
    props.game?.freeSlots.forEach(slot => {
        if (slot.type === SlotType.Result)
            resultStyles.value[slot.index!] = `border:2px solid ${msg.color}`
        else if (slot.type === SlotType.PlayField)
            columnStyles.value[slot.index!] = `border:2px solid ${msg.color}`
    });
}

function onDescent(): void {
    resultStyles.value = Array(8).map(() => "")
    columnStyles.value = Array(8).map(() => "")
    openedStyle.value = ''
    closedStyle.value = ''
}

function onCardClicked(card: ICard) {
    props.game?.onCardClicked(card)
}

function onFinish(msg: IFinishMessage): void {
    data.time = toTime(msg.time)
    data.moves = msg.moves
    data.showModal = true

    if (!best || (msg.time < best.time || msg.moves < best.moves)) {
        const storageData = storage!.read()
        if (!storageData) throw Error('No storage data available')
        storageData.record = { time: msg.time, moves: msg.moves }
        storage?.write(storageData)
    }
}

function toTime(time: number): string {
    const mins = Math.floor(time / 60)
    const secs = time % 60
    return '' + (mins > 9 ? mins : '0' + mins) + ":" + (secs > 9 ? secs : '0' + secs)
}
</script>

<template>
    <div class="game">
        <div class="finish-modal" v-if="data.showModal">
            <div class="panel">
                <p>You win!</p>
                <p>Congratulations!</p>
                <p><span>Time: {{ data.time }}</span> <span v-if="best">Best: {{ toTime(best.time) }}</span></p>
                <p><span>Moves: {{ data.moves }}</span> <span v-if="best">Best: {{ best.moves }}</span></p>
            </div>
        </div>
        <div class="deck-row">
            <div class="results">
                <CardSlot :id="`slot-${SlotType[SlotType.Result]}-${index}`" v-for="index in 8" :key="index"
                    :style="resultStyles[index - 1]" :type="SlotType.Result" :index="index" />
            </div>
            <div class="deck">
                <CardSlot ref="closed" :id="`slot-${SlotType[SlotType.DeckClosed]}-0`" :type="SlotType.DeckClosed"
                    :style="closedStyle" />
                <CardSlot ref="opened" :id="`slot-${SlotType[SlotType.DeckOpened]}-0`" :type="SlotType.DeckOpened"
                    :style="openedStyle" />
            </div>
        </div>
        <div class="columns">
            <div v-for="index in 10" :key="index">
                <CardSlot :id="`slot-${SlotType[SlotType.PlayField]}-${index}`" :type="SlotType.PlayField"
                    :style="columnStyles[index - 1]" :index="index" />
            </div>
        </div>

        <div :class="`card-holder ${startedClass}`">
            <CardItem v-for="entry in props.game!.deck.entries()" :key="entry[1].title" :card="entry[1]"
                @card-clicked="onCardClicked" />
        </div>
    </div>
</template>

<style scoped>
.game {
    position: relative;
    display: flex;
    width: 100%;
    height: calc(100vh - 40px);
    flex-direction: column;
    justify-content: start;
    gap: var(--default-gap);
}

.deck-row {
    width: 100%;
    display: grid;
    grid-template-columns: 4fr 1fr;
    justify-content: space-around;
    gap: var(--default-gap);
    padding: var(--default-padding);
    background-color: var(--color-background-mute);
}

.results {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: calc(var(--default-gap) / 4);
}

.deck {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: calc(var(--default-gap) / 4);
}

.columns {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    align-self: center;
    justify-content: space-around;
    justify-items: center;
    /* gap: 21px; */
    width: 100%;
    padding: var(--default-padding);
}

.finish-modal {
    position: absolute;
    width: 24rem;
    height: 12rem;
    top: calc(50% - 12rem/2);
    left: calc(50% - 24rem/2);
    background-color: var(--color-background-mute);
    border: 2px solid black;
    border-radius: 8px;
    z-index: 100;
    align-content: center;
    align-items: center;
}

.panel {
    margin: 0 auto;
    width: fit-content;
}

.card-holder {
    visibility: hidden;
}

.card-holder.started {
    visibility: inherit;
}
</style>