<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/story-maps?filter=people', { replaceState: true });
  });
</script>

<svelte:head>
  <title>People - Mapping the Musical Renaissance</title>
</svelte:head>

<div class="loading-container">
  <p>Loading people...</p>
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
