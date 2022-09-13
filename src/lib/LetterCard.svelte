<script>
  export let letter;
  export let score;

  let largeLetters = ['z', 'w']
</script>

<div
  class="flex flex-col justify-between h-44 w-28 bg-white rounded-sm text-black shadow-2xl"
>
  <div class="flex flex-col uppercase card-letter-font">
    <span class="text-2xl p-1 pb-0">{letter}</span>
    <span class="pl-1">{score}</span>
  </div>
  <span class="text-center uppercase card-center-letter pt-6 pl-1 pr-1" class:card-center-letter--smaller="{largeLetters.includes(letter)}">{letter}</span>
  <div class="flex flex-col rotate-180 uppercase card-letter-font">
    <span class="text-2xl p-1 pb-0">{letter}</span>
    <span class="pl-1">{score}</span>
  </div>
</div>
