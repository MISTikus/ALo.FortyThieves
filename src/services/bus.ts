import type ICard from '@/models/Card'
import type { ISlot } from '@/models/Slot'
import { Observable, Subject } from 'rxjs'

export class Bus implements IBus {
  constructor(
    private gameSubject = new Subject<void>(),
    private gameTimeSubject = new Subject<number>(),
    private moveSubject = new Subject<IMoveMessage>(),
    private deckSubject = new Subject<IDeckStateMessage>(),
    private cardHoveredSubject = new Subject<ICardHoveredMessage>(),
    private cardHoverSubject = new Subject<ICardHoverMessage>(),
    private cardDescendedSubject = new Subject<Symbol>(),
    private descendedSubject = new Subject<Symbol>(),
    private cardChangedSubject = new Subject<ICardChangedMessage>(),
    private finishSubject = new Subject<IFinishMessage>()
  ) {}
  gameTimeChanged(time: number): void {
    this.gameTimeSubject.next(time)
  }
  onGameTimeChanged(): Observable<number> {
    return this.gameTimeSubject.asObservable()
  }
  gameStarted(): void {
    this.gameSubject.next()
  }
  onGameStarted(): Observable<void> {
    return this.gameSubject.asObservable()
  }

  move(card: ICard, from: ISlot, to: ISlot): void {
    this.moveSubject.next({ card, from, to })
  }

  moves(): Observable<IMoveMessage> {
    return this.moveSubject.asObservable()
  }

  deckChanged(cardsLeft: number): void {
    this.deckSubject.next({ cardsLeft })
  }

  deckStatus(): Observable<IDeckStateMessage> {
    return this.deckSubject.asObservable()
  }

  cardHovered(card: ICard, from: ISlot): void {
    this.cardHoveredSubject.next({ card, from })
  }
  onCardHover(): Observable<ICardHoveredMessage> {
    return this.cardHoveredSubject.asObservable()
  }

  hover(card: ICard | null, from: ISlot, color: string = 'var(--color-border-highlight)'): void {
    this.cardHoverSubject.next({ card, from, color })
  }
  onHover(): Observable<ICardHoverMessage> {
    return this.cardHoverSubject.asObservable()
  }

  cardDescended(mark: Symbol): void {
    this.cardDescendedSubject.next(mark)
  }
  onCardDescended(): Observable<Symbol> {
    return this.cardDescendedSubject.asObservable()
  }

  descent(mark: Symbol): void {
    this.descendedSubject.next(mark)
  }
  onDescent(): Observable<Symbol> {
    return this.descendedSubject.asObservable()
  }

  cardChanged(card: ICard): void {
    this.cardChangedSubject.next({ card })
  }
  onCardChanged(): Observable<ICardChangedMessage> {
    return this.cardChangedSubject.asObservable()
  }

  finish(time: number, moves: number): void {
    this.finishSubject.next({ time, moves })
  }
  finished(): Observable<IFinishMessage> {
    return this.finishSubject.asObservable()
  }
}

export const Descended = Symbol('Descended')
export const Descent = Symbol('Descent')

export interface IBus {
  gameStarted(): void
  onGameStarted(): Observable<void>

  gameTimeChanged(time: number): void
  onGameTimeChanged(): Observable<number>

  move(card: ICard, from: ISlot, to: ISlot): void
  moves(): Observable<IMoveMessage>

  deckChanged(cardsLeft: number): void
  deckStatus(): Observable<IDeckStateMessage>

  cardHovered(card: ICard, from: ISlot): void
  onCardHover(): Observable<ICardHoveredMessage>

  hover(card: ICard | null, from: ISlot, color?: string): void
  onHover(): Observable<ICardHoverMessage>

  cardChanged(card: ICard): void
  onCardChanged(): Observable<ICardChangedMessage>

  cardDescended(mark: Symbol): void
  onCardDescended(): Observable<Symbol>

  descent(mark: Symbol): void
  onDescent(): Observable<Symbol>

  finish(time: number, moves: number): void
  finished(): Observable<IFinishMessage>
}

export interface IMoveMessage {
  card: ICard
  from: ISlot
  to: ISlot
}

export interface IDeckStateMessage {
  cardsLeft: number
}

export interface ICardHoveredMessage {
  card: ICard
  from: ISlot
}

export interface ICardHoverMessage {
  card: ICard | null
  from: ISlot
  color?: string
}

export interface ICardChangedMessage {
  card: ICard
}

export interface IFinishMessage {
  time: number
  moves: number
}

export default function (): IBus {
  return new Bus()
}
