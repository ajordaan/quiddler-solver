<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import Hand from "./Hand";
  import LetterCard from "./lib/LetterCard.svelte";
  import scrabbleWordList from "./scrabble_word_list.json";
  import { CardLetter, CardStatus, LetterGroup } from "./types";
  import WordFinder from "./WordFinder";

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
  let loading = false;
  let wordFinder = null;
  let transitionedCount;

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
    playerCards = playerCards;
    handWords = handWords;
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
      class=" inline-block h-full w-full px-4 py-4
    text-sm font-semibold text-center
    text-white uppercase bg-indigo-600 
    rounded-md cursor-pointer
    hover:bg-indigo-700"
      on:click={search}
    >
      {#if loading}
        <span class="loader" />
      {:else}
        Find Words
      {/if}
    </button>
  </div>

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
    <h3 class="text-3xl card-letter-font w-full text-center">Words</h3>
    <div
      class="flex w-full justify-between md:justify-center flex-wrap gap-8 pb-10"
    >
      {#each handWords as group}
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
      {/each}
    </div>
    <h3 class="text-3xl card-letter-font w-full text-center">Throwaway</h3>
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
    <h3 class="text-3xl card-letter-font w-full text-center">Lose</h3>
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
