import { CardLetter, CardStatus, LetterGroup } from "./types";

export default class Hand {
  words: LetterGroup[];
  playerCards: CardLetter[];
  wordsTemp: string[]
  throwawayTemp: string
  ID = 1
  constructor(playerCardsExcludingThrowaway: string, words: string[], throwawayLetter: string, WORD_SCORES ) {
    console.log('--- HAND ---')
    console.log({playerCardsExcludingThrowaway, words, throwawayLetter})

    this.playerCards = Array.from(playerCardsExcludingThrowaway + throwawayLetter).map(lett => {return { id: this.newId(), character: lett, score: WORD_SCORES[lett], status: CardStatus.PENDING} })
    this.words = []
   
    this.wordsTemp = words
    this.throwawayTemp = throwawayLetter
  }

  setScoredWords() {
    const foundLettersIndex = [] as number[]

    this.wordsTemp.forEach(word => {
      const group: LetterGroup = {word: []}
      Array.from(word).forEach(letter => {
        const card = this.playerCards.find((c, index) => {
          const found = !foundLettersIndex.includes(index) && c.character === letter
          if(found) {
            foundLettersIndex.push(index)
            return true
          }

          return false
        });

        card.status = CardStatus.SCORED
        group.word.push(card)
      })
      this.words.push(group)
    })
  }

  setThrowAwayCard() {
    const card = this.playerCards.find(c => c.character === this.throwawayTemp)
    card.status = CardStatus.THROWAWAY
  }

  setLoseCards() {
    console.log('set lose cards')
    let remainingCards = [...this.playerCards]
    this.words.forEach(letterGroup => {
      letterGroup.word.forEach(card => {
        const index = remainingCards.findIndex(rc => rc.character === card.character)
        index > -1 && remainingCards.splice(index, 1)
      })
    })

    this.playerCards.forEach(card => {
      const index = remainingCards.findIndex(rc => rc.character === card.character)

      if(index > -1 && card.status === CardStatus.PENDING) {
        card.status = CardStatus.LOSE
        remainingCards.splice(index, 1)
      }
    })
  }

  totalScore(): number {
      return this.words.reduce((total,group) => total += group.word.reduce((score, card) => score += card.score, 0), 0)
  }

  newId() {
    return this.ID++
  }

  

}
