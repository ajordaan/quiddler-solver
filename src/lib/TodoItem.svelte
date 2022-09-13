<script>
  export let todo;
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<label>
  <input type="checkbox" on:change={() => dispatch("mark")} />
  {todo.description}
  <button on:click={() => dispatch("remove")}>remove</button>
</label>
