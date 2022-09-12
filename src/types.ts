
export interface CardLetter {
  id: number
  character: string
  score: number
}

export interface LetterGroup {
  word: CardLetter[]
}

export interface PlayableHand {
  words: LetterGroup[]
  throwaway: CardLetter
  loseCards(): CardLetter[]
  totalScore(): number
}
