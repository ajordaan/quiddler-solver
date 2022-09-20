onmessage = function (event) {
  const wordFinder = new WordFinder(event.data.letters, event.data.wordList, event.data.wordScores)
  const word = wordFinder.getPlayableHandInfo();
  postMessage(
    { messageType: "result", data: word }
  );
};

const DOUBLE_LETTER_PLACEHOLDERS = {
  er: '!',
  cl: '@',
  in: '#',
  th: '$',
  qu: '%'
}
const PLACEHOLDER_DOUBLE_LETTERS = {
  '@': 'cl',
  '!': 'er',
  '#': 'in',
  '$': 'th',
  '%': 'qu'
}
class WordFinder {

  constructor(letters, wordList, wordScores) {
    this.letters = this.convertDoubleLettersToPlaceholders(letters)
    this.WORD_LIST = wordList
    this.WORD_SCORES = wordScores
  }

  convertDoubleLettersToPlaceholders(word) {
    let wordWithPlaceHolders = ''
    for (let i = 0; i < word.length; i++) {
      if (word[i] === '(') {
        const doubleLetter = word.substring(i + 1, word.indexOf(')', i))
        wordWithPlaceHolders += DOUBLE_LETTER_PLACEHOLDERS[doubleLetter]
        i = word.indexOf(')', i)
      }
      else {
        wordWithPlaceHolders += word[i]
      }
    }

    return wordWithPlaceHolders
  }

  convertPlaceHoldersToDoubleLetters(word) {
    let wordWithoutPlaceholders = ''

    for (const letter of word) {
      if (letter in PLACEHOLDER_DOUBLE_LETTERS) {
        wordWithoutPlaceholders += PLACEHOLDER_DOUBLE_LETTERS[letter]
      }
      else {
        wordWithoutPlaceholders += letter
      }
    }

    return wordWithoutPlaceholders
  }

  getPlayableHandInfo() {
    const variations = this.getThrowawayVariations()
    const topWords = []
    let bestWord = null
    variations.forEach(variation => {

      const validWords = this.findValidWords(variation.includedLetters)
      bestWord = null
      if (validWords.length > 0) {
        bestWord = this.getWordWithHighestScore(variation.includedLetters, validWords)
        topWords.push({ ...bestWord, playerLetters: variation.includedLetters, throwaway: variation.excludedLetter })
      }

      postMessage({ messageType: 'progress', data: { ...bestWord, playerLetters: variation.includedLetters, throwaway: variation.excludedLetter } })

    })

    const topWord = topWords.length > 0 ? topWords.sort((a, b) => {
      if (a.score < b.score) {
        return 1;
      }
      if (a.score > b.score) {
        return -1;
      }
  
      if (this.WORD_SCORES[a.throwaway] < this.WORD_SCORES[b.throwaway]) {
        return 1;
      }
      if (this.WORD_SCORES[a.throwaway] > this.WORD_SCORES[b.throwaway]) {
        return -1;
      }
      return 0;
    })[0] : null

    return topWord
  }

  findValidWords(letters) {
    if (letters.length > 10) {
      console.log('Too many letters')
      return
    }
    const combinations = this.getCombinations(letters)
    const allPermutations = this.getAllPermutations(combinations)
    const validWords = allPermutations.filter(perm => this.validWord(perm.join('')))
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
        letterGroups.push(groups)
      }
    }

    const filteredGroups = letterGroups.map(group => {
      const groupScore = group.reduce((total, wordScore) => total += wordScore.score, 0)
      const groupWords = group.map(wordScore => wordScore.word)
      return { words: groupWords, score: groupScore }

    })

    const topGroups = filteredGroups.sort(this.compareWordScores)

    const topWord = validWordsWithScore[0]

    if (topWord.score < topGroups[0]?.score)
      return topGroups[0]

    return { words: [topWord.word], score: topWord.score }
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
    word.forEach(letter => score += this.WORD_SCORES[letter])

    return score
  }

  validWord(word) {
    return word.length > 1 && this.binarySearch(this.WORD_LIST, this.convertPlaceHoldersToDoubleLetters(word))
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

  compareHandScores(a, b) {
    const scores = this
    console.log({a,b})
    console.log('hello?: ' + scores)
    if (a.score < b.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }

    // if (scores[a.throwaway] < scores[b.throwaway]) {
    //   return 1;
    // }
    // if (scores[a.throwaway] > scores[b.throwaway]) {
    //   return -1;
    // }
    return 0;
  }

  binarySearch(array, target) {
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex) {
      let middleIndex = Math.floor((startIndex + endIndex) / 2);
      if (target === array[middleIndex]) {
        return true
      }
      if (target > array[middleIndex]) {
        startIndex = middleIndex + 1;
      }
      if (target < array[middleIndex]) {
        endIndex = middleIndex - 1;
      }
      else {
      }
    }
    return false
  }
}
