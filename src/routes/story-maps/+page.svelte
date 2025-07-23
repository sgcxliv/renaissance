<script>
  import Navbar from '$lib/components/Navigation/Navbar.svelte';
  import StoryMapTemplate from '$lib/components/StoryMap/StoryMapTemplate.svelte';
</script>

<svelte:head>
  <title>Story Maps - Mapping the Musical Renaissance</title>
</svelte:head>

<Navbar />

<main class="page-content">
  <StoryMapTemplate 
    title="Story Map: Institution/Person"
    blurbText="Clicking the footnotes highlights the corresponding point on the map, and clicking the point highlights the sentence in the blurb"
    hasAudio={true}
    hasPicture={true}
    pictureText="Clicking the picture will enlarge above"
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
