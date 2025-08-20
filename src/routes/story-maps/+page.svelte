<!-- 
  Story Maps Index Page
  Lists all available story maps and provides navigation
-->
<script>
  import { onMount } from 'svelte';
  import { mapData, lookupTables } from '$lib/stores/data.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  import Navbar from '$lib/components/Navigation/Navbar.svelte';

  // Available story maps - you can expand this list as needed
  const availableStoryMaps = [
    {
      id: 'BCO:Pierre_de_la_Rue',
      name: 'Pierre de la Rue',
      type: 'Composer',
      description: 'Follow the musical journey of Pierre de la Rue, one of the most important Franco-Flemish composers of the Renaissance period.',
      image: null, // Will use placeholder
      timeRange: 'c. 1452 – 1518',
      featured: true
    },
    {
      id: 'BCO:Josquin_des_Prez', 
      name: 'Josquin des Prez',
      type: 'Composer',
      description: 'Explore the life and travels of Josquin des Prez, master of Renaissance polyphony.',
      image: null, // Will use placeholder
      timeRange: 'c. 1450 – 1521',
      featured: true
    },
    {
      id: 'BCO:Jean_Mouton',
      name: 'Jean Mouton',
      type: 'Composer', 
      description: 'Follow the career of Jean Mouton, court composer and master of sacred polyphony.',
      image: null, // Will use placeholder
      timeRange: 'c. 1459 – 1522',
      featured: true
    }
    // Add more story maps as they become available
  ];

  let loading = true;
  let eventCounts = {};
  
  // Get filter from URL parameters
  $: filterType = $page.url.searchParams.get('filter') || 'all';
  
  // Filter story maps based on URL parameter
  $: filteredStoryMaps = availableStoryMaps.filter(storyMap => {
    const hasEvents = eventCounts[storyMap.id] > 0 || storyMap.featured;
    
    if (!hasEvents) return false;
    
    if (filterType === 'all') return true;
    if (filterType === 'people') return storyMap.type === 'Composer' || storyMap.type === 'Musician';
    if (filterType === 'places') return storyMap.type === 'Place' || storyMap.type === 'Institution';
    if (filterType === 'events') return storyMap.type === 'Event' || storyMap.type === 'Performance';
    
    return true;
  });
  
  // Dynamic page title and description based on filter
  $: pageTitle = filterType === 'people' ? 'People - Story Maps' : 
                 filterType === 'places' ? 'Places - Story Maps' :
                 filterType === 'events' ? 'Events - Story Maps' : 'Story Maps';
                 
  $: pageDescription = filterType === 'people' ? 'Interactive story maps following the journeys of Renaissance musicians and composers.' :
                       filterType === 'places' ? 'Explore the important locations and institutions that shaped Renaissance music.' :
                       filterType === 'events' ? 'Follow the timeline of significant musical events during the Renaissance period.' :
                       'Interactive story maps following the journeys of Renaissance musicians, composers, and other figures.';

  onMount(async () => {
    loading = true;
    
    // Wait for data to load
    if (!$mapData.METADATA?.Events) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Calculate event counts for each story map
    calculateEventCounts();
    loading = false;
  });

  function calculateEventCounts() {
    const events = $mapData.METADATA?.Events || [];
    
    availableStoryMaps.forEach(storyMap => {
      const count = events.filter(event => event.BIOID === storyMap.id).length;
      eventCounts[storyMap.id] = count;
    });
  }

  function openStoryMap(id) {
    goto(`/story-maps/${id}`);
  }
</script>

<svelte:head>
  <title>{pageTitle} - Mapping the Musical Renaissance</title>
  <meta name="description" content={pageDescription} />
</svelte:head>

<Navbar />

<div class="story-maps-container">
  <header class="page-header">
    <h1>
      {#if filterType === 'people'}
        People
      {:else if filterType === 'places'}
        Places  
      {:else if filterType === 'events'}
        Events
      {:else}
        Story Maps
      {/if}
    </h1>
    <p class="page-description">
      {pageDescription}
    </p>
  </header>

  {#if loading}
    <div class="loading-state">
      <h2>Loading Story Maps...</h2>
      <p>Preparing available journeys...</p>
    </div>
  {:else}
    <div class="story-maps-grid">
      {#each filteredStoryMaps as storyMap}
        <div class="story-map-card" class:featured={storyMap.featured}>
          <div class="card-image">
            {#if storyMap.image}
              <img src={storyMap.image} alt={storyMap.name} />
            {:else}
              <div class="placeholder-image">
                <span>🎼</span>
              </div>
            {/if}
            {#if storyMap.featured}
              <div class="featured-badge">Featured</div>
            {/if}
          </div>
          
          <div class="card-content">
            <div class="card-header">
              <h3>{storyMap.name}</h3>
              <span class="person-type">{storyMap.type}</span>
            </div>
            
            <p class="time-range">{storyMap.timeRange}</p>
            <p class="description">{storyMap.description}</p>
            
            <div class="card-stats">
              <span class="event-count">
                {eventCounts[storyMap.id] || 0} documented events
              </span>
            </div>
            
            <button 
              class="explore-button"
              on:click={() => openStoryMap(storyMap.id)}
              disabled={!eventCounts[storyMap.id]}
            >
              {eventCounts[storyMap.id] ? 'Explore Journey' : 'Coming Soon'}
            </button>
          </div>
        </div>
      {/each}
    </div>

    {#if filteredStoryMaps.length === 0}
      <div class="no-stories">
        <h2>No Story Maps Available</h2>
        <p>Story maps are currently being prepared. Check back soon!</p>
      </div>
    {/if}

    <!-- Information Section -->
    <div class="info-section">
      <h2>About Story Maps</h2>
      <div class="info-grid">
        <div class="info-item">
          <h3>📍 Interactive Journeys</h3>
          <p>Follow the geographic movements and life events of Renaissance figures through interactive maps and timelines.</p>
        </div>
        
        <div class="info-item">
          <h3>📚 Primary Sources</h3>
          <p>Each event is backed by historical documents and archival sources, providing authentic insights into their lives.</p>
        </div>
        
        <div class="info-item">
          <h3>🎵 Musical Context</h3>
          <p>Discover the musical and cultural context of each location and period, understanding how geography influenced art.</p>
        </div>
        
        <div class="info-item">
          <h3>🔗 Connected Stories</h3>
          <p>See how different figures' paths crossed and influenced each other throughout the Renaissance period.</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .story-maps-container {
    min-height: calc(100vh - 80px);
    background-color: #f9f7f4;
    padding: 2rem;
  }

  .page-header {
    text-align: center;
    max-width: 800px;
    margin: 0 auto 3rem auto;
  }

  .page-header h1 {
    font-size: 2.5rem;
    color: #2c2c2c;
    margin-bottom: 1rem;
  }

  .page-description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #666;
  }

  .loading-state {
    text-align: center;
    padding: 3rem;
  }

  .loading-state h2 {
    color: #2c2c2c;
    margin-bottom: 1rem;
  }

  .loading-state p {
    color: #666;
  }

  .story-maps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .story-map-card {
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    border: 2px solid #e8dcc0;
  }

  .story-map-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }

  .story-map-card.featured {
    border-color: #8b7355;
  }

  .card-image {
    position: relative;
    height: 200px;
    background-color: #f0f0f0;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-image {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 3rem;
    background: linear-gradient(135deg, #e8dcc0, #f0ede5);
  }

  .featured-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #8b7355;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
  }

  .card-content {
    padding: 1.5rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .card-header h3 {
    margin: 0;
    color: #2c2c2c;
    font-size: 1.3rem;
  }

  .person-type {
    background-color: #f0ede5;
    color: #8b7355;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
  }

  .time-range {
    color: #666;
    font-style: italic;
    margin: 0.5rem 0;
    font-size: 14px;
  }

  .description {
    line-height: 1.6;
    color: #333;
    margin: 1rem 0;
  }

  .card-stats {
    margin: 1rem 0;
    padding: 0.75rem;
    background-color: #f9f9f9;
    border-radius: 6px;
  }

  .event-count {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }

  .explore-button {
    width: 100%;
    background-color: #8b7355;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .explore-button:hover:not(:disabled) {
    background-color: #6d5a42;
  }

  .explore-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .no-stories {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .info-section {
    max-width: 1200px;
    margin: 4rem auto 0 auto;
    padding-top: 3rem;
    border-top: 2px solid #e8dcc0;
  }

  .info-section h2 {
    text-align: center;
    color: #2c2c2c;
    margin-bottom: 2rem;
    font-size: 2rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .info-item {
    text-align: center;
    padding: 1.5rem;
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e8dcc0;
  }

  .info-item h3 {
    color: #8b7355;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .info-item p {
    color: #666;
    line-height: 1.6;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .story-maps-container {
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 2rem;
    }

    .story-maps-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>
