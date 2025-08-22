<!--
Svelte component that displays detailed information about a historical event including person, location, date, and source documentation.
Processes and formats biographical, geographical, institutional, archival, and bibliographic data from lookup tables with uncertainty indicators.
Features comprehensive citation formatting for bibliography entries and handles multiple archival sources with proper signature display.
-->
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
		if (!bioid || !$lookupTables || !$lookupTables.bio_table) return null;
		
		const person = findInfo($lookupTables.bio_table, bioid);
		if (!person) return null;
		
		// Try different name fields based on the bio type
		let nameField, type;
		if (bioid.startsWith('BCO:')) {
			nameField = 'Composer Name';
			type = 'Composer';
		} else if (bioid.startsWith('BMU:')) {
			nameField = 'Musician Name';
			type = 'Musician';
		} else if (bioid.startsWith('BNO:')) {
			nameField = 'Non-musician Name';
			type = 'Non-musician';
		}
		
		const aliases = person.Alias ? [person.Alias] : [];
		
		return {
			name: person[nameField] || 'Unknown',
			type: type,
			aliases: aliases
		};
	}

	function getLocationInfo(locid) {
		if (!locid || !$lookupTables || !$lookupTables.loc_table) return null;
		
		const location = findInfo($lookupTables.loc_table, locid);
		if (!location) return null;
		
		let displayName = location['Name of Location'] || 'Unknown';
		
		// Add uncertainty markers
		const certainty = event?.CERTLOC;
		if (certainty && certainty !== "1") {
			if (certainty === "2") displayName += "?";
			else if (certainty === "3") displayName += "??";
			else if (certainty === "4") displayName += "???";
		}
		
		return {
			name: location['Name of Location'] || 'Unknown',
			displayName: displayName,
			alias: location.Alias || ''
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
</script>

<div class="event-details">
  {#if personInfo}
    <div class="detail-section">
      <strong>Person:</strong> {personInfo.name} ({personInfo.type})
      {#if personInfo.aliases.length > 0}
        <div class="aliases">
          <em>Also known as: {personInfo.aliases.join(', ')}</em>
        </div>
      {/if}
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

  <div class="description-box">
    {event?.Description || 'No description available'}
    {#if event?.CERTRANGE && event.CERTRANGE !== "1"}
      <span class="uncertainty">
        {event.CERTRANGE === "2" ? "?" : event.CERTRANGE === "3" ? "??" : "???"}
      </span>
    {/if}
  </div>

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

  .description-box {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.75rem;
    margin-top: 0.5rem;
    font-size: 11px;
    line-height: 1.4;
    color: #333;
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

  strong {
    color: #333;
    font-weight: 600;
  }
</style>
