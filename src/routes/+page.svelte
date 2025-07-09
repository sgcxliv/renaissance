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
  <div class="row">
    <!-- Map Container -->
    <div id="map-container">
      <MapContainer />
      
      <!-- Date Slider -->
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
    height: auto;
  }

  .filters-row {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
    align-items: center;
    flex-wrap: wrap;
  }

  .row {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: auto;
  }

  #map-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 75%;
    margin-right: 10px;
    position: relative;
  }

  #sidebar {
    flex: 1;
    height: 450px;
    box-shadow: 2px 5px 5px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    overflow-y: auto;
    width: 25%;
  }

  .slider-container {
    position: relative;
    width: 100%;
    padding: 20px 0;
    margin-top: -50px;
  }

  .histogram-container {
    width: 100%;
    margin-top: 20px;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .row {
      flex-direction: column;
    }
    
    #map-container {
      width: 100%;
      margin-right: 0;
      margin-bottom: 1rem;
    }
    
    #sidebar {
      width: 100%;
      height: 300px;
    }
    
    .filters-row {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
