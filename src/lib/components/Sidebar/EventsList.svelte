<script>
  import { sidebarState } from '$lib/stores/map.js';
  import EventDetails from './EventDetails.svelte';

  let selectedEvent = null;

  $: visibleEvents = $sidebarState.activeMarkers || [];
  
  $: {
    console.log('EventsList: sidebarState activeMarkers count:', visibleEvents.length);
    console.log('EventsList: first few events:', visibleEvents.slice(0, 3));
  }

  function selectEvent(event) {
    selectedEvent = selectedEvent?.EVID === event.EVID ? null : event;
    // Update the sidebar state with selected event
    sidebarState.update(state => ({
      ...state,
      selectedEvent: selectedEvent
    }));
  }

  function formatEventSummary(event) {
    const description = event.Description || '';
    if (!description.trim()) {
      return 'No description available';
    }
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
</script>

<div class="sidebar-content">
  <h3>Events Shown on Map<br><span class="subtitle">(click to select event)</span></h3>
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
            
            {#if selectedEvent?.EVID === event.EVID}
              <div class="event-details-container">
                <EventDetails event={selectedEvent} />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .sidebar-content {
    padding: 1rem;
    height: 100%;
    overflow-y: auto;
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 0.8rem;
    font-weight: normal;
    color: #666;
  }

  .visible-count {
    font-size: 1rem;
    color: #666;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
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
    height: calc(100% - 3rem);
    overflow-y: auto;
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .event-item {
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 0.75rem;
    border: 1px solid #eee;
    border-radius: 4px;
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
    line-height: 1.4;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #333;
  }

  .event-details-container {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #ddd;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    padding: 0.5rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .sidebar-content {
      padding: 0.5rem;
    }
    
    .event-item {
      padding: 0.5rem;
      font-size: 0.9rem;
    }
  }
</style>