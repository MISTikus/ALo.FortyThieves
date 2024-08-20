<script setup lang="ts">
import { inject, onMounted, reactive, ref } from 'vue'
import PlayField from '@/components/game/PlayField.vue'
import ResultsContainer from '@/components/game/ResultsContainer.vue'
import DeckContainer from '@/components/game/DeckContainer.vue'
import type { IGame } from '@/services/game'
import type { IBus, IFinishMessage } from '@/services/bus'

const game = inject<IGame>('game')
const bus = inject<IBus>('bus')
if (!game) throw Error('Game service is not provided')
if (!bus) throw Error('Bus service is not provided')

onMounted(() => {
    game.onLoaded()
    bus.finished().subscribe(onFinish)

    document.body.oncontextmenu = e => {
        if (e.button !== 2) return;
        e.preventDefault()
        game.undo()
    }
})

const data = reactive({
    time: ref('00:00'),
    moves: ref(0),
    showModal: ref(false)
})

function onFinish(msg: IFinishMessage) {
    data.time = toTime(msg.time)
    data.moves = msg.moves
    data.showModal = true
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
                <p>Time: {{ data.time }}</p>
                <p>Moves: {{ data.moves }}</p>
            </div>
        </div>
        <div class="deck-row">
            <ResultsContainer :cards="game!.results" />
            <DeckContainer :opened="game!.opened" :closed="game!.closed" />
        </div>
        <PlayField :cards="game!.columns" />
        <!-- <div class="card-holder">
            <CardItem v-for="card in game.deck" :key="card.title" />
        </div> -->
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
    padding: var(--default-padding);
}

.deck-row {
    width: 100%;
    display: grid;
    grid-template-columns: 4fr 1fr;
    justify-content: space-around;
    gap: var(--default-gap);
    padding: var(--default-padding);
    background-color: var(--vt-c-black-mute);
}

.finish-modal {
    position: absolute;
    width: 24rem;
    height: 12rem;
    top: calc(50% - 12rem/2);
    left: calc(50% - 24rem/2);
    background-color: gray;
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
</style>