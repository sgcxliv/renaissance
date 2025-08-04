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

console.log("Inside map.js: mapData", mapData, "filters", filters, "lookupTables", lookupTables);

export const filteredEvents = derived(
  [mapData, filters, lookupTables],
  ([$mapData, $filters, $lookupTables]) => {
    const rawEvents = $mapData.METADATA?.Events || [];
    console.log('filteredEvents: rawEvents count:', rawEvents.length);
    console.log('filteredEvents: current filters:', $filters);
    console.log('filteredEvents: lookupTables available:', Object.keys($lookupTables));
    
    // Sample a few events to check their date fields
    if (rawEvents.length > 0) {
      console.log('filteredEvents: Sample events:');
      for (let i = 0; i < Math.min(3, rawEvents.length); i++) {
        const event = rawEvents[i];
        console.log(`  Event ${i}:`, {
          EVID: event.EVID,
          EYEAR: event.EYEAR,
          LYEAR: event.LYEAR,
          BIOID: event.BIOID,
          LOCID: event.LOCID
        });
      }
    }
    
    if (!Array.isArray(rawEvents)) {
      console.warn('filteredEvents: rawEvents is not an array:', rawEvents);
      return [];
    }
    if (!$lookupTables || Object.keys($lookupTables).length === 0) {
      console.warn('filteredEvents: no lookup tables available');
      return [];
    }
    
    const filtered = applyFilters(rawEvents, $filters, $lookupTables, {});
    console.log('filteredEvents: filtered count:', filtered.length);
    
    if (filtered.length === 0 && rawEvents.length > 0) {
      console.warn('filteredEvents: All events filtered out! Sample event:', rawEvents[0]);
      console.warn('filteredEvents: Sample event BIOID:', rawEvents[0]?.BIOID);
      console.warn('filteredEvents: Sample event EYEAR/LYEAR:', rawEvents[0]?.EYEAR, rawEvents[0]?.LYEAR);
      console.warn('filteredEvents: Current date range filter:', $filters.dateRange);
    }
    
    return filtered;
  }
);

/**
 * Events with location data for map display
 */
export const mappableEvents = derived(
  [filteredEvents, lookupTables],
  ([$filteredEvents, $lookupTables]) => {
    console.log('mappableEvents: input filteredEvents count:', $filteredEvents?.length || 0);
    
    if (!$filteredEvents || $filteredEvents.length === 0) {
      console.log('mappableEvents: no filtered events available');
      return [];
    }
    
    const mappable = $filteredEvents.map(event => {
      const location = $lookupTables.Locations?.[event.LOCID]; // Use LOCID per your sheet!
      if (!location) {
        console.warn(`No location found for event ${event.EVID} with LOCID: ${event.LOCID}`);
        return null;
      }
      // Try to get coordinates from various possible field names
      let coordinates = null;
      
      if (location.Coordinates) {
        // Ex: "50.17760749704224, 3.2357382725777493"
        const coords = location.Coordinates.split(',').map(s => Number(s.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          coordinates = [coords[0], coords[1]];
        }
      } else if (location.COORD) {
        // Fallback to COORD field
        const coords = location.COORD.split(',').map(Number);
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          coordinates = [coords[0], coords[1]];
        }
      } else if (location['Google URL']) {
        // Try to extract coordinates from Google Maps URL
        console.log('Attempting to extract coordinates from Google URL for:', event.LOCID);
        // For now, skip events without direct coordinates
        console.warn(`No direct coordinates for location ${event.LOCID}, has Google URL:`, location['Google URL']);
        return null;
      }
      
      if (!coordinates) {
        console.warn(`Invalid coordinates for location ${event.LOCID}:`, location);
        return null;
      }
      return {
        ...event,
        location: location,
        coordinates: coordinates,
        personInfo: getPersonInfo(event, $lookupTables),
        institutionInfo: getInstitutionInfo(event, $lookupTables)
      };
    }).filter(e => e !== null);
    console.log(`mappableEvents: ${mappable.length} out of ${$filteredEvents.length} filtered events have valid locations`);
    return mappable;
  }
);

console.debug('✅ filteredEvents in map.js:', filteredEvents);

// Auto-update sidebarState when mappableEvents changes using a derived store
const sidebarUpdater = derived(mappableEvents, ($mappableEvents) => {
  console.log('Auto-updating sidebarState with', $mappableEvents.length, 'mappable events');
  sidebarState.update(state => ({
    ...state,
    activeMarkers: $mappableEvents,
    activeEvents: $mappableEvents,
    totalEvents: $mappableEvents.length
  }));
  return $mappableEvents;
});

// Subscribe to ensure the derived store runs
sidebarUpdater.subscribe(() => {});


/**
 * Helper function to get person information for an event
 */
function getPersonInfo(event, lookupTables) {
  if (!event.BIOID) return null;
  const bioId = event.BIOID;
  const type = bioId.substring(0, 3);
  let personInfo = null;
  let nameField = '';
  switch (type) {
    case "BCO":
      personInfo = lookupTables.Bio_Composers?.[bioId];
      nameField = 'BCONAME';
      break;
    case "BMU":
      personInfo = lookupTables.Bio_Musicians?.[bioId];
      nameField = 'BMUNAME';
      break;
    case "BNO":
      personInfo = lookupTables.Bio_Nonmusicians?.[bioId];
      nameField = 'BNONAME';
      break;
    default:
      console.warn(`Unknown person type: ${type} for BIOID: ${bioId}`);
      return null;
  }
  if (!personInfo) {
    console.warn(`No person info found for ${bioId}`);
    return null;
  }
  return {
    ...personInfo,
    name: personInfo[nameField] || 'Unknown',
    type: type,
    aliases: personInfo.ALIAS ? personInfo.ALIAS.split(/\s*;\s*/) : []
  };
}

/**
 * Helper function to get institution information for an event
 */
function getInstitutionInfo(event, lookupTables) {
  if (!event.INSID) return null;
  const institutionInfo = lookupTables.Institutions?.[event.INSID];
  if (!institutionInfo) {
    console.warn(`No institution info found for ${event.INSID}`);
    return null;
  }
  return institutionInfo;
}

/**
 * Helper function to select an event (for map interaction)
 */
export function selectEvent(event) {
  mapState.update(state => ({
    ...state,
    selectedEvent: event,
    selectedMarker: event
  }));

  sidebarState.update(state => ({
    ...state,
    selectedEvent: event
  }));
}

/**
 * Helper function to clear selection
 */
export function clearSelection() {
  mapState.update(state => ({
    ...state,
    selectedEvent: null,
    selectedMarker: null
  }));

  sidebarState.update(state => ({
    ...state,
    selectedEvent: null
  }));
}

/**
 * Helper function to focus map on specific coordinates
 */
export function focusMap(coordinates, zoom = 10) {
  mapState.update(state => ({
    ...state,
    center: coordinates,
    zoom: zoom
  }));
}

/**
 * Helper function to toggle sidebar
 */
export function toggleSidebar() {
  sidebarState.update(state => ({
    ...state,
    isOpen: !state.isOpen
  }));
}

/**
 * Search events by text (for search functionality)
 */
export const searchResults = derived(
  [filteredEvents, lookupTables],
  ([$filteredEvents, $lookupTables]) => {
    return $filteredEvents.map(event => {
      const personInfo = getPersonInfo(event, $lookupTables);
      const locationInfo = $lookupTables.Locations?.[event.LOCID];
      const institutionInfo = getInstitutionInfo(event, $lookupTables);
      return {
        ...event,
        searchableText: [
          personInfo?.name || '',
          locationInfo?.LOCNAME || '',
          institutionInfo?.INSNAME || '',
          event.Description || '',
          event.EYEAR || '',
          event.LYEAR || '',
          event.DATERANGE || event['Date Range'] || '',
          personInfo?.aliases?.join(' ') || ''
        ].join(' ').toLowerCase()
      };
    });
  }
);