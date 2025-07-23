<script>
  export let title = "Story Map: Institution/Person";
  export let blurbText = `Clicking the footnotes highlights the corresponding point on the map, and clicking the point highlights the sentence in the blurb`;
  export let hasAudio = true;
  export let hasPicture = true;
  export let pictureText = "Clicking the picture will enlarge above";
  
  // Timeline data - can be made dynamic later
  let timelineStart = 1400;
  let timelineEnd = 1600;
  let currentStart = 1450;
  let currentEnd = 1550;
  
  // Map data placeholders
  let mapPoints = [
    { id: 1, x: 15, y: 25, color: 'white', type: 'start' },
    { id: 2, x: 35, y: 45, color: 'yellow', type: 'middle' },
    { id: 3, x: 55, y: 35, color: 'black', type: 'end' },
    { id: 4, x: 75, y: 55, color: 'red', type: 'event' },
    { id: 5, x: 85, y: 25, color: 'green', type: 'destination' }
  ];
  
  function handlePointClick(point) {
    console.log('Point clicked:', point);
    // Add highlighting logic here
  }
  
  function handleFootnoteClick(footnoteId) {
    console.log('Footnote clicked:', footnoteId);
    // Add highlighting logic here
  }
</script>

<div class="storymap-container">
  <!-- Left Content Panel -->
  <div class="content-panel">
    <div class="blurb-section">
      <h2>Long Blurb about story map</h2>
      <p class="blurb-text">
        {blurbText}
        <button 
          class="footnote-link" 
          on:click={() => handleFootnoteClick(1)}
        >
          ¹
        </button>
        and clicking the point highlights the sentence in the blurb.
        <button 
          class="footnote-link" 
          on:click={() => handleFootnoteClick(2)}
        >
          ²
        </button>
      </p>
    </div>
    
    <!-- Picture Section -->
    {#if hasPicture}
      <div class="picture-section">
        <h3>Picture</h3>
        <div class="picture-placeholder">
          <div class="picture-frame">
            [Picture Placeholder]
          </div>
        </div>
        <p class="picture-caption">{pictureText}</p>
      </div>
    {/if}
    
    <!-- Audio Section -->
    {#if hasAudio}
      <div class="audio-section">
        <h3>Audio element</h3>
        <div class="audio-controls">
          <button class="audio-btn">◀</button>
          <button class="audio-btn play-btn">▶</button>
          <button class="audio-btn">▶▶</button>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Right Map Panel -->
  <div class="map-panel">
    <div class="map-header">
      <h2>{title}</h2>
      <button class="zoom-control">Zoom in<br>out/map<br>controls</button>
    </div>
    
    <div class="map-container">
      <div class="map-content">
        <div class="map-label">MAP</div>
        
        <!-- Story map points with connecting lines -->
        <svg class="story-paths" viewBox="0 0 100 80">
          <!-- Dotted paths connecting points -->
          <path 
            d="M 15,25 Q 25,35 35,45 Q 45,40 55,35 Q 65,45 75,55 Q 80,40 85,25" 
            stroke="#666" 
            stroke-width="1" 
            stroke-dasharray="2,2" 
            fill="none"
          />
        </svg>
        
        <!-- Map points -->
        {#each mapPoints as point}
          <button 
            class="map-point {point.color}" 
            style="left: {point.x}%; top: {point.y}%;"
            on:click={() => handlePointClick(point)}
          >
            {#if point.type === 'start' || point.type === 'end'}
              <div class="point-dot"></div>
            {:else}
              <div class="point-circle"></div>
            {/if}
          </button>
        {/each}
        
        <!-- Direction arrows -->
        <div class="arrow arrow-1" style="left: 25%; top: 30%;">↓</div>
        <div class="arrow arrow-2" style="left: 45%; top: 35%;">→</div>
        <div class="arrow arrow-3" style="left: 65%; top: 25%;">↗</div>
        <div class="arrow arrow-4" style="left: 80%; top: 40%;">↓</div>
      </div>
    </div>
    
    <!-- Timeline Section -->
    <div class="timeline-section">
      <h3>Timeline drag bar (Event/Institution beginning - end dates)</h3>
      <div class="timeline-container">
        <div class="timeline-track">
          <div class="timeline-range" style="left: 25%; width: 50%;"></div>
          <input 
            type="range" 
            min={timelineStart} 
            max={timelineEnd} 
            bind:value={currentStart}
            class="timeline-slider start-slider"
          />
          <input 
            type="range" 
            min={timelineStart} 
            max={timelineEnd} 
            bind:value={currentEnd}
            class="timeline-slider end-slider"
          />
        </div>
        <div class="timeline-labels">
          <span>{timelineStart}</span>
          <span>{timelineEnd}</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Legend Section -->
<div class="legend-section">
  <h3>General Map legend:</h3>
  <div class="legend-content">
    <div class="legend-item">
      <p><strong>Transparency</strong> = Confidence in event</p>
    </div>
    <div class="legend-item">
      <p><strong>Story maps:</strong> Line will appear for person's journey, black dot for end, 
      white dot for beginning, nodes along journey with spiked arrows 
      showing direction of travel</p>
    </div>
  </div>
</div>

<div class="sources-section">
  <h3>Sources for individual figure / bibliography</h3>
</div>

<style>
  .storymap-container {
    display: flex;
    gap: 1rem;
    min-height: 70vh;
    background-color: #f5f5f0;
    border: 2px solid #8b7355;
    font-family: 'Times New Roman', serif;
  }
  
  .content-panel {
    flex: 1;
    padding: 1.5rem;
    background-color: #f0ede5;
    border-right: 2px solid #8b7355;
    max-width: 400px;
  }
  
  .map-panel {
    flex: 2;
    padding: 1.5rem;
    background-color: #f5f5f0;
  }
  
  .blurb-section h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    text-align: center;
    color: #2c2c2c;
  }
  
  .blurb-text {
    line-height: 1.6;
    color: #333;
    margin-bottom: 1.5rem;
  }
  
  .footnote-link {
    background: none;
    border: none;
    color: #0066cc;
    cursor: pointer;
    font-size: 0.9em;
    text-decoration: underline;
    padding: 0;
    margin: 0 2px;
  }
  
  .footnote-link:hover {
    background-color: #e6f3ff;
  }
  
  .picture-section {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .picture-section h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    color: #2c2c2c;
  }
  
  .picture-frame {
    width: 120px;
    height: 80px;
    background-color: #8b4513;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.5rem;
    border: 3px solid #654321;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .picture-caption {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.4;
  }
  
  .audio-section {
    text-align: center;
  }
  
  .audio-section h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    color: #2c2c2c;
  }
  
  .audio-controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    background-color: #8b4513;
    padding: 0.5rem;
    border-radius: 4px;
    width: fit-content;
    margin: 0 auto;
  }
  
  .audio-btn {
    background: white;
    border: 1px solid #333;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
  }
  
  .play-btn {
    background-color: #f0f0f0;
  }
  
  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .map-header h2 {
    font-size: 1.3rem;
    color: #2c2c2c;
    margin: 0;
  }
  
  .zoom-control {
    background-color: #fff;
    border: 1px solid #333;
    padding: 0.5rem;
    font-size: 0.7rem;
    line-height: 1.2;
    cursor: pointer;
    text-align: center;
    min-width: 80px;
  }
  
  .map-container {
    position: relative;
    height: 300px;
    background-color: #e8dcc0;
    border: 2px solid #8b7355;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }
  
  .map-content {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .map-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    font-weight: bold;
    color: #666;
    z-index: 1;
  }
  
  .story-paths {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
  
  .map-point {
    position: absolute;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 3;
    transform: translate(-50%, -50%);
    padding: 2px;
  }
  
  .point-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid #333;
  }
  
  .point-circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #333;
  }
  
  .map-point.white .point-dot,
  .map-point.white .point-circle {
    background-color: white;
  }
  
  .map-point.yellow .point-dot,
  .map-point.yellow .point-circle {
    background-color: yellow;
  }
  
  .map-point.black .point-dot,
  .map-point.black .point-circle {
    background-color: black;
  }
  
  .map-point.red .point-dot,
  .map-point.red .point-circle {
    background-color: red;
  }
  
  .map-point.green .point-dot,
  .map-point.green .point-circle {
    background-color: green;
  }
  
  .arrow {
    position: absolute;
    font-size: 1.2rem;
    color: #333;
    z-index: 3;
    transform: translate(-50%, -50%);
    font-weight: bold;
  }
  
  .timeline-section h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: #2c2c2c;
    text-align: center;
  }
  
  .timeline-container {
    background-color: #f0ede5;
    border: 1px solid #8b7355;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .timeline-track {
    position: relative;
    height: 40px;
    margin-bottom: 0.5rem;
  }
  
  .timeline-range {
    position: absolute;
    top: 18px;
    height: 4px;
    background-color: #8b7355;
  }
  
  .timeline-slider {
    position: absolute;
    top: 0;
    width: 100%;
    height: 40px;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    pointer-events: none;
  }
  
  .timeline-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #333;
    border-radius: 50%;
    pointer-events: auto;
    cursor: pointer;
  }
  
  .timeline-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #666;
  }
  
  .legend-section {
    background-color: #f0ede5;
    border: 2px solid #8b7355;
    padding: 1.5rem;
    margin-top: 1rem;
    font-family: 'Times New Roman', serif;
  }
  
  .legend-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #2c2c2c;
  }
  
  .legend-content {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .legend-item {
    flex: 1;
    min-width: 300px;
    line-height: 1.5;
    color: #333;
  }
  
  .sources-section {
    background-color: #d4c4a0;
    border: 2px solid #8b7355;
    padding: 1.5rem;
    margin-top: 1rem;
    text-align: center;
    font-family: 'Times New Roman', serif;
  }
  
  .sources-section h3 {
    font-size: 1.1rem;
    margin: 0;
    color: #2c2c2c;
  }
  
  @media (max-width: 768px) {
    .storymap-container {
      flex-direction: column;
    }
    
    .content-panel {
      max-width: none;
      border-right: none;
      border-bottom: 2px solid #8b7355;
    }
    
    .map-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .legend-content {
      flex-direction: column;
    }
    
    .legend-item {
      min-width: auto;
    }
  }
</style>
