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
    
    // Debug first few events
    const shouldDebug = Math.random() < 0.01; // Debug ~1% of events
    if (shouldDebug) {
      console.log('filterHelpers date check:', {
        EVID: event.EVID,
        EYEAR: event.EYEAR,
        LYEAR: event.LYEAR,
        startYear,
        endYear,
        dateRangeMin: dateRange.min,
        dateRangeMax: dateRange.max,
        passes: !(endYear < dateRange.min || startYear > dateRange.max)
      });
    }
    
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
  // Clean and normalize search text: remove punctuation and convert to lowercase
  const cleanSearchText = searchText.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  if (!cleanSearchText) return true;
  
  // Split into individual words for word-based matching
  const searchWords = cleanSearchText.split(/\s+/).filter(word => word.length > 0);
  
  // Get person name
  const personInfo = getPersonInfoForFilter(event.BIOID, lookupTables);
  const personName = personInfo?.name || '';
  
  // Get location name and city
  const locationInfo = lookupTables.Locations?.[event.LOCID];
  const locationName = locationInfo?.LOCNAME || '';
  const cityName = locationInfo?.CITY || '';
  
  // Get aliases
  const aliases = personInfo?.aliases?.join(' ') || '';
  
  // Get event description (check both Description and EINFO fields for compatibility)
  const eventDescription = event.Description || event.EINFO || '';
  
  // Build searchable text and normalize it
  const searchableText = [
    personName,
    locationName,
    cityName,
    eventDescription,
    aliases,
    event.EYEAR?.toString() || '',
    event.LYEAR?.toString() || '',
    event.DATERANGE || event['Date Range'] || ''
  ].join(' ').toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Check if all search words are found in the searchable text
  return searchWords.every(word => searchableText.includes(word));
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
  
  // Count events by decade - each event counted ONCE in its earliest year's decade
  events.forEach(event => {
    const earliestYear = parseInt(event.EYEAR);
    
    if (isNaN(earliestYear)) return;
    
    // Find which decade bucket this event belongs to based on earliest year
    const decade = Math.floor(earliestYear / 10) * 10;
    
    // Only count if the decade is within our histogram range
    if (histogramData[decade] !== undefined) {
      histogramData[decade]++;
    }
  });
  
  return histogramData;
}