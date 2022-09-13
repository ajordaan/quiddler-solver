export enum CardStatus {
  PENDING,
  SCORED,
  LOSE,
  THROWAWAY,
}
export interface CardLetter {
  id: number
  character: string
  score: number
  status: CardStatus
}

export interface LetterGroup {
  word: CardLetter[]
}
