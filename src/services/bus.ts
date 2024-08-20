import type ICard from '@/models/Card'
import type { ISlot } from '@/models/Slot'
import { Observable, Subject } from 'rxjs'

export class Bus implements IBus {
  constructor(
    private moveSubject = new Subject<IMoveMessage>(),
    private deckSubject = new Subject<IDeckStateMessage>(),
    private cardHoverSubject = new Subject<ICardHoveredMessage>(),
    private cardDescendedSubject = new Subject<boolean>(),
    private finishSubject = new Subject<IFinishMessage>()
  ) {}

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
    this.cardHoverSubject.next({ card, from })
  }
  onCardHover(): Observable<ICardHoveredMessage> {
    return this.cardHoverSubject.asObservable()
  }

  cardDescended(mark: boolean): void {
    this.cardDescendedSubject.next(mark)
  }
  onCardDescended(): Observable<boolean> {
    return this.cardDescendedSubject.asObservable()
  }

  finish(time: number, moves: number): void {
    this.finishSubject.next({ time, moves })
  }
  finished(): Observable<IFinishMessage> {
    return this.finishSubject.asObservable()
  }
}

export interface IBus {
  move(card: ICard, from: ISlot, to: ISlot): void
  moves(): Observable<IMoveMessage>

  deckChanged(cardsLeft: number): void
  deckStatus(): Observable<IDeckStateMessage>

  cardHovered(card: ICard, from: ISlot): void
  onCardHover(): Observable<ICardHoveredMessage>

  cardDescended(mark: boolean): void
  onCardDescended(): Observable<boolean>

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

export interface IFinishMessage {
  time: number
  moves: number
}

export default function (): IBus {
  return new Bus()
}
