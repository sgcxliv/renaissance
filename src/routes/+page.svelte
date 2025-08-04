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

  // Check if we have critical data for basic map functionality
  $: hasCriticalData = $mapData.METADATA?.Events && $mapData.METADATA?.Locations;
  $: hasFullData = hasCriticalData && $mapData.METADATA?.Bio_Composers && $mapData.METADATA?.Bio_Musicians;

  // Debug reactive statements
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
    // Get date range from actual data if available
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
      
      // Only update if we found valid years
      if (minYear < maxYear && minYear !== 9999) {
        console.log('Setting date range from data:', minYear, '-', maxYear);
        console.log('Sample events from data:', events.slice(0, 3));
        
        // Don't artificially constrain the date range - use actual data bounds
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

<Navbar />

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
  {:else if hasCriticalData}
    <!-- Main landing page - show map with critical data loaded -->
    <div class="landing-container">
      <!-- Show loading banner for background data -->
      {#if !hasFullData}
        <div class="partial-loading-banner">
          <span>🔄 Loading additional features...</span>
        </div>
      {/if}
      
      <!-- Banner Section -->
      <div class="banner-section">
        <div class="banner-content">
          <h2>Banner: about the project</h2>
          <p>This interactive map displays historical events related to musicians, composers, and other figures in music history from 1400-1600.</p>
        </div>
      </div>

      <!-- Search Bar Above Map (floating without container) -->
      <div class="search-section-main">
        <SearchBox />
      </div>

      <!-- Main Content Grid -->
      <div class="main-grid">
        <!-- Left Sidebar -->
        <div class="left-sidebar">
          <EventsList />
        </div>

        <!-- Main Map Area -->
        <div class="map-area">
          <!-- Map Container -->
          <div class="map-wrapper">
            <MapContainer />
            <!-- Current search note -->
            <div class="search-note">
              *current search bar only does a direct lookup (eg. France must mention the literal string "France", but in theory should return stuff related to all French cities, events, music, people, etc.
            </div>
          </div>

          <!-- Map Legend -->
          <div class="legend-wrapper">
            <h4>General Map legend:</h4>
            <div class="legend-items">
              <div class="legend-item">Transparency = Confidence in event</div>
              <div class="legend-item">Color = Composer/Musician/Non-Musician</div>
              <div class="legend-item">Shape = Political/Ecclesiastical/Other</div>
            </div>
          </div>

          <!-- Timeline Slider and Histogram -->
          <div class="timeline-wrapper">
            <Histogram />
            <DateSlider />
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Loading state -->
    <div class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2>Loading Musical Renaissance Map...</h2>
        <div class="loading-details">
          <p>📊 Critical data loaded: {hasCriticalData ? 'Yes' : 'No'}</p>
          <p>🔧 Component mounted: {mounted ? 'Yes' : 'No'}</p>
          <p>📁 Metadata keys: {Object.keys($mapData.METADATA || {}).join(', ') || 'None yet'}</p>
          <p>⚡ Phase: {$mapData.isLoading ? 'Loading critical data (Events, Locations)...' : 'Ready for map rendering'}</p>
          {#if $mapData.isLoading}
            <p>⏳ Fetching essential data from Google Sheets...</p>
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
  /* Override layout styles for landing page */
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

  /* Landing Page Styles */
  .landing-container {
    background-color: #f5f5f0;
    height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
  }

  .banner-section {
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    margin: 1rem;
    padding: 1.5rem;
  }

  .banner-content h2 {
    margin: 0 0 1rem 0;
    color: #2c2c2c;
    font-size: 1.3rem;
  }

  .banner-content p {
    margin: 0;
    line-height: 1.6;
    color: #333;
  }

  .search-section-main {
    margin: 0 1rem 1rem 1rem;
    /* Removed background-color, padding, border, and border-radius to let search bar float */
  }

  .main-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 0.5rem;
    margin: 0.75rem;
    flex: 1;
    min-height: 0;
  }

  /* Left Sidebar Styles */
  .left-sidebar {
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Map Area Styles */
  .map-area {
    background-color: #e8dcc0;
    border: 2px solid #8b7355;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  .map-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
    height: 70vh;
    overflow: visible;
  }

  .search-note {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 0.75rem;
    border: 1px solid #8b7355;
    border-radius: 4px;
    font-size: 0.8rem;
    line-height: 1.4;
    max-width: 300px;
    z-index: 1000;
  }

  .timeline-wrapper {
    padding: 0.75rem; /* Increased padding to center better */
    background-color: #f0ede5;
    border-top: 1px solid #8b7355;
    flex-shrink: 0;
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center; /* Center the timeline content */
    min-height: 120px; /* Ensure adequate space for the timeline */
  }

  .legend-wrapper {
    background-color: #f0ede5;
    padding: 0.75rem;
    border-top: 1px solid #8b7355;
    flex-shrink: 0;
    position: relative;
    z-index: 10;
  }

  .legend-wrapper h4 {
    margin: 0 0 0.75rem 0;
    color: #2c2c2c;
    font-size: 1rem;
  }

  .legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .legend-item {
    font-size: 0.9rem;
    color: #333;
  }

  /* Partial Loading Banner */
  .partial-loading-banner {
    background: linear-gradient(90deg, #4CAF50, #45a049);
    color: white;
    padding: 0.5rem;
    text-align: center;
    font-size: 0.9rem;
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

  /* Responsive Design */
  @media (max-width: 1024px) {
    .main-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .media-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .main-grid {
      margin: 0.5rem;
    }

    .banner-section {
      margin: 0.5rem;
      padding: 1rem;
    }

    .left-sidebar {
      padding: 0.75rem;
    }

    .search-note {
      position: static;
      margin-top: 1rem;
      max-width: none;
    }

    .legend-items {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
