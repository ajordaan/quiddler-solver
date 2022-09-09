<script>
  export let letter;
  export let score;
</script>

<div
  class="flex flex-col justify-between h-52 w-36 bg-white rounded-sm text-black"
>
  <div class="flex flex-col p-1 uppercase card-letter-font">
    <span class="text-2xl">{letter}</span>
    <span class="pl-1">{score}</span>
  </div>
  <span class="text-center uppercase card-center-letter pt-6 pl-1 pr-1">{letter}</span>
  <div class="flex flex-col rotate-180 p-1 uppercase card-letter-font">
    <span class="text-2xl">{letter}</span>
    <span class="pl-1">{score}</span>
  </div>
</div>
