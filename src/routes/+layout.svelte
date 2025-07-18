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

{#if isLoading}
  <div class="loading">Loading...</div>
{:else if error}
  <div class="error">{error}</div>
{:else}
  <header>
    <!-- Add your navigation component here -->
  </header>

  <main class="page-content">
    <div class="wrapper">
      <div class="map-container">
        <slot name="map" />
      </div>
      <div class="slider-container">
        <slot name="slider" />
      </div>
      <slot />
    </div>
  </main>

  <footer>
    <!-- Add your footer content here -->
  </footer>
{/if}

<style>
  .loading, .error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
  }

  .error {
    color: red;
  }

  .wrapper {
    position: relative;
    width: 100%;
    height: calc(100vh - 100px); /* Adjust based on your header and footer height */
  }

  .map-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .slider-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    z-index: 2;
  }
</style>
