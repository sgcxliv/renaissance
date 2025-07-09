<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { loadAllMetadata } from '$lib/utils/api.js';
  import { mapData } from '$lib/stores/data.js';

  onMount(async () => {
    try {
      const metadata = await loadAllMetadata();
      mapData.update(data => ({
        ...data,
        METADATA: metadata
      }));
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  });
</script>

<main class="page-content">
  <div class="wrapper">
    <slot />
  </div>
</main>
