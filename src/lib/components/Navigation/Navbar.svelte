<!--
Svelte navigation component with dropdown menus and active state tracking based on current page URL.
Features hover-based dropdown functionality with timeout handling and responsive design for mobile devices.
Includes styled navigation links with separators and programmatic navigation to home page.
-->
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  // Navigation items
  const navItems = [
    { 
      href: '/story-maps', 
      label: 'Story Maps',
      dropdown: [
        { href: '/people', label: 'People' },
        { href: '/places', label: 'Places' },
        { href: '/events', label: 'Events' }
      ]
    },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];
  
  $: currentPath = $page.url.pathname;
  
  let showDropdown = false;
  let dropdownTimeout;
  
  function handleMouseEnter() {
    clearTimeout(dropdownTimeout);
    showDropdown = true;
  }
  
  function handleMouseLeave() {
    dropdownTimeout = setTimeout(() => {
      showDropdown = false;
    }, 150); // Small delay to prevent flickering
  }

  function navigateHome(event) {
    event.preventDefault();
    goto('/');
  }
</script>

<nav class="navbar">
  <div class="nav-container">
    <div class="nav-title">
      <a href="/" on:click={navigateHome}>Mapping the Musical Renaissance</a>
    </div>
    
    <div class="nav-links">
      {#each navItems as item}
        {#if item.dropdown}
          <div 
            class="nav-item dropdown-container"
            on:mouseenter={handleMouseEnter}
            on:mouseleave={handleMouseLeave}
          >
            <a
              href={item.href}
              class="nav-link"
              class:active={currentPath === item.href || item.dropdown.some(subItem => currentPath === subItem.href)}
            >
              {item.label}
              <span class="dropdown-arrow">▼</span>
            </a>
            
            {#if showDropdown}
              <div class="dropdown-menu">
                {#each item.dropdown as subItem}
                  <a
                    href={subItem.href}
                    class="dropdown-link"
                    class:active={currentPath === subItem.href}
                  >
                    {subItem.label}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <a
            href={item.href}
            class="nav-link"
            class:active={currentPath === item.href}
          >
            {item.label}
          </a>
        {/if}
        
        {#if item !== navItems[navItems.length - 1]}
          <span class="nav-separator">|</span>
        {/if}
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
  
  .nav-item {
    position: relative;
  }
  
  .dropdown-container {
    position: relative;
  }
  
  .nav-link {
    color: #2c2c2c;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.25rem;
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
  
  .dropdown-arrow {
    font-size: 0.75rem;
    transition: transform 0.2s ease;
  }
  
  .dropdown-container:hover .dropdown-arrow {
    transform: rotate(180deg);
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #d4c4a0;
    border: 1px solid #8b7355;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    min-width: 150px;
    z-index: 1000;
    padding: 0.5rem 0;
    margin-top: 0.25rem;
  }
  
  .dropdown-link {
    display: block;
    color: #2c2c2c;
    text-decoration: none;
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
    transition: background-color 0.2s ease;
  }
  
  .dropdown-link:hover {
    background-color: rgba(139, 115, 85, 0.15);
  }
  
  .dropdown-link.active {
    font-weight: bold;
    background-color: rgba(139, 115, 85, 0.25);
  }
  
  .nav-separator {
    color: #2c2c2c;
    margin: 0 0.25rem;
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
    
    .dropdown-menu {
      position: static;
      box-shadow: none;
      border: none;
      background-color: rgba(139, 115, 85, 0.1);
      border-radius: 4px;
      margin-top: 0.5rem;
    }
  }
</style>
