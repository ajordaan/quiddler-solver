import { CardLetter, CardStatus, LetterGroup } from "./types";
import { convertPlaceHoldersToDoubleLetters, convertDoubleLettersToPlaceholders } from "./utils"
export default class Hand {
  words: LetterGroup[];
  playerCards: CardLetter[];
  ID = 1;
  constructor(playerLetters: string, WORD_SCORES ) {
    const convertedLetters = convertDoubleLettersToPlaceholders(playerLetters)
    this.playerCards = Array.from(convertedLetters).map(lett => {
      
      return { id: this.newId(), character: lett, score: WORD_SCORES[lett], status: CardStatus.PENDING} 
    
    })
    this.words = []
  }

  setScoredWords(scoredWords: string[]) {
    const foundLettersIndex = [] as number[]

    scoredWords.forEach(word => {
      const group: LetterGroup = {word: []}
      Array.from(word).forEach(letter => {
        const card = this.playerCards.find((c, index) => {
          const found = !foundLettersIndex.includes(index) && c.character === letter && c.status === CardStatus.PENDING
          if (found) {
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

  setThrowAwayCard(letter) {
    const card = this.playerCards.find(c => c.character === letter)
    card.status = CardStatus.THROWAWAY

    console.log({card})
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

      if (index > -1 && card.status === CardStatus.PENDING) {
        card.status = CardStatus.LOSE
        remainingCards.splice(index, 1)
        console.log({card})
      }
    })
  }

  get wordScore(): number {
    return this.words.reduce((total, group) => total += group.word.reduce((score, card) => score += card.score, 0), 0)
  }

  get loseScore(): number {
    return this.playerCards.filter(card => card.status === CardStatus.LOSE).reduce((score, card) => score += card.score, 0)
  }

  get totalScore(): number {
    return this.wordScore - this.loseScore
  }

  newId() {
    return this.ID++
  }
}
