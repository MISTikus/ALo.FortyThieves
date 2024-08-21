export default function (): ISettings {
  return {
    randomize: true,
    useHelper: true
  }
}

export interface ISettings {
  randomize: boolean
  useHelper: boolean // ToDo
}
