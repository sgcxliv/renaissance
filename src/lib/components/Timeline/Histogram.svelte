<script>
  import { filters, actualDateRange } from '$lib/stores/filters.js';
  import { mappableEvents } from '$lib/stores/map.js';
  import { generateHistogramData } from '$lib/utils/filterHelpers.js';

  const DECADE_STEP = 10;

  let maxCount = 0;
  let histogramData = {};

  // Use actual data range from the loaded data
  $: START_YEAR = $actualDateRange.min;
  $: END_YEAR = $actualDateRange.max;

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
    const maxHeight = 50; // Maximum bar height in pixels - you can adjust this value
    return `${Math.max(1, (percentage / 100) * maxHeight)}px`;
  }

  function getDecadeLabel(year) {
    return `${year}s`;
  }


</script>

<div class="histogram-container">
  <div class="histogram-wrapper">
    {#each decades as decade}
      <div 
        class="histogram-bar"
        style="height: {getBarHeight(histogramData[decade] || 0)};"
        title="{histogramData[decade] || 0} events in {getDecadeLabel(decade)}"
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
    height: 60px; /* You can adjust this value to make the histogram taller */
    margin-bottom: 3px;
    padding: 0;
  }

  .histogram-bar {
    flex: 1;
    background-color: #cccccc;
    margin: 0 1px;
    transition: background-color 0.2s ease;
    min-height: 2px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
    border-radius: 2px 2px 0 0;
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
