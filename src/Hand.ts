import type { CardLetter, LetterGroup, PlayableHand } from "./types";

export default class Hand implements PlayableHand {
  words: LetterGroup[];
  throwaway: CardLetter;
  playerCards: CardLetter[];

  constructor(playerCardsExcludingThrowaway: CardLetter[], words: LetterGroup[], throwaway: CardLetter, ) {
    this.playerCards = playerCardsExcludingThrowaway
    this.words = words
    this.throwaway = throwaway
  }

  loseCards() {
    let remainingCards = this.playerCards
    this.words.forEach(letterGroup => {
      letterGroup.word.forEach(card => {
        const index = remainingCards.findIndex(rc => rc.character === card.character)
        index > -1 && remainingCards.splice(index, 1)
      })
    })

    return remainingCards
  }

  totalScore(): number {
      return this.words.reduce((total,group) => total += group.word.reduce((score, card) => score += card.score, 0), 0)
  }

  

}
