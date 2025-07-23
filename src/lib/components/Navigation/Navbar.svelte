<script>
  import { page } from '$app/stores';
  
  // Navigation items
  const navItems = [
    { href: '/story-maps', label: 'Story Maps' },
    { href: '/people', label: 'People' },
    { href: '/places', label: 'Places' },
    { href: '/events', label: 'Events' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];
  
  $: currentPath = $page.url.pathname;
</script>

<nav class="navbar">
  <div class="nav-container">
    <div class="nav-title">
      <a href="/">Mapping the Musical Renaissance</a>
    </div>
    
    <div class="nav-links">
      {#each navItems as item}
        <a 
          href={item.href} 
          class="nav-link" 
          class:active={currentPath === item.href}
        >
          {item.label}
        </a>
        <span class="nav-separator">|</span>
      {/each}
    </div>
  </div>
</nav>

<style>
  .navbar {
    background-color: #d4c4a0;
    border-bottom: 2px solid #8b7355;
    padding: 0.75rem 0;
    font-family: 'Times New Roman', serif;
  }
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .nav-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-right: 2rem;
  }
  
  .nav-title a {
    color: #2c2c2c;
    text-decoration: none;
  }
  
  .nav-title a:hover {
    text-decoration: underline;
  }
  
  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .nav-link {
    color: #2c2c2c;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
    transition: all 0.2s ease;
  }
  
  .nav-link:hover {
    text-decoration: underline;
    background-color: rgba(139, 115, 85, 0.1);
    border-radius: 3px;
  }
  
  .nav-link.active {
    font-weight: bold;
    background-color: rgba(139, 115, 85, 0.2);
    border-radius: 3px;
  }
  
  .nav-separator {
    color: #2c2c2c;
    margin: 0 0.25rem;
  }
  
  .nav-separator:last-child {
    display: none;
  }
  
  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .nav-title {
      margin-right: 0;
      margin-bottom: 0.5rem;
    }
    
    .nav-links {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
