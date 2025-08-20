<!-- 
  Story Map Dynamic Page Component
  This file handles individual story map pages for specific people/composers
  Usage: /story-maps/BCO:Pierre_de_la_Rue or /story-maps/BMU:xyz
-->
<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { mapData, lookupTables } from '$lib/stores/data.js';
  import { goto } from '$app/navigation';
  
  import Navbar from '$lib/components/Navigation/Navbar.svelte';
  import StoryMapTemplate from '$lib/components/StoryMap/StoryMapTemplate.svelte';

  let personId = '';
  let personData = null;
  let personEvents = [];
  let loading = true;
  let error = null;

  $: personId = $page.params.id;

  // Story map configurations for specific people
  const storyMapConfigs = {
    'BCO:Pierre_de_la_Rue': {
      name: 'Pierre de la Rue',
      description: 'Pierre de la Rue (c. 1452 – 20 November 1518) was a Franco-Flemish composer and singer of the Renaissance. His output consists of masses, motets, and chansons. He served in the chapel of the Burgundian court and later at the court of Philip the Fair.',
      biography: 'Pierre de la Rue was one of the most important composers of the late 15th and early 16th centuries. Born around 1452, he spent much of his career in the service of the Burgundian court, where he worked alongside other prominent musicians of his time. His compositions demonstrate a masterful understanding of polyphonic techniques and represent some of the finest examples of Renaissance music.',
      timelineDates: { start: 1470, end: 1520 },
      // Test media content
      image: '/images/test.png', // Using your test image
      audio: 'https://example-audio.mp3', // Test audio placeholder - will show audio controls when Supabase is set up
      youtube: 'sU5JZWbNt8c' // Your test YouTube video ID
    },
    'BCO:Josquin_des_Prez': {
      name: 'Josquin des Prez',
      description: 'Josquin des Prez (c. 1450-1521) was the most famous composer of the Renaissance, whose compositions are considered the pinnacle of polyphonic music.',
      biography: 'Josquin des Prez was a master of Renaissance polyphony, widely regarded as the greatest composer of his generation. His innovative use of musical techniques and expressive capabilities established new standards for sacred and secular music.',
      timelineDates: { start: 1470, end: 1521 },
      // Test different media combinations
      image: '/images/headshots/Bradley.jpg', // Use existing test image
      audio: null,
      youtube: 'K8E_zMLCRNg' // Example: Classical music performance
    },
    'BCO:Jean_Mouton': {
      name: 'Jean Mouton',
      description: 'Jean Mouton (c. 1459 – 30 October 1522) was a French composer of the Renaissance, known for his sacred music and service in the royal chapel.',
      biography: 'Jean Mouton was a prominent composer who served in the French royal chapel. His works demonstrate sophisticated polyphonic writing and contributed significantly to the development of Renaissance musical style.',
      timelineDates: { start: 1480, end: 1522 },
      // Test all media types
      image: '/images/headshots/McIntyre.jpg', // Use another existing test image
      audio: 'https://example-mouton-audio.mp3', // Test audio placeholder
      youtube: '6Yl_67OhO00' // Example: Renaissance music performance
    }
  };

  onMount(async () => {
    loading = true;
    error = null;

    try {
      // Wait for data to be loaded if not already
      if (!$mapData.METADATA?.Events) {
        // You might want to implement a loading mechanism here
        // For now, we'll just wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      loadPersonData();
    } catch (err) {
      console.error('Error loading story map:', err);
      error = 'Failed to load story map data';
    } finally {
      loading = false;
    }
  });

  function loadPersonData() {
    if (!personId) {
      error = 'No person ID provided';
      return;
    }

    console.log('Loading data for:', personId);

    // Check if this person has a story map configuration
    if (!storyMapConfigs[personId]) {
      error = 'Story map not available for this person';
      return;
    }

    // Load person data from lookup tables
    if (personId.startsWith('BCO:')) {
      personData = $lookupTables?.Bio_Composers?.[personId];
    } else if (personId.startsWith('BMU:')) {
      personData = $lookupTables?.Bio_Musicians?.[personId];
    } else if (personId.startsWith('BNO:')) {
      personData = $lookupTables?.Bio_Nonmusicians?.[personId];
    }

    console.log('Person data loaded:', personData);

    // If person data not found in lookup tables, we can still proceed with the story map
    // since we have the configuration data
    if (!personData) {
      console.log('Person data not found in lookup tables, but proceeding with story map config');
      // Create a basic person data object from the configuration
      personData = {
        name: storyMapConfigs[personId].name,
        // Add other fields as needed
      };
    }

    // Load events for this person
    const allEvents = $mapData.METADATA?.Events || [];
    console.log('Total events available:', allEvents.length);
    console.log('Sample events:', allEvents.slice(0, 3));
    
    // Filter events for this person - try different possible field names
    personEvents = allEvents.filter(event => {
      const bioid = event.BIOID || event['Biography ID (BCO, BMU, BNO)'] || event.BiographyID;
      const matches = bioid === personId;
      if (matches) {
        console.log('Found matching event:', event.EVID, 'BIOID:', bioid);
      }
      return matches;
    }).sort((a, b) => {
      const yearA = parseInt(a.EYEAR || a['Start Year'] || 0);
      const yearB = parseInt(b.EYEAR || b['Start Year'] || 0);
      return yearA - yearB;
    });

    console.log(`Loaded ${personEvents.length} events for ${personId}`);
    console.log('Person events:', personEvents);
    
    // If no events found, try logging some debug info
    if (personEvents.length === 0) {
      console.log('No events found. Checking available BIOIDs...');
      const uniqueBioIds = [...new Set(allEvents.map(e => e.BIOID || e['Biography ID (BCO, BMU, BNO)'] || e.BiographyID).filter(Boolean))];
      console.log('Available Biography IDs:', uniqueBioIds.slice(0, 20));
    }
  }

  function goBack() {
    goto('/story-maps');
  }
</script>

<svelte:head>
  <title>Story Map: {storyMapConfigs[personId]?.name || 'Unknown Person'} - Mapping the Musical Renaissance</title>
  <meta name="description" content="Interactive story map following the journey of {storyMapConfigs[personId]?.name || 'a Renaissance figure'}" />
</svelte:head>

<Navbar />

<div class="story-map-container">
  {#if loading}
    <div class="loading-state">
      <h2>Loading Story Map...</h2>
      <p>Preparing the musical journey...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <h2>Story Map Not Available</h2>
      <p>{error}</p>
      <button on:click={goBack} class="back-button">
        ← Back to Story Maps
      </button>
    </div>
  {:else if personData && storyMapConfigs[personId]}
    <StoryMapTemplate 
      person={personData}
      events={personEvents}
      config={storyMapConfigs[personId]}
      personId={personId}
    />
  {:else}
    <div class="error-state">
      <h2>Story Map Not Found</h2>
      <p>This story map is not yet available.</p>
      <button on:click={goBack} class="back-button">
        ← Back to Story Maps
      </button>
    </div>
  {/if}
</div>

<style>
  .story-map-container {
    min-height: calc(100vh - 80px);
    background-color: #f9f7f4;
  }

  .loading-state, .error-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 80px);
    text-align: center;
    padding: 2rem;
  }

  .loading-state h2, .error-state h2 {
    color: #2c2c2c;
    margin-bottom: 1rem;
  }

  .loading-state p, .error-state p {
    color: #666;
    margin-bottom: 2rem;
  }

  .back-button {
    background-color: #8b7355;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
  }

  .back-button:hover {
    background-color: #6d5a42;
  }
</style>
