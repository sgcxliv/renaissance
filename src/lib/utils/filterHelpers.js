// Apply all filters to events array
export function applyFilters(events, filters, lookupTables, headerIndex) {
  if (!events || !Array.isArray(events)) return [];
  
  const {
    showComposers,
    showMusicians,
    showNonMusicians,
    showCertainty,
    searchText,
    dateRange,
    institutionFilter,
    activeNames
  } = filters;

  return events.filter(event => {
    // Person type filter
    const personType = event.BIOID?.substring(0, 3);
    let showPersonType = false;
    
    if (personType === "BCO" && showComposers) showPersonType = true;
    if (personType === "BMU" && showMusicians) showPersonType = true;
    if (personType === "BNO" && showNonMusicians) showPersonType = true;
    
    if (!showPersonType) return false;

    // Date range filter
    const startYear = parseInt(event.EYEAR) || 1400;
    const endYear = parseInt(event.LYEAR) || 1600;
    
    if (endYear < dateRange.min || startYear > dateRange.max) {
      return false;
    }

    // Certainty filter
    if (showCertainty) {
      const locCert = parseInt(event.CERTLOC) || 1;
      const dateCert = parseInt(event.CERTEDATE) || 1;
      const rangeCert = parseInt(event.CERTRANGE) || 1;
      
      if (locCert > 2 || dateCert > 2 || rangeCert > 2) {
        return false;
      }
    }

    // Institution filter
    if (institutionFilter && event.INSID !== institutionFilter) {
      return false;
    }

    // Active names filter
    if (activeNames.size > 0) {
      const personInfo = getPersonInfoForFilter(event.BIOID, lookupTables);
      if (!personInfo || !activeNames.has(personInfo.name)) {
        return false;
      }
    }

    // Search text filter
    if (searchText && searchText.trim()) {
      if (!matchesSearchText(event, searchText, lookupTables)) {
        return false;
      }
    }

    return true;
  });
}

// Check if event matches search text
function matchesSearchText(event, searchText, lookupTables) {
  const regex = new RegExp(searchText, 'i');
  
  // Get person name
  const personInfo = getPersonInfoForFilter(event.BIOID, lookupTables);
  const personName = personInfo?.name || '';
  
  // Get location name
  const locationInfo = lookupTables.Locations?.[event.LOCID];
  const locationName = locationInfo?.LOCNAME || '';
  
  // Get aliases
  const aliases = personInfo?.aliases?.join(' ') || '';
  
  // Build searchable text
  const searchableText = [
    personName,
    locationName,
    event.EINFO || '',
    aliases,
    event.EYEAR?.toString() || '',
    event.LYEAR?.toString() || '',
    event.DATERANGE || ''
  ].join(' ');
  
  return regex.test(searchableText);
}

// Helper to get person info for filtering
function getPersonInfoForFilter(bioid, lookupTables) {
  if (!bioid) return null;
  
  const type = bioid.substring(0, 3);
  let personInfo = null;
  let nameField = '';
  let aliasField = '';
  
  if (type === "BCO") {
    personInfo = lookupTables.Bio_Composers?.[bioid];
    nameField = 'BCONAME';
    aliasField = 'ALIAS';
  } else if (type === "BMU") {
    personInfo = lookupTables.Bio_Musicians?.[bioid];
    nameField = 'BMUNAME';
    aliasField = 'ALIAS';
  } else if (type === "BNO") {
    personInfo = lookupTables.Bio_Nonmusicians?.[bioid];
    nameField = 'BNONAME';
    aliasField = 'ALIAS';
  }
  
  if (!personInfo) return null;
  
  const aliases = personInfo[aliasField]?.includes(';')
    ? personInfo[aliasField].split(/\s*;\s*/)
    : [personInfo[aliasField]].filter(Boolean);
  
  return {
    ...personInfo,
    name: personInfo[nameField],
    aliases,
    type
  };
}

// Generate histogram data from filtered events
export function generateHistogramData(events, startYear = 1400, endYear = 1590) {
  const histogramData = {};
  
  // Initialize decades
  for (let year = startYear; year <= endYear; year += 10) {
    histogramData[year] = 0;
  }
  
  // Count events by decade
  events.forEach(event => {
    const earliestYear = parseInt(event.EYEAR);
    const latestYear = parseInt(event.LYEAR);
    
    if (isNaN(earliestYear) || isNaN(latestYear)) return;
    
    // Clamp years to histogram range
    const clampedEarliest = Math.max(startYear, earliestYear);
    const clampedLatest = Math.min(endYear, latestYear);
    
    // Get all decades this event spans
    const decades = getDecadesInRange(clampedEarliest, clampedLatest);
    
    decades.forEach(decade => {
      if (histogramData[decade] !== undefined) {
        histogramData[decade]++;
      }
    });
  });
  
  return histogramData;
}

// Get all decades an event spans
function getDecadesInRange(startYear, endYear) {
  const decades = [];
  const startDecade = Math.floor(startYear / 10) * 10;
  const endDecade = Math.floor(endYear / 10) * 10;
  
  for (let decade = startDecade; decade <= endDecade; decade += 10) {
    decades.push(decade);
  }
  
  return decades;
}