export interface ISlot {
  type: SlotType
  index: number
}

export enum SlotType {
  DeckClosed,
  DeckOpened,
  PlayField,
  Result
}
