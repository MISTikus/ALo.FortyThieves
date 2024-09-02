import type { ISlot } from '@/models/Slot'
import type { ISettings } from './settings'
import type ICard from '@/models/Card'
import type { IMoveMessage } from './bus'

export class Storage implements IStorage {
  read(): IStorageData | null {
    const data = localStorage.getItem('data')
    if (data) {
      return JSON.parse(data)
    }
    return null
  }
  write(data: IStorageData): void {
    const stringData = JSON.stringify(data)
    localStorage.setItem('data', stringData)
  }
}

export interface IStorageData {
  settings: ISettings
  record: { time: number; moves: number } | null
  // ToDo
  savedGame: {
    closed: string[]
    opened: string[]
    columns: string[][]
    results: string[][]
    freeSlots: ISlot[]
    deck: Map<string, ICard>
    history: IMoveMessage[]
    time: number
    moves: number
  } | null
}

export interface IStorage {
  read(): IStorageData | null
  write(data: IStorageData): void
}

export default function (): IStorage {
  return new Storage()
}
