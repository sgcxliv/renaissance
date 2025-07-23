<script>
  import Navbar from '$lib/components/Navigation/Navbar.svelte';
</script>

<svelte:head>
    <title>About - Mapping the Musical Renaissance</title>
</svelte:head>

<Navbar />

<main class="page-content">
  <div class="about-container">
    <h1>About Mapping the Musical Renaissance</h1>
    
    <section class="about-section">
      <h2>Project Overview</h2>
      <p>
        Mapping the Musical Renaissance is a digital humanities project that visualizes the geographic 
        and temporal dimensions of Renaissance music culture across Europe. Through interactive maps 
        and story maps, we explore the movements of musicians, the establishment of musical institutions, 
        and the spread of musical innovations during the 15th and 16th centuries.
      </p>
    </section>
    
    <section class="about-section">
      <h2>Methodology</h2>
      <p>
        Our research draws from historical records, archival sources, and musicological scholarship 
        to create a comprehensive database of musical events, people, and places. Each data point 
        is carefully verified and includes information about source reliability and historical certainty.
      </p>
    </section>
    
    <section class="about-section">
      <h2>Data Sources</h2>
      <p>
        The project incorporates data from various historical archives, musical manuscripts, 
        biographical records, and scholarly publications. We prioritize primary sources while 
        acknowledging gaps and uncertainties in the historical record.
      </p>
    </section>
    
    <section class="about-section">
      <h2>Team</h2>
      <p>
        This project is a collaboration between musicologists, digital humanities scholars, 
        and data visualization specialists. [Team member details would go here]
      </p>
    </section>
    
    <section class="about-section">
      <h2>Technical Implementation</h2>
      <p>
        The platform is built using modern web technologies including Svelte, Leaflet for mapping, 
        and responsive design principles to ensure accessibility across devices.
      </p>
    </section>
  </div>
</main>

<style>
  .page-content {
    min-height: calc(100vh - 80px);
    background-color: #f9f7f4;
    padding: 2rem;
    font-family: 'Times New Roman', serif;
  }
  
  .about-container {
    max-width: 800px;
    margin: 0 auto;
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    padding: 2rem;
    border-radius: 8px;
  }
  
  h1 {
    text-align: center;
    color: #2c2c2c;
    margin-bottom: 2rem;
    font-size: 2rem;
    border-bottom: 2px solid #8b7355;
    padding-bottom: 1rem;
  }
  
  .about-section {
    margin-bottom: 2rem;
  }
  
  .about-section:last-child {
    margin-bottom: 0;
  }
  
  h2 {
    color: #2c2c2c;
    margin-bottom: 1rem;
    font-size: 1.3rem;
    border-left: 4px solid #8b7355;
    padding-left: 1rem;
  }
  
  p {
    line-height: 1.6;
    color: #333;
    margin-bottom: 1rem;
    text-align: justify;
  }
  
  @media (max-width: 768px) {
    .page-content {
      padding: 1rem;
    }
    
    .about-container {
      padding: 1rem;
    }
    
    h1 {
      font-size: 1.5rem;
    }
    
    h2 {
      font-size: 1.1rem;
    }
  }
</style>
            This interactive map displays historical events related to musicians, composers,
            and other figures in music history from 1400-1600.
        </p>
    </section>

    <section>
        <h2>Data Sources</h2>
        <p>
            The data is compiled from various historical documents, archives, and scholarly sources.
            Each event is linked to its primary source documentation when available.
        </p>
    </section>

    <section>
        <h2>How to Use</h2>
        <ul>
            <li>Use the checkboxes to filter by person type (composers, musicians, non-musicians)</li>
            <li>Adjust the date slider to focus on specific time periods</li>
            <li>Search for specific names, places, or events</li>
            <li>Click on map markers to view detailed information</li>
            <li>Use the institution filter to see events by institution type</li>
        </ul>
    </section>

    <section>
        <h2>Legend</h2>
        <div class="legend">
            <div class="legend-item">
                <span class="color-sample" style="background-color: #8B4513;"></span>
                Composers
            </div>
            <div class="legend-item">
                <span class="color-sample" style="background-color: #CD853F;"></span>
                Musicians
            </div>
            <div class="legend-item">
                <span class="color-sample" style="background-color: #DAA520;"></span>
                Non-Musicians
            </div>
        </div>
    </section>
</div>

<style>
    .about-page {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        line-height: 1.6;
        font-family: 'Georgia', serif;
        color: #2C1810;
        background-color: #FFF8E1;
        min-height: 100vh;
    }

    h1 {
        color: #8B4513;
        margin-bottom: 2rem;
        font-size: 2.5rem;
        text-align: center;
        border-bottom: 2px solid #CD853F;
        padding-bottom: 1rem;
    }

    h2 {
        color: #5D4037;
        margin: 2rem 0 1rem 0;
        font-size: 1.5rem;
        border-left: 4px solid #DAA520;
        padding-left: 1rem;
    }

    section {
        margin-bottom: 2rem;
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #D7CCC8;
    }

    p {
        margin-bottom: 1rem;
        color: #2C1810;
        font-size: 1.1rem;
    }

    ul {
        padding-left: 1.5rem;
        color: #2C1810;
    }

    li {
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }

    .legend {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: #F5F5DC;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #D7CCC8;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        font-size: 1rem;
    }

    .color-sample {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-block;
        border: 2px solid white;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .about-page {
            padding: 1rem;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
        }

        h2 {
            font-size: 1.3rem;
            margin: 1.5rem 0 0.75rem 0;
        }

        section {
            padding: 1rem;
            margin-bottom: 1.5rem;
        }

        p, li {
            font-size: 1rem;
        }
    }

    @media (max-width: 480px) {
        .about-page {
            padding: 0.5rem;
        }

        h1 {
            font-size: 1.8rem;
        }

        section {
            padding: 0.75rem;
        }
    }
</style>
