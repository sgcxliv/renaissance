<script>
  import { filters } from '$lib/stores/filters.js';
  import { mappableEvents } from '$lib/stores/map.js';
  import { generateHistogramData } from '$lib/utils/filterHelpers.js';
  import { dateSliderMin, dateSliderMax } from '$lib/stores/filters.js';

  const DECADE_STEP = 10;

  let maxCount = 0;
  let histogramData = {};

  // Use dynamic range based on actual data
  $: START_YEAR = Math.floor(($dateSliderMin - 10) / 10) * 10;
  $: END_YEAR = Math.ceil(($dateSliderMax + 10) / 10) * 10;

  // Use mappableEvents instead of sidebarState.activeMarkers
  $: {
    const events = $mappableEvents || [];
    
    console.log('=== HISTOGRAM DEBUG ===');
    console.log('Histogram processing', events.length, 'mappable events');
    console.log('START_YEAR:', START_YEAR, 'END_YEAR:', END_YEAR);
    
    if (events.length > 0) {
      console.log('Sample events for histogram:');
      events.slice(0, 3).forEach((event, i) => {
        console.log(`  Event ${i}:`, {
          EVID: event.EVID,
          EYEAR: event.EYEAR,
          LYEAR: event.LYEAR,
          decade: Math.floor(parseInt(event.EYEAR) / 10) * 10,
          Description: event.Description
        });
      });
    }
    
    histogramData = generateHistogramData(events, START_YEAR, END_YEAR);
    maxCount = Math.max(...Object.values(histogramData), 1);
    
    console.log('Histogram data (decade -> count):', histogramData);
    console.log('Max count:', maxCount);
    console.log('=======================');
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
    if (maxCount === 0) return '1px'; // Minimum visible height
    const percentage = (count / maxCount) * 100;
    const maxHeight = 30; // Maximum bar height in pixels
    return `${Math.max(1, (percentage / 100) * maxHeight)}px`;
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
  <div class="histogram-wrapper">
    {#each decades as decade}
      <div 
        class="histogram-bar"
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
    {/each}
  </div>
  
  <div class="decade-labels">
    {#each decades as decade}
      <div class="decade-label">
        {getDecadeLabel(decade)}
      </div>
    {/each}
  </div>
</div>

<style>
  .histogram-container {
    width: 100%;
    background: transparent;
    border-radius: 0;
    padding: 0;
    margin: 0;
  }

  .histogram-wrapper {
    display: flex;
    align-items: end;
    justify-content: space-between;
    height: 40px;
    margin-bottom: 3px;
    padding: 0;
  }

  .histogram-bar {
    flex: 1;
    background-color: #cccccc;
    margin: 0 1px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 2px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
    border-radius: 2px 2px 0 0;
  }

  .histogram-bar:hover {
    background-color: #999999;
    transform: translateY(-1px);
  }

  .count-label {
    font-size: 8px;
    font-weight: bold;
    color: #333;
    position: absolute;
    bottom: 2px;
    width: 100%;
    text-align: center;
    text-shadow: 0 1px 2px rgba(255,255,255,0.8);
  }

  .decade-labels {
    display: flex;
    justify-content: space-between;
    padding: 0;
    margin-bottom: 5px;
  }

  .decade-label {
    flex: 1;
    font-size: 9px;
    color: #666;
    text-align: center;
    margin: 0 1px;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .count-label {
      font-size: 7px;
    }
    
    .decade-label {
      font-size: 8px;
    }
  }

  @media (max-width: 480px) {
    .decade-label {
      font-size: 7px;
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }
  }
</style>
