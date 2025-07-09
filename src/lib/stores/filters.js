import { writable, derived } from 'svelte/store';

// Filter states
export const filters = writable({
  showComposers: true,
  showMusicians: true,
  showNonMusicians: false,
  showCertainty: true,
  searchText: '',
  dateRange: { min: 1400, max: 1590 },
  institutionFilter: null,
  activeNames: new Set()
});

// Date slider values
export const dateSliderMin = writable(1400);
export const dateSliderMax = writable(1590);

// Institution filter
export const institutionFilter = writable(null);

// Search and autocomplete
export const searchResults = writable([]);
export const searchCount = writable(0);