<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/story-maps?filter=places', { replaceState: true });
  });
</script>

<svelte:head>
  <title>Places - Mapping the Musical Renaissance</title>
</svelte:head>

<div class="loading-container">
  <p>Loading places...</p>
</div>

<style>
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    font-family: 'Times New Roman', serif;
  }
</style>
