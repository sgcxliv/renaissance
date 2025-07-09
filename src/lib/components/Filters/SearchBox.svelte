<script>
  import { filters } from '$lib/stores/filters.js';
  import { searchResults, searchCount } from '$lib/stores/filters.js';
  import { mapData, lookupTables } from '$lib/stores/data.js';
  import { totalMarkers } from '$lib/stores/data.js';

  let searchInput = '';
  let autocompleteResults = [];
  let showAutocomplete = false;
  let searchInputElement;

  // Reactive statements
  $: if (searchInput !== $filters.searchText) {
    updateSearch(searchInput);
  }

  $: if (searchInput.length > 2) {
    generateAutocomplete(searchInput);
  } else {
    hideAutocomplete();
  }

  function updateSearch(value) {
    filters.update(f => ({
      ...f,
      searchText: value
    }));
  }

  function generateAutocomplete(query) {
    if (!$lookupTables || !query) {
      hideAutocomplete();
      return;
    }

    const results = [];
    const regex = new RegExp(query, 'i');
    const seen = new Set();

    // Search through people
    ['Bio_Composers', 'Bio_Musicians', 'Bio_Nonmusicians'].forEach(sheet => {
      const data = $lookupTables[sheet] || {};
      Object.values(data).forEach(person => {
        const nameField = sheet === 'Bio_Composers' ? 'BCONAME' : 
                         sheet === 'Bio_Musicians' ? 'BMUNAME' : 'BNONAME';
        const aliasField = 'ALIAS';
        
        const name = person[nameField];
        const aliases = person[aliasField];
        
        if (name && regex.test(name) && !seen.has(name)) {
          results.push({ type: 'person', name, sheet });
          seen.add(name);
        }
        
        if (aliases) {
          const aliasArray = aliases.includes(';') ? aliases.split(/\s*;\s*/) : [aliases];
          aliasArray.forEach(alias => {
            if (alias && regex.test(alias) && !seen.has(alias)) {
              results.push({ type: 'person', name: alias, sheet });
              seen.add(alias);
            }
          });
        }
      });
    });

    // Search through locations
    const locations = $lookupTables.Locations || {};
    Object.values(locations).forEach(location => {
      const name = location.LOCNAME;
      const city = location.CITY;
      
      if (name && regex.test(name) && !seen.has(name)) {
        results.push({ type: 'location', name });
        seen.add(name);
      }
      
      if (city && regex.test(city) && !seen.has(city)) {
        results.push({ type: 'location', name: city });
        seen.add(city);
      }
    });

    autocompleteResults = results.slice(0, 10); // Limit to 10 results
    showAutocomplete = autocompleteResults.length > 0;
  }

  function selectAutocomplete(item) {
    searchInput = item.name;
    hideAutocomplete();
    updateSearch(searchInput);
  }

  function hideAutocomplete() {
    showAutocomplete = false;
    autocompleteResults = [];
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      hideAutocomplete();
      searchInputElement?.blur();
    }
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.search-bar')) {
      hideAutocomplete();
    }
  }

  // Handle clicks outside search
  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  }
</script>

<div class="search-bar">
  <input 
    bind:this={searchInputElement}
    bind:value={searchInput}
    type="text" 
    placeholder="Search location, person, or event"
    on:keydown={handleKeydown}
    on:focus={() => {
      if (searchInput.length > 2) {
        generateAutocomplete(searchInput);
      }
    }}
  />
  
  <div id="search-count">
    [{$totalMarkers} {$totalMarkers === 1 ? "event" : "events"}, of which {$searchCount} are visible]
  </div>

  {#if showAutocomplete}
    <div id="autocomplete-results" class="autocomplete-results">
      {#each autocompleteResults as item}
        <div 
          class="autocomplete-item"
          on:click={() => selectAutocomplete(item)}
          on:keydown={(e) => e.key === 'Enter' && selectAutocomplete(item)}
          role="button"
          tabindex="0"
        >
          <span class="item-name">{item.name}</span>
          <span class="item-type">({item.type})</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    flex: 1;
  }

  .search-bar input[type="text"] {
    flex-grow: 1;
    padding: 12px 20px 12px 40px;
    border: 1px solid #ddd;
    font-size: 16px;
    background-image: url('/images/searchicon.png');
    background-position: 10px 12px;
    background-repeat: no-repeat;
    box-sizing: border-box;
    width: 100%;
    border-radius: 4px;
  }

  #search-count {
    font-size: 16px;
    margin-left: 10px;
    padding: 12px;
    white-space: nowrap;
  }

  .autocomplete-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    margin-top: 2px;
  }

  .autocomplete-item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .autocomplete-item:hover {
    background-color: #f0f0f0;
  }

  .item-name {
    font-weight: 500;
  }

  .item-type {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .search-bar {
      flex-direction: column;
      align-items: stretch;
    }
    
    #search-count {
      margin-left: 0;
      text-align: center;
      font-size: 14px;
    }
  }
</style>