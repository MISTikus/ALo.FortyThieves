import { CardValue, Card } from '@/models/Card'
import type { ISlot } from '@/models/Slot'
import { SlotType } from '@/models/Slot'
import type ICard from '@/models/Card'
import type { IBus, IMoveMessage } from './bus'

const total: number = 13 * 4 * 2
const defaultDeck: CardValue[] = [
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  CardValue.Jack,
  CardValue.Queen,
  CardValue.King,
  CardValue.Ace
]

export class Game implements IGame {
  closed: ICard[] = []
  opened: ICard[] = []
  columns: ICard[][] = []
  results: ICard[][] = []
  history: IMoveMessage[] = []
  time: number = 0
  moves: number = 0

  constructor(private bus: IBus) {
    for (let i = 0; i < 10; i++) this.columns.push([])
    for (let i = 0; i < 8; i++) this.results.push([])

    for (let i = 0; i < total; i++) {
      const value = defaultDeck[i % 13]
      const suit = Math.floor(i / 13) % 4
      const card: ICard = new Card(value, suit)
      this.closed.push(card)
    }

    const seed: number = Number.parseInt(Math.random().toString()[5])
    for (const i in [...Array(seed || 1).keys()]) {
      this.closed = this.closed.sort(() => Math.random() - 0.5)
    }

    this.spawn()
  }

  private spawn() {
    let col = 0
    for (let i = 0; i < 40; i++) {
      if (col >= 10) col = 0
      const card = this.getTopCard()
      if (card === null) continue
      card.isClosed = false
      this.columns[col].push(card)
      col++
    }
  }

  getTopCard(): ICard | null {
    if (this.closed.length == 0) return null
    const card = this.closed.pop()
    if (card === undefined) return null
    this.bus.deckChanged(this.closed.length)
    return card
  }

  onLoaded() {
    this.bus.deckChanged(this.closed.length)
  }

  onCardClicked(card: ICard, fromSlot: ISlot): void {
    switch (fromSlot.type) {
      case SlotType.DeckClosed:
        this.closedDeckCardClicked()
        break
      case SlotType.DeckOpened:
        this.openedDeckCardClicked(card)
        break
      case SlotType.PlayField:
        this.playFieldDeckCardClicked(card, fromSlot)
        break
      case SlotType.Result:
        this.resultDeckCardClicked(card, fromSlot)
        break
    }
  }

  closedDeckCardClicked(): void {
    const removed = this.closed.pop()
    if (!removed) throw Error('no card to move in ' + SlotType.DeckClosed)
    removed.isClosed = false
    this.opened.push(removed)
    this.move(
      removed,
      { type: SlotType.DeckClosed, index: 0 },
      { type: SlotType.DeckOpened, index: 0 }
    )
  }
  openedDeckCardClicked(card: ICard): void {
    if (this.tryPlaceToResults(card, { type: SlotType.DeckOpened, index: 0 }, this.opened)) return
    this.tryPlaceToColumns(card, { type: SlotType.DeckOpened, index: 0 }, this.opened)
  }
  playFieldDeckCardClicked(card: ICard, fromSlot: ISlot): void {
    if (this.tryPlaceToResults(card, fromSlot, this.columns[fromSlot.index])) return
    this.tryPlaceToColumns(card, fromSlot, this.columns[fromSlot.index], true)
  }
  resultDeckCardClicked(card: ICard, fromSlot: ISlot): void {
    this.tryPlaceToResults(card, fromSlot, this.results[fromSlot.index])
  }

  tryPlaceToResults(card: ICard, fromSlot: ISlot, slotArray: ICard[]): boolean {
    for (let i = 0; i < 8; i++) {
      if (this.canPlaceResult(i, card)) {
        const removed = slotArray.pop()
        if (!removed) throw Error('no card to move in ' + SlotType.PlayField + ':' + i)
        removed.isClosed = false
        this.results[i].push(removed)
        this.move(removed, fromSlot, { type: SlotType.Result, index: i })
        return true
      }
    }
    return false
  }
  tryPlaceToColumns(
    card: Card,
    fromSlot: ISlot,
    slotArray: ICard[],
    skipIndex: boolean = false
  ): boolean {
    for (let i = 0; i < 10; i++) {
      if (skipIndex && fromSlot.index === i) continue
      if (this.canPlaceColumn(i, card)) {
        const removed = slotArray.pop()
        if (!removed) throw Error('no card to move in ' + SlotType.PlayField + ':' + i)
        removed.isClosed = false
        this.columns[i].push(removed)
        this.move(removed, fromSlot, { type: SlotType.PlayField, index: i })
        return true
      }
    }
    return false
  }

  canPlaceResult(index: number, card: ICard): boolean {
    if (this.results[index].length === 0 && card.value == CardValue.Ace) return true
    if (this.results[index].length === 0) return false

    const topCard = this.results[index][this.results[index].length - 1]
    if (
      topCard.suit === card.suit &&
      topCard.value === CardValue.Ace &&
      card.value === CardValue.Two
    )
      return true
    if (topCard.suit === card.suit && topCard.value === card.value - 1) return true
    return false
  }

  canPlaceColumn(index: number, card: ICard): boolean {
    if (this.columns[index].length === 0) return true
    const topCard = this.columns[index][this.columns[index].length - 1]
    if (topCard.suit === card.suit && topCard.value - 1 === card.value) return true
    return false
  }

  undo(): void {
    if (this.history.length === 0) return
    const lastMove = this.history.pop()
    if (!lastMove) return
    let toMove: ICard | undefined
    switch (lastMove.to.type) {
      case SlotType.PlayField:
        toMove = this.columns[lastMove.to.index].pop()
        break
      case SlotType.Result:
        toMove = this.results[lastMove.to.index].pop()
        break
    }
    if (!toMove) return
    switch (lastMove.from.type) {
      case SlotType.DeckOpened:
        this.opened.push(toMove)
        break
      case SlotType.PlayField:
        this.columns[lastMove.from.index].push(toMove)
        break
      case SlotType.Result:
        this.results[lastMove.from.index].push(toMove)
        break
    }
    this.move(lastMove.card, lastMove.to, lastMove.from, false)
  }

  move(card: ICard, fromSlot: ISlot, toSlot: ISlot, saveHistory: boolean = true) {
    this.moves++
    if (saveHistory) this.history.push({ card, from: fromSlot, to: toSlot })
    this.bus.move(card, fromSlot, toSlot)

    let totalResults = 0
    for (const i in this.results) totalResults += this.results[i].length
    if (totalResults === total) this.bus.finish(this.time, this.moves)
  }
}

export interface IGame {
  onLoaded(): void
  getTopCard(): ICard | null

  onCardClicked(card: ICard, slot: ISlot): void
  undo(): void

  time: number
  closed: ICard[]
  opened: ICard[]
  columns: ICard[][]
  results: ICard[][]
}

export default function (bus: IBus): IGame {
  return new Game(bus)
}
