<script>
  import { sidebarState, mappableEvents } from '$lib/stores/map.js';
  import { lookupTables } from '$lib/stores/data.js';
  import EventDetails from './EventDetails.svelte';

  let selectedEvent = null;
  let activeTab = 'about'; // 'about' or 'source'

  // Listen to external selection changes (e.g., from map clicks)
  $: if ($sidebarState.selectedEvent !== selectedEvent) {
    selectedEvent = $sidebarState.selectedEvent;
  }

  // Use sidebarState.activeMarkers which contains events visible in current map view
  $: visibleEvents = ($sidebarState.activeMarkers || []).filter(event => {
    const description = event.Description || '';
    return description.trim().length > 0;
  });
  
  $: {
    console.log('EventsList: mappableEvents count:', visibleEvents.length);
    console.log('EventsList: first few events:', visibleEvents.slice(0, 3));
  }

  function selectEvent(event) {
    selectedEvent = selectedEvent?.EVID === event.EVID ? null : event;
    // Update the sidebar state with selected event
    sidebarState.update(state => ({
      ...state,
      selectedEvent: selectedEvent
    }));
    // Reset to about tab when selecting a new event
    if (selectedEvent) {
      activeTab = 'about';
    }
  }

  function formatEventSummary(event) {
    // Get person name from BIOID lookup
    let personName = 'Unknown person';
    if (event.BIOID && $lookupTables) {
      const bioid = event.BIOID;
      let person = null;
      
      if (bioid.startsWith('BCO:')) {
        person = $lookupTables.Bio_Composers?.[bioid];
        if (person) personName = person['Composer Name'] || person.BCONAME || 'Unknown composer';
      } else if (bioid.startsWith('BMU:')) {
        person = $lookupTables.Bio_Musicians?.[bioid];
        if (person) personName = person['Musician Name'] || person.BMUNAME || 'Unknown musician';
      } else if (bioid.startsWith('BNO:')) {
        person = $lookupTables.Bio_Nonmusicians?.[bioid];
        if (person) personName = person['Non-musician Name'] || person.BNONAME || 'Unknown non-musician';
      }
    }

    const dateRange = event.DATERANGE || event['Date Range'] || 'Unknown date';
    const description = event.Description || '';
    
    // Format as "name of person: date, event description"
    const summary = `${personName}: ${dateRange}, ${description}`;
    const words = summary.split(' ');
    return words.slice(0, 15).join(' ') + (words.length > 15 ? '...' : '');
  }

  function formatEventText(event) {
    const dateRange = event.DATERANGE || event['Date Range'] || 'Unknown date';
    const personName = event.personInfo?.name || 'Unknown person';
    const description = event.Description || '';
    
    return `[${dateRange}] ${personName}: ${description}`;
  }

  function formatExpandedEventSummary(event) {
    // Get person name from BIOID lookup
    let personName = 'Unknown person';
    if (event.BIOID && $lookupTables) {
      const bioid = event.BIOID;
      let person = null;
      
      if (bioid.startsWith('BCO:')) {
        person = $lookupTables.Bio_Composers?.[bioid];
        if (person) personName = person['Composer Name'] || 'Unknown composer';
      } else if (bioid.startsWith('BMU:')) {
        person = $lookupTables.Bio_Musicians?.[bioid];
        if (person) personName = person['Musician Name'] || 'Unknown musician';
      } else if (bioid.startsWith('BNO:')) {
        person = $lookupTables.Bio_Nonmusicians?.[bioid];
        if (person) personName = person['Non-musician Name'] || 'Unknown non-musician';
      }
    }

    // Get location name from LOCID lookup
    let locationName = 'Unknown location';
    if (event.LOCID && $lookupTables?.Locations) {
      const location = $lookupTables.Locations[event.LOCID];
      if (location) {
        locationName = location['Name of Location'] || location.LOCNAME || 'Unknown location';
        if (location.CITY) {
          locationName += `, ${location.CITY}`;
        }
      }
    }

    const dateRange = event.DATERANGE || event['Date Range'] || 'Unknown date';
    const description = event.Description || 'No description available';
    
    return {
      personName,
      locationName,
      dateRange,
      description
    };
  }

  // display media on main page dropdown if it exists (needs work, placeholders)
  function sanitizeEventId(eventId) {
    return eventId?.replace(/[^a-zA-Z0-9-_]/g, '_') || '';
  }

  function hasMedia(event) {
    return false; // placeholder
  }

  function hasAudio(event) {
    return false; // placeholder
  }
</script>

<div class="sidebar-container">
  <div class="events-section" class:collapsed={selectedEvent}>
    <div class="events-header">
      <h3><strong>Events:</strong> {visibleEvents.length} Visible</h3>
    </div>

    {#if visibleEvents.some(ev => !ev.EVID)}
      <div style="color: red; font-weight:bold; margin-bottom:8px;">
        Warning: One or more events missing a unique EVID.
      </div>
    {/if}
    
    {#if visibleEvents.length === 0}
      <p class="no-events">No events match current filters</p>
    {:else}
      <div class="events-table-container">
        <div class="events-list">
          {#each visibleEvents as event, i (`${event.EVID || 'unknown'}_${i}`)}
            <div 
              class="event-item"
              class:selected={selectedEvent?.EVID === event.EVID}
              on:click={() => selectEvent(event)}
              on:keydown={(e) => e.key === 'Enter' && selectEvent(event)}
              role="button"
              tabindex="0"
            >
              <div class="event-summary">
                {formatEventSummary(event)}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Event Details Section - Only show when event is selected -->
  {#if selectedEvent}
    <div class="details-section">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          class="tab-btn" 
          class:active={activeTab === 'about'}
          on:click={() => activeTab = 'about'}
        >
          About
        </button>
        <button 
          class="tab-btn" 
          class:active={activeTab === 'source'}
          on:click={() => activeTab = 'source'}
        >
          Source
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        {#if activeTab === 'about'}
          <div class="about-content">
            <!-- Event Details with Date, Person, Location, and Description -->
            {#if selectedEvent}
              {@const eventInfo = formatExpandedEventSummary(selectedEvent)}
              <div class="event-details-compact">
                <div class="detail-line"><strong>Date:</strong> {eventInfo.dateRange}</div>
                <div class="detail-line"><strong>Person:</strong> {eventInfo.personName}</div>
                <div class="detail-line"><strong>Location:</strong> {eventInfo.locationName}</div>
                <div class="description-text">{eventInfo.description}</div>
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
          </div>
        {/if}

        {#if activeTab === 'source'}
          <div class="source-content">
            <div class="tab-note">
              Source information and primary documents
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .sidebar-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .events-section {
    flex-shrink: 0;
    padding: 0.5rem;
    transition: max-height 0.3s ease-in-out;
    overflow-y: hidden; /* Changed from auto to hidden so only the table container scrolls */
    border-bottom: 1px solid #ddd;
    display: flex;
    flex-direction: column;
  }

  .events-section:not(.collapsed) {
    flex: 1;
    max-height: none;
  }

  .events-section.collapsed {
    max-height: 140px; /* About 2 events + header */
    min-height: 140px; /* Ensure consistent height */
  }

  .events-section.collapsed .events-table-container {
    max-height: 100px; /* Show about 2 events */
    overflow-y: auto;
  }

  .details-section {
    flex: 1;
    padding: 0.5rem;
    overflow-y: auto;
    background-color: #f9f9f9;
    animation: slideDown 0.3s ease-in-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .events-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.25rem;
    font-weight: normal;
  }

  .no-events {
    color: #666;
    font-style: italic;
    text-align: center;
    margin: 2rem 0;
  }

  .events-table-container {
    width: 100%;
    flex: 1;
    overflow-y: auto;
    margin-top: 0.25rem;
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 0; /* Remove gap between events */
  }

  .event-item {
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 0.5rem;
    border: 1px solid #eee;
    border-radius: 0; /* Remove border radius for tight fit */
    background-color: white;
    margin-bottom: 0; /* Remove margin */
    border-bottom: none; /* Remove bottom border to make them kiss */
  }

  .event-item:last-child {
    border-bottom: 1px solid #eee; /* Add border to last item */
  }

  .event-item:hover {
    background-color: #f5f5f5;
  }

  .event-item.selected {
    background-color: #e3f2fd;
    border-color: #2196f3;
  }

  .event-summary {
    line-height: 1.3;
    font-size: 0.85rem;
    color: #333;
  }

  /* Tab Navigation */
  .tab-navigation {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 0.5rem;
  }

  .tab-btn {
    flex: 1;
    padding: 0.5rem;
    border: none;
    background: #f5f5f5;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .tab-btn:hover {
    background: #e9e9e9;
  }

  .tab-btn.active {
    background: white;
    border-bottom-color: #2196f3;
    color: #2196f3;
  }

  /* Tab Content */
  .tab-content {
    flex: 1;
    overflow-y: auto;
  }

  .about-content,
  .source-content {
    display: flex;
    flex-direction: column;
    gap: 0; /* Remove gap between sections */
  }

  /* Related Section */
  .related-section {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    background: white;
    margin-top: 0.75rem; /* Space only above related section */
  }

  /* Event Details Compact Layout */
  .event-details-compact {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
  }

  .detail-line {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .detail-line:last-child {
    margin-bottom: 0;
  }

  .description-text {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #333;
  }

  .related-section h4 {
    margin: 0 0 0.75rem 0;
    color: #333;
  }

  .suggestion-category {
    margin-bottom: 1rem;
  }

  .suggestion-item {
    margin: 0.25rem 0;
    color: #2196f3;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .suggestion-item:hover {
    color: #1976d2;
  }

  .tab-note {
    font-style: italic;
    color: #666;
    padding: 1rem;
    text-align: center;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .events-section {
      padding: 0.5rem;
    }
    
    .details-section {
      padding: 0.5rem;
    }
    
    .event-item {
      padding: 0.5rem;
      font-size: 0.9rem;
    }

    .events-section.collapsed {
      max-height: 150px;
    }
  }
</style>