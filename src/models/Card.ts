import { SlotType, type ISlot } from './Slot'

export default interface ICard {
  isClosed: boolean
  readonly canInteract: boolean
  value: CardValue
  suit: CardSuit
  title: string
  slot: ISlot
  index?: number
  debugData?: string

  movedTo(slot: ISlot, index: number): void
}

export class Card implements ICard {
  value: CardValue
  suit: CardSuit
  title: string
  slot: ISlot
  index?: number = 0
  debugData?: string

  constructor(value: CardValue, suit: CardSuit, slot: ISlot) {
    this.value = value
    this.suit = suit
    this.slot = slot
    this.title = CardValue[this.value] + ':' + CardSuit[this.suit]
  }

  get isClosed(): boolean {
    return this.slot.type === SlotType.DeckClosed
  }
  get canInteract(): boolean {
    return this.slot.type !== SlotType.DeckClosed && this.slot.type === SlotType.Result
  }

  movedTo(slot: ISlot, index: number): void {
    this.slot = slot
    this.index = index
  }
}

export enum CardValue {
  Ace = 0,
  King = 13,
  Queen = 12,
  Jack = 11,
  Ten = 10,
  Nine = 9,
  Eight = 8,
  Seven = 7,
  Six = 6,
  Five = 5,
  Four = 4,
  Three = 3,
  Two = 2
}

export enum CardSuit {
  Hearts = 0,
  Diamonds = 1,
  Spades = 2,
  Clubs = 3
}
