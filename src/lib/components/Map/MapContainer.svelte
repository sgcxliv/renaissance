<--!
// Svelte component that renders an interactive Leaflet map displaying historical events with clustering, filtering, and popup functionality.
// Processes event data from stores, creates markers with custom styling based on person types, and handles map interactions including bounds restriction to Europe.
// Features performance optimization with initial load limiting, viewport-based filtering, and real-time marker updates based on applied filters.
-->
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
  let failedEvents = [];
  let initialLoadComplete = false;

  onMount(() => {
    setTimeout(() => {
      initialLoadComplete = true;
      console.log('Initial load period complete - removing event limiting');
      if (map && markerCluster && allProcessedEvents.length > 0) {
        filterAndUpdateMarkers($filters);
      }
    }, 3000);
  });

  // filter events to only those visible in map viewport
  function filterEventsInView(events, map) {
    if (!map) return [];
    const bounds = map.getBounds();
    return events.filter(event => {
      if (!event.coordinates) return false;
      const [lat, lng] = Array.isArray(event.coordinates)
        ? event.coordinates
        : [event.coordinates.lat, event.coordinates.lng];
      return bounds.contains(L.latLng(lat, lng));
    });
  }

  // Reactive event processing
  $: if (map && $mapData.METADATA.Events && $lookupTables && $headerIndex) {
    processAndDisplayEvents();
  }

  // Update markers when filters or events change
  $: if (map && markerCluster && allProcessedEvents.length > 0) {
    filterAndUpdateMarkers($filters);
  }

  onMount(() => {
    initializeMap();

    const resizeHandler = () => {
      if (map) map.invalidateSize();
    };
    window.addEventListener('resize', resizeHandler);

    onDestroy(() => {
      window.removeEventListener('resize', resizeHandler);
      if (map) map.remove();
    });
  });

  function initializeMap() {
    if (!mapElement) return;

    // Initialize map focused on Central Europe/Northern Italy (Renaissance heartland)
    // Starting point: Florence, Italy area with moderate zoom to show regional context
    map = L.map(mapElement, {
      preferCanvas: true
    }).setView([45.5, 10.5], 7); // Florence region, zoomed in more

    // Set min/max zoom levels
    map.options.minZoom = 4;
    map.options.maxZoom = 19;

    // Define Europe bounds (approximate)
    const europeBounds = L.latLngBounds(
      L.latLng(34.5, -25), // Southwest (South Spain/Portugal, Atlantic)
      L.latLng(71, 45)     // Northeast (North Scandinavia, Ural Mountains)
    );

    // Set max bounds to restrict panning to Europe
    map.setMaxBounds(europeBounds);
    map.on('drag', function() {
      map.panInsideBounds(europeBounds, { animate: false });
    });

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

    // Event listeners
    map.on('moveend zoomend', () => {
      updateMapBounds();
      filterAndUpdateMarkers($filters);
    });

    // Clear selection when clicking on empty map areas
    map.on('click', function(e) {
      // Only clear if not clicking on a marker
      if (!e.originalEvent.defaultPrevented) {
        sidebarState.update(state => ({
          ...state,
          selectedEvent: null
        }));
      }
    });

    markerCluster.on('clusterclick', function(event) {
      const clusterMarkers = event.layer.getAllChildMarkers();
      updateSidebarWithClusterMarkers(clusterMarkers);
    });

    markerCluster.on('spiderfied', function(event) {
      const clusterMarkers = event.markers;
      updateSidebarWithClusterMarkers(clusterMarkers);
    });

    // Update store to mark map as ready
    mapState.update(state => ({
      ...state,
      ready: true
    }));
  }

  function processAndDisplayEvents() {
    // Add these logs at the top:
    console.log("lookupTables.Locations keys:", Object.keys($lookupTables.Locations || {}));
    console.log("lookupTables.Bio_Composers keys:", Object.keys($lookupTables.Bio_Composers || {}));
    console.log("lookupTables.Bio_Musicians keys:", Object.keys($lookupTables.Bio_Musicians || {}));
    console.log("lookupTables.Bio_Nonmusicians keys:", Object.keys($lookupTables.Bio_Nonmusicians || {}));

    const events = $mapData.METADATA.Events || [];
    console.log("First event LOCID:", events[0]?.LOCID, "BIOID:", events[0]?.BIOID);
    console.log("Locations has key?", $lookupTables.Locations?.[events[0]?.LOCID]);
    console.log("Bio_Musicians has key?", $lookupTables.Bio_Musicians?.[events[0]?.BIOID]);

    // Use .reduce to track both successful and failed events
    const { processed, failed } = events.reduce(
      (acc, event) => {
        const result = processEventForDisplay(event, $lookupTables, $headerIndex);
        if (result !== null && result !== undefined) {
          acc.processed.push(result);
        } else {
          acc.failed.push(event);
        }
        return acc;
      },
      { processed: [], failed: [] }
    );
    allProcessedEvents = processed;
    failedEvents = failed;
    totalMarkers.set(allProcessedEvents.length);
    console.log(`Processed ${allProcessedEvents.length} events for display`);

    if (failedEvents.length) {
      console.warn('Failed to process events:', failedEvents);
    }

    // more debugingg logs
    console.log('SAMPLE processed event:', allProcessedEvents[0]);
    if (allProcessedEvents[0]) {
      // Try multiple variants of ID as fallback
      const locationId =
        allProcessedEvents[0].LOCID ||
        allProcessedEvents[0].locationId ||
        allProcessedEvents[0].locid;
      console.log('SAMPLE location ID from event:', locationId);
      console.log('SAMPLE location lookup:', $lookupTables.Locations?.[locationId]);
    }
  }

  function filterAndUpdateMarkers(currentFilters) {
    if (!markerCluster || !allProcessedEvents.length) return;

    // Clear existing markers
    markerCluster.clearLayers();

    // Filter by user filters (checkboxes, search, certainty...)
    let filteredEvents = applyFilters(
      allProcessedEvents,
      currentFilters,
      $lookupTables,
      $headerIndex
    );

    // Further filter to only events visible in current map bounds
    filteredEvents = filterEventsInView(filteredEvents, map);

    // Apply initial load limiting for first 3 seconds only
    if (!initialLoadComplete && filteredEvents.length > 100) {
      console.log(`Initial load: limiting to 100 events (${filteredEvents.length} available)`);
      // Get map center for distance calculation
      const center = map.getCenter();
      
      // Calculate distance from center and sort by proximity
      filteredEvents = filteredEvents
        .map(event => {
          if (!event.coordinates) return null;
          const [lat, lng] = event.coordinates;
          const distance = Math.sqrt(
            Math.pow(lat - center.lat, 2) + Math.pow(lng - center.lng, 2)
          );
          return { ...event, distanceFromCenter: distance };
        })
        .filter(e => e !== null)
        .sort((a, b) => a.distanceFromCenter - b.distanceFromCenter)
        .slice(0, 100); // Show closest 100 events during initial load
    } else if (initialLoadComplete && filteredEvents.length > 100) {
      console.log(`Post-initial load: showing all ${filteredEvents.length} events`);
    }

    // create markers for filtered events
    const newMarkers = [];

    filteredEvents.forEach(event => {
      const locInfo = $lookupTables.Locations?.[event.LOCID];
      if (!locInfo) {
        console.error('Missing location for LOCID', event.LOCID, 'Event:', event);
        return;
      }
      const coordsString = locInfo.Coordinates || locInfo.COORD;
      if (!coordsString) {
        console.error('Missing coordinates in location row:', locInfo, 'LOCID:', event.LOCID);
        return;
      }
      const coordsArray = coordsString.split(',').map(Number);
      if (coordsArray.length !== 2 || coordsArray.some(isNaN)) {
        console.error('Invalid coords:', coordsString, coordsArray, 'Event:', event);
        return;
      }
      const coordinates = [coordsArray[0], coordsArray[1]];

      // Create proper marker with styling and popup
      const marker = createMarker(event, coordinates);
      
      // Add event data to marker for reference
      marker.eventData = event;
      
      // Create popup content
      const popupContent = createPopupContent(event, $lookupTables, $headerIndex);
      if (popupContent) {
        marker.bindPopup(popupContent);
      }
      
      // Add click handler to update sidebar selection
      marker.on('click', function(e) {
        // Prevent map click event from firing
        e.originalEvent.preventDefault();
        sidebarState.update(state => ({
          ...state,
          selectedEvent: event
        }));
      });
      
      newMarkers.push(marker);
    });

    // Add markers to cluster
    markerCluster.addLayers(newMarkers);

    // Update markers store
    markers.set(newMarkers);

    // Update sidebar
    updateSidebarWithMarkers(newMarkers);

    console.log(`Displaying ${newMarkers.length} markers${!initialLoadComplete ? ' (initial load - more coming)' : ''}`);
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

  function getLocId(event) {
    return event.LOCID || event.locationId || event.locid;
  }

  function getBioId(event) {
    return event.BIOID;
  }
</script>

<div bind:this={mapElement} id="map"></div>

<style>
  #map {
    flex: 3;
    height: 80vh;
    min-height: 300px;
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
