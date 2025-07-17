import { writable, derived } from 'svelte/store';
import { mapData, lookupTables } from './data.js';
import { filters } from './filters.js';
import { applyFilters } from '$lib/utils/filterHelpers.js';

export const mapState = writable({
  center: [45.0, 10.0],
  zoom: 6,
  selectedMarker: null
});

export const sidebarState = writable({
  isOpen: true,
  activeEvents: [],
  activeMarkers: [],
  totalEvents: 0
});

// Derived store that gets and filters events
export const filteredEvents = derived(
  [mapData, filters, lookupTables],
  ([$mapData, $filters, $lookupTables]) => {
    console.log('filteredEvents derived - starting');
    console.log('mapData METADATA:', $mapData.METADATA);
    console.log('filters:', $filters);
    console.log('lookupTables:', $lookupTables);
    
    // Get raw events from METADATA
    const rawEvents = $mapData.METADATA?.Events || [];
    
    if (!Array.isArray(rawEvents)) {
      console.log('No events array found');
      return [];
    }
    
    console.log('Raw events count:', rawEvents.length);
    
    // Apply filters
    const filtered = applyFilters(rawEvents, $filters, $lookupTables, {});
    
    console.log('Filtered events count:', filtered.length);
    return filtered;
  }
);

// Update sidebarState when filteredEvents changes
filteredEvents.subscribe(events => {
  console.log('Updating sidebarState with', events.length, 'events');
  sidebarState.update(state => ({
    ...state,
    activeMarkers: events,
    activeEvents: events,
    totalEvents: events.length
  }));
});
