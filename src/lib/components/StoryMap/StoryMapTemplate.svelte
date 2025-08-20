<script>
  // Props for dynamic story map content
  export let person;
  export let events;
  export let config;
  export let personId;
  
  // Legacy props for backwards compatibility
  export let title = config?.name || "Story Map: Institution/Person";
  export let blurbText = config?.description || `Clicking the footnotes highlights the corresponding point on the map, and clicking the point highlights the sentence in the blurb`;
  export let pictureText = "Clicking the picture will enlarge above";
  
  // Media detection - only show tabs when content is available
  $: hasImage = !!(config?.image || config?.picture);
  $: hasAudio = !!(config?.audio || config?.mp3);
  $: hasVideo = !!(config?.video || config?.youtube || config?.youtubeId);
  
  // Determine if we should show any media sections
  $: showMediaSections = hasImage || hasAudio || hasVideo;
  
  import { onMount, onDestroy } from 'svelte';
  import { mapData, lookupTables } from '$lib/stores/data.js';
  import { createMarker, createPopupContent } from '$lib/utils/mapHelpers.js';
  import { processEventForDisplay } from '$lib/utils/dataProcessing.js';
  
  let currentEventIndex = 0;
  let timelineStart = config?.timelineDates?.start || 1400;
  let timelineEnd = config?.timelineDates?.end || 1600;
  let currentStart = timelineStart;
  let currentEnd = timelineEnd;
  let mapElement;
  let map;
  let markerCluster;
  let mapProcessedEvents = [];
  let movementLines = [];
  let currentMovementLines = [];
  
  $: currentEvent = events?.[currentEventIndex];
  $: hasNextEvent = currentEventIndex < (events?.length || 0) - 1;
  $: hasPreviousEvent = currentEventIndex > 0;

  // Enhanced event with location data
  $: enhancedCurrentEvent = currentEvent ? getEnhancedEvent(currentEvent) : null;

  function getEnhancedEvent(event) {
    const location = $lookupTables?.Locations?.[event.LOCID];
    const institution = $lookupTables?.Institutions?.[event.INSID];
    
    // Get location display like the main map
    let locationDisplay = '';
    if (location) {
      locationDisplay = location['Name of Location'] || location.LOCNAME || '';
      if (location.CITY) {
        locationDisplay += `, ${location.CITY}`;
      }
      // Add uncertainty markers
      const certainty = event.CERTLOC;
      if (certainty && certainty !== "1") {
        if (certainty === "2") locationDisplay += "?";
        else if (certainty === "3") locationDisplay += "??";
        else if (certainty === "4") locationDisplay += "???";
      }
    }
    
    return {
      ...event,
      locationInfo: location,
      institutionInfo: institution,
      dateRange: event.DATERANGE || `${event.EYEAR || '?'}-${event.LYEAR || '?'}`,
      formattedDescription: event.Description || event.EINFO || 'No description available',
      locationDisplay: locationDisplay || 'Unknown location'
    };
  }

  // Initialize map when component mounts
  onMount(async () => {
    if (typeof window !== 'undefined' && window.L) {
      initializeMap();
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  function initializeMap() {
    if (!mapElement) return;

    // Initialize Leaflet map
    map = L.map(mapElement, {
      center: [50.0, 10.0], // Center of Europe
      zoom: 5,
      zoomControl: false
    });

    // Add zoom control to top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize marker cluster group
    markerCluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      disableClusteringAtZoom: 8
    });

    map.addLayer(markerCluster);

    // Process and display person-specific events
    if (events && events.length > 0) {
      processPersonEvents();
    }
  }

  function createMovementLine(fromCoords, toCoords, isNext = false, isPrevious = false) {
    // Determine line color based on relationship to current event
    let color = 'rgba(139, 115, 85, 0.7)'; // Default translucent brown
    let weight = 3;
    
    if (isNext) {
      color = 'rgba(34, 197, 94, 0.8)'; // Translucent green for next movement
      weight = 4;
    } else if (isPrevious) {
      color = 'rgba(239, 68, 68, 0.8)'; // Translucent red for previous movement
      weight = 4;
    }

    // Create dotted line
    const line = L.polyline([fromCoords, toCoords], {
      color: color,
      weight: weight,
      opacity: 0.9,
      dashArray: '8, 12'
    });

    // Calculate midpoint for arrow
    const midLat = (fromCoords[0] + toCoords[0]) / 2;
    const midLng = (fromCoords[1] + toCoords[1]) / 2;
    
    // Calculate bearing for arrow direction
    const bearing = calculateBearing(fromCoords, toCoords);
    
    // Create arrow marker with better styling
    const arrowIcon = L.divIcon({
      html: `<div style="
        transform: rotate(${bearing}deg); 
        color: ${color.replace('rgba', 'rgb').replace(', 0.', ', 1.').replace(', 0.8)', ')')};
        font-size: 18px; 
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
      ">→</div>`,
      className: 'movement-arrow',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    const arrow = L.marker([midLat, midLng], { icon: arrowIcon });

    return { line, arrow };
  }

  function calculateBearing(from, to) {
    const lat1 = from[0] * Math.PI / 180;
    const lat2 = to[0] * Math.PI / 180;
    const deltaLng = (to[1] - from[1]) * Math.PI / 180;
    
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  function updateMovementLines() {
    // Clear existing movement lines
    currentMovementLines.forEach(({ line, arrow }) => {
      map.removeLayer(line);
      map.removeLayer(arrow);
    });
    currentMovementLines = [];

    if (mapProcessedEvents.length < 2) {
      console.log('Not enough events for movement lines');
      return;
    }

    console.log('Creating movement lines for', mapProcessedEvents.length, 'events');

    // Create all movement lines
    for (let i = 0; i < mapProcessedEvents.length - 1; i++) {
      const currentEvent = mapProcessedEvents[i];
      const nextEvent = mapProcessedEvents[i + 1];
      
      if (currentEvent.coordinates && nextEvent.coordinates) {
        const isNext = i === currentEventIndex;
        const isPrevious = i === currentEventIndex - 1;
        
        const movement = createMovementLine(
          currentEvent.coordinates, 
          nextEvent.coordinates,
          isNext,
          isPrevious
        );
        
        map.addLayer(movement.line);
        map.addLayer(movement.arrow);
        currentMovementLines.push(movement);
        
        console.log(`Added movement line ${i} -> ${i+1}`, {
          from: currentEvent.coordinates,
          to: nextEvent.coordinates,
          isNext,
          isPrevious
        });
      }
    }
    
    console.log('Total movement lines created:', currentMovementLines.length);
  }

  function processPersonEvents() {
    if (!events || !$lookupTables || events.length === 0) {
      console.log('No events or lookup tables available');
      return;
    }

    console.log('Processing events for story map:', events);
    mapProcessedEvents = [];
    
    events.forEach((event, index) => {
      try {
        // Use the same logic as the main map
        const processedEvent = processEventForDisplay(event, $lookupTables);
        console.log('Processed event:', processedEvent);
        
        if (processedEvent && processedEvent.coordinates) {
          mapProcessedEvents.push({
            ...processedEvent,
            originalIndex: index,
            isCurrentEvent: index === currentEventIndex
          });
          console.log('Added event with coordinates:', processedEvent);
        } else {
          // Fallback: try to get coordinates directly from location data
          const location = $lookupTables?.Locations?.[event.LOCID];
          if (location) {
            // Try different coordinate field names
            let coordinates = null;
            const coordString = location.Coordinates || location.COORD || '';
            
            if (coordString) {
              const coordsArray = coordString.split(',').map(Number);
              if (coordsArray.length === 2 && !coordsArray.some(isNaN)) {
                coordinates = [coordsArray[0], coordsArray[1]];
              }
            }
            
            // Alternative: try LATITUDE/LONGITUDE fields
            if (!coordinates && location.LATITUDE && location.LONGITUDE) {
              const lat = parseFloat(location.LATITUDE);
              const lng = parseFloat(location.LONGITUDE);
              if (!isNaN(lat) && !isNaN(lng)) {
                coordinates = [lat, lng];
              }
            }
            
            if (coordinates) {
              const directEvent = {
                ...event,
                coordinates: coordinates,
                locationInfo: location,
                institutionInfo: $lookupTables?.Institutions?.[event.INSID],
                originalIndex: index,
                isCurrentEvent: index === currentEventIndex,
                personType: event.BIOID?.substring(0, 3)
              };
              mapProcessedEvents.push(directEvent);
              console.log('Added event with direct coordinates:', directEvent);
            } else {
              console.warn('No valid coordinates found for event:', event, location);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to process event for map:', event, error);
      }
    });

    console.log('Final processed events for story map:', mapProcessedEvents);
    updateMapMarkers();
  }

  function updateMapMarkers() {
    if (!markerCluster || !map) {
      console.log('Map or marker cluster not ready');
      return;
    }

    console.log('Updating map markers with events:', mapProcessedEvents);
    markerCluster.clearLayers();

    mapProcessedEvents.forEach((event, index) => {
      // Use the same marker creation logic as the main map
      const personType = event.BIOID?.substring(0, 3);
      
      // Determine color based on person type
      let fillColor;
      if (personType === "BCO") {
        fillColor = "#440154"; // Purple for composers
      } else if (personType === "BMU") {
        fillColor = "#23ed5c"; // Green for musicians
      } else if (personType === "BNO") {
        fillColor = "#fde725"; // Yellow for non-musicians
      } else {
        fillColor = "#0c8aff"; // Default blue
      }

      // Highlight current event
      if (event.originalIndex === currentEventIndex) {
        fillColor = "#ff4444"; // Red for current event
      }

      const markerOptions = {
        radius: 8,
        fillColor: fillColor,
        color: "#000000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      };

      const marker = L.circleMarker(event.coordinates, markerOptions);

      // Create popup content using the same logic as main map
      const popupContent = createPopupContent(event, $lookupTables);
      marker.bindPopup(popupContent);

      // Handle marker click to sync with timeline
      marker.on('click', () => {
        jumpToEvent(event.originalIndex);
      });

      markerCluster.addLayer(marker);
      console.log('Added marker for event:', event);
    });

    // Update movement lines
    updateMovementLines();

    // Fit map to show all markers
    if (mapProcessedEvents.length > 0) {
      const group = new L.featureGroup(markerCluster.getLayers());
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }

  // Update map when current event changes
  $: if (map && mapProcessedEvents.length > 0) {
    updateMapMarkers();
    
    // Pan map to current event (without changing zoom level)
    const currentMapEvent = mapProcessedEvents.find(e => e.originalIndex === currentEventIndex);
    if (currentMapEvent && currentMapEvent.coordinates) {
      map.panTo(currentMapEvent.coordinates);
    }
  }

  // Process events when data changes
  $: if (map && events && $lookupTables) {
    processPersonEvents();
  }

  function nextEvent() {
    if (hasNextEvent) {
      currentEventIndex++;
    }
  }

  function previousEvent() {
    if (hasPreviousEvent) {
      currentEventIndex--;
    }
  }

  function jumpToEvent(index) {
    currentEventIndex = index;
  }
  
  function handlePointClick(point) {
    console.log('Point clicked:', point);
    if (point.id !== undefined) {
      jumpToEvent(point.id);
    }
  }
  
  function handleFootnoteClick(footnoteId) {
    console.log('Footnote clicked:', footnoteId);
    // Legacy function for backwards compatibility
  }

  function getBibliographyEntry(event) {
    if (!event) return null;
    
    const docId = event.DOCID;
    if (!docId) return null;
    
    const doc = $lookupTables?.Doc_Entries?.[docId] || $lookupTables?.Archival_Docs?.[docId];
    if (!doc) return null;
    
    // Format bibliography entry
    let entry = '';
    if (doc.AUTHOR) entry += `${doc.AUTHOR}, `;
    if (doc.TITLE) entry += `"${doc.TITLE}," `;
    if (doc.SOURCE) entry += `${doc.SOURCE}, `;
    if (doc.DATE) entry += `${doc.DATE}`;
    
    return entry.trim();
  }
</script>

<div class="storymap-container">
  <!-- Left Content Panel -->
  <div class="content-panel">
    <!-- Biography Section -->
    <div class="blurb-section">
      <h2>{title}</h2>
      <p class="blurb-text">
        {config?.biography || blurbText}
      </p>
      
      <!-- Event Navigation -->
      {#if events && events.length > 0}
        <div class="event-navigation">
          <div class="nav-controls">
            <button 
              on:click={previousEvent} 
              disabled={!hasPreviousEvent}
              class="nav-button"
            >
              ← Previous
            </button>
            
            <span class="event-counter">
              Event {currentEventIndex + 1} of {events.length}
            </span>
            
            <button 
              on:click={nextEvent} 
              disabled={!hasNextEvent}
              class="nav-button"
            >
              Next →
            </button>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Current Event Details -->
    {#if enhancedCurrentEvent}
      <div class="current-event-section">
        <h3>Event {currentEventIndex + 1}</h3>
        <div class="event-details">
          <p class="event-date">
            <strong>Date:</strong> {enhancedCurrentEvent.dateRange}
          </p>
          <p class="event-location">
            <strong>Location:</strong> {enhancedCurrentEvent.locationDisplay}
          </p>
          
          <p class="event-description">
            <strong>Description:</strong> {enhancedCurrentEvent.formattedDescription}
          </p>
        </div>
      </div>
    {/if}
    
    <!-- Media Sections - Only show when content is available -->
    {#if showMediaSections}
      
      <!-- Picture Section - Show if there's an image -->
      {#if hasImage}
        <div class="picture-section">
          <h3>Picture</h3>
          <div class="picture-container">
            {#if config?.image || config?.picture}
              <img 
                src={config.image || config.picture} 
                alt={config.name || title} 
                class="portrait" 
                on:click={() => console.log('Picture clicked - implement enlargement')}
              />
            {:else}
              <div class="picture-placeholder">
                <div class="picture-frame">
                  [Picture will be loaded from repository]
                </div>
              </div>
            {/if}
          </div>
          <p class="picture-caption">{pictureText}</p>
        </div>
      {/if}

      <!-- Audio Section - Show if there's audio content -->
      {#if hasAudio}
        <div class="audio-section">
          <h3>Audio</h3>
          {#if config?.audio || config?.mp3}
            <!-- Audio from Supabase or direct file -->
            <audio controls class="audio-player">
              <source src={config.audio || config.mp3} type="audio/mpeg">
              <source src={config.audio || config.mp3} type="audio/mp3">
              Your browser does not support the audio element.
            </audio>
          {:else}
            <div class="audio-placeholder">
              <div class="audio-controls">
                <button class="audio-btn">◀</button>
                <button class="audio-btn play-btn">▶</button>
                <button class="audio-btn">▶▶</button>
              </div>
              <p class="media-note">Audio will be loaded from Supabase</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Video Section - Show if there's video content -->
      {#if hasVideo}
        <div class="video-section">
          <h3>Video</h3>
          {#if config?.youtube || config?.youtubeId}
            <!-- YouTube video -->
            <div class="youtube-container">
              <button 
                class="youtube-thumbnail"
                on:click={() => console.log('YouTube video clicked - implement overlay')}
              >
                <div class="play-overlay">▶</div>
                <p>Click to play YouTube video</p>
              </button>
              <p class="media-note">YouTube: {config.youtube || config.youtubeId}</p>
            </div>
          {:else if config?.video}
            <!-- Direct video file -->
            <video controls class="video-player">
              <source src={config.video} type="video/mp4">
              Your browser does not support the video element.
            </video>
          {:else}
            <div class="video-placeholder">
              <div class="video-frame">
                [Video content will be available]
              </div>
            </div>
          {/if}
        </div>
      {/if}
      
    {/if}
  </div>
  
  <!-- Right Map Panel -->
  <div class="map-panel">
    <div class="map-container">
      <div class="map-header">
        <h2>{title}</h2>
        <div class="zoom-control">Interactive Map</div>
      </div>
      
      <!-- Interactive Leaflet Map -->
      <div class="leaflet-map" bind:this={mapElement}></div>
    </div>
  </div>
</div> <!-- Close storymap-container -->



<style>
  .storymap-container {
    display: flex;
    gap: 0;
    height: 80vh;
    background-color: white;
    border: 2px solid #8b7355;
    font-family: 'Times New Roman', serif;
  }

  .content-panel {
    flex: 0 0 300px;
    min-width: 300px;
    max-width: 350px;
    background-color: white;
    border-right: 1px solid #8b7355;
    padding: 1rem;
    overflow-y: auto;
    height: 100%;
  }

  .map-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
  }
  
  .blurb-section h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    text-align: center;
    color: #2c2c2c;
  }
  
  .blurb-text {
    line-height: 1.6;
    color: #333;
    margin-bottom: 1.5rem;
  }

  /* Event Navigation Styles */
  .event-navigation {
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: #f8f8f8;
    border-radius: 8px;
    border: 1px solid #ddd;
  }

  .nav-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .nav-button {
    background-color: #8b7355;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .nav-button:hover:not(:disabled) {
    background-color: #6d5a42;
  }

  .nav-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .event-counter {
    font-weight: bold;
    color: #2c2c2c;
    font-size: 14px;
  }

  /* Current Event Section */
  .current-event-section {
    margin: 1rem 0;
    padding: 1rem;
    background-color: #f8f8f8;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .current-event-section h3 {
    margin: 0 0 0.75rem 0;
    color: #8b7355;
    font-size: 1.1rem;
    font-weight: bold;
    text-align: center;
  }

  .event-date, .event-location {
    margin: 0.5rem 0;
    color: #333;
    font-size: 14px;
  }

  .event-description {
    margin: 0.75rem 0 0 0;
    line-height: 1.4;
    color: #333;
    font-size: 14px;
  }

  /* Portrait/Image Styles */
  .picture-container {
    text-align: center;
    margin-bottom: 1rem;
  }

  .portrait {
    max-width: 100%;
    width: 200px;
    height: 250px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid #8b7355;
  }

  .blurb-text {
    line-height: 1.6;
    color: #333;
    margin-bottom: 1.5rem;
  }
  
  .footnote-link {
    background: none;
    border: none;
    color: #0066cc;
    cursor: pointer;
    font-size: 0.9em;
    text-decoration: underline;
    padding: 0;
    margin: 0 2px;
  }
  
  .footnote-link:hover {
    background-color: #e6f3ff;
  }
  
  .picture-section {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .picture-section h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    color: #2c2c2c;
  }
  
  .picture-frame {
    width: 120px;
    height: 80px;
    background-color: #8b4513;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.5rem;
    border: 3px solid #654321;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .picture-caption {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.4;
  }
  
  .audio-section {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .audio-section h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    color: #2c2c2c;
  }
  
  .audio-player {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .audio-controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    background-color: #8b4513;
    padding: 0.5rem;
    border-radius: 4px;
    width: fit-content;
    margin: 0 auto;
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

  /* Video Section Styles */
  .video-section {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .video-section h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    color: #2c2c2c;
  }
  
  .video-player {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 8px;
    border: 2px solid #8b7355;
  }
  
  .youtube-container {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .youtube-thumbnail {
    position: relative;
    width: 100%;
    height: 180px;
    background-color: #000;
    background-image: linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333),
                      linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333);
    background-size: 20px 20px;
    background-position: 0 0, 10px 10px;
    border: 2px solid #8b7355;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }
  
  .youtube-thumbnail:hover {
    background-color: #222;
    transform: scale(1.02);
  }
  
  .play-overlay {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #ff0000;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
  }
  
  .video-frame,
  .picture-placeholder,
  .audio-placeholder {
    margin-bottom: 0.5rem;
  }
  
  .video-frame {
    width: 100%;
    max-width: 300px;
    height: 180px;
    background-color: #8b4513;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 3px solid #654321;
    border-radius: 8px;
    font-size: 0.9rem;
  }
  
  .media-note {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.5rem;
    font-style: italic;
  }
  
  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .map-header h2 {
    font-size: 1.3rem;
    color: #2c2c2c;
    margin: 0;
  }
  
  .zoom-control {
    background-color: #fff;
    border: 1px solid #333;
    padding: 0.5rem;
    font-size: 0.7rem;
    line-height: 1.2;
    cursor: pointer;
    text-align: center;
    min-width: 80px;
  }
  
  .map-container {
    flex: 1;
    position: relative;
    background-color: #e8dcc0;
    border: none;
    overflow: hidden;
    height: 100%;
  }

  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: rgba(139, 115, 85, 0.1);
    border-bottom: 1px solid #8b7355;
  }

  .map-header h2 {
    font-size: 1.1rem;
    color: #2c2c2c;
    margin: 0;
  }

  .zoom-control {
    background-color: #fff;
    border: 1px solid #8b7355;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-radius: 4px;
    color: #666;
  }

  .leaflet-map {
    height: calc(100% - 60px);
    width: 100%;
    z-index: 1;
  }

  /* Movement arrow styling */
  :global(.movement-arrow) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  :global(.movement-arrow div) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  }
  
  @media (max-width: 768px) {
    .storymap-container {
      flex-direction: column;
      height: auto;
    }
    
    .content-panel {
      max-width: none;
      border-right: none;
      border-bottom: 1px solid #8b7355;
      height: auto;
    }
    
    .map-panel {
      height: 60vh;
    }
    
    .map-header {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>