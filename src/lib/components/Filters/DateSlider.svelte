<script>
  import { filters, dateSliderMin, dateSliderMax } from '$lib/stores/filters.js';

  let sliderMinElement;
  let sliderMaxElement;

  const MIN_YEAR = 1400;
  const MAX_YEAR = 1590;

  // Step 1: Don't assign $stores at top-level!
  // Instead, use reactive statements so values track the store.
  let minValue;
  let maxValue;

  $: minValue = $dateSliderMin;
  $: maxValue = $dateSliderMax;

  $: {
    updateDateRange();
    updateSliderBackground();
    updateFilters();
  }

  function updateDateRange() {
    if (typeof document === 'undefined') return;

    const activeStartLabel = document.querySelector('.slider-active-label-start');
    const activeEndLabel = document.querySelector('.slider-active-label-end');

    if (activeStartLabel && activeEndLabel && sliderMinElement && sliderMaxElement) {
      const minPercent = ((minValue - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
      const maxPercent = ((maxValue - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

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
      const minPercent = ((minValue - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
      const maxPercent = ((maxValue - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

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
  }

  function handleMaxChange() {
    if (maxValue <= minValue) {
      maxValue = minValue + 1;
    }
  }
</script>
<!-- The rest of your markup and styles remain unchanged -->
<div class="slider-container">
  <div class="slider-wrapper">
    <!-- Background track -->
    <div class="slider-track"></div>
    <!-- Min range slider -->
    <input 
      bind:this={sliderMinElement}
      type="range" 
      min={MIN_YEAR} 
      max={MAX_YEAR} 
      bind:value={minValue}
      on:input={handleMinChange}
      class="slider slider-min"
    />
    <!-- Max range slider -->
    <input 
      bind:this={sliderMaxElement}
      type="range" 
      min={MIN_YEAR} 
      max={MAX_YEAR} 
      bind:value={maxValue}
      on:input={handleMaxChange}
      class="slider slider-max"
    />
  </div>
  <!-- Labels -->
  <div class="slider-active-label-container">
    <div class="slider-active-label-start"></div>
    <div class="slider-active-label-end"></div>
  </div>
</div>

<style>
  .slider-container {
    position: relative;
    width: 100%;
    padding: 20px 0;
    margin-top: -50px;
  }

  .slider-wrapper {
    position: relative;
    width: 100%;
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

  .slider-active-label-container {
    position: relative;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 4;
  }

  .slider-active-label-start,
  .slider-active-label-end {
    position: absolute;
    font-size: 14px;
    font-weight: bold;
    background-color: white;
    padding: 2px 6px;
    border-radius: 3px;
    top: 25px;
    transform: translateX(-50%);
    z-index: 4;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
</style>