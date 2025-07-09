import { writable, derived } from 'svelte/store';

// Global MAP object equivalent
export const mapData = writable({
  results: {},
  menus: {},
  activeResults: null,
  lookup: {},
  index: {},
  METADATA: {}
});

// Map instance and markers
export const mapInstance = writable(null);
export const markerCluster = writable(null);
export const markers = writable([]);
export const totalMarkers = writable(0);

// Processed lookup tables for O(1) access
export const lookupTables = derived(mapData, ($mapData) => {
  if (!$mapData.METADATA || Object.keys($mapData.METADATA).length === 0) {
    return {};
  }
  
  const lookup = {};
  const metadata = $mapData.METADATA;
  
  for (const sheet in metadata) {
    if (sheet === "Events") continue;
    
    const sheetArray = metadata[sheet];
    if (!sheetArray || !Array.isArray(sheetArray)) continue;
    
    lookup[sheet] = {};
    
    // Find ID key dynamically
    let idKey = null;
    if (sheetArray.length > 0) {
      const firstEntry = sheetArray[0];
      for (let key in firstEntry) {
        if (key.toLowerCase().includes("id")) {
          idKey = key;
          break;
        }
      }
    }
    
    if (!idKey) continue;
    
    // Build lookup table
    for (let entry of sheetArray) {
      let id = entry[idKey];
      if (id) {
        lookup[sheet][id] = entry;
      }
    }
  }
  
  return lookup;
});

// Header index mapping
export const headerIndex = derived(mapData, ($mapData) => {
  const output = {};
  const headers = $mapData.METADATA.Headers || [];
  
  for (let i = 0; i < headers.length; i++) {
    let sheetid = headers[i]["Spreadsheet ID"];
    let javaid = headers[i]["JavaScript Name"];
    if (!sheetid || !javaid) continue;
    
    let id = `${sheetid}:${javaid}`;
    let value = headers[i]["Column Name"];
    if (!value) continue;
    
    output[id] = value;
  }
  
  return output;
});