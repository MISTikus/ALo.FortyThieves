export default function (): ISettings {
  return {
    randomize: false,
    useHelper: true
  }
}

export interface ISettings {
  randomize: boolean
  useHelper: boolean // ToDo
}
