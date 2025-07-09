<script>
  import { sidebarState } from '$lib/stores/map.js';
  import { searchCount } from '$lib/stores/filters.js';
  import EventDetails from './EventDetails.svelte';

  let selectedEvent = null;

  $: visibleEvents = $sidebarState.activeMarkers || [];
  $: searchCount.set(visibleEvents.length);

  function selectEvent(event) {
    selectedEvent = selectedEvent?.EVID === event.EVID ? null : event;
  }

  function formatEventText(event) {
    const dateRange = event.DATERANGE || 'Unknown date';
    const personName = event.personInfo?.name || 'Unknown person';
    const description = event.EINFO || '';
    
    return `[${dateRange}] ${personName}: ${description}`;
  }

  function sanitizeEventId(eventId) {
    return eventId?.replace(/[^a-zA-Z0-9-_]/g, '_') || '';
  }
</script>

<div class="sidebar-content">
  <h3>Visible Events</h3>
  
  {#if visibleEvents.length === 0}
    <p class="no-events">No events match current filters</p>
  {:else}
    <div class="events-table-container">
      <table id="active-markers-table">
        <thead>
          <tr>
            <th>Events</th>
          </tr>
        </thead>
        <tbody>
          {#each visibleEvents as event (event.EVID)}
            <tr 
              class="event-row"
              class:selected={selectedEvent?.EVID === event.EVID}
              on:click={() => selectEvent(event)}
              on:keydown={(e) => e.key === 'Enter' && selectEvent(event)}
              role="button"
              tabindex="0"
            >
              <td>
                <div class="event-text">
                  {formatEventText(event)}
                </div>
                
                {#if selectedEvent?.EVID === event.EVID}
                  <div class="event-details-container">
                    <EventDetails event={selectedEvent} />
                  </div>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
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

  #active-markers-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }

  #active-markers-table th {
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    padding: 8px 5px;
    background-color: #f4f4f4;
    border-bottom: 1px solid #ccc;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .event-row {
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .event-row:hover {
    background-color: #f5f5f5;
  }

  .event-row.selected {
    background-color: #e3f2fd;
  }

  #active-markers-table td {
    text-align: left;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    font-size: 12px;
    padding: 6px 8px;
    white-space: pre-wrap;
    vertical-align: top;
    border-bottom: 1px solid #eee;
  }

  .event-text {
    line-height: 1.4;
    margin-bottom: 0.5rem;
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
    
    #active-markers-table td {
      font-size: 11px;
      padding: 4px 6px;
    }
  }
</style>