import { getColumnIndex, findInfo } from './dataProcessing.js';

// Create marker based on person type
export function createMarker(event, latlng, options = {}) {
  const personType = event.BIOID?.substring(0, 3);
  
  // Determine color based on person type
  let fillColor;
  if (personType === "BCO") {
    fillColor = "#440154"; // Purple for composers
  } else if (personType === "BMU") {
    fillColor = "#23ed5c"; // Green for musicians
  } else if (personType === "BNO") {
    fillColor = "#fde725"; // Yellow for non-musicians
  } else {
    fillColor = "#0c8aff"; // Default blue
  }

  const markerOptions = {
    radius: 5,
    fillColor: fillColor,
    color: "#000000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
    ...options
  };

  return L.circleMarker(latlng, markerOptions);
}

// Get cluster color based on dominant marker type
export function getClusterColor(markers) {
  if (!markers || markers.length === 0) return "#0c8aff";
  
  const colors = markers.map(m => m.options?.fillColor).filter(Boolean);
  
  // Count occurrences
  const colorCounts = {};
  colors.forEach(color => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });
  
  // Find dominant color
  let dominantColor = "#0c8aff";
  let maxCount = 0;
  
  for (const [color, count] of Object.entries(colorCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }
  
  return dominantColor;
}

// Create popup content
export function createPopupContent(event, lookupTables, headerIndex) {
  const personInfo = getPersonInfo(event.BIOID, lookupTables, headerIndex);
  // FIXED: use event.LOCID not event["Location ID (LOC)"]
  const locationInfo = findInfo(event.LOCID, "Locations", lookupTables);
  
  if (!personInfo || !locationInfo) return '';
  
  let content = `
    <div class="popup-content">
      <h3>${personInfo.name}</h3>
      <p><strong>Date:</strong> ${event.DATERANGE || 'Unknown'}</p>
      <p><strong>Place:</strong> ${getLocationDisplay(locationInfo, event)} </p>
  `;
  
  if (event.EINFO) {
    content += `<p><strong>Description:</strong> ${event.EINFO}</p>`;
  }
  
  // Add archival information
  const archival = getArchivalInfo(event, lookupTables, headerIndex);
  if (archival) {
    content += `<p><strong>Archival Document:</strong> ${archival}</p>`;
  }
  
  // Add bibliography
  const bibliography = getBibliographyInfo(event, lookupTables, headerIndex);
  if (bibliography) {
    content += `<p><strong>Bibliography:</strong> ${bibliography}</p>`;
  }
  
  // Add share link
  const shareID = event.EVID?.slice(3);
  if (shareID) {
    content += `
      <p>
        <a href="#" onclick="sharePoint('${shareID}')" class="share-link">
          <img src="/images/share_24.svg" alt="Share" style="height: 16px; width: 16px; margin-right: 5px;">
          Copy link
        </a>
      </p>
    `;
  }
  
  content += `</div>`;
  return content;
}

// Get location display with uncertainty markers
function getLocationDisplay(locationInfo, event) {
  const LOCNAME = 'LOCNAME'; // Should use headerIndex in a more abstract build, but fine as literal here.
  const CITY = 'CITY';
  
  let location = locationInfo[LOCNAME] || '';
  
  // Add larger location if available
  if (locationInfo[CITY]) {
    location += `, ${locationInfo[CITY]}`;
  }
  
  // Add uncertainty markers
  const certainty = event.CERTLOC;
  if (certainty && certainty !== "1") {
    if (certainty === "2") location += "?";
    else if (certainty === "3") location += "??";
    else if (certainty === "4") location += "???";
  }
  
  return location;
}

// Get archival document information
function getArchivalInfo(event, lookupTables, headerIndex) {
  if (!event.DOEID) return null;
  
  const docEntries = event.DOEID.includes(";") 
    ? event.DOEID.split(/\s*;\s*/)
    : [event.DOEID];
  
  let archiveInfo = '';
  
  for (let i = 0; i < docEntries.length; i++) {
    const docInfo = findInfo(docEntries[i], "Doc_Entries", lookupTables);
    if (!docInfo || !docInfo.ARDID) continue;
    
    const archivalDoc = findInfo(docInfo.ARDID, "Archival_Docs", lookupTables);
    if (!archivalDoc) continue;
    
    if (i > 0) archiveInfo += '; ';
    
    if (archivalDoc.ARC) {
      archiveInfo += archivalDoc.ARC;
      if (archivalDoc.ARCFOND) {
        archiveInfo += `, ${archivalDoc.ARCFOND}`;
      }
      if (archivalDoc.SIG) {
        archiveInfo += ` ${archivalDoc.SIG}`;
      }
    }
  }
  
  return archiveInfo || null;
}

// Get bibliography information
function getBibliographyInfo(event, lookupTables, headerIndex) {
  if (!event.BIBID) return null;
  
  const bibIDs = event.BIBID.includes(";")
    ? event.BIBID.split(/\s*;\s*/)
    : [event.BIBID];
  
  const bibPages = event.BIBPAGES?.includes(";")
    ? event.BIBPAGES.split(/\s*;\s*/)
    : [event.BIBPAGES || ''];
  
  let bibliography = '';
  
  for (let i = 0; i < bibIDs.length; i++) {
    const bibInfo = findInfo(bibIDs[i], "Bibliography", lookupTables);
    if (!bibInfo) continue;
    
    if (i > 0) bibliography += '; ';
    
    let entry = '';
    if (bibInfo.AUTHOR) entry += `${bibInfo.AUTHOR}, `;
    if (bibInfo.ARTNAME) entry += `"${bibInfo.ARTNAME}," `;
    if (bibInfo.VOLNAME) entry += `<i>${bibInfo.VOLNAME}</i>`;
    if (bibInfo.YEAR) entry += ` (${bibInfo.YEAR})`;
    if (bibInfo.PAGES) entry += `: ${bibInfo.PAGES}`;
    if (bibPages[i]) entry += `, at ${bibPages[i]}`;
    
    bibliography += entry;
  }
  
  return bibliography || null;
}

// Get person info helper
function getPersonInfo(bioid, lookupTables, headerIndex) {
  if (!bioid) return null;
  
  const type = bioid.substring(0, 3);
  let personInfo = null;
  let nameField = '';
  
  if (type === "BCO") {
    personInfo = findInfo(bioid, "Bio_Composers", lookupTables);
    nameField = 'BCONAME';
  } else if (type === "BMU") {
    personInfo = findInfo(bioid, "Bio_Musicians", lookupTables);
    nameField = 'BMUNAME';
  } else if (type === "BNO") {
    personInfo = findInfo(bioid, "Bio_Nonmusicians", lookupTables);
    nameField = 'BNONAME';
  }
  
  if (!personInfo) return null;
  
  return {
    ...personInfo,
    name: personInfo[nameField],
    type
  };
}

// Share point functionality
export function sharePoint(eventid) {
  const shareURL = `${window.location.origin}/?eventid=${eventid}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareURL).then(() => {
      console.log('Link copied to clipboard');
      // You could show a toast notification here
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  } else {
    // Fallback for older browsers
    console.log('Share URL:', shareURL);
  }
}