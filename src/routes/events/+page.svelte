<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/story-maps?filter=events', { replaceState: true });
  });
</script>

<svelte:head>
  <title>Events - Mapping the Musical Renaissance</title>
</svelte:head>

<div class="loading-container">
  <p>Loading events...</p>
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
