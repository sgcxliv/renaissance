<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { loadAllMetadata } from '$lib/utils/api.js';
  import { mapData } from '$lib/stores/data.js';
  import { writable } from 'svelte/store';

  const isLoading = writable(true);
  const error = writable(null);

  onMount(async () => {
    console.log('onMount running!');
    try {
      isLoading.set(true);
      // temporarily comment out actual api call to see if store logic breaks
      // const metadata = await loadAllMetadata();
      // mapData.update(data => ({
      //   ...data,
      //   METADATA: metadata
      // }));
      isLoading.set(false);
      error.set(null);
    } catch (err) {
      console.error('Failed to load metadata:', err);
      error.set('Failed to load data. Please try again later.');
      isLoading.set(false);
    }
  });
</script>

//DEBUG BEFORE IF BLOCKS

{#if $isLoading}
  <div class="loading">Loading...</div>
{:else if $error}
  <div class="error">{$error}</div>
{:else}
  <div style="color: green;">BODY RENDERED</div>
{/if}
