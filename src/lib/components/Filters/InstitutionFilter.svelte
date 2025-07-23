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
        if (inst.INSTYPE?.toLowerCase() !== type.toLowerCase())
          return false;

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
            <!-- .INSID/.INSNAME are the correct spreadsheed "short column names"! -->
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
/* Your styles as before */
</style>