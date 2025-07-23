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
  mapData,
  $mapData => $mapData.METADATA?.Events || []
);
// If you want filtering, uncomment and fix this block with correct fieldnames!
// export const filteredEvents = derived(
//   [mapData, filters, lookupTables],
//   ([$mapData, $filters, $lookupTables]) => {
//     const rawEvents = $mapData.METADATA?.Events || [];
//     if (!Array.isArray(rawEvents)) return [];
//     return applyFilters(rawEvents, $filters, $lookupTables, {});
//   }
// );

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
      const location = $lookupTables.Locations?.[event.LOCID]; // Use LOCID per your sheet!
      if (!location) {
        console.warn(`No location found for event ${event.EVID} with LOCID: ${event.LOCID}`);
        return null;
      }
      // Try to get coordinates from COORD
      let coordinates = null;
      if (location.COORD) {
        // Ex: "45.4642,9.1900"
        const coords = location.COORD.split(',').map(Number);
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          coordinates = [coords[0], coords[1]];
        }
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
    console.log(`Mappable events: ${mappable.length} out of ${$filteredEvents.length} filtered events`);
    return mappable;
  }
);

console.debug('✅ filteredEvents in map.js:', filteredEvents);

filteredEvents.subscribe(events => {
  console.log('Updating sidebarState with', events.length, 'filtered events');
  sidebarState.update(state => ({
    ...state,
    activeMarkers: events,
    activeEvents: events,
    totalEvents: events.length
  }));
});


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
          event.EINFO || '',
          event.EYEAR || '',
          event.LYEAR || '',
          event.DATERANGE || '',
          personInfo?.aliases?.join(' ') || ''
        ].join(' ').toLowerCase()
      };
    });
  }
);