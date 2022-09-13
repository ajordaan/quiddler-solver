const WORD_SCORES = {
  a: 2,
  b: 8,
  c: 5,
  d: 2,
  e: 2,
  f: 6,
  g: 6,
  h: 7,
  i: 2,
  j: 13,
  k: 8,
  l: 3,
  m: 5,
  n: 5,
  o: 2,
  p: 6,
  q: 15,
  r: 5,
  s: 3,
  t: 3,
  u: 4,
  v: 11,
  w: 10,
  x: 12,
  y: 4,
  z: 14,
  er: 7,
  cl: 10,
  in: 7,
  th: 9,
  qu: 9
}
import Hand from './Hand'
import { CardLetter, CardStatus, LetterGroup } from './types';
export default class WordFinder {

  static id = 1

  static get WORD_SCORES() {
    return WORD_SCORES;
  }

  static uid() {
    return this.id++
  }

  letters: string
  WORD_LIST: string[]
  RESULT_SIZE = 5

  constructor(letters: string, wordList) {
    this.letters = letters
    this.WORD_LIST = wordList
  }

  getPlayableHand() {
    const variations = this.getThrowawayVariations()
    const topWords = []
    variations.forEach(variation => {
  
      const validWords = this.findValidWords(variation.includedLetters)
      if(validWords.length > 0) {
        const bestWord = this.getWordWithHighestScore(variation.includedLetters, validWords )

        topWords.push({ ...bestWord, playerLetters: variation.includedLetters, throwaway: variation.excludedLetter })
      }
     
    })
    
    
    const topWord =  topWords.length > 0 ? topWords.sort(this.compareWordScores)[0] : null

    if(topWord) {
      const groups: LetterGroup[] = []
      topWord.words.forEach(w => {
        const cardLetters: CardLetter[] = []
        for(let lett of w) {
          cardLetters.push({ id: WordFinder.uid(), character: lett, score: WORD_SCORES[lett], status: CardStatus.SCORED })
        }

        groups.push({word: cardLetters})
      })
      
      return new Hand(topWord.playerLetters,topWord.words, topWord.throwaway, WORD_SCORES)

    }

  }

  findValidWords(letters) {
    if (letters.length > 10) {
      console.log('Too many letters')
      return
    }

    const combinations = this.getCombinations(letters)
    const allPermutations = this.getAllPermutations(combinations)


    // console.log({ allPermutations: allPermutations.length })
    
    const validWords = allPermutations.filter(perm => this.validWord(perm.join('')))
    // console.log({ validWords: validWords })
    return validWords

  }

  getWordWithHighestScore(letters, validWords) {
    const validWordsWithScore = this.getValidWordsWithScore(validWords)
    const letterGroups = []
    for (const wordScore of validWordsWithScore) {

      const word = wordScore.word
      let remainingLetters = letters
      for (let l of word) {
        remainingLetters = remainingLetters.replace(l, '')
      }
      const groups = this.buildWordGroup(letters, remainingLetters, validWordsWithScore, [wordScore])
      if (groups && groups.length > 1) {
        // console.log(' ---------- GROUP -----------')
        // console.log(groups)
        // console.log(' ----------------------------')
        letterGroups.push(groups)
      }

    }

    const filteredGroups = letterGroups.map(group => {
      const groupScore = group.reduce((total, wordScore) => total += wordScore.score, 0)
      const groupWords = group.map(wordScore => wordScore.word)
      return { id: WordFinder.uid(), words: groupWords, score: groupScore }

    })

    const topGroups = filteredGroups.sort(this.compareWordScores)

    // console.log(JSON.stringify(topGroups))
    
    const topWord = validWordsWithScore[0]

//    console.log({topWord})

    // console.log(topWord)
    // console.log(topGroups[0])
    if (topWord.score < topGroups[0]?.score)
      return topGroups[0]

    return { id: WordFinder.uid(), words: [topWord.word], score: topWord.score }
  }

  getThrowawayVariations() {
    const letterVariations = []

    for (let i = 0; i < this.letters.length; i++) {
      const includedLetters = this.letters.slice(0, i) + this.letters.slice(i + 1)
      const excludedLetter = this.letters[i]

      letterVariations.push({ includedLetters, excludedLetter })
    }

    return letterVariations
  }

  buildWordGroup(letters, remainingLetters, validWords, group) {
    if (remainingLetters.length < 2)
      return group

    for (let wordScore of validWords) {
      const word = wordScore.word
      if (word.length >= letters.length - 1) {
        continue;
      }

      remainingLetters = Array.from(remainingLetters).sort().join('')

      if (remainingLetters.includes(Array.from(word).sort().join(''))) {
        group.push(wordScore)

        for (let l of word) {
          remainingLetters = remainingLetters.replace(l, '')
        }

        return this.buildWordGroup(letters, remainingLetters, validWords, group)
      }
    }
  }

  getValidWordsWithScore(words) {
    const validWordsWithScore = words.map(word => {
      const score = this.calculateWordScore(word)

      return { word: word.join(''), score }
    })

    return validWordsWithScore.sort(this.compareWordScores)
  }

  calculateWordScore(word) {
    let score = 0
    word.forEach(letter => score += WORD_SCORES[letter])

    return score
  }

  validWord(word) {
    return word.length > 1 && this.binarySearch(this.WORD_LIST, word)
  }

  getAllPermutations(groups) {
    const temp = []
    groups.forEach(wordLength => {
      const perms = this.getPermutations(Array.from(wordLength))
      this.largePush(perms, temp)
    })

    return temp
  }

  getPermutations(letterArray) {
    let result = [];

    const permute = (arr, m = []) => {
      if (arr.length === 0) {
        result.push(m)
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next))
        }
      }
    }

    permute(letterArray)

    return result;
  }

  getCombinations(letters) {
    const strLength = letters.length;
    let result = [];
    let currentIndex = 0;
    while (currentIndex < strLength) {
      let char = letters.charAt(currentIndex);
      let x;
      let arrTemp = [char];
      for (x in result) {
        arrTemp.push("" + result[x] + char);
      }
      result = result.concat(arrTemp);
      currentIndex++;
    }
    return result;
  }

  largePush(src, dest) {
    const len = src.length
    for (let i = 0; i < len; i++) {
      dest.push(src[i])
    }
  }

  compareWordScores(a, b) {
    if (a.score < b.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }
    return 0;
  }

  binarySearch(array, target) {
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex) {
      // Define Middle Index (This will change when comparing )
      let middleIndex = Math.floor((startIndex + endIndex) / 2);
      // Compare Middle Index with Target for match
      if (target === array[middleIndex]) {
        return true
      }
      // Search Right Side Of Array
      if (target > array[middleIndex]) {
        // Assign Start Index and increase the Index by 1 to narrow search
        startIndex = middleIndex + 1;
      }
      // Search Left Side Of Array
      if (target < array[middleIndex]) {
        // Assign End Index and increase the Index by 1 to narrow search
        endIndex = middleIndex - 1;
      }
      // Not found in this iteration of the loop. Looping again.
      else {
      }
    }
    // If Target Is Not Found
    return false
  }
}
