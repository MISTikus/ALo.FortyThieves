export default interface ICard {
  isClosed: boolean
  value: CardValue
  suit: CardSuit
  title: string
}

export class Card implements ICard {
  isClosed: boolean
  value: CardValue
  suit: CardSuit
  title: string

  constructor(value: CardValue, suit: CardSuit, isClosed: boolean = true) {
    this.value = value
    this.suit = suit
    this.isClosed = isClosed
    this.title = CardValue[this.value] + ':' + CardSuit[this.suit]
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
