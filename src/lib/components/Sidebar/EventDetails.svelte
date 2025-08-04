<script>
  import { lookupTables, headerIndex } from '$lib/stores/data.js';
  import { findInfo } from '$lib/utils/dataProcessing.js';

  export let event;

  $: personInfo = getPersonInfo(event?.BIOID);
  $: locationInfo = getLocationInfo(event?.LOCID);
  $: institutionInfo = getInstitutionInfo(event?.INSID);
  $: archivalInfo = getArchivalInfo(event?.DOEID);
  $: bibliographyInfo = getBibliographyInfo(event?.BIBID, event?.BIBPAGES);

  function getPersonInfo(bioid) {
    if (!bioid || !$lookupTables) return null;
    
    const type = bioid.substring(0, 3);
    let person = null;
    let nameField = '';
    let aliasField = 'ALIAS';
    
    if (type === "BCO") {
      person = findInfo(bioid, "Bio_Composers", $lookupTables);
      nameField = 'BCONAME';
    } else if (type === "BMU") {
      person = findInfo(bioid, "Bio_Musicians", $lookupTables);
      nameField = 'BMUNAME';
    } else if (type === "BNO") {
      person = findInfo(bioid, "Bio_Nonmusicians", $lookupTables);
      nameField = 'BNONAME';
    }
    
    if (!person) return null;
    
    const aliases = person[aliasField]?.includes(';')
      ? person[aliasField].split(/\s*;\s*/)
      : [person[aliasField]].filter(Boolean);
    
    return {
      name: person[nameField],
      aliases,
      type: type === "BCO" ? "Composer" : type === "BMU" ? "Musician" : "Non-musician"
    };
  }

  function getLocationInfo(locid) {
    if (!locid || !$lookupTables) return null;
    
    const location = findInfo(locid, "Locations", $lookupTables);
    if (!location) return null;
    
    let displayName = location.LOCNAME || '';
    if (location.CITY) {
      displayName += `, ${location.CITY}`;
    }
    if (location.COUNTRY) {
      displayName += `, ${location.COUNTRY}`;
    }
    
    // Add uncertainty markers
    const certainty = event?.CERTLOC;
    if (certainty && certainty !== "1") {
      if (certainty === "2") displayName += "?";
      else if (certainty === "3") displayName += "??";
      else if (certainty === "4") displayName += "???";
    }
    
    return {
      ...location,
      displayName
    };
  }

  function getInstitutionInfo(insid) {
    if (!insid || !$lookupTables) return null;
    return findInfo(insid, "Institutions", $lookupTables);
  }

  function getArchivalInfo(doeid) {
    if (!doeid || !$lookupTables) return null;
    
    const docEntries = doeid.includes(";") ? doeid.split(/\s*;\s*/) : [doeid];
    const archivalDocs = [];
    
    for (const docId of docEntries) {
      const docInfo = findInfo(docId, "Doc_Entries", $lookupTables);
      if (!docInfo?.ARDID) continue;
      
      const archivalDoc = findInfo(docInfo.ARDID, "Archival_Docs", $lookupTables);
      if (archivalDoc) {
        let signature = '';
        if (archivalDoc.ARC) {
          signature = archivalDoc.ARC;
          if (archivalDoc.ARCFOND) signature += `, ${archivalDoc.ARCFOND}`;
          if (archivalDoc.SIG) signature += ` ${archivalDoc.SIG}`;
        }
        
        archivalDocs.push({
          ...archivalDoc,
          signature,
          docEntry: docInfo
        });
      }
    }
    
    return archivalDocs.length > 0 ? archivalDocs : null;
  }

  function getBibliographyInfo(bibid, bibpages) {
    if (!bibid || !$lookupTables) return null;
    
    const bibIDs = bibid.includes(";") ? bibid.split(/\s*;\s*/) : [bibid];
    const bibPages = bibpages?.includes(";") ? bibpages.split(/\s*;\s*/) : [bibpages || ''];
    const bibliography = [];
    
    for (let i = 0; i < bibIDs.length; i++) {
      const bibInfo = findInfo(bibIDs[i], "Bibliography", $lookupTables);
      if (!bibInfo) continue;
      
      let citation = '';
      if (bibInfo.AUTHOR) citation += `${bibInfo.AUTHOR}, `;
      if (bibInfo.ARTNAME) citation += `"${bibInfo.ARTNAME}," `;
      if (bibInfo.VOLNAME) citation += `<em>${bibInfo.VOLNAME}</em>`;
      if (bibInfo.EDIT) citation += `, ed. ${bibInfo.EDIT}`;
      if (bibInfo.VOLNO) citation += ` ${bibInfo.VOLNO}`;
      if (bibInfo.BIBLOC && bibInfo.PUB && bibInfo.YEAR) {
        citation += ` (${bibInfo.BIBLOC}: ${bibInfo.PUB}, ${bibInfo.YEAR})`;
      } else if (bibInfo.YEAR) {
        citation += ` (${bibInfo.YEAR})`;
      }
      if (bibInfo.PAGES) citation += `: ${bibInfo.PAGES}`;
      if (bibPages[i]) citation += `, at ${bibPages[i]}`;
      
      bibliography.push({
        ...bibInfo,
        citation
      });
    }
    
    return bibliography.length > 0 ? bibliography : null;
  }

  function formatDateWithUncertainty(dateRange, certainty) {
    if (!dateRange) return 'Unknown date';
    
    let display = dateRange;
    if (certainty && certainty !== "1") {
      if (certainty === "2") display += "?";
      else if (certainty === "3") display += "??";
      else if (certainty === "4") display += "???";
    }
    
    return display;
  }

  function copyShareLink() {
    const eventId = event?.EVID?.slice(3); // Remove "EV:" prefix
    if (!eventId) return;
    
    const shareURL = `${window.location.origin}/?eventid=${eventId}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareURL).then(() => {
        console.log('Share link copied to clipboard');
        // You could show a toast notification here
      }).catch(err => {
        console.error('Failed to copy link: ', err);
      });
    }
  }
</script>

<div class="event-details">
  {#if personInfo}
    <div class="detail-section">
      <strong>Person:</strong> {personInfo.name}
      {#if personInfo.aliases.length > 0}
        <div class="aliases">
          <em>Also known as: {personInfo.aliases.join(', ')}</em>
        </div>
      {/if}
      <div class="person-type">({personInfo.type})</div>
    </div>
  {/if}

  {#if locationInfo}
    <div class="detail-section">
      <strong>Location:</strong> {locationInfo.displayName}
    </div>
  {/if}

  <div class="detail-section">
    <strong>Date:</strong> 
    {formatDateWithUncertainty(event?.DATERANGE, event?.CERTEDATE || event?.CERTLDATE)}
  </div>

  {#if event?.Description}
    <div class="detail-section">
      <strong>Description:</strong> {event.Description}
      {#if event.CERTRANGE && event.CERTRANGE !== "1"}
        <span class="uncertainty">
          {event.CERTRANGE === "2" ? "?" : event.CERTRANGE === "3" ? "??" : "???"}
        </span>
      {/if}
    </div>
  {/if}

  {#if institutionInfo}
    <div class="detail-section">
      <strong>Institution:</strong> {institutionInfo.INSNAME}
      {#if institutionInfo.INSTYPE}
        <span class="institution-type">({institutionInfo.INSTYPE})</span>
      {/if}
    </div>
  {/if}

  {#if archivalInfo}
    <div class="detail-section">
      <strong>Archival Sources:</strong>
      {#each archivalInfo as doc}
        <div class="archival-doc">{doc.signature}</div>
      {/each}
    </div>
  {/if}

  {#if bibliographyInfo}
    <div class="detail-section">
      <strong>Bibliography:</strong>
      {#each bibliographyInfo as bib}
        <div class="bibliography-entry">{@html bib.citation}</div>
      {/each}
    </div>
  {/if}

  <div class="detail-section actions">
    <button 
      class="share-button" 
      on:click={copyShareLink}
      title="Copy share link"
    >
      <img src="/images/share_24.svg" alt="Share" />
      Copy link
    </button>
  </div>
</div>

<style>
  .event-details {
    font-size: 11px;
    line-height: 1.4;
  }

  .detail-section {
    margin-bottom: 0.75rem;
  }

  .detail-section:last-child {
    margin-bottom: 0;
  }

  .aliases {
    font-size: 10px;
    color: #666;
    margin-top: 0.25rem;
  }

  .person-type {
    font-size: 10px;
    color: #888;
    font-style: italic;
  }

  .institution-type {
    font-size: 10px;
    color: #666;
    font-style: italic;
  }

  .uncertainty {
    color: #ff6b6b;
    font-weight: bold;
  }

  .archival-doc {
    font-size: 10px;
    color: #666;
    margin-left: 1rem;
    font-family: monospace;
  }

  .bibliography-entry {
    font-size: 10px;
    color: #444;
    margin-left: 1rem;
    margin-bottom: 0.25rem;
  }

  .actions {
    border-top: 1px solid #eee;
    padding-top: 0.5rem;
    margin-top: 0.75rem;
  }

  .share-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-size: 10px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 3px;
    cursor: pointer;
    color: #333;
    text-decoration: none;
  }

  .share-button:hover {
    background: #e0e0e0;
    border-color: #ccc;
  }

  .share-button img {
    width: 12px;
    height: 12px;
  }

  strong {
    color: #333;
    font-weight: 600;
  }
</style>