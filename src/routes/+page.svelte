<script>
  import { onMount } from 'svelte';
  import { mapData, initializeData, lookupTables } from '$lib/stores/data.js';
  import { filters, updateDateRange, dateSliderMin, dateSliderMax } from '$lib/stores/filters.js';
  import { mapState, sidebarState, filteredEvents } from '$lib/stores/map.js';
  
  import Navbar from '$lib/components/Navigation/Navbar.svelte';
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
      await initializeData();
      dataLoaded = true;
      console.log('Data initialization complete');
      console.log('Events loaded:', $mapData.METADATA?.Events?.length || 0);
    } catch (error) {
      console.error('Error loading data:', error);
      loadingError = error.message;
    }
    
    mounted = true;
    
    if (dataLoaded) {
      updateDateRangeFromData();
      updateSliderBackground();
      loadMarkerFromURL();
    }
  });

  $: hasCriticalData = $mapData.METADATA?.Events && $mapData.METADATA?.Locations;
  $: hasFullData = hasCriticalData && $mapData.METADATA?.Bio_Composers && $mapData.METADATA?.Bio_Musicians;

  $: {
    console.log('=== Page Debug ===');
    console.log('mounted:', mounted);
    console.log('dataLoaded:', dataLoaded);
    console.log('loadingError:', loadingError);
    console.log('mapData.METADATA keys:', Object.keys($mapData.METADATA || {}));
    console.log('raw events count:', $mapData.METADATA?.Events?.length || 0);
    if ($filteredEvents && typeof $filteredEvents.length === 'number') {
        console.log('filteredEvents count:', $filteredEvents.length);
        } else {
        console.warn('filteredEvents not ready or not an array:', $filteredEvents);
    }
    console.log('sidebarState activeMarkers:', $sidebarState.activeMarkers?.length || 0);
    console.log('current filters:', $filters);
    console.log('==================');
  }

  function updateDateRangeFromData() {
    const events = $mapData.METADATA?.Events || [];
    if (events.length > 0) {
      let minYear = 9999;
      let maxYear = 0;
      
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
      
      if (minYear < maxYear && minYear !== 9999) {
        console.log('Setting date range from data:', minYear, '-', maxYear);
        console.log('Sample events from data:', events.slice(0, 3));
        
        dateSliderMin.set(minYear);
        dateSliderMax.set(maxYear);
        filters.update(f => ({
          ...f,
          dateRange: { min: minYear, max: maxYear }
        }));
      }
    }
  }

  function updateSliderBackground() {
    console.log('Slider background updated');
  }

  function loadMarkerFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let eventid = urlParams.get('eventid');
    
    if (eventid) {
      eventid = eventid.startsWith('EV:') ? eventid : `EV:${eventid}`;
      console.log('Loading marker for event:', eventid);
      
      const events = $mapData.METADATA?.Events || [];
      const targetEvent = events.find(event => event.EVID === eventid);
      
      if (targetEvent) {
        console.log('Found target event:', targetEvent);
        mapState.update(state => ({
          ...state,
          selectedMarker: targetEvent
        }));
        
        sidebarState.update(state => ({
          ...state,
          selectedEvent: targetEvent
        }));
      } else {
        console.warn('Event not found:', eventid);
      }
    }
  }

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

<Navbar />

{#if mounted}
  {#if loadingError}
    <div class="error-container">
      <h2>Error Loading Data</h2>
      <p>There was a problem loading the musical data:</p>
      <p class="error-message">{loadingError}</p>
      <button on:click={retryDataLoad} class="retry-button">
        Retry Loading Data
      </button>
    </div>
  {:else if hasCriticalData}
    <div class="landing-container">
      {#if !hasFullData}
        <div class="partial-loading-banner">
          <span>🔄 Loading additional features...</span>
        </div>
      {/if}
      
      <div class="banner-section">
        <div class="banner-content">
          <h2>Banner: about the project</h2>
          <p>This interactive map displays historical events related to musicians, composers, and other figures in music history from 1400-1600.</p>
        </div>
      </div>

      <div class="main-grid">
        <div class="left-column">
          <div class="search-section">
            <SearchBox />
          </div>
          
          <div class="filters-section">
            <PersonTypeFilter />
            <InstitutionFilter />
          </div>
          <div class="left-sidebar">
            <EventsList />
          </div>
        </div>

        <div class="map-area">
          <div class="map-wrapper">
            <MapContainer />
          </div>

          <div class="timeline-wrapper">
            <Histogram />
            <DateSlider />
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2>Loading Musical Renaissance Map...</h2>
        <div class="loading-details">
          <p>Critical data loaded: {hasCriticalData ? 'Yes' : 'No'}</p>
          <p>Component mounted: {mounted ? 'Yes' : 'No'}</p>
          <p>Metadata keys: {Object.keys($mapData.METADATA || {}).join(', ') || 'None yet'}</p>
          <p>Phase: {$mapData.isLoading ? 'Loading critical data (Events, Locations)...' : 'Ready for map rendering'}</p>
          {#if $mapData.isLoading}
            <p>⏳ Fetching essential data from Google Sheets...</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
{:else}
  <div class="loading-container">
    <div class="loading-content">
      <h2>Initializing Application...</h2>
    </div>
  </div>
{/if}

<style>
  :global(.wrapper) {
    position: static !important;
    height: auto !important;
  }

  :global(.map-container),
  :global(.filters-container),
  :global(.slider-container) {
    position: static !important;
    top: auto !important;
    left: auto !important;
    width: auto !important;
    height: auto !important;
    z-index: auto !important;
    transform: none !important;
  }

  :global(body) {
    font-family: 'Times New Roman', serif;
    margin: 0;
    padding: 0;
    background-color: #f9f7f4;
    height: 100vh;
  }

  :global(html) {
    height: 100vh;
  }

  :global(.histogram) {
  margin-top: 20px; /* Adjust this value as needed */
  }

  :global(.date-slider) {
    margin-top: 10px;
  }

  .landing-container {
    background-color: #f5f5f0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .banner-section {
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    margin: 0.4rem 0.75rem;
    padding: 1rem;
  }

  .banner-content h2 {
    margin: 0 0 0.5rem 0;
    color: #2c2c2c;
    font-size: 1.2rem;
  }

  .banner-content p {
    margin: 0;
    line-height: 1.4;
    color: #333;
    font-size: 0.9rem;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 0.5rem;
    margin: 0.1rem 0.75rem;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow: hidden;
  }

  .search-section {
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    padding: 0.5rem;
  }

  .filters-section {
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .left-sidebar {
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    display: flex;
    flex-direction: column;
    overflow: auto;
    flex: 1;
  }

  .map-area {
    background-color: #e8dcc0;
    border: 2px solid #8b7355;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .map-wrapper {
    position: relative;
    height: 65vh;
    overflow: hidden;
  }

  .timeline-wrapper {
  padding: 20px 0.5rem 0.5rem;
  background-color: #f0ede5;
  border-top: 1px solid #8b7355;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 25vh;
 }

  .partial-loading-banner {
    background: linear-gradient(90deg, #4CAF50, #45a049);
    color: white;
    padding: 0.25rem;
    text-align: center;
    font-size: 0.8rem;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
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

  @media (max-width: 1024px) {
    .main-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
  }

  @media (max-width: 768px) {
    .main-grid {
      margin: 0.25rem;
    }

    .banner-section {
      margin: 0.25rem;
      padding: 0.5rem;
    }

    .left-sidebar {
      max-height: 30vh;
    }

    .map-wrapper {
      height: 50vh;
    }
  }
</style>