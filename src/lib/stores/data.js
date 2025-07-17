import { writable, derived } from 'svelte/store';
import { fetchSheetData } from '$lib/utils/dataFetcher.js';

/**
 * Core data store for the Renaissance Music Map
 * Manages all spreadsheet data and provides derived lookup tables
 */

export const mapData = writable({
  results: {},
  menus: {},
  activeResults: null,
  lookup: {},
  index: {},
  METADATA: {},
  isLoading: false,
  error: null
});

// Individual sheet stores for easier access
export const eventsData = writable([]);
export const locationsData = writable([]);
export const composersData = writable([]);
export const musiciansData = writable([]);
export const nonMusiciansData = writable([]);
export const institutionsData = writable([]);
export const headersData = writable([]);

// Map instance and markers
export const mapInstance = writable(null);
export const markerCluster = writable(null);
export const markers = writable([]);
export const totalMarkers = writable(0);

// Processed lookup tables for O(1) access
export const lookupTables = derived(mapData, ($mapData) => {
  if (!$mapData.METADATA || Object.keys($mapData.METADATA).length === 0) {
    console.log('No METADATA available for lookup tables');
    return {};
  }
  
  const lookup = {};
  const metadata = $mapData.METADATA;
  
  console.log('Building lookup tables from metadata:', Object.keys(metadata));
  
  for (const sheet in metadata) {
    if (sheet === "Events") continue; // Events don't need lookup
    
    const sheetArray = metadata[sheet];
    if (!sheetArray || !Array.isArray(sheetArray)) {
      console.log(`Skipping ${sheet}: not an array`);
      continue;
    }
    
    lookup[sheet] = {};
    
    // Find ID key dynamically based on sheet type
    let idKey = null;
    if (sheetArray.length > 0) {
      const firstEntry = sheetArray[0];
      
      // Look for specific ID patterns based on your documentation
      const idPatterns = {
        'Locations': ['LOCID', 'LOC_ID'],
        'Bio_Composers': ['BCOID', 'BCO_ID'],
        'Bio_Musicians': ['BMUID', 'BMU_ID'],
        'Bio_Nonmusicians': ['BNOID', 'BNO_ID'],
        'Institutions': ['INSID', 'INS_ID'],
        'Headers': ['ID', 'HEADER_ID'],
        'Doc_Entries': ['DOEID', 'DOE_ID'],
        'Occasions': ['OCCID', 'OCC_ID'],
        'Archival_Docs': ['ARDID', 'ARD_ID'],
        'Bibliography': ['BIBID', 'BIB_ID']
      };
      
      // Try sheet-specific patterns first
      if (idPatterns[sheet]) {
        for (const pattern of idPatterns[sheet]) {
          if (firstEntry[pattern]) {
            idKey = pattern;
            break;
          }
        }
      }
      
      // Fallback to generic ID search
      if (!idKey) {
        for (let key in firstEntry) {
          if (key.toLowerCase().includes("id")) {
            idKey = key;
            break;
          }
        }
      }
    }
    
    if (!idKey) {
      console.warn(`No ID key found for ${sheet}`);
      continue;
    }
    
    console.log(`Building lookup for ${sheet} using ID key: ${idKey}`);
    
    // Build lookup table
    for (let entry of sheetArray) {
      let id = entry[idKey];
      if (id) {
        lookup[sheet][id] = entry;
      }
    }
    
    console.log(`${sheet} lookup table created with ${Object.keys(lookup[sheet]).length} entries`);
  }
  
  console.log('Lookup tables built:', Object.keys(lookup));
  return lookup;
});

// Header index mapping for column name conversion
export const headerIndex = derived(mapData, ($mapData) => {
  const output = {};
  const headers = $mapData.METADATA.Headers || [];
  
  console.log('Building header index from', headers.length, 'headers');
  
  for (let i = 0; i < headers.length; i++) {
    let sheetid = headers[i]["Spreadsheet ID"];
    let javaid = headers[i]["JavaScript Name"];
    if (!sheetid || !javaid) continue;
    
    let id = `${sheetid}:${javaid}`;
    let value = headers[i]["Column Name"];
    if (!value) continue;
    
    output[id] = value;
  }
  
  console.log('Header index built with', Object.keys(output).length, 'mappings');
  return output;
});

/**
 * Initialize all data from Google Sheets
 */
export async function initializeData() {
  console.log('Starting data initialization...');
  
  mapData.update(d => ({ ...d, isLoading: true, error: null }));
  
  try {
    const sheets = [
      'Events', 
      'Locations', 
      'Bio_Composers', 
      'Bio_Musicians', 
      'Bio_Nonmusicians', 
      'Institutions', 
      'Headers',
      'Doc_Entries',
      'Occasions'
    ];
    
    const data = {};
    
    for (const sheet of sheets) {
      console.log(`Fetching ${sheet}...`);
      data[sheet] = await fetchSheetData(sheet);
      console.log(`${sheet} loaded:`, data[sheet].length, 'records');
    }
    
    console.log('All data loaded successfully');
    
    // Update individual stores
    eventsData.set(data.Events || []);
    locationsData.set(data.Locations || []);
    composersData.set(data.Bio_Composers || []);
    musiciansData.set(data.Bio_Musicians || []);
    nonMusiciansData.set(data.Bio_Nonmusicians || []);
    institutionsData.set(data.Institutions || []);
    headersData.set(data.Headers || []);
    
    // Update main store
    mapData.update(d => ({ 
      ...d, 
      METADATA: data, 
      isLoading: false,
      error: null
    }));
    
    console.log('Data initialization complete');
    
  } catch (error) {
    console.error('Failed to load data:', error);
    mapData.update(d => ({ 
      ...d, 
      isLoading: false, 
      error: error.message 
    }));
    throw error;
  }
}

/**
 * Refresh a specific sheet
 */
export async function refreshSheet(sheetName) {
  try {
    console.log(`Refreshing ${sheetName}...`);
    const sheetData = await fetchSheetData(sheetName);
    
    mapData.update(d => ({
      ...d,
      METADATA: { ...d.METADATA, [sheetName]: sheetData }
    }));
    
    // Update individual store if applicable
    switch(sheetName) {
      case 'Events':
        eventsData.set(sheetData);
        break;
      case 'Locations':
        locationsData.set(sheetData);
        break;
      case 'Bio_Composers':
        composersData.set(sheetData);
        break;
      case 'Bio_Musicians':
        musiciansData.set(sheetData);
        break;
      case 'Bio_Nonmusicians':
        nonMusiciansData.set(sheetData);
        break;
      case 'Institutions':
        institutionsData.set(sheetData);
        break;
      case 'Headers':
        headersData.set(sheetData);
        break;
    }
    
    console.log(`${sheetName} refreshed successfully`);
    
  } catch (error) {
    console.error(`Failed to refresh ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Get all events with location data
 */
export const eventsWithLocations = derived(
  [mapData, lookupTables],
  ([$mapData, $lookupTables]) => {
    const events = $mapData.METADATA?.Events || [];
    
    return events.map(event => {
      const location = $lookupTables.Locations?.[event.LOCID];
      return {
        ...event,
        location: location || null
      };
    }).filter(event => event.location); // Only events with valid locations
  }
);
