<script>
  import { mapData, lookupTables } from '$lib/stores/data.js';
  import { filters } from '$lib/stores/filters.js';
  import { mapState, sidebarState, filteredEvents } from '$lib/stores/map.js';

  import MapContainer from '$lib/components/Map/MapContainer.svelte';
  import PersonTypeFilter from '$lib/components/Filters/PersonTypeFilter.svelte';
  import DateSlider from '$lib/components/Filters/DateSlider.svelte';
  import InstitutionFilter from '$lib/components/Filters/InstitutionFilter.svelte';
  import SearchBox from '$lib/components/Filters/SearchBox.svelte';
  import EventsList from '$lib/components/Sidebar/EventsList.svelte';
  import Histogram from '$lib/components/Timeline/Histogram.svelte';

  // If you want hardcoded some UI state for design, you can set:
  // let filters = {};
  // let filteredEvents = [];
  // let mapData = {};
  // let sidebarState = {};
</script>

<svelte:head>
  <title>Mapping the Musical Renaissance</title>
  <meta name="description" content="Interactive map of Renaissance music events and figures" />
</svelte:head>

<!-- NO loading logic, always render main UI! -->
<div class="container">
  <!-- Search and Filters Row -->
  <div class="filters-row">
    <SearchBox />
    <PersonTypeFilter />
    <InstitutionFilter />
  </div>

  <!-- Main Content Row -->
  <div class="content-wrapper">
    <div class="map-slider-container">
      <MapContainer />

      <div class="slider-container">
        <DateSlider />
      </div>
    </div>

    <!-- Sidebar -->
    <div id="sidebar">
      <EventsList />
    </div>
  </div>

  <!-- Histogram with debug info -->
  <div class="histogram-container">
    <div class="histogram-debug">
      <h4>Histogram Debug Info</h4>
      <div class="debug-grid">
        <div>
          <strong>Data Status:</strong><br>
          • Data Loaded: {'?'}<br>
          • Loading Error: {'?'}<br>
          • Mounted: {'?'}
        </div>
        <div>
          <strong>Event Counts:</strong><br>
          • Total Events in Data: {$mapData.METADATA?.Events?.length || 0}<br>
          • Filtered Events: {$filteredEvents?.length || 0}<br>
          • Active Markers: {$sidebarState.activeMarkers?.length || 0}
        </div>
        <div>
          <strong>Filter Status:</strong><br>
          • Show Composers: {$filters.showComposers ? '✅' : '❌'}<br>
          • Show Musicians: {$filters.showMusicians ? '✅' : '❌'}<br>
          • Show Non-Musicians: {$filters.showNonMusicians ? '✅' : '❌'}
        </div>
        <div>
          <strong>Date Range:</strong><br>
          • Min: {$filters.dateRange?.min || 'Not set'}<br>
          • Max: {$filters.dateRange?.max || 'Not set'}<br>
          • Search: "{$filters.searchText || 'None'}"
        </div>
      </div>

      {#if $filteredEvents?.length > 0}
        <details class="sample-data">
          <summary>Sample Event Data</summary>
          <pre>{JSON.stringify($filteredEvents[0], null, 2)}</pre>
        </details>
      {/if}
    </div>
    <Histogram />
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .filters-row {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
    align-items: center;
    flex-wrap: wrap;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }

  .content-wrapper {
    display: flex;
    width: 100%;
    height: calc(100vh - 350px);
  }

  .map-slider-container {
    position: relative;
    width: 75%;
    height: 100%;
  }

  .slider-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    z-index: 2;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  #sidebar {
    width: 25%;
    height: 100%;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    overflow-y: auto;
    border-left: 1px solid #dee2e6;
  }

  .histogram-container {
    width: 100%;
    margin-top: 20px;
    padding: 20px;
    background-color: #fff;
    border-top: 1px solid #dee2e6;
  }

  .histogram-debug {
    background: #f0f8ff;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .histogram-debug h4 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .debug-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    font-size: 14px;
  }

  .sample-data {
    margin-top: 10px;
  }

  .sample-data summary {
    cursor: pointer;
    font-weight: bold;
  }

  .sample-data pre {
    background: #f9f9f9;
    padding: 10px;
    overflow: auto;
    font-size: 11px;
    margin-top: 5px;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .loading-content {
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    backdrop-filter: blur(10px);
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-details {
    margin-top: 1rem;
    font-size: 14px;
    opacity: 0.9;
  }

  .loading-details p {
    margin: 0.5rem 0;
  }

  .error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 2rem;
    text-align: center;
    background: #f8f9fa;
  }

  .error-container h2 {
    color: #dc3545;
    margin-bottom: 1rem;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 5px;
    margin: 1rem 0;
    border: 1px solid #f5c6cb;
  }

  .retry-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: #0056b3;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .content-wrapper {
      flex-direction: column;
      height: auto;
    }
    
    .map-slider-container {
      width: 100%;
      height: 450px;
    }

    #sidebar {
      width: 100%;
      height: 300px;
      border-left: none;
      border-top: 1px solid #dee2e6;
    }
    
    .filters-row {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .slider-container {
      position: static;
      transform: none;
      width: 100%;
      margin-top: 20px;
      background: white;
    }
}
</style>
