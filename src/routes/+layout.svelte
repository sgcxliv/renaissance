<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { loadAllMetadata } from '$lib/utils/api.js';
  import { mapData } from '$lib/stores/data.js';
  import { writable } from 'svelte/store';

  const isLoading = writable(true);
  const error = writable(null);

  onMount(async () => {
    try {
      isLoading.set(true);
      const metadata = await loadAllMetadata();
      mapData.update(data => ({
        ...data,
        METADATA: metadata
      }));
    } catch (err) {
      console.error('Failed to load metadata:', err);
      error.set('Failed to load data. Please try again later.');
    } finally {
      isLoading.set(false);
    }
  });
</script>
