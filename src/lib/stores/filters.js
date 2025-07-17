import { writable } from 'svelte/store';

/**
 * Filters store for managing all filtering options
 * Matches the structure expected by filterHelpers.js
 */
export const filters = writable({
  // Person type filters
  showComposers: true,
  showMusicians: true,
  showNonMusicians: true,
  
  // Date range
  dateRange: { min: 1400, max: 1590 },
  
  // Certainty filter
  showCertainty: false,
  
  // Text search
  searchText: '',
  
  // Institution filter
  institutionFilter: null,
  
  // Active names filter (for advanced filtering)
  activeNames: new Set()
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
    dateRange: { min: 1400, max: 1590 },
    showCertainty: false,
    searchText: '',
    institutionFilter: null,
    activeNames: new Set()
  });
}
