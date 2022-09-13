<script lang="ts">
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
  let allCards: CardLetter[] = []
  let handWords: LetterGroup[] = []

  function search() {
    const wordFinder = new WordFinder(playerLetters, scrabbleWordList);

    hand = wordFinder.getPlayableHand();

    console.log({words: hand.words});
    console.log({allCards: hand.allCards()})
    console.log({loseCards: hand.playerCards.filter(card => card.status === CardStatus.LOSE)})
    console.log({playerCards: hand.playerCards})
    console.log("Hand score" + hand.totalScore());

    console.log({ hand });
    bestWordLetters = bestWord.words.join(WORD_DELIMITER);

   playerCards = hand.playerCards
   allCards = hand.allCards()
   handWords = hand.words

    setTimeout(() => {
      hand.setLoseCards()
      hand.setScoredWords()
      allCards = hand.allCards()
      playerCards = playerCards
      handWords = handWords
    }, 2000)
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

  <h3 class="text-3xl">All Cards</h3>
  <div class="flex gap-4 pt-12">
    {#if hand}
      {#each allCards.filter(card => card.status === CardStatus.PENDING) as card (card.id)}
        <LetterCard letter={card.character} score={card.score} />
      {/each}
    {/if}
  </div>

  <h3 class="text-3xl">Words</h3>
  <div class="flex gap-4 pt-12">
    {#if hand}
      {#each handWords as group}
        {#each group.word as card (card.id)}
          <LetterCard letter={card.character} score={card.score} />
        {/each}
        <div class="w-8" />
      {/each}
    {/if}
  </div>

  <h3 class="text-3xl">Throwaway</h3>
  <div class="flex gap-4 pt-12">
    {#if hand}
      <LetterCard
        letter={hand.throwaway.character}
        score={hand.throwaway.score}
      />
    {/if}
  </div>

  <h3 class="text-3xl">Lose</h3>
  <div class="flex gap-4 pt-12">
    {#if hand}
      {#each playerCards.filter(card => card.status === CardStatus.LOSE) as card (card.id)}
        <LetterCard letter={card.character} score={card.score} />
      {/each}
    {/if}
  </div>

  <code class="mt-20">
    {JSON.stringify(bestWord)}
  </code>

  <Counter />
</main>

<style>
</style>
