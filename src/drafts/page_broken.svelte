<script>
  import { onMount } from 'svelte';
  import { mapData, initializeData, lookupTables } from '$lib/stores/data.js';
  import { filters, updateDateRange } from '$lib/stores/filters.js';
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
  {:else if dataLoaded}
    <!-- Main landing page -->
    <div class="landing-container">
      <!-- Banner Section -->
      <div class="banner-section">
        <div class="banner-content">
          <h2>Banner: about the project</h2>
          <p>This interactive map displays historical events related to musicians, composers, and other figures in music history from 1400-1600.</p>
        </div>
      </div>

      <!-- Search Bar Above Map -->
      <div class="search-section-main">
        <SearchBox />
      </div>

      <!-- Main Content Grid -->
      <div class="main-grid">
        <!-- Left Sidebar -->
        <div class="left-sidebar">
          <!-- Events List at Rest -->
          <div class="events-list-section">
            <EventsList />
          </div>

          <!-- About/Source Tabs - Only show when item selected -->
          <div class="info-tabs" class:hidden={!$sidebarState.selectedEvent}>
          <!-- About/Source Tabs - Only show when item selected -->
          <div class="info-tabs" class:hidden={!$sidebarState.selectedEvent}>
            <div class="tab-buttons">
              <button class="tab-btn active">About</button>
              <button class="tab-btn">Source</button>
            </div>
            <div class="tab-note">
              Two tabs: source has images of primary-source documents
            </div>
          </div>

          <!-- Selected Item Details - Only show when item selected -->
          {#if $sidebarState.selectedEvent}
            <!-- Pop-up Info -->
            <div class="popup-section">
              <div class="popup-header">
                {$sidebarState.selectedEvent.personInfo?.name || 'Selected Event'}
              </div>
            </div>

            <!-- Media Sections - Only show if media exists -->
            {#if $sidebarState.selectedEvent.hasMedia}
              <div class="media-grid">
                <div class="picture-section">
                  <h4>Picture of figure/video</h4>
                  <p>Clicking the image/video enlarges it to full-screen</p>
                </div>
                
                <div class="short-blurb">
                  <p><em>{$sidebarState.selectedEvent.EINFO || 'Short description...'}</em></p>
                  <div class="story-link">link to full story map page if there is one</div>
                </div>
              </div>
            {:else}
              <!-- Just the blurb when no media -->
              <div class="short-blurb">
                <p><em>{$sidebarState.selectedEvent.EINFO || 'Short description...'}</em></p>
                <div class="story-link">link to full story map page if there is one</div>
              </div>
            {/if}

            <!-- Audio Element - Only show if audio exists -->
            {#if $sidebarState.selectedEvent.hasAudio}
              <div class="audio-section">
                <h4>Audio element</h4>
                <div class="audio-controls">
                  <button class="audio-btn">◀</button>
                  <button class="audio-btn play-btn">▶</button>
                  <button class="audio-btn">▶▶</button>
                </div>
              </div>
            {/if}

            <!-- Related Events -->
            <div class="related-section">
              <h4>Related Events/Suggestions:</h4>
              <div class="suggestions">
                <div class="suggestion-category">
                  <strong>Want to learn more:</strong>
                  <div class="suggestion-item">Person 1 (Direct link to pop up)</div>
                  <div class="suggestion-item">Event 1 (Direct link to pop up)</div>
                  <div class="suggestion-item">Place 1 (Direct link to pop up)</div>
                </div>
              </div>
            </div>
          {/if}
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

          <!-- Timeline Slider -->
          <div class="timeline-wrapper">
            <DateSlider />
          </div>

          <!-- Metadata Bar - Moved below map -->
          <div class="metadata-bar">
            <span class="metadata-text">
              Metadata: {$sidebarState.totalEvents || 0} Events visible, 
              {$filters.dateRange?.min || 1400} - {$filters.dateRange?.max || 1600} period selected
            </span>
            <div class="zoom-controls">
              <span>Zoom in<br>out/map<br>controls</span>
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
    background-color: #d4c4a0;
    padding: 0.75rem;
    margin: 0 1rem 1rem 1rem;
    border: 2px solid #8b7355;
    border-radius: 4px;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    margin: 1rem;
    flex: 1;
    min-height: 0;
  }

  /* Left Sidebar Styles */
  .left-sidebar {
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
  }

  .events-list-section {
    background-color: white;
    border: 1px solid #8b7355;
    border-radius: 4px;
    flex: 1;
    overflow-y: auto;
  }

  .hidden {
    display: none;
  }

  .search-section {
    background-color: #d4c4a0;
    padding: 0.75rem;
    border: 1px solid #8b7355;
    border-radius: 4px;
  }

  .info-tabs {
    background-color: white;
    border: 1px solid #8b7355;
    border-radius: 4px;
  }

  .tab-buttons {
    display: flex;
    border-bottom: 1px solid #8b7355;
  }

  .tab-btn {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background-color: #f5f5f0;
    cursor: pointer;
    border-right: 1px solid #8b7355;
  }

  .tab-btn:last-child {
    border-right: none;
  }

  .tab-btn.active {
    background-color: #8b4513;
    color: white;
  }

  .tab-note {
    padding: 0.75rem;
    font-size: 0.85rem;
    color: #555;
  }

  .popup-section {
    background-color: #e8dcc0;
    border: 1px solid #8b7355;
    padding: 0.75rem;
    border-radius: 4px;
  }

  .popup-header {
    font-weight: bold;
    color: #2c2c2c;
    text-align: center;
  }

  .media-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .picture-section {
    background-color: white;
    border: 1px solid #8b7355;
    padding: 0.75rem;
    border-radius: 4px;
    text-align: center;
  }

  .picture-section h4 {
    margin: 0 0 0.5rem 0;
    color: #2c2c2c;
    font-size: 1rem;
  }

  .picture-section p {
    margin: 0;
    font-size: 0.8rem;
    color: #555;
    line-height: 1.4;
  }

  .short-blurb {
    background-color: white;
    border: 1px solid #8b7355;
    padding: 0.75rem;
    border-radius: 4px;
  }

  .short-blurb p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    line-height: 1.4;
    color: #333;
  }

  .story-link {
    font-size: 0.8rem;
    color: #0066cc;
    text-decoration: underline;
    cursor: pointer;
  }

  .audio-section {
    background-color: white;
    border: 1px solid #8b7355;
    padding: 0.75rem;
    border-radius: 4px;
  }

  .audio-section h4 {
    margin: 0 0 0.5rem 0;
    color: #2c2c2c;
    font-size: 1rem;
  }

  .audio-controls {
    display: flex;
    justify-content: center;
    gap: 0.25rem;
    background-color: #8b4513;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .audio-btn {
    background: white;
    border: 1px solid #333;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .play-btn {
    background-color: #f0f0f0;
  }

  .related-section {
    background-color: white;
    border: 1px solid #8b7355;
    padding: 0.75rem;
    border-radius: 4px;
  }

  .related-section h4 {
    margin: 0 0 0.75rem 0;
    color: #2c2c2c;
    font-size: 1rem;
  }

  .suggestion-category {
    margin-bottom: 0.5rem;
  }

  .suggestion-item {
    margin-left: 1rem;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
    color: #0066cc;
    cursor: pointer;
    text-decoration: underline;
  }

  /* Map Area Styles */
  .map-area {
    background-color: #e8dcc0;
    border: 2px solid #8b7355;
    display: flex;
    flex-direction: column;
    overflow: visible; /* Allow child elements to extend beyond */
  }

  .metadata-bar {
    background-color: #d4c4a0;
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #8b7355;
  }

  .metadata-text {
    font-weight: bold;
    color: #2c2c2c;
  }

  .zoom-controls {
    background-color: white;
    border: 1px solid #333;
    padding: 0.5rem;
    font-size: 0.7rem;
    line-height: 1.2;
    text-align: center;
    min-width: 80px;
  }

  .map-wrapper {
    position: relative;
    flex: 1;
    min-height: 0; /* Allow flex to shrink */
    height: 70vh; /* Fixed height to extend beyond container */
    overflow: visible; /* Allow map to extend outside */
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
    padding: 0.75rem;
    background-color: #f0ede5;
    border-top: 1px solid #8b7355;
    flex-shrink: 0;
    position: relative;
    z-index: 10; /* Ensure timeline appears above extended map */
  }

  .legend-wrapper {
    background-color: #f0ede5;
    padding: 0.75rem;
    border-top: 1px solid #8b7355;
    flex-shrink: 0;
    position: relative;
    z-index: 10; /* Ensure legend appears above extended map */
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

  /* Loading and Error States */
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
