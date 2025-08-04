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
    
    // Before building the lookup table for each sheet:
    const keyMap = {
      'Locations': { id: 'LOCID', fallback: 'Location ID (LOC)' },
      'Bio_Musicians': { 
        id: 'BMUID', 
        fallback: 'Biography ID (BCO, BMU, BNO)', 
        alt: 'Biography Musician (BMU) ID' // <-- add this line
      },
      // ...add for other sheets as needed
    };

    // Find ID key dynamically based on sheet type
    let idKey = null;
    if (sheetArray.length > 0) {
      const firstEntry = sheetArray[0];
      if (keyMap[sheet]) {
        if (firstEntry[keyMap[sheet].id]) {
          idKey = keyMap[sheet].id;
        } else if (firstEntry[keyMap[sheet].fallback]) {
          idKey = keyMap[sheet].fallback;
        } else if (keyMap[sheet].alt && firstEntry[keyMap[sheet].alt]) {
          idKey = keyMap[sheet].alt;
        }
      }
      // Try sheet-specific patterns first
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
    console.log(`${sheet} lookup keys:`, Object.keys(lookup[sheet]).slice(0, 10));
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
    
    // --- Normalize Events after fetching ---
    if (data.Events) {
      function clean(s) { return typeof s === "string" ? s.replace(/^\uFEFF/, "").trim() : s; }
      function getField(o, ...names) {
        for (const key of names) {
          for (const k of Object.keys(o)) {
            if (
              k === key || clean(k) === clean(key) ||
              clean(k).toLowerCase() === clean(key).toLowerCase()
            ) return o[k];
          }
        }
        return undefined;
      }
      
      data.Events = data.Events.map(event => {
        const locid = event.LOCID || getField(
          event, "Location ID (LOC)", " Location ID (LOC)", "Location Id (LOC)"
        );
        const bioid = event.BIOID || getField(
          event, "Biography ID (BCO, BMU, BNO)",
          "Biography Musician (BMU) ID", "Biography Composer (BCO) ID", "Biography Nonmusician (BNO) ID"
        );
        const insid = event.INSID || getField(event, "Institution ID (INS)");
        
        // Map CSV field names to expected field names
        return {
          ...event,
          EVID: event.EVID || event.ID,
          LOCID: locid || event['Location ID (LOC)'], // Fix: Use the actual CSV field name
          BIOID: bioid || event['Biography ID (BCO, BMU, BNO)'], // Fix: Use the actual CSV field name  
          INSID: insid || event['Institution ID (INS)'],
          DATERANGE: event.DATERANGE || event['Date Range'],
          CERTLOC: event.CERTLOC || event['LOC Certainty'],
          CERTEDATE: event.CERTEDATE || event['Earliest Date Certainty'],
          CERTLDATE: event.CERTLDATE || event['Latest Date Certainty'],
          CERTRANGE: event.CERTRANGE || event['Certainty of Event (within Range)'],
          EYEAR: event.EYEAR || event['Earliest Year'],
          LYEAR: event.LYEAR || event['Latest Year'],
          DOEID: event.DOEID || event['Document Entry ID (DOE)'],
          BIBID: event.BIBID || event['Bibliography ID (BIB)'],
          BIBPAGES: event.BIBPAGES || event['BIB Pages'],
          Description: event.Description || event.EINFO || getField(event, "Description", "Event Description")
        };
      });
      
      // Check for duplicate EVIDs
      const evids = data.Events.map(e => e.EVID);
      const duplicateEvids = evids.filter((evid, index) => evids.indexOf(evid) !== index);
      if (duplicateEvids.length > 0) {
        console.warn('Duplicate EVIDs found:', [...new Set(duplicateEvids)]);
        console.warn('Total events:', data.Events.length, 'Unique EVIDs:', new Set(evids).size);
      }
      
      console.log("Events normalized. First event:", data.Events[0]);
      console.log("Sample location data:", data.Locations?.[0]);
    }
    // --- END NORMALIZATION ---
    
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
 * (EVENT LOCID, NOT long-name!)
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