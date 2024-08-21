import { CardValue, Card } from '@/models/Card'
import type { ISlot } from '@/models/Slot'
import { SlotType } from '@/models/Slot'
import type ICard from '@/models/Card'
import { Descent, type IBus, type ICardHoveredMessage, type IMoveMessage } from './bus'
import type { ISettings } from './settings'

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
  closed: string[] = []
  opened: string[] = []
  columns: string[][] = []
  results: string[][] = []
  freeSlots: ISlot[] = []
  deck: Map<string, ICard> = new Map<string, ICard>()

  history: IMoveMessage[] = []
  time: number = 0
  moves: number = 0

  constructor(
    private bus: IBus,
    private settings: ISettings
  ) {
    for (let i = 0; i < 10; i++) this.columns.push([])
    for (let i = 0; i < 8; i++) this.results.push([])

    const closedSlot: ISlot = { type: SlotType.DeckClosed }
    for (let i = 0; i < total; i++) {
      const value = defaultDeck[i % 13]
      const suit = Math.floor(i / 13) % 4
      const card: ICard = new Card(value, suit, closedSlot)
      if (this.deck.has(card.title)) {
        card.title += ':add'
      }
      this.deck.set(card.title, card)
      this.closed.push(card.title)
    }

    if (settings.randomize) {
      const seed: number = Number.parseInt(Math.random().toString()[5])
      for (const i in [...Array(seed || 1).keys()]) {
        this.closed = this.closed.sort(() => Math.random() - 0.5)
      }
    }

    bus.onCardHover().subscribe((m) => this.onCardHovered(m))
    bus.onCardDescended().subscribe(() => this.onCardDescended())
  }

  private spawn() {
    let col = 0
    for (let i = 0; i < 40; i++) {
      if (col >= 10) col = 0
      const card = this.getTopCard()
      if (card === null) continue
      card.slot = { type: SlotType.PlayField, index: col }
      card.index = this.columns[col].length
      this.columns[col].push(card.title)
      card.debugData = `Slot: ${col}. Ix: ${card.index}`
      this.move(
        card,
        { type: SlotType.DeckClosed },
        { type: SlotType.PlayField, index: col },
        false
      )
      col++
    }
  }

  getTopCard(): ICard | null {
    if (this.closed.length == 0) return null
    const card = this.closed.pop()
    if (card === undefined) return null
    this.bus.deckChanged(this.closed.length)
    return this.deck.get(card) || null
  }

  onLoaded() {
    this.spawn()
  }

  onCardClicked(card: ICard): void {
    const fromSlot = card.slot
    switch (fromSlot.type) {
      case SlotType.DeckClosed:
        this.closedDeckCardClicked()
        break
      case SlotType.DeckOpened:
        this.openedDeckCardClicked(card)
        break
      case SlotType.PlayField:
        if (!this.columns.map((x) => x[x.length - 1]).filter((x) => x === card.title).length) return
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
    const card = this.deck.get(removed)
    if (!card) throw Error('no card to move in ' + SlotType.DeckClosed)
    const toSlot = { type: SlotType.DeckOpened }
    card.slot = toSlot
    card.index = this.opened.length
    this.opened.push(removed)
    this.bus.deckChanged(this.closed.length)
    this.move(card, { type: SlotType.DeckClosed }, { type: SlotType.DeckOpened })
  }
  openedDeckCardClicked(card: ICard): void {
    if (this.tryPlaceToResults(card, { type: SlotType.DeckOpened }, this.opened)) return
    this.tryPlaceToColumns(card, { type: SlotType.DeckOpened }, this.opened)
  }
  playFieldDeckCardClicked(card: ICard, fromSlot: ISlot): void {
    if (this.tryPlaceToResults(card, fromSlot, this.columns[fromSlot.index || 0])) return
    this.tryPlaceToColumns(card, fromSlot, this.columns[fromSlot.index || 0], true)
  }
  resultDeckCardClicked(card: ICard, fromSlot: ISlot): void {
    this.tryPlaceToColumns(card, fromSlot, this.results[fromSlot.index || 0], false)
  }

  tryPlaceToResults(card: ICard, fromSlot: ISlot, slotArray: string[]): boolean {
    for (let i = 0; i < 8; i++) {
      if (this.canPlaceResult(i, card)) {
        const removed = slotArray.pop()
        if (!removed) throw Error('no card to move in ' + SlotType.PlayField + ':' + i)
        const card = this.deck.get(removed)
        if (!card) throw Error('no card to move in ' + SlotType.PlayField + ':' + i)
        const toSlot = { type: SlotType.Result, index: i }
        card.movedTo(toSlot, this.results[i].length)
        this.results[i].push(removed)
        this.move(card, fromSlot, toSlot)
        return true
      }
    }
    return false
  }
  tryPlaceToColumns(
    card: ICard,
    fromSlot: ISlot,
    slotArray: string[],
    skipIndex: boolean = false
  ): boolean {
    for (let i = 0; i < 10; i++) {
      if (skipIndex && fromSlot.index === i) continue
      if (this.canPlaceColumn(i, card, true)) {
        const removed = slotArray.pop()
        if (!removed) throw Error('no card to move in ' + SlotType.PlayField + ':' + i)
        const toSlot = { type: SlotType.PlayField, index: i }
        card.movedTo(toSlot, this.columns[i].length)
        this.columns[i].push(removed)
        this.move(card, fromSlot, toSlot)
        return true
      }
    }
    return false
  }

  canPlaceResult(index: number, card: ICard): boolean {
    if (this.results[index].length === 0 && card.value == CardValue.Ace) return true
    if (this.results[index].length === 0) return false

    const topCardTitle = this.results[index][this.results[index].length - 1]
    const topCard = this.deck.get(topCardTitle)
    if (!topCard) throw Error('no card in deck')
    if (
      topCard.suit === card.suit &&
      topCard.value === CardValue.Ace &&
      card.value === CardValue.Two
    )
      return true
    if (topCard.suit === card.suit && topCard.value === card.value - 1) return true
    return false
  }

  canPlaceColumn(index: number, card: ICard, includeEmpty: boolean): boolean {
    if (this.columns[index].length === 0) return includeEmpty
    const topCardTitle = this.columns[index][this.columns[index].length - 1]
    const topCard = this.deck.get(topCardTitle)
    if (!topCard) throw Error('no card in deck')
    if (topCard.suit === card.suit && topCard.value - 1 === card.value) return true
    return false
  }

  private onCardHovered(msg: ICardHoveredMessage): void {
    if (msg.from.type === SlotType.PlayField) {
      const isLast = !!this.columns.filter((x) => x[x.length - 1] === msg.card.title)[0]
      if (!isLast) return
    }
    if (msg.from.type === SlotType.DeckClosed) {
      this.bus.hover(null, { type: SlotType.DeckClosed }, 'pirple')
      return
    }

    this.freeSlots = []
    for (let i = 0; i < 8; i++) {
      if (this.canPlaceResult(i, msg.card)) {
        this.bus.hover(msg.card, msg.from, 'purple')
        const topCardTitle = this.results[i][this.results[i].length - 1]
        const slot = { type: SlotType.Result, index: i }
        if (topCardTitle) {
          const topCard = this.deck.get(topCardTitle)
          if (!topCard) throw Error('fail')
          this.bus.hover(topCard, slot)
        } else {
          this.freeSlots.push(slot)
          this.bus.hover(null, slot)
        }
      }
    }
    for (let i = 0; i < 10; i++) {
      if (msg.from.index === i) continue
      if (this.canPlaceColumn(i, msg.card, false)) {
        this.bus.hover(msg.card, msg.from, 'purple')
        const topCardTitle = this.columns[i][this.columns[i].length - 1]
        const slot = { type: SlotType.Result, index: i }
        if (topCardTitle) {
          const topCard = this.deck.get(topCardTitle)
          if (!topCard) throw Error('fail')
          this.bus.hover(topCard, slot)
        } else {
          this.freeSlots.push(slot)
          this.bus.hover(null, slot)
        }
      }
    }
  }

  private onCardDescended(): void {
    this.bus.descent(Descent)
  }

  undo(): void {
    if (this.history.length === 0) return
    const lastMove = this.history.pop()
    if (!lastMove) return
    let toMove: string | undefined
    switch (lastMove.to.type) {
      case SlotType.DeckOpened:
        toMove = this.opened.pop()
        break
      case SlotType.PlayField:
        toMove = this.columns[lastMove.to.index || 0].pop()
        break
      case SlotType.Result:
        toMove = this.results[lastMove.to.index || 0].pop()
        break
    }
    if (!toMove) return

    const card = this.deck.get(toMove)
    if (!card) return

    switch (lastMove.from.type) {
      case SlotType.DeckClosed:
        card.movedTo(lastMove.from, this.closed.length)
        this.closed.push(toMove)
        this.bus.deckChanged(this.closed.length)
        break
      case SlotType.DeckOpened:
        card.movedTo(lastMove.from, this.opened.length)
        this.opened.push(toMove)
        break
      case SlotType.PlayField:
        card.movedTo(lastMove.from, this.columns[lastMove.from.index || 0].length)

        this.columns[lastMove.from.index || 0].push(toMove)
        break
      case SlotType.Result:
        card.movedTo(lastMove.from, this.results[lastMove.from.index || 0].length)
        this.results[lastMove.from.index || 0].push(toMove)
        break
    }
    this.move(card, lastMove.to, lastMove.from, false)
  }

  move(card: ICard, fromSlot: ISlot, toSlot: ISlot, saveHistory: boolean = true) {
    this.moves++
    if (saveHistory) this.history.push({ card, from: fromSlot, to: toSlot })
    this.bus.move(card, fromSlot, toSlot)
    this.bus.cardChanged(card)

    let totalResults = 0
    for (const i in this.results) totalResults += this.results[i].length
    if (totalResults === total) this.bus.finish(this.time, this.moves)
  }
}

export interface IGame {
  onLoaded(): void
  getTopCard(): ICard | null

  onCardClicked(card: ICard): void
  undo(): void

  time: number
  closed: string[]
  opened: string[]
  columns: string[][]
  results: string[][]
  freeSlots: ISlot[]

  deck: Map<string, ICard>
}

export default function (bus: IBus, settings: ISettings): IGame {
  return new Game(bus, settings)
}
