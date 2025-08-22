<!--
Svelte component that creates a dual-handle range slider for filtering data by date range with visual feedback.
Syncs with global filter stores and dynamically adjusts to actual data date ranges with real-time visual updates.
Features custom styling with active range highlighting and floating labels showing current values.
-->
<script>
  import { filters, dateSliderMin, dateSliderMax, actualDateRange } from '$lib/stores/filters.js';

  let sliderMinElement;
  let sliderMaxElement;

  // Use actual data range instead of hardcoded values
  $: MIN_YEAR = $actualDateRange.min;
  $: MAX_YEAR = $actualDateRange.max;

  // Initialize values from stores
  let minValue = $dateSliderMin;
  let maxValue = $dateSliderMax;

  // Update local values when stores change
  $: minValue = $dateSliderMin;
  $: maxValue = $dateSliderMax;

  // Use the actual data range for sliders
  $: actualMinYear = MIN_YEAR;
  $: actualMaxYear = MAX_YEAR;

  // Update visual elements when values change
  $: if (minValue !== undefined && maxValue !== undefined) {
    updateDateRange();
    updateSliderBackground();
  }

  function updateDateRange() {
    if (typeof document === 'undefined') return;

    const activeStartLabel = document.querySelector('.slider-active-label-start');
    const activeEndLabel = document.querySelector('.slider-active-label-end');

    if (activeStartLabel && activeEndLabel && sliderMinElement && sliderMaxElement) {
      const minPercent = ((minValue - actualMinYear) / (actualMaxYear - actualMinYear)) * 100;
      const maxPercent = ((maxValue - actualMinYear) / (actualMaxYear - actualMinYear)) * 100;

      activeStartLabel.style.left = `${minPercent}%`;
      activeStartLabel.textContent = minValue?.toString();
      activeEndLabel.style.left = `${maxPercent}%`;
      activeEndLabel.textContent = maxValue?.toString();
    }
  }

  function updateSliderBackground() {
    if (typeof document === 'undefined') return;

    const sliderTrack = document.querySelector('.slider-track');
    if (sliderTrack) {
      const minPercent = ((minValue - actualMinYear) / (actualMaxYear - actualMinYear)) * 100;
      const maxPercent = ((maxValue - actualMinYear) / (actualMaxYear - actualMinYear)) * 100;

      sliderTrack.style.background = `linear-gradient(
        to right,
        #ddd 0%,
        #ddd ${minPercent}%,
        #333 ${minPercent}%,
        #333 ${maxPercent}%,
        #ddd ${maxPercent}%,
        #ddd 100%
      )`;
    }
  }

  function updateFilters() {
    filters.update(f => ({
      ...f,
      dateRange: { min: minValue, max: maxValue }
    }));
    dateSliderMin.set(minValue ?? MIN_YEAR);
    dateSliderMax.set(maxValue ?? MAX_YEAR);
  }

  function handleMinChange() {
    if (minValue >= maxValue) {
      minValue = maxValue - 1;
    }
    updateFilters();
  }

  function handleMaxChange() {
    if (maxValue <= minValue) {
      maxValue = minValue + 1;
    }
    updateFilters();
  }
</script>
<div class="date-slider-container">
  <div class="slider-container">
    <div class="slider-wrapper">
      <!-- Background track -->
      <div class="slider-track"></div>
            <!-- Min range slider -->
      <input 
        bind:this={sliderMinElement}
        type="range" 
        min={actualMinYear} 
        max={actualMaxYear} 
        bind:value={minValue}
        on:input={handleMinChange}
        class="slider slider-min"
      />
      <!-- Max range slider -->
      <input 
        bind:this={sliderMaxElement}
        type="range" 
        min={actualMinYear} 
        max={actualMaxYear} 
        bind:value={maxValue}
        on:input={handleMaxChange}
        class="slider slider-max"
      />
    </div>
    <!-- Year labels at the bottom -->
    <div class="year-labels">
      <span class="year-label start">{actualMinYear}</span>
      <span class="year-label end">{actualMaxYear}</span>
    </div>
    
    <!-- Active range labels -->
    <div class="slider-active-label-container">
      <div class="slider-active-label-start"></div>
      <div class="slider-active-label-end"></div>
    </div>
  </div>
</div>

<style>
  .date-slider-container {
    width: 100%;
    margin: 0.5rem 0; /* Added margin for better spacing */
  }

  .slider-container {
    position: relative;
    width: 100%;
    padding: 5px 0 1px 0;
    background: transparent;
    border-radius: 0;
    margin-bottom: 0;
  }

  .slider-wrapper {
    position: relative;
    width: calc(100% - 40px);
    margin: 0 20px;
    height: 8px;
  }

  .slider-track {
    position: absolute;
    width: 100%;
    height: 8px;
    background: #ddd;
    border-radius: 5px;
    z-index: 1;
  }

  .slider {
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 8px;
    -webkit-appearance: none;
    background: transparent;
    z-index: 2;
  }

  .slider::-webkit-slider-thumb {
    pointer-events: auto;
    position: relative;
    -webkit-appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #333;
    cursor: pointer;
    z-index: 3;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .slider::-moz-range-thumb {
    pointer-events: auto;
    position: relative;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #333;
    cursor: pointer;
    border: none;
    z-index: 3;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: transparent;
    border-radius: 5px;
  }

  .slider::-moz-range-track {
    width: 100%;
    height: 8px;
    background: transparent;
    border-radius: 5px;
    border: none;
  }

  .year-labels {
    display: flex;
    justify-content: space-between;
    margin: 10px 20px 0 20px;
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }

  .slider-active-label-container {
    position: relative;
    width: calc(100% - 40px);
    margin: 0 20px;
    height: 30px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 4;
  }

  .slider-active-label-start,
  .slider-active-label-end {
    position: absolute;
    font-size: 12px;
    font-weight: bold;
    background-color: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    top: -35px;
    transform: translateX(-50%);
    z-index: 4;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    white-space: nowrap;
  }

  .slider-active-label-start::after,
  .slider-active-label-end::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -4px;
    border: 4px solid transparent;
    border-top-color: #333;
  }
</style>
