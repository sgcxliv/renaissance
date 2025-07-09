<script>
  import { onMount } from 'svelte';
  import { mapData, lookupTables, headerIndex } from '$lib/stores/data.js';
  import { filters } from '$lib/stores/filters.js';
  import { mapState, sidebarState } from '$lib/stores/map.js';
  
  import MapContainer from '$lib/components/Map/MapContainer.svelte';
  import PersonTypeFilter from '$lib/components/Filters/PersonTypeFilter.svelte';
  import DateSlider from '$lib/components/Filters/DateSlider.svelte';
  import InstitutionFilter from '$lib/components/Filters/InstitutionFilter.svelte';
  import SearchBox from '$lib/components/Filters/SearchBox.svelte';
  import EventsList from '$lib/components/Sidebar/EventsList.svelte';
  import Histogram from '$lib/components/Timeline/Histogram.svelte';

  let mounted = false;

  onMount(() => {
    mounted = true;
    
    // Initialize date slider on page load
    updateDateRange();
    updateSliderBackground();
    
    // Load marker from URL if eventid is present
    loadMarkerFromURL();
  });

  // Your existing functions converted to work with stores
  function updateDateRange() {
    // Implementation from your slider.html
    console.log('Date range updated');
  }

  function updateSliderBackground() {
    // Implementation from your slider.html
    console.log('Slider background updated');
  }

  function loadMarkerFromURL() {
    // Implementation from your existing loadMarkerFromURL function
    const urlParams = new URLSearchParams(window.location.search);
    let eventid = urlParams.get('eventid');
    
    if (eventid) {
      eventid = `EV:${eventid}`;
      console.log('Loading marker for event:', eventid);
      // Will implement marker loading in MapContainer
    }
  }
</script>

<svelte:head>
  <title>Mapping the Musical Renaissance</title>
  <meta name="description" content="Interactive map of Renaissance music events and figures" />
</svelte:head>

{#if mounted}
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

  <!-- Histogram -->
  <div class="histogram-container">
    <Histogram />
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
  }

  .content-wrapper {
    display: flex;
    width: 100%;
    height: calc(100vh - 200px); /* Adjust based on your layout */
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
  }

  #sidebar {
    width: 25%;
    height: 100%;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    overflow-y: auto;
  }

  .histogram-container {
    width: 100%;
    margin-top: 20px;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .content-wrapper {
      flex-direction: column;
      height: auto;
    }
    
    .map-slider-container {
      width: 100%;
      height: 450px; /* Adjust as needed */
    }

    #sidebar {
      width: 100%;
      height: 300px;
    }
    
    .filters-row {
      flex-direction: column;
      align-items: stretch;
    }

    .slider-container {
      position: static;
      transform: none;
      width: 100%;
      margin-top: 20px;
    }
  }
</style>
