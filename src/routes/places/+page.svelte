<script>
  import Navbar from '$lib/components/Navigation/Navbar.svelte';
  import StoryMapTemplate from '$lib/components/StoryMap/StoryMapTemplate.svelte';
</script>

<svelte:head>
  <title>Places - Mapping the Musical Renaissance</title>
</svelte:head>

<Navbar />

<main class="page-content">
  <StoryMapTemplate 
    title="Story Map: Renaissance Musical Centers"
    blurbText="Explore the major cities and institutions that shaped Renaissance music. From the courts of Italy to the cathedrals of Northern Europe, trace the geographic spread of musical innovation and cultural exchange."
    hasAudio={false}
    hasPicture={true}
    pictureText="Historic view of a Renaissance city - click to enlarge"
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
