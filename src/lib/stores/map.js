import { writable, derived } from 'svelte/store';
import { mapData, lookupTables } from './data.js';
import { filters } from './filters.js';
import { applyFilters } from '$lib/utils/filterHelpers.js';

/**
 * Map-related stores for managing map state and filtered data
 */

export const mapState = writable({
  center: [45.0, 10.0], // Default to center of Europe
  zoom: 6,
  selectedMarker: null,
  selectedEvent: null
});

export const sidebarState = writable({
  isOpen: true,
  activeEvents: [],
  activeMarkers: [],
  totalEvents: 0,
  selectedEvent: null
});

/**
 * Derived store that applies all filters to events
 */
export const filteredEvents = derived(
  [mapData, filters, lookupTables],
  ([$mapData, $filters, $lookupTables]) => {
    console.log('=== Filtering Events ===');
    console.log('mapData METADATA keys:', Object.keys($mapData.METADATA || {}));
    console.log('filters:', $filters);
    console.log('lookupTables keys:', Object.keys($lookupTables || {}));
    
    // Get raw events from METADATA
    const rawEvents = $mapData.METADATA?.Events || [];
    
    if (!Array.isArray(rawEvents)) {
      console.log('No events array found in mapData.METADATA');
      return [];
    }
    
    console.log('Raw events count:', rawEvents.length);
    
    if (rawEvents.length === 0) {
      console.log('No events to filter');
      return [];
    }
    
    // Log sample event structure
    if (rawEvents.length > 0) {
      console.log('Sample event structure:', Object.keys(rawEvents[0]));
    }
    
    // Apply filters using your filterHelpers function
    const filtered = applyFilters(rawEvents, $filters, $lookupTables, {});
    
    console.log('Filtered events count:', filtered.length);
    console.log('========================');
    
    return filtered;
  }
);

/**
 * Events with location data for map display
 */
export const mappableEvents = derived(
  [filteredEvents, lookupTables],
  ([$filteredEvents, $lookupTables]) => {
    if (!$filteredEvents || $filteredEvents.length === 0) {
      return [];
    }
    
    const mappable = $filteredEvents.map(event => {
      const location = $lookupTables.Locations?.[event.
