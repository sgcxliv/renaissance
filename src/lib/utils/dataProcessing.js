// Column index helper (equivalent to MAP.cindex)
export function getColumnIndex(headerIndex, sheetid, javaid) {
  return headerIndex[`${sheetid}:${javaid}`];
}

// Find info helper (equivalent to findInfo)
export function findInfo(id, sheet, lookupTables) {
  return lookupTables[sheet] ? lookupTables[sheet][id] : null;
}

// Build lookup tables (equivalent to buildLookupTables)
export function buildLookupTables(metadata) {
  const lookup = {};
  
  for (const sheet in metadata) {
    if (sheet === "Events") continue;
    
    const sheetArray = metadata[sheet];
    if (!sheetArray || !Array.isArray(sheetArray)) {
      console.warn("No METADATA FOR", sheet);
      continue;
    }
    
    lookup[sheet] = {};
    
    // Dynamically determine the ID key
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
    
    if (!idKey) {
      console.warn(`No ID key found for sheet ${sheet}`);
      continue;
    }
    
    for (let entry of sheetArray) {
      let id = entry[idKey];
      if (!id) {
        console.warn("NO ID FOR ENTRY", entry);
        continue;
      }
      lookup[sheet][id] = entry;
    }
  }
  
  return lookup;
}

// Process event data for display
export function processEventForDisplay(event, lookupTables, headerIndex) {
  // Get column indices
  const LOCID = getColumnIndex(headerIndex, "LOC", "LOCID");
  const LOCNAME = getColumnIndex(headerIndex, "LOC", "LOCNAME");
  const LOCCITY = getColumnIndex(headerIndex, "LOC", "CITY");
  const LOCCOUNTRY = getColumnIndex(headerIndex, "LOC", "COUNTRY");
  const COORD = getColumnIndex(headerIndex, "LOC", "COORD");
  
  // Find related data
  const locationInfo = findInfo(event.LOCID, "Locations", lookupTables);
  if (!locationInfo) return null;
  
  const personInfo = getPersonInfo(event.BIOID, lookupTables, headerIndex);
  if (!personInfo) return null;
  
  // Process coordinates
  const coordinates = locationInfo[COORD];
  if (!coordinates) return null;
  
  const coordsArray = coordinates.split(',').map(Number);
  if (coordsArray.length !== 2 || isNaN(coordsArray[0]) || isNaN(coordsArray[1])) {
    return null;
  }
  
  // Swap latitude and longitude for Leaflet
  const coordinatesProcessed = [coordsArray[1], coordsArray[0]];
  
  return {
    ...event,
    locationInfo,
    personInfo,
    coordinates: coordinatesProcessed,
    personType: event.BIOID.substring(0, 3)
  };
}

// Get person information based on ID type
function getPersonInfo(bioid, lookupTables, headerIndex) {
  if (!bioid) return null;
  
  const type = bioid.substring(0, 3);
  const BCONAME = getColumnIndex(headerIndex, "BCO", "BCONAME");
  const BMUNAME = getColumnIndex(headerIndex, "BMU", "BMUNAME");
  const BNONAME = getColumnIndex(headerIndex, "BNO", "BNONAME");
  const BCOALIAS = getColumnIndex(headerIndex, "BCO", "ALIAS");
  const BMUALIAS = getColumnIndex(headerIndex, "BMU", "ALIAS");
  const BNOALIAS = getColumnIndex(headerIndex, "BNO", "ALIAS");
  
  let personInfo = null;
  let name = null;
  let aliases = null;
  
  if (type === "BCO") {
    personInfo = findInfo(bioid, "Bio_Composers", lookupTables);
    if (personInfo) {
      name = personInfo[BCONAME];
      aliases = personInfo[BCOALIAS];
    }
  } else if (type === "BMU") {
    personInfo = findInfo(bioid, "Bio_Musicians", lookupTables);
    if (personInfo) {
      name = personInfo[BMUNAME];
      aliases = personInfo[BMUALIAS];
    }
  } else if (type === "BNO") {
    personInfo = findInfo(bioid, "Bio_Nonmusicians", lookupTables);
    if (personInfo) {
      name = personInfo[BNONAME];
      aliases = personInfo[BNOALIAS];
    }
  }
  
  if (!personInfo || !name) return null;
  
  // Process aliases
  let aliasArray = [];
  if (aliases && aliases.includes(";")) {
    aliasArray = aliases.trim().split(/\s*;\s*/);
  } else if (aliases) {
    aliasArray = [aliases];
  }
  
  return {
    ...personInfo,
    name,
    aliases: aliasArray,
    type
  };
}