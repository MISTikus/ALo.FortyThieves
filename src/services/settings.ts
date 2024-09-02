export default function (): ISettings {
  return {
    randomize: true,
    useHelper: true,
    automateResults: true
  }
}

export interface ISettings {
  randomize: boolean
  useHelper: boolean // ToDo
  automateResults: boolean
}
