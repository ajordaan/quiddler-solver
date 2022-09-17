<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { crossfade, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import Hand from "./Hand";
  import LetterCard from "./lib/LetterCard.svelte";
  import scrabbleWordList from "./scrabble_word_list.json";
  import { CardLetter, CardStatus, LetterGroup } from "./types";
  import WordFinder from "./WordFinder";
  import WordDictionary from "./WordDictionary";

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 3000),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  let playerLetters = "";
  let hand: Hand = null;
  let playerCards: CardLetter[] = [];
  let handWords: LetterGroup[] = [];
  let wordFound = false;
  let loading = false;
  let timeoutLength = 2000;
  let scoreString = "";
  let wordFinder = null;
  let transitionedCount = 0;

  let wordDictionary = new WordDictionary()

  async function search() {
    transitionedCount = 0;
    loading = true;
    hand = null;
    playerCards = [];
    handWords = [];

    wordFinder = new WordFinder(playerLetters, scrabbleWordList);
    hand = new Hand(playerLetters, WordFinder.WORD_SCORES);

    playerCards = hand.playerCards;
    console.log(playerCards);
    handWords = hand.words;

    if(transitionedCount < playerCards.length) {
      setTimeout(getWords, 2000)
    }
    else {
      getWords()
    }
  }

  function getWords() {
    const info = wordFinder.getPlayableHandInfo();

    hand.setThrowAwayCard(info.throwaway);
    hand.setScoredWords(info.words);
    hand.setLoseCards();
    loading = false;
    scoreString =
          hand.loseScore === 0
            ? hand.totalScore + ""
            : `${hand.wordScore} - ${hand.loseScore} = ${hand.totalScore}`;
    playerCards = playerCards;
    handWords = handWords;
    wordFound = true
  }

  function clear() {
    playerLetters = "";
    hand = null;
    playerCards = [];
    handWords = [];
    wordFound = false;
  }
</script>

<main class="flex flex-col p-8 w-screen items-center justify-center">
  <h1
    class="p-10 celtic-font text-4xl text-center leading-relaxed tracking-widest"
  >
    quiddler solver
  </h1>

  <div class="flex flex-col items-center justify-center lg:w-1/3 [&>*]:m-3">
    <input class="h-14 rounded text-3xl" bind:value={playerLetters} />
    <button
      class="block px-4 py-3
    text-sm font-semibold 
    text-white uppercase transition
    duration-200 ease-in-out bg-indigo-600 
    rounded-md cursor-pointer
    hover:bg-indigo-700"
      on:click={search}
    >
      {#if loading}
        <span class="flex justify-center">
          <svg
            aria-hidden="true"
            class="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-white"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </span>
      {:else}
        Find Words
      {/if}
    </button>
  </div>

  {#if wordFound}
    <h3 in:fade class="pt-4 text-5xl card-letter-font w-full text-center">
      {scoreString}
    </h3>
  {/if}
  <div class="flex gap-4 pt-12 flex-wrap w-full justify-center">
    {#if hand}
      {#each playerCards.filter((card) => card.status === CardStatus.PENDING) as card (card.id)}
        <div
          in:receive={{ key: card.id }}
          out:send={{ key: card.id }}
          animate:flip={{ duration: (d) => d * 2000 }}
          on:introend={() => transitionedCount++}
        >
          <LetterCard letter={card.character} score={card.score} />
        </div>
      {/each}
    {/if}
  </div>

  <div class="flex justify-center flex-wrap gap-2 pb-12">
    {#if wordFound}
      <h3 in:fade class="text-3xl card-letter-font w-full text-center">
        Words {hand.loseScore > 0 ? `(${hand.wordScore})` : ""}
      </h3>
    {/if}
    <div
      class="flex w-full justify-between md:justify-center flex-wrap gap-12 pb-10"
    >
      {#each handWords as group}
        <div class="">
          <div class="flex gap-2 flex-col md:flex-row">
            {#each group.word as card (card.id)}
              <div
                in:receive={{ key: card.id }}
                out:send={{ key: card.id }}
                animate:flip={{ duration: (d) => d * 2000 }}
              >
                <LetterCard letter={card.character} score={card.score} />
              </div>
            {/each}
          </div>
          {#await wordDictionary.defineWord(group.word) then definition}
          <p style={`width: ${7 * group.word.length}rem`} class="pt-2" transition:fade>{definition}</p>
          {/await}
        </div>
      {/each}
    </div>
    {#if wordFound}
      <h3 in:fade class="text-3xl card-letter-font w-full text-center">
        Throwaway
      </h3>
    {/if}
    <div class="flex justify-center gap-4 pb-10">
      {#each playerCards.filter((card) => card.status === CardStatus.THROWAWAY) as card (card.id)}
        <div
          in:receive={{ key: card.id }}
          out:send={{ key: card.id }}
          animate:flip={{ duration: (d) => d * 2000 }}
        >
          <LetterCard letter={card.character} score={card.score} />
        </div>
      {/each}
    </div>
    {#if wordFound && hand.loseScore > 0}
      <h3 in:fade class="text-3xl card-letter-font w-full text-center">
        Lose ({hand.loseScore})
      </h3>
    {/if}
    <div class="flex gap-4 flex-wrap w-full justify-center pb-10">
      {#each playerCards.filter((card) => card.status === CardStatus.LOSE) as card (card.id)}
        <div
          in:receive={{ key: card.id }}
          out:send={{ key: card.id }}
          animate:flip={{ duration: (d) => d * 2000 }}
        >
          <LetterCard letter={card.character} score={card.score} />
        </div>
      {/each}
    </div>
  </div>
</main>

<style>
</style>
