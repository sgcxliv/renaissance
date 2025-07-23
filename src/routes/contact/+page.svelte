<script>
  import Navbar from '$lib/components/Navigation/Navbar.svelte';
</script>

<svelte:head>
  <title>Contact - Mapping the Musical Renaissance</title>
</svelte:head>

<Navbar />

<main class="page-content">
  <div class="contact-container">
    <h1>Contact Us</h1>
    
    <section class="contact-section">
      <h2>Project Team</h2>
      <div class="contact-grid">
        <div class="contact-card">
          <h3>Dr. [Principal Investigator]</h3>
          <p class="title">Lead Researcher</p>
          <p class="email">email@university.edu</p>
          <p class="affiliation">Department of Music History<br>University Name</p>
        </div>
        
        <div class="contact-card">
          <h3>Dr. [Co-Investigator]</h3>
          <p class="title">Digital Humanities Specialist</p>
          <p class="email">email@university.edu</p>
          <p class="affiliation">Digital Humanities Center<br>University Name</p>
        </div>
        
        <div class="contact-card">
          <h3>[Developer Name]</h3>
          <p class="title">Technical Developer</p>
          <p class="email">developer@university.edu</p>
          <p class="affiliation">IT Services<br>University Name</p>
        </div>
      </div>
    </section>
    
    <section class="contact-section">
      <h2>General Inquiries</h2>
      <p>
        For general questions about the project, data access, or collaboration opportunities, 
        please contact us at:
      </p>
      <p class="general-email">info@renaissancemusic.org</p>
    </section>
    
    <section class="contact-section">
      <h2>Data Contributions</h2>
      <p>
        We welcome contributions from researchers and institutions. If you have historical 
        data, corrections, or additional sources that could enhance our database, please 
        reach out to our research team.
      </p>
    </section>
    
    <section class="contact-section">
      <h2>Technical Support</h2>
      <p>
        If you encounter technical issues with the website or have suggestions for 
        improvements, please contact our technical team.
      </p>
    </section>
    
    <section class="contact-section">
      <h2>Institutional Affiliation</h2>
      <p>
        This project is supported by [University/Institution Name] and funded by 
        [Grant/Foundation Name]. 
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
  
  .contact-container {
    max-width: 900px;
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
  
  .contact-section {
    margin-bottom: 2rem;
  }
  
  .contact-section:last-child {
    margin-bottom: 0;
  }
  
  h2 {
    color: #2c2c2c;
    margin-bottom: 1rem;
    font-size: 1.3rem;
    border-left: 4px solid #8b7355;
    padding-left: 1rem;
  }
  
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 1rem 0;
  }
  
  .contact-card {
    background-color: white;
    border: 1px solid #8b7355;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(139, 115, 85, 0.1);
  }
  
  .contact-card h3 {
    color: #2c2c2c;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  .title {
    font-style: italic;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .email {
    color: #0066cc;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .affiliation {
    color: #555;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .general-email {
    font-size: 1.1rem;
    color: #0066cc;
    font-weight: bold;
    text-align: center;
    margin: 1rem 0;
    padding: 1rem;
    background-color: white;
    border: 1px solid #8b7355;
    border-radius: 6px;
  }
  
  p {
    line-height: 1.6;
    color: #333;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 768px) {
    .page-content {
      padding: 1rem;
    }
    
    .contact-container {
      padding: 1rem;
    }
    
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    h1 {
      font-size: 1.5rem;
    }
    
    h2 {
      font-size: 1.1rem;
    }
  }
</style>
