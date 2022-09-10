<script>
  import svelteLogo from './assets/svelte.svg'
  import LetterCard from './lib/LetterCard.svelte'
  import scrabbleWordList from './scrabble_word_list.json'
  import WordFinder from './WordFinder'


  let letters = ''
let bestWord = {}

let bestWordLetters = ''

const WORD_SCORES = WordFinder.WORD_SCORES;

const WORD_DELIMITER = '$'

function search() {
  const wordFinder = new WordFinder(letters, scrabbleWordList)

  bestWord = wordFinder.getBestWords()
  bestWordLetters = bestWord.words.join(WORD_DELIMITER)
  
}


</script>

<main class="flex flex-col w-screen items-center justify-center">
  <h1 class="p-10 celtic-font text-4xl text-center leading-relaxed tracking-widest">quiddler solver</h1>

  <div class="flex flex-col w-1/3 [&>*]:m-3">
    <input class="h-10 rounded" bind:value={letters}>
    <button class="inline-block px-4 py-3
    text-sm font-semibold text-center
    text-white uppercase transition
    duration-200 ease-in-out bg-indigo-600 
    rounded-md cursor-pointer
    hover:bg-indigo-700" on:click={search}>
      Find Words
    </button>
  </div>

  
<div class="flex gap-4 pt-12">
  {#each bestWordLetters as l}
  {#if l !== WORD_DELIMITER}
  <LetterCard letter={l} score={WORD_SCORES[l]}></LetterCard>
	
  {:else}
   <div class="w-8"></div>
{/if}
  
{/each}

</div>

<code class="mt-20">
  {JSON.stringify(bestWord)}
</code>


</main>

<style>

</style>
