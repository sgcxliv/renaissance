<script>
  import { onMount, onDestroy } from 'svelte';
  import { mapData, lookupTables, headerIndex, markers, totalMarkers } from '$lib/stores/data.js';
  import { filters } from '$lib/stores/filters.js';
  import { mapState, sidebarState } from '$lib/stores/map.js';
  import { applyFilters } from '$lib/utils/filterHelpers.js';
  import { createMarker, getClusterColor, createPopupContent } from '$lib/utils/mapHelpers.js';
  import { processEventForDisplay } from '$lib/utils/dataProcessing.js';

  let mapElement;
  let map;
  let markerCluster;
  let allProcessedEvents = [];

  // Reactive statements
  $: if (map && $mapData.METADATA.Events && $lookupTables && $headerIndex) {
    processAndDisplayEvents();
  }

  $: if (map && markerCluster && allProcessedEvents.length > 0) {
    filterAndUpdateMarkers($filters);
  }

  onMount(() => {
    initializeMap();
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  function initializeMap() {
    if (!mapElement) return;

    map = L.map(mapElement, { 
      preferCanvas: true 
    }).setView([47, 9], 5);

    map.options.minZoom = 4;
    map.options.maxZoom = 19;

    // Add tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Initialize marker cluster
    markerCluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      iconCreateFunction: function(cluster) {
        const markers = cluster.getAllChildMarkers();
        const clusterColor = getClusterColor(markers);
        
        if (markers.length <= 1) {
          return L.divIcon({ 
            html: '', 
            className: 'hidden-cluster', 
            iconSize: L.point(0, 0) 
          });
        }

        return L.divIcon({
          html: `
            <div style="
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              font-weight: bold;
              background: radial-gradient(circle, 
                ${clusterColor} 20%, 
                rgba(255, 255, 255, 0.1) 80%);
              box-shadow: 0 0 10px rgba(0,0,0,0.3);
            ">
              ${cluster.getChildCount()}
            </div>
          `,
          className: 'custom-cluster',
          iconSize: L.point(40, 40)
        });
      }
    });

    map.addLayer(markerCluster);

    // Add event listeners
    map.on('moveend zoomend', () => {
      updateMapBounds();
      filterAndUpdateMarkers($filters);
    });

    markerCluster.on('clusterclick', function(event) {
      const clusterMarkers = event.layer.getAllChildMarkers();
      updateSidebarWithClusterMarkers(clusterMarkers);
    });

    markerCluster.on('spiderfied', function(event) {
      const clusterMarkers = event.markers;
      updateSidebarWithClusterMarkers(clusterMarkers);
    });

    // Update store
    mapState.update(state => ({
      ...state,
      ready: true
    }));
  }

  function processAndDisplayEvents() {
    const events = $mapData.METADATA.Events || [];
    
    allProcessedEvents = events
      .map(event => processEventForDisplay(event, $lookupTables, $headerIndex))
      .filter(Boolean); // Remove null events

    totalMarkers.set(allProcessedEvents.length);
    console.log(`Processed ${allProcessedEvents.length} events for display`);
  }

  function filterAndUpdateMarkers(currentFilters) {
    if (!markerCluster || !allProcessedEvents.length) return;

    // Clear existing markers
    markerCluster.clearLayers();

    // Apply filters
    const filteredEvents = applyFilters(
      allProcessedEvents, 
      currentFilters, 
      $lookupTables, 
      $headerIndex
    );

    // Create markers for filtered events
    const newMarkers = [];
    
    filteredEvents.forEach(event => {
      if (!event.coordinates) return;

      const marker = createMarker(event, event.coordinates);
      
      // Create popup content
      const popupContent = createPopupContent(event, $lookupTables, $headerIndex);
      marker.bindPopup(popupContent);

      // Store event data on marker
      marker.eventData = event;
      marker.options.personID = event.BIOID;
      marker.options.eventId = event.EVID;

      newMarkers.push(marker);
    });

    // Add markers to cluster
    markerCluster.addLayers(newMarkers);

    // Update markers store
    markers.set(newMarkers);

    // Update sidebar
    updateSidebarWithMarkers(newMarkers);

    console.log(`Displaying ${newMarkers.length} markers`);
  }

  function updateMapBounds() {
    if (!map) return;
    
    const bounds = map.getBounds();
    mapState.update(state => ({
      ...state,
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }
    }));
  }

  function updateSidebarWithClusterMarkers(clusterMarkers) {
    const events = clusterMarkers
      .map(marker => marker.eventData)
      .filter(Boolean);
    
    sidebarState.update(state => ({
      ...state,
      activeMarkers: events
    }));
  }

  function updateSidebarWithMarkers(allMarkers) {
    // Get visible markers within map bounds
    const bounds = map.getBounds();
    const visibleMarkers = allMarkers.filter(marker => {
      return bounds.contains(marker.getLatLng());
    });

    const events = visibleMarkers
      .map(marker => marker.eventData)
      .filter(Boolean);
    
    sidebarState.update(state => ({
      ...state,
      activeMarkers: events
    }));
  }

  // Make sharePoint function globally available
  if (typeof window !== 'undefined') {
    window.sharePoint = function(eventid) {
      const shareURL = `${window.location.origin}/?eventid=${eventid}`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareURL).then(() => {
          console.log('Link copied to clipboard');
          // Could show toast notification here
        }).catch(err => {
          console.error('Failed to copy link: ', err);
        });
      }
    };
  }
</script>

<div bind:this={mapElement} id="map"></div>

<style>
  #map {
    flex: 3;
    height: 450px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  :global(.custom-cluster) {
    background: transparent !important;
    border: none !important;
  }

  :global(.hidden-cluster) {
    display: none !important;
  }

  :global(.popup-content h3) {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.1rem;
  }

  :global(.popup-content p) {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  :global(.share-link) {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: #0066cc;
    font-size: 0.9rem;
  }

  :global(.share-link:hover) {
    text-decoration: underline;
  }
</style>