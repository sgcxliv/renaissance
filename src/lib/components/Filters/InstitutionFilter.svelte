<script>
  import { filters } from '$lib/stores/filters.js';
  import { mapData, lookupTables } from '$lib/stores/data.js';

  let showPopup = false;
  let selectedInstitution = null;
  let institutionType = 'ecclesiastical';
  let selectedCountries = new Set();

  $: availableInstitutions = getAvailableInstitutions($lookupTables, institutionType, selectedCountries);
  $: availableCountries = getAvailableCountries($lookupTables, institutionType);

  // Debug logging
  $: {
    console.log('=== Institution Filter Debug ===');
    console.log('Full lookupTables:', $lookupTables);
    console.log('lookupTables.Institutions count:', Object.keys($lookupTables.Institutions || {}).length);
    console.log('lookupTables.Events count:', Object.keys($lookupTables.Events || {}).length);
    console.log('lookupTables.Locations count:', Object.keys($lookupTables.Locations || {}).length);
    console.log('institutionType:', institutionType);
    console.log('selectedCountries:', selectedCountries);
    
    if ($lookupTables.Institutions) {
      const allInstitutions = Object.values($lookupTables.Institutions);
      console.log('All institutions:', allInstitutions.length);
      console.log('Sample institution data:', allInstitutions[0]);
      
      const ecclesiastical = allInstitutions.filter(inst => inst.INSTYPE?.toLowerCase() === 'ecclesiastical');
      const political = allInstitutions.filter(inst => inst.INSTYPE?.toLowerCase() === 'political');
      console.log('Ecclesiastical institutions:', ecclesiastical.length);
      console.log('Political institutions:', political.length);
      
      if (ecclesiastical.length > 0) {
        console.log('Sample ecclesiastical:', ecclesiastical[0]);
      }
      if (political.length > 0) {
        console.log('Sample political:', political[0]);
      }
    }
    
    console.log('availableInstitutions:', availableInstitutions.length);
    console.log('availableCountries:', availableCountries);
    console.log('selectedCountries size:', selectedCountries.size);
    console.log('selectedCountries array:', Array.from(selectedCountries));
    if (availableInstitutions.length > 0) {
      console.log('Sample institutions:', availableInstitutions.slice(0, 3));
    }
    console.log('================================');
  }

  function togglePopup() {
    showPopup = !showPopup;
  }

  function selectInstitution(institution) {
    selectedInstitution = institution;
    showPopup = false;

    filters.update(f => ({
      ...f,
      institutionFilter: institution.id
    }));
  }

  function removeSelectedInstitution() {
    selectedInstitution = null;

    filters.update(f => ({
      ...f,
      institutionFilter: null
    }));
  }

  function toggleCountry(country) {
    console.log('Toggling country:', country);
    // Clear all countries first, then add only the clicked one
    selectedCountries = new Set([country]);
    console.log('Updated selectedCountries:', selectedCountries);
  }

  function getAvailableCountries(lookupTables, type) {
    console.log('Getting countries for type:', type);
    
    // Try both lookupTables and raw METADATA for institutions
    let institutions = [];
    
    if (lookupTables.Institutions) {
      institutions = Object.values(lookupTables.Institutions);
    } else if ($mapData.METADATA?.Institutions) {
      institutions = $mapData.METADATA.Institutions;
    }

    if (institutions.length === 0) {
      console.log('No institutions found for country filtering');
      return [];
    }

    const countries = new Set();
    const events = Object.values(lookupTables.Events || $mapData.METADATA?.Events || {});
    const locations = lookupTables.Locations || $mapData.METADATA?.Locations || {};

    console.log('Available events:', events.length);
    console.log('Available locations:', Object.keys(locations).length);

    institutions.forEach(inst => {
      // Check different possible field names for institution type
      const instType = inst.INSTYPE || inst['Institution Type'] || inst.Type;
      
      if (instType?.toLowerCase() === type.toLowerCase()) {
        // For institutions, we need to find their associated events to get locations
        events.forEach(event => {
          const instId = inst.INSID || inst['Institution ID (INS)'] || inst.ID;
          if (event.INSID === instId) {
            const location = locations[event.LOCID];
            if (location?.COUNTRY) {
              countries.add(location.COUNTRY);
            }
          }
        });
      }
    });

    const countryArray = Array.from(countries).sort();
    console.log('Found countries for', type + ':', countryArray);
    return countryArray;
  }

  function getAvailableInstitutions(lookupTables, type, selectedCountries) {
    // Try both lookupTables and raw METADATA
    let institutions = [];
    
    if (lookupTables.Institutions) {
      institutions = Object.values(lookupTables.Institutions);
    } else if ($mapData.METADATA?.Institutions) {
      institutions = $mapData.METADATA.Institutions;
    }
    
    if (institutions.length === 0) {
      console.log('No institutions found in either source');
      return [];
    }

    console.log('Found institutions:', institutions.length, 'Sample:', institutions[0]);

    return institutions
      .filter(inst => {
        // Check different possible field names for institution type
        const instType = inst.INSTYPE || inst['Institution Type'] || inst.Type;
        
        // Filter by institution type (ecclesiastical/political)
        if (!instType || instType.toLowerCase() !== type.toLowerCase()) {
          return false;
        }

        // If no countries selected, show all institutions of this type
        if (selectedCountries.size === 0) {
          return true;
        }

        // If countries are selected, check if institution has events in those countries
        const events = Object.values(lookupTables.Events || $mapData.METADATA?.Events || {});
        const hasEventsInCountry = events.some(event => {
          const instId = inst.INSID || inst['Institution ID (INS)'] || inst.ID;
          if (event.INSID === instId) {
            const location = lookupTables.Locations?.[event.LOCID];
            return location?.COUNTRY && selectedCountries.has(location.COUNTRY);
          }
          return false;
        });

        return hasEventsInCountry;
      })
      .sort((a, b) => {
        const nameA = a.INSNAME || a['Institution Name'] || a.Name || '';
        const nameB = b.INSNAME || b['Institution Name'] || b.Name || '';
        return nameA.localeCompare(nameB);
      });
  }

  // Close popup when clicking outside
  function handleClickOutside(event) {
    if (!event.target.closest('.custom-dropdown')) {
      showPopup = false;
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  }
</script>

<div class="institution-filter-container">
  <div class="custom-dropdown">
    <button
      id="institution-button"
      class="dropdown-button {selectedInstitution ? '' : 'with-arrow'}"
      on:click={togglePopup}
    >
      {#if selectedInstitution}
        <span class="remove-selected-institution" on:click|stopPropagation={removeSelectedInstitution}>
          &times;
        </span>
        <span>{selectedInstitution.name}</span>
      {:else}
        <span>View Institutions</span>
        <span class="dropdown-arrow">▼</span>
      {/if}
    </button>
    {#if showPopup}
    <div id="institution-popup" class="institution-popup visible">
      <!-- Institution type toggle -->
      <div class="popup-section">
        <div class="toggle-group">
          <label class="toggle-option">
            <input
              type="radio"
              name="institution-type"
              value="ecclesiastical"
              bind:group={institutionType}
            />
            Ecclesiastical
          </label>
          <label class="toggle-option">
            <input
              type="radio"
              name="institution-type"
              value="political"
              bind:group={institutionType}
            />
            Political
          </label>
        </div>
      </div>

      <!-- Country filter -->
      <div class="popup-section country-section">
        <div class="country-grid">
          {#each availableCountries as country}
            <div
              class="country-item"
              class:active={selectedCountries.has(country)}
              on:click={() => {
                console.log('Clicking country:', country);
                toggleCountry(country);
              }}
              on:keydown={(e) => e.key === 'Enter' && toggleCountry(country)}
              role="button"
              tabindex="0"
            >
              {country}
            </div>
          {:else}
            <div class="no-countries">No countries available</div>
          {/each}
        </div>
      </div>

      <!-- Institution list -->
      <div class="institution-list-container">
        <ul id="institution-list" class="institution-list">
          {#each availableInstitutions as institution}
            <li on:click={() => selectInstitution({ 
              id: institution.INSID || institution['Institution ID (INS)'] || institution.ID, 
              name: institution.INSNAME || institution['Institution Name'] || institution.Name 
            })}>
              {institution.INSNAME || institution['Institution Name'] || institution.Name}
            </li>
          {:else}
            <li><em>No matching institutions found</em></li>
          {/each}
        </ul>
      </div>
    </div>
    {/if}
  </div>
</div>

<style>
  .institution-filter-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .custom-dropdown {
    position: relative;
  }

  .dropdown-button {
    width: 100%;
    padding: 0.75rem;
    background: white;
    border: 1px solid #8b7355;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #333;
    transition: background-color 0.2s;
  }

  .dropdown-button:hover {
    background-color: #f8f8f8;
  }

  .dropdown-arrow {
    font-size: 12px;
    color: #666;
  }

  .remove-selected-institution {
    background: #dc3545;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    margin-right: 0.5rem;
  }

  .remove-selected-institution:hover {
    background: #c82333;
  }

  .institution-popup {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #8b7355;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
    margin-top: 2px;
  }

  .institution-popup.visible {
    display: block;
  }

  .popup-section {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  .popup-section:last-child {
    border-bottom: none;
  }

  .toggle-group {
    display: flex;
    gap: 1rem;
  }

  .toggle-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 14px;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 20px;
    transition: all 0.2s;
  }

  .toggle-option:hover {
    background-color: #f5f5f5;
  }

  .toggle-option input[type="radio"] {
    margin: 0;
  }

  .toggle-option input[type="radio"]:checked + label {
    background-color: #8b7355;
    color: white;
  }

  .country-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .country-item {
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
    color: #495057;
    min-width: 80px;
    text-align: center;
  }

  .country-item:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }

  .country-item.active {
    background: #8b7355;
    color: white;
    border-color: #8b7355;
  }

  .institution-list-container {
    max-height: 200px;
    overflow-y: auto;
  }

  .institution-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .institution-list li {
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .institution-list li:hover {
    background: #f5f5f5;
  }

  .institution-list li:last-child {
    border-bottom: none;
  }

  .country-section {
    background: white;
    border-radius: 6px;
  }

  .no-countries {
    font-style: italic;
    color: #6c757d;
    text-align: center;
    padding: 1rem;
  }
</style>