import { writable, derived } from 'svelte/store';
import { mapData } from './data.js';
import { filters } from './filters.js';

export const mapState = writable({
  center: [45.0, 10.0],
  zoom: 6,
  selectedMarker: null
});

export const sidebarState = writable({
  isOpen: true,
  activeEvents: [],
  activeMarkers: []
});

// Derived store that processes events from mapData
export const processedEvents = derived(
  [mapData, filters],
  ([$mapData, $filters]) => {
    // Get events from METADATA
    const events = $mapData.METADATA?.Events || [];
    
    if (!Array.isArray(events)) {
      console.log('No events array found in mapData.METADATA');
      return [];
    }
    
    console.log('Processing events:', events.length);
    
    // Apply filters here if needed
    let filteredEvents = events;
    
    // Example filtering (adjust based on your filter structure)
    if ($filters.dateRange) {
      filteredEvents = filteredEvents.filter(event => {
        const eventYear = extractEventYear(event);
        return eventYear >= $filters.dateRange.min && eventYear <= $filters.dateRange.max;
      });
    }
    
    return filteredEvents;
  }
);

// Update sidebarState when processedEvents changes
processedEvents.subscribe(events => {
  sidebarState.update(state => ({
    ...state,
    activeMarkers: events,
    activeEvents: events
  }));
});

function extractEventYear(event) {
  // Same function as in filterHelpers.js
  if (event.year) return parseInt(event.year);
  if (event.date) {
    const match = event.date.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  }
  if (event.Date) {
    const match = event.Date.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  }
  return null;
}
