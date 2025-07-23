<script>
  import Navbar from '$lib/components/Navigation/Navbar.svelte';
  import StoryMapTemplate from '$lib/components/StoryMap/StoryMapTemplate.svelte';
</script>

<svelte:head>
  <title>Events - Mapping the Musical Renaissance</title>
</svelte:head>

<Navbar />

<main class="page-content">
  <StoryMapTemplate 
    title="Story Map: Key Musical Events"
    blurbText="Follow the timeline of significant musical events during the Renaissance period. From the invention of music printing to the establishment of major musical institutions, see how events shaped the musical landscape of Europe."
    hasAudio={true}
    hasPicture={false}
  />
</main>

<style>
  .page-content {
    min-height: calc(100vh - 80px);
    background-color: #f9f7f4;
    padding: 2rem;
  }
  
  @media (max-width: 768px) {
    .page-content {
      padding: 1rem;
    }
  }
</style>
