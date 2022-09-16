
import { CardLetter} from "./types";
export default class WordDictionary {
  API_KEY = ''

  constructor() {
    this.API_KEY = this.apiKey
  }

  get apiKey() {
    const key = "68d3fc08-d7f2-4109-8335-eda6a2c0cd25"
    const parts = key.split('-')
    return `${parts[0]}-${parts[1]}-${parts[2]}-${Array.from(parts[3]).reduce((prev, next) => prev += (parseInt(next) + 1), '')}-${parts[4]} `
  }

  definitionUrl(word) {

    return `https://dictionaryapi.com/api/v3/references/collegiate/json/${encodeURI(word)}?key=${this.API_KEY}`.trim()
  }

  async defineWord(letters: CardLetter[]) {
    
    const word = letters.reduce((str, card) => str += card.character, '' )
    
    const url = this.definitionUrl(word)
console.log({url})
    const res = await fetch(url)
    const json = await res.json()
console.log({json})

const entry = json.find(ent => ent.shortdef && ent.shortdef.length > 0 )

    if(entry ) {
      return entry.shortdef[0]
    }
    else {
      console.log('Could not find definition, maybe try one of these words:' )
      console.log({similarWords: json})
    }

    return ''

  }
}
