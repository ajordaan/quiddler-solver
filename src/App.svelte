<script lang="ts">
import type Hand from "./Hand";

  import Counter from "./lib/Counter.svelte";
  import LetterCard from "./lib/LetterCard.svelte";
  import scrabbleWordList from "./scrabble_word_list.json";
  import type { CardLetter } from "./types";
  import WordFinder from "./WordFinder";

  let bestWord = { words: [] };

  let bestWordLetters = "";

  const WORD_SCORES = WordFinder.WORD_SCORES;

  const WORD_DELIMITER = "$";

  let playerLetters = "";
  let hand: Hand = null;
  let playerCards: CardLetter[] = [];

  function search() {
    const wordFinder = new WordFinder(playerLetters, scrabbleWordList);

    hand = wordFinder.getPlayableHand();

    console.log("Hand words: " + JSON.stringify(hand.words));
    console.log("Hand score" + hand.totalScore());

    console.log({ hand });
    bestWordLetters = bestWord.words.join(WORD_DELIMITER);
    let id = 1;

    console.log({ playerCards });
    //playerCards = bestWordLetters.map
  }
</script>

<main class="flex flex-col w-screen items-center justify-center">
  <h1
    class="p-10 celtic-font text-4xl text-center leading-relaxed tracking-widest"
  >
    quiddler solver
  </h1>

  <div class="flex flex-col w-1/3 [&>*]:m-3">
    <input class="h-10 rounded" bind:value={playerLetters} />
    <button
      class="inline-block px-4 py-3
    text-sm font-semibold text-center
    text-white uppercase transition
    duration-200 ease-in-out bg-indigo-600 
    rounded-md cursor-pointer
    hover:bg-indigo-700"
      on:click={search}
    >
      Find Words
    </button>
  </div>

  <div class="flex gap-4 pt-12">
    {#if hand}
      {#each hand.words[0].word as group (group.id)}
        {#if group.character !== WORD_DELIMITER}
          <LetterCard letter={group.character} score={group.score} />
        {:else}
          <div class="w-8" />
        {/if}
      {/each}
    {/if}
  </div>

  <h3 class="text-lg">Throwaway</h3>
  <div class="flex gap-4 pt-12">
    {#if hand}
    <LetterCard letter={hand.throwaway.character} score={hand.throwaway.character} />
    {/if}
  </div>

  
  <code class="mt-20">
    {JSON.stringify(bestWord)}
  </code>

  <Counter />
</main>

<style>
</style>
