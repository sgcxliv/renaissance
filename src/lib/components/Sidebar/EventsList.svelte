<script>
  import { sidebarState, mappableEvents } from '$lib/stores/map.js';
  import EventDetails from './EventDetails.svelte';

  let selectedEvent = null;
  let activeTab = 'about'; // 'about' or 'source'

  // Listen to external selection changes (e.g., from map clicks)
  $: if ($sidebarState.selectedEvent !== selectedEvent) {
    selectedEvent = $sidebarState.selectedEvent;
  }

  // Use mappableEvents directly instead of sidebarState.activeMarkers
  $: visibleEvents = ($mappableEvents || []).filter(event => {
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
    const description = event.Description || '';
    const words = description.split(' ');
    const summary = words.slice(0, 10).join(' ');
    return summary + (words.length > 10 ? '...' : '');
  }

  function formatEventText(event) {
    const dateRange = event.DATERANGE || event['Date Range'] || 'Unknown date';
    const personName = event.personInfo?.name || 'Unknown person';
    const description = event.Description || '';
    
    return `[${dateRange}] ${personName}: ${description}`;
  }

  function sanitizeEventId(eventId) {
    return eventId?.replace(/[^a-zA-Z0-9-_]/g, '_') || '';
  }

  // Check if event has media (placeholder for now - you'll need to implement based on your data structure)
  function hasMedia(event) {
    // Add logic here based on your data structure
    return false; // placeholder
  }

  // Check if event has audio (placeholder for now - you'll need to implement based on your data structure)
  function hasAudio(event) {
    // Add logic here based on your data structure
    return false; // placeholder
  }
</script>

<div class="sidebar-container">
  <!-- Events List Section -->
  <div class="events-section" class:collapsed={selectedEvent}>
    <!-- <h3>Events<br><span class="subtitle">(click to select)</span></h3> -->
    <div class="visible-count">
      {visibleEvents.length} event{visibleEvents.length === 1 ? '' : 's'} visible
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
            <!-- Basic Event Details -->
            <EventDetails event={selectedEvent} />
            
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

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.25rem;
  }

  .subtitle {
    font-size: 0.8rem;
    font-weight: normal;
    color: #666;
  }

  .visible-count {
    font-size: 0.9rem;
    color: #666;
    padding-bottom: 0.25rem;
    margin-bottom: 0.25rem;
    border-bottom: 1px solid #eaeaea;
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
    gap: 0.25rem;
  }

  .event-item {
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 0.5rem;
    border: 1px solid #eee;
    border-radius: 3px;
    background-color: white;
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
    gap: 0.5rem;
  }

  .story-link {
    margin-top: 0.5rem;
    color: #2196f3;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.9rem;
  }

  /* Related Section */
  .related-section {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    background: white;
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