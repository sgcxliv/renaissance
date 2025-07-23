<script>
  import Navbar from '$lib/components/Navigation/Navbar.svelte';
  import StoryMapTemplate from '$lib/components/StoryMap/StoryMapTemplate.svelte';
</script>

<svelte:head>
  <title>People - Mapping the Musical Renaissance</title>
</svelte:head>

<Navbar />

<main class="page-content">
  <StoryMapTemplate 
    title="Story Map: Notable Renaissance Musicians"
    blurbText="This story map follows the journey of prominent Renaissance musicians across Europe. Click the footnotes to highlight corresponding locations on the map, and click the map points to see related text highlighted."
    hasAudio={true}
    hasPicture={true}
    pictureText="Portrait of a Renaissance musician - click to enlarge"
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
