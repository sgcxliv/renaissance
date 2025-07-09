<script>
  import { filters } from '$lib/stores/filters.js';
  import { mapData, lookupTables } from '$lib/stores/data.js';

  let showPopup = false;
  let selectedInstitution = null;
  let institutionType = 'ecclesiastical';
  let selectedCountries = new Set();

  $: availableInstitutions = getAvailableInstitutions($lookupTables, institutionType, selectedCountries);
  $: availableCountries = getAvailableCountries($lookupTables, institutionType);

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
    if (selectedCountries.has(country)) {
      selectedCountries.delete(country);
    } else {
      selectedCountries.add(country);
    }
    selectedCountries = selectedCountries; // Trigger reactivity
  }

  function getAvailableCountries(lookupTables, type) {
    if (!lookupTables.Institutions || !lookupTables.Events) return [];
    
    const countries = new Set();
    const institutions = Object.values(lookupTables.Institutions);
    
    institutions.forEach(inst => {
      if (inst.INSTYPE?.toLowerCase() === type.toLowerCase()) {
        // Find events for this institution to get country
        const events = Object.values(lookupTables.Events || {});
        events.forEach(event => {
          if (event.INSID === inst.INSID) {
            const location = lookupTables.Locations?.[event.LOCID];
            if (location?.COUNTRY) {
              countries.add(location.COUNTRY);
            }
          }
        });
      }
    });
    
    return Array.from(countries).sort();
  }

  function getAvailableInstitutions(lookupTables, type, selectedCountries) {
    if (!lookupTables.Institutions) return [];
    
    const institutions = Object.values(lookupTables.Institutions);
    
    return institutions
      .filter(inst => {
        if (inst.INSTYPE?.toLowerCase() !== type.toLowerCase()) return false;
        
        if (selectedCountries.size > 0) {
          // Check if institution has events in selected countries
          const events = Object.values($mapData.METADATA.Events || []);
          const hasEventsInCountry = events.some(event => {
            if (event.INSID === inst.INSID) {
              const location = lookupTables.Locations?.[event.LOCID];
              return location?.COUNTRY && selectedCountries.has(location.COUNTRY);
            }
            return false;
          });
          
          if (!hasEventsInCountry) return false;
        }
        
        return true;
      })
      .sort((a, b) => (a.INSNAME || '').localeCompare(b.INSNAME || ''));
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

<div class="custom-dropdown">
  <button 
    id="institution-button"
    class={selectedInstitution ? '' : 'with-arrow'}
    on:click={togglePopup}
  >
    {#if selectedInstitution}
      <span class="remove-selected-institution" on:click|stopPropagation={removeSelectedInstitution}>
        &times;
      </span>
      <span>{selectedInstitution.name}</span>
    {:else}
      View Institutions
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
      <div class="popup-section">
        <div class="country-grid">
          {#each availableCountries as country}
            <div 
              class="country-item"
              class:active={selectedCountries.has(country)}
              on:click={() => toggleCountry(country)}
              on:keydown={(e) => e.key === 'Enter' && toggleCountry(country)}
              role="button"
              tabindex="0"
            >
              {country}
            </div>
          {/each}
        </div>
      </div>

      <!-- Institution list -->
      <div class="institution-list-container">
        <ul id="institution-list" class="institution-list">
          {#each availableInstitutions as institution}
            <li on:click={() => selectInstitution({ id: institution.INSID, name: institution.INSNAME })}>
              {institution.INSNAME}
            </li>
          {:else}
            <li><em>No matching institutions found</em></li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
</div>

<style>
  .custom-dropdown {
    position: relative;
    margin-left: 16px;
  }

  #institution-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px 10px;
    font-size: 14px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    box-sizing: border-box;
    height: 30px;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
    z-index: 10001;
  }

  #institution-button.with-arrow {
    padding-right: 30px;
    min-width: 150px;
  }

  #institution-button.with-arrow::after {
    content: "";
    background-image: url('data:image/svg+xml;utf8,<svg fill="%23333" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 16px;
    width: 20px;
    height: 20px;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  #institution-button:hover {
    border-color: #aaa;
    background-color: #f9f9f9;
  }

  .remove-selected-institution {
    color: red;
    margin-right: 6px;
    font-weight: bold;
    cursor: pointer;
    font-size: 16px;
  }

  .remove-selected-institution:hover {
    color: darkred;
  }

  .institution-popup {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1001;
    background: #fff;
    border: 1px solid #aaa;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    padding: 20px;
    width: 350px;
    font-family: sans-serif;
  }

  .popup-section {
    margin-bottom: 20px;
  }

  .toggle-group {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .toggle-option {
    padding: 6px 16px;
    border: 1px solid #ccc;
    border-radius: 9999px;
    cursor: pointer;
    font-weight: bold;
    user-select: none;
  }

  .toggle-option input[type="radio"] {
    display: none;
  }

  .toggle-option:has(input[type="radio"]:checked) {
    background-color: #f0f0f0;
    border-color: #999;
  }

  .country-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    font-size: 14px;
  }

  .country-item {
    border: 1px solid #ccc;
    padding: 4px 8px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    border-radius: 4px;
  }

  .country-item:hover {
    background-color: #f0f0f0;
    border-color: #999;
  }

  .country-item.active {
    background-color: #ddd;
    border-color: #999;
    font-weight: bold;
  }

  .institution-list-container {
    max-height: 200px;
    overflow-y: auto;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .institution-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .institution-list li {
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }

  .institution-list li:last-child {
    border-bottom: none;
  }

  .institution-list li:hover {
    background-color: #f0f0f0;
  }

  .institution-list li em {
    color: #666;
    font-style: italic;
  }
</style>