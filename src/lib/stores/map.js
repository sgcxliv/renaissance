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
      const location = $lookupTables.Locations?.[event.LOCID];
      
      if (!location) {
        console.warn(`No location found for event ${event.EVID} with LOCID: ${event.LOCID}`);
        return null;
      }
      
      // Extract coordinates from location data
      let coordinates = null;
      if (location.coordinates) {
        // If coordinates are stored as a string like "45.4642,9.1900"
        const coords = location.coordinates.split(',');
        if (coords.length === 2) {
          coordinates = [parseFloat(coords[0]), parseFloat(coords[1])];
        }
      } else if (location.lat && location.lng) {
        // If stored separately
        coordinates = [parseFloat(location.lat), parseFloat(location.lng)];
      } else if (location.latitude && location.longitude) {
        // Alternative naming
        coordinates = [parseFloat(location.latitude), parseFloat(location.longitude)];
      }
      
      if (!coordinates || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
        console.warn(`Invalid coordinates for location ${event.LOCID}:`, location);
        return null;
      }
      
      return {
        ...event,
        location: location,
        coordinates: coordinates,
        // Add person information for display
        personInfo: getPersonInfo(event, $lookupTables),
        // Add institution information
        institutionInfo: getInstitutionInfo(event, $lookupTables)
      };
    }).filter(event => event !== null); // Remove events without valid locations
    
    console.log(`Mappable events: ${mappable.length} out of ${$filteredEvents.length} filtered events`);
    return mappable;
  }
);

/**
 * Update sidebarState when filteredEvents changes
 */
console.log('filteredEvents here:', filteredEvents, typeof filteredEvents);
if (!filteredEvents || typeof filteredEvents.subscribe !== 'function') {
  throw new Error('filteredEvents does not have a subscribe method:', filteredEvents);
}
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
    // This can be used by search components to get searchable events
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
