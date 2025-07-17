<script>
  import { filters } from '$lib/stores/filters.js';
  import { sidebarState } from '$lib/stores/map.js';
  import { generateHistogramData } from '$lib/utils/filterHelpers.js';

  const START_YEAR = 1400;
  const END_YEAR = 1590;
  const DECADE_STEP = 10;

  let maxCount = 0;
  let histogramData = {};
  let debugInfo = '';

  // Reactive histogram generation with detailed debugging
  $: {
    const events = $sidebarState.activeMarkers || [];
    
    debugInfo = `
      Events received: ${events.length}
      Sample event: ${events.length > 0 ? JSON.stringify(events[0], null, 2) : 'None'}
    `;
    
    console.log('=== Histogram Debug ===');
    console.log('Events for histogram:', events.length);
    if (events.length > 0) {
      console.log('Sample event:', events[0]);
      console.log('Event structure check:');
      console.log('- EYEAR:', events[0].EYEAR);
      console.log('- LYEAR:', events[0].LYEAR);
      console.log('- BIOID:', events[0].BIOID);
    }
    
    histogramData = generateHistogramData(events, START_YEAR, END_YEAR);
    maxCount = Math.max(...Object.values(histogramData), 1);
    
    console.log('Generated histogram data:', histogramData);
    console.log('Max count:', maxCount);
    console.log('======================');
  }

  // Generate decades array for iteration
  $: decades = generateDecades(START_YEAR, END_YEAR, DECADE_STEP);

  function generateDecades(start, end, step) {
    const decades = [];
    for (let year = start; year <= end; year += step) {
      decades.push(year);
    }
    return decades;
  }

  function getBarHeight(count) {
    if (maxCount === 0) return '2px'; // Minimum visible height
    const percentage = (count / maxCount) * 100;
    const maxHeight = 100; // Maximum bar height in pixels
    return `${Math.max(2, (percentage / 100) * maxHeight)}px`;
  }

  function getDecadeLabel(year) {
    return `${year}s`;
  }

  function handleBarClick(decade) {
    console.log('Bar clicked for decade:', decade);
    // Update date slider to focus on this decade
    filters.update(f => ({
      ...f,
      dateRange: { min: decade, max: decade + 9 }
    }));
  }
</script>

<div class="histogram-container">
  <h3>Events by Decade</h3>
  
  <!-- Detailed debug section -->
  <details style="margin-bottom: 1rem; background: #f5f5f5; padding: 10px;">
    <summary style="cursor: pointer; font-weight: bold;">Debug Info (click to expand)</summary>
    <pre style="font-size: 11px; overflow: auto;">{debugInfo}</pre>
    <p><strong>Histogram Data:</strong></p>
    <pre style="font-size: 11px;">{JSON.stringify(histogramData, null, 2)}</pre>
  </details>
  
  <table class="histogram">
    <tbody>
      <tr>
        {#each decades as decade}
          <td>
            <div 
              class="count"
              style="height: {getBarHeight(histogramData[decade] || 0)};"
              title="{histogramData[decade] || 0} events in {getDecadeLabel(decade)}"
              on:click={() => handleBarClick(decade)}
              on:keydown={(e) => e.key === 'Enter' && handleBarClick(decade)}
              role="button"
              tabindex="0"
            >
              <div class="count-label">
                {histogramData[decade] || 0}
              </div>
            </div>
          </td>
        {/each}
      </tr>
      <tr class="decade-labels">
        {#each decades as decade}
          <td class="decade-label">
            {getDecadeLabel(decade)}
          </td>
        {/each}
      </tr>
    </tbody>
  </table>
</div>

<style>
  .histogram-container {
    width: 100%;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    text-align: center;
    color: #333;
  }

  .histogram {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .histogram td {
    width: auto;
    padding: 0;
    vertical-align: bottom;
    text-align: center;
  }

  .count {
    width: 100%;
    background-color: #4a90e2;
    color: white;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border: 1px solid #357abd;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 20px;
  }

  .count:hover {
    background-color: #357abd;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .count-label {
    font-size: 10px;
    font-weight: bold;
    padding: 2px;
    position: absolute;
    bottom: 2px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }

  .decade-labels td {
    padding: 8px 2px 0 2px;
  }

  .decade-label {
    font-size: 11px;
    font-weight: 500;
    color: #666;
    text-align: center;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .histogram-container {
      padding: 0.5rem;
    }
    
    h3 {
      font-size: 1rem;
    }
    
    .count-label {
      font-size: 8px;
    }
    
    .decade-label {
      font-size: 9px;
    }
  }

  @media (max-width: 480px) {
    .decade-label {
      font-size: 8px;
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }
  }
</style>
