// Column index helper (equivalent to MAP.cindex)
export function getColumnIndex(headerIndex, sheetid, javaid) {
  return headerIndex[`${sheetid}:${javaid}`];
}

// Find info helper
export function findInfo(id, sheet, lookupTables) {
  return lookupTables[sheet] ? lookupTables[sheet][id] : null;
}

// Process event data for display
export function processEventForDisplay(event, lookupTables, headerIndex) {
  const locId = event.LOCID;
  const bioId = event.BIOID;

  // Check for missing required IDs
  if (!locId || !bioId || locId.trim() === '' || bioId.trim() === '') {
    console.warn("Event missing LOCID or BIOID", { EVID: event.EVID, LOCID: locId, BIOID: bioId });
    return null;
  }

  const locationInfo = findInfo(locId, "Locations", lookupTables);
  if (!locationInfo) {
    console.warn("No locationInfo for LOCID", locId, "Event:", event.EVID);
    return null;
  }

  const personInfo = getPersonInfo(bioId, lookupTables, headerIndex);
  if (!personInfo) {
    console.warn("No personInfo for BIOID", bioId, "Event:", event.EVID);
    return null;
  }

  const coordString = locationInfo?.Coordinates || locationInfo?.COORD || "";
  if (!coordString) {
    console.warn("No coordinates in location row:", locationInfo, event);
    return null;
  }
  const coordsArray = coordString.split(',').map(Number);
  if (coordsArray.length !== 2 || coordsArray.some(isNaN)) {
    console.warn("Invalid coordinates in location row:", coordString, locationInfo, event);
    return null;
  }
  const coordinates = [coordsArray[0], coordsArray[1]];

  return {
    ...event,
    locationInfo,
    personInfo,
    coordinates,
    personType: bioId.substring(0, 3)
  };
}

// Helper (no change needed):
function getPersonInfo(bioid, lookupTables, headerIndex) {
  if (!bioid) return null;
  const type = bioid.substring(0, 3);

  if (type === "BCO") {
    return findInfo(bioid, "Bio_Composers", lookupTables);
  } else if (type === "BMU") {
    return findInfo(bioid, "Bio_Musicians", lookupTables);
  } else if (type === "BNO") {
    return findInfo(bioid, "Bio_Nonmusicians", lookupTables);
  }
  return null;
}