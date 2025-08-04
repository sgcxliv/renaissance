import { writable, derived } from 'svelte/store';
import { mapData } from './data.js';

// Calculate actual date range from data
export const actualDateRange = derived(mapData, ($mapData) => {
  const events = $mapData.METADATA?.Events || [];
  if (events.length === 0) {
    return { min: 1400, max: 1600 };
  }
  
  let minYear = Infinity;
  let maxYear = -Infinity;
  
  events.forEach(event => {
    const eyear = parseInt(event.EYEAR);
    const lyear = parseInt(event.LYEAR);
    
    if (!isNaN(eyear)) {
      minYear = Math.min(minYear, eyear);
    }
    if (!isNaN(lyear)) {
      maxYear = Math.max(maxYear, lyear);
    }
  });
  
  // Add some padding and round to decades
  const min = minYear === Infinity ? 1400 : Math.floor((minYear - 10) / 10) * 10;
  const max = maxYear === -Infinity ? 1600 : Math.ceil((maxYear + 10) / 10) * 10;
  
  return { min, max };
});

// Initialize with default values, will be updated when data loads
export const dateSliderMin = writable(1400);
export const dateSliderMax = writable(1600);

// Update sliders when actual date range is calculated
actualDateRange.subscribe(range => {
  dateSliderMin.set(range.min);
  dateSliderMax.set(range.max);
});

export const filters = writable({
  // Person type filters
  showComposers: true,
  showMusicians: true,
  showNonMusicians: true,
  
  // Date range - initialize with actual data range
  dateRange: { min: 1400, max: 1600 },
  
  // Certainty filter
  showCertainty: false,
  
  // Text search
  searchText: '',
  
  // Institution filter
  institutionFilter: null,
  
  // Active names filter (for advanced filtering)
  activeNames: new Set()
});

// Update filters date range when actual date range is calculated
actualDateRange.subscribe(range => {
  filters.update(f => ({
    ...f,
    dateRange: { min: range.min, max: range.max }
  }));
});

// Helper functions to update specific filters
export function updatePersonTypeFilters(composers, musicians, nonMusicians) {
  filters.update(f => ({
    ...f,
    showComposers: composers,
    showMusicians: musicians,
    showNonMusicians: nonMusicians
  }));
}

export function updateDateRange(min, max) {
  filters.update(f => ({
    ...f,
    dateRange: { min, max }
  }));
}

export function updateSearchText(text) {
  filters.update(f => ({
    ...f,
    searchText: text
  }));
}

export function updateInstitutionFilter(institutionId) {
  filters.update(f => ({
    ...f,
    institutionFilter: institutionId
  }));
}

export function updateCertaintyFilter(showCertainty) {
  filters.update(f => ({
    ...f,
    showCertainty
  }));
}

export function resetFilters() {
  filters.set({
    showComposers: true,
    showMusicians: true,
    showNonMusicians: true,
    dateRange: { min: 1400, max: 1600 },
    showCertainty: false,
    searchText: '',
    institutionFilter: null,
    activeNames: new Set()
  });
}

export const searchResults = writable([]);

// derived store for count
export const searchCount = derived(searchResults, $results => $results.length);