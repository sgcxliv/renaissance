<script>
  import { onMount } from 'svelte';
  import { mapData, initializeData, lookupTables } from '$lib/stores/data.js';
  import { filters, updateDateRange } from '$lib/stores/filters.js';
  import { mapState, sidebarState, filteredEvents } from '$lib/stores/map.js';
  
  import MapContainer from '$lib/components/Map/MapContainer.svelte';
  import PersonTypeFilter from '$lib/components/Filters/PersonTypeFilter.svelte';
  import DateSlider from '$lib/components/Filters/DateSlider.svelte';
  import InstitutionFilter from '$lib/components/Filters/InstitutionFilter.svelte';
  import SearchBox from '$lib/components/Filters/SearchBox.svelte';
  import EventsList from '$lib/components/Sidebar/EventsList.svelte';
  import Histogram from '$lib/components/Timeline/Histogram.svelte';

  let mounted = false;
  let dataLoaded = false;
  let loadingError = null;

  onMount(async () => {
    console.log('Page mounting, initializing data...');
    
    try {
      // Initialize data first
      await initializeData();
      dataLoaded = true;
      console.log('Data initialization complete');
      console.log('Events loaded:', $mapData.METADATA?.Events?.length || 0);
    } catch (error) {
      console.error('Error loading data:', error);
      loadingError = error.message;
    }
    
    mounted = true;
    
    // Initialize other components after data is loaded
    if (dataLoaded) {
      updateDateRangeFromData();
      updateSliderBackground();
      loadMarkerFromURL();
    }
  });

  // Debug reactive statements
  $: {
    console.log('=== Page Debug ===');
    console.log('mounted:', mounted);
    console.log('dataLoaded:', dataLoaded);
    console.log('loadingError:', loadingError);
    console.log('mapData.METADATA keys:', Object.keys($mapData.METADATA || {}));
    console.log('raw events count:', $mapData.METADATA?.Events?.length || 0);
    console.log('filteredEvents count:', $filteredEvents?.length || 0);
    console.log('sidebarState activeMarkers:', $sidebarState.activeMarkers?.length || 0);
    console.log('current filters:', $filters);
    console.log('==================');
  }

  function updateDateRangeFromData() {
    // Get date range from actual data if available
    const events = $mapData.METADATA?.Events || [];
    if (events.length > 0) {
      let minYear = 1600;
      let maxYear = 1400;
      
      events.forEach(event => {
        const eyear = parseInt(event.EYEAR);
        const lyear = parseInt(event.LYEAR);
        
        if (!isNaN(eyear)) {
          minYear = Math.min(minYear, eyear);
          maxYear = Math.max(maxYear, eyear);
        }
        if (!isNaN(lyear)) {
          minYear = Math.min(minYear, lyear);
          maxYear = Math.max(maxYear, lyear);
        }
      });
      
      // Only update if we found valid years
      if (minYear < maxYear) {
        console.log('Setting date range from data:', minYear, '-', maxYear);
        filters.update(f => ({
          ...f,
          dateRange: { min: minYear, max: maxYear }
        }));
      }
    }
  }

  function updateSliderBackground() {
    // Implementation for slider background updates
    console.log('Slider background updated');
    // This would typically update visual elements of the date slider
  }

  function loadMarkerFromURL() {
    // Load specific marker if eventid is in URL
    const urlParams = new URLSearchParams(window.location.search);
    let eventid = urlParams.get('eventid');
    
    if (eventid) {
      eventid = eventid.startsWith('EV:') ? eventid : `EV:${eventid}`;
      console.log('Loading marker for event:', eventid);
      
      // Find the event in the data
      const events = $mapData.METADATA?.Events || [];
      const targetEvent = events.find(event => event.EVID === eventid);
      
      if (targetEvent) {
        console.log('Found target event:', targetEvent);
        // Update map state to focus on this event
        mapState.update(state => ({
          ...state,
          selectedMarker: targetEvent
        }));
        
        // You might also want to update the sidebar to show this event
        sidebarState.update(state => ({
          ...state,
          selectedEvent: targetEvent
        }));
      } else {
        console.warn('Event not found:', eventid);
      }
    }
  }

  // Helper function to retry data loading
  async function retryDataLoad() {
    loadingError = null;
    dataLoaded = false;
    
    try {
      await initializeData();
      dataLoaded = true;
      updateDateRangeFromData();
    } catch (error) {
      console.error('Retry failed:', error);
      loadingError = error.message;
    }
  }
</script>

<svelte:head>
  <title>Mapping the Musical Renaissance</title>
  <meta name="description" content="Interactive map of Renaissance music events and figures" />
</svelte:head>

{#if mounted}
  {#if loadingError}
    <!-- Error state -->
    <div class="error-container">
      <h2>Error Loading Data</h2>
      <p>There was a problem loading the musical data:</p>
      <p class="error-message">{loadingError}</p>
      <button on:click={retryDataLoad} class="retry-button">
        Retry Loading Data
      </button>
    </div>
  {:else if dataLoaded}
    <!-- Main application -->
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

      <!-- Histogram with comprehensive debug info -->
      <div class="histogram-container">
        <div class="histogram-debug">
          <h4>Histogram Debug Info</h4>
          <div class="debug-grid">
            <div>
              <strong>Data Status:</strong><br>
              • Data Loaded: {dataLoaded ? '✅ Yes' : '❌ No'}<br>
              • Loading Error: {loadingError || 'None'}<br>
              • Mounted: {mounted ? '✅ Yes' : '❌ No'}
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
  {:else}
    <!-- Loading state -->
    <div class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2>Loading Musical Renaissance Map...</h2>
        <div class="loading-details">
          <p>📊 Data loaded: {dataLoaded ? 'Yes' : 'No'}</p>
          <p>🔧 Component mounted: {mounted ? 'Yes' : 'No'}</p>
          <p>📁 Metadata keys: {Object.keys($mapData.METADATA || {}).join(', ') || 'None yet'}</p>
          {#if $mapData.isLoading}
            <p>⏳ Fetching data from Google Sheets...</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
{:else}
  <!-- Initial mounting state -->
  <div class="loading-container">
    <div class="loading-content">
      <h2>Initializing Application...</h2>
    </div>
  </div>
{/if}

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
