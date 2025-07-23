<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { fetchSheetData } from '$lib/utils/dataFetcher.js'; // <--- use dataFetcher!
  import { mapData } from '$lib/stores/data.js';
  import { writable } from 'svelte/store';

  // --- Add this block for debugging ---
  if (typeof window !== 'undefined') {
    mapData.subscribe(val => window._mapData = val);
  }
  // --- End debug block ---

  // Load all sheets—mimics what your old loadAllMetadata was doing, but robust
  async function loadAllMetadata() {
    const sheets = [
      "Events", "Bio_Composers", "Bio_Musicians", "Bio_Nonmusicians",
      "Locations", "Institutions", "Doc_Entries", "Archival_Docs",
      "Bibliography", "Headers", "Occasions"
    ];
    const metadata = {};
    await Promise.all(
      sheets.map(async (sheet) => {
        try {
          metadata[sheet] = await fetchSheetData(sheet);
        } catch (err) {
          console.error(`Failed to load ${sheet}:`, err);
          metadata[sheet] = [];
        }
      })
    );
    return metadata;
  }

  // State stores for loading and error handling
  const isLoading = writable(true);
  const error = writable(null);

  onMount(async () => {
    try {
      isLoading.set(true);
      const metadata = await loadAllMetadata();

      // LOG RAW event keys and first raw event BEFORE normalization
      if (metadata?.Events && metadata.Events.length > 0) {
        console.log("Raw event keys (before normalization):", Object.keys(metadata.Events[0]));
        console.log("First raw event:", metadata.Events[0]);
      }

      // Normalize event keys robustly after loading
      if (metadata?.Events) {
        function clean(s) { return typeof s === "string" ? s.replace(/^\uFEFF/, "").trim() : s; }
        function getField(o, ...names) {
          for (const key of names) {
            for (const k of Object.keys(o)) {
              if (
                k === key || clean(k) === clean(key) ||
                clean(k).toLowerCase() === clean(key).toLowerCase()
              ) return o[k];
            }
          }
          return undefined;
        }
        metadata.Events = metadata.Events.map(event => {
          const locid = event.LOCID || getField(
            event, "Location ID (LOC)", " Location ID (LOC)", "Location Id (LOC)"
          );
          const bioid = event.BIOID || getField(
            event, "Biography ID (BCO, BMU, BNO)",
            "Biography Musician (BMU) ID", "Biography Composer (BCO) ID", "Biography Nonmusician (BNO) ID"
          );
          const insid = event.INSID || getField(event, "Institution ID (INS)");
          return {
            ...event,
            LOCID: locid,
            BIOID: bioid,
            INSID: insid
          };
        });
        // Optional: log to verify
        console.log("First 3 normalized events:", metadata.Events.slice(0, 3));
      }

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

{#if $isLoading}
  <div class="loading">Loading...</div>
{:else if $error}
  <div class="error">{$error}</div>
{:else}
  <header></header>

  <main class="page-content">
    <div class="wrapper">
      <div class="filters-container">
        <slot name="filters" />
      </div>
      <div class="map-container">
        <slot name="map" />
      </div>
      <div class="slider-container">
        <slot name="slider" />
      </div>
      <slot />
    </div>
  </main>

  <footer></footer>
{/if}

<style>
  .loading,
  .error {
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
    height: calc(100vh - 100px);
  }

  .map-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }
  #map {
    pointer-events: auto;
  }
  .filters-container {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 6px;
    padding: 12px 18px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.09);
    min-width: 220px;
    user-select: auto;
    pointer-events: auto;
  }
  .slider-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    z-index: 2;
  }
  @media (max-width: 768px) {
    .filters-container { top: 10px; left: 5px; right: 5px; min-width: 0; width: calc(100% - 10px); padding: 8px 6px; }
    .slider-container { width: 98%; }
  }

  /* New style for the map container */
  .map-container {
    height: 40vh; /* 40% of the viewport height */
  }
</style>