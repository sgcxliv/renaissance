<script>
  import { onMount } from 'svelte';
  import { mapData, lookupTables, headerIndex } from '$lib/stores/data.js';
  import BrowseInterface from '$lib/components/Browse/BrowseInterface.svelte';
  import EventsTable from '$lib/components/Browse/EventsTable.svelte';
  import DocumentsTable from '$lib/components/Browse/DocumentsTable.svelte';

  let currentSheet = 'Events';
  let searchQuery = '';
  let filteredData = [];

  $: if ($mapData.METADATA[currentSheet]) {
    applySearch();
  }

  function switchSheet(sheetName) {
    currentSheet = sheetName;
    searchQuery = '';
  }

  function applySearch() {
    const data = $mapData.METADATA[currentSheet] || [];
    
    if (!searchQuery.trim()) {
      filteredData = data;
      return;
    }

    const regex = new RegExp(searchQuery, 'i');
    filteredData = data.filter(item => {
      return Object.values(item).some(value =>
        value && value.toString().match(regex)
      );
    });
  }

  function handleSearch(event) {
    searchQuery = event.target.value;
    applySearch();
  }
</script>

<svelte:head>
  <title>Browse Data - Mapping the Musical Renaissance</title>
</svelte:head>

<div class="browse-container">
  <h1>Browse Database</h1>
  
  <!-- Sheet selection buttons -->
  <div class="sheet-buttons">
    <button
      class="sheet-button"
      class:selected={currentSheet === 'Events'}
      on:click={() => switchSheet('Events')}
    >
      Events
    </button>
    <button
      class="sheet-button"
      class:selected={currentSheet === 'Doc_Entries'}
      on:click={() => switchSheet('Doc_Entries')}
    >
      Documents
    </button>
  </div>

  <!-- Search interface -->
  <div class="search-interface">
    <BrowseInterface {currentSheet} />
    
    <div class="search-section">
      <input
        type="text"
        id="input"
        placeholder="Search all fields..."
        value={searchQuery}
        on:input={handleSearch}
      />
      <div id="search-count">
        {#if searchQuery}
          [{filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}]
        {:else}
          [{filteredData.length} total {filteredData.length === 1 ? 'entry' : 'entries'}]
        {/if}
      </div>
    </div>
  </div>

  <!-- Results display -->
  <div class="results-list">
    {#if currentSheet === 'Events'}
      <EventsTable events={filteredData} />
    {:else if currentSheet === 'Doc_Entries'}
      <DocumentsTable documents={filteredData} />
    {/if}
  </div>
</div>

<style>
  .browse-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    color: #333;
  }

  .sheet-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: center;
  }

  .sheet-button {
    font: 400 18px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0645AD;
    display: inline-block;
    background: white;
    padding: 10px 20px;
    border: 1px solid black;
    text-align: center;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .sheet-button.selected {
    background: dodgerblue;
    color: white;
  }

  .sheet-button:hover:not(.selected) {
    background: darkred;
    color: white;
  }

  .search-interface {
    margin-bottom: 2rem;
  }

  .search-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  #input {
    background-image: url('/images/searchicon.png');
    background-position: 10px 12px;
    background-repeat: no-repeat;
    border: 1px solid #ddd;
    font-size: 16px;
    padding: 12px 20px 12px 40px;
    width: 400px;
    border-radius: 4px;
  }

  #search-count {
    font-size: 16px;
    color: #666;
  }

  .results-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .browse-container {
      padding: 1rem;
    }
    
    .sheet-buttons {
      flex-direction: column;
      align-items: center;
    }
    
    .search-section {
      flex-direction: column;
      align-items: stretch;
    }
    
    #input {
      width: 100%;
    }
  }
</style>
