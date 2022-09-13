<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 4000),

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
  import type Hand from "./Hand";

  import Counter from "./lib/Counter.svelte";
  import LetterCard from "./lib/LetterCard.svelte";
  import scrabbleWordList from "./scrabble_word_list.json";
  import { CardLetter, CardStatus, LetterGroup } from "./types";
  import WordFinder from "./WordFinder";

  let bestWord = { words: [] };

  let bestWordLetters = "";

  const WORD_SCORES = WordFinder.WORD_SCORES;

  const WORD_DELIMITER = "$";

  let playerLetters = "";
  let hand: Hand = null;
  let playerCards: CardLetter[] = [];
  let allCards: CardLetter[] = [];
  let handWords: LetterGroup[] = [];

  function search() {
    const wordFinder = new WordFinder(playerLetters, scrabbleWordList);

    hand = wordFinder.getPlayableHand();

    console.log({ words: hand.words });
    console.log({ allCards: hand.allCards() });
    console.log({
      loseCards: hand.playerCards.filter(
        (card) => card.status === CardStatus.LOSE
      ),
    });
    console.log({ playerCards: hand.playerCards });
    console.log("Hand score" + hand.totalScore());

    console.log({ hand });
    bestWordLetters = bestWord.words.join(WORD_DELIMITER);

    playerCards = hand.playerCards;
    allCards = hand.allCards();
    handWords = hand.words;

    setTimeout(() => {
      hand.setLoseCards();
      hand.setScoredWords();
      allCards = hand.allCards();
      playerCards = playerCards;
      handWords = handWords;
    }, 2000);
  }

  // // function loseCardsTest(words) {
  // //   console.log('set lose cards')
  // //   let remainingCards = [...playerCards]
  // //   words.forEach(letterGroup => {
  // //     letterGroup.word.forEach(card => {
  // //       const index = remainingCards.findIndex(rc => rc.character === card.character)
  // //       index > -1 && remainingCards.splice(index, 1)
  // //     })
  // //   })

  //   playerCards.forEach(card => {
  //     const index = remainingCards.findIndex(rc => rc.character === card.character)

  //     if(index > -1) {
  //       card.status = CardStatus.LOSE
  //       remainingCards.splice(index, 1)
  //     }
  //   })

  //   playerCards = playerCards;
  // }
</script>

<main class="flex flex-col w-screen items-center justify-center">
  <h1
    class="p-10 celtic-font text-4xl text-center leading-relaxed tracking-widest"
  >
    quiddler solver
  </h1>

  <div class="flex flex-col w-1/3 [&>*]:m-3">
    <input class="h-14 rounded text-3xl" bind:value={playerLetters} />
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
      {#each allCards.filter((card) => card.status === CardStatus.PENDING) as card (card.id)}
        <div
          in:receive={{ key: card.id }}
          out:send={{ key: card.id }}
          animate:flip="{{duration: (d) => d * 2000 }}"
        >
          <LetterCard letter={card.character} score={card.score} />
        </div>
      {/each}
    {/if}
  </div>

  <div class="flex gap-4 pt-12">
    {#if hand}
      {#each handWords as group}
        {#each group.word as card (card.id)}
          <div
            in:receive={{ key: card.id }}
            out:send={{ key: card.id }}
            animate:flip="{{duration: (d) => d * 2000 }}"
          >
            <LetterCard letter={card.character} score={card.score} />
          </div>
        {/each}
        <div class="w-8" />
      {/each}
    {/if}
  </div>

  <!-- <h3 class="text-3xl">Throwaway</h3>
  <div class="flex gap-4 pt-12">
    {#if hand}
      <LetterCard
        letter={hand.throwaway.character}
        score={hand.throwaway.score}
      />
    {/if}
  </div> -->

  <h3 class="text-3xl">Lose</h3>
  <div class="flex gap-4 pt-12">
    {#if hand}
      {#each playerCards.filter((card) => card.status === CardStatus.LOSE) as card (card.id)}
        <div
          in:receive={{ key: card.id }}
          out:send={{ key: card.id }}
          animate:flip="{{duration: (d) => d * 2000 }}"
        >
          <LetterCard letter={card.character} score={card.score} />
        </div>
      {/each}
    {/if}
  </div>

  <code class="mt-20">
    {JSON.stringify(bestWord)}
  </code>

  <Counter />

  <div class="mb-32" />
</main>

<style>
</style>
