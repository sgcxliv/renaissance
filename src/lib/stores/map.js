import { writable } from 'svelte/store';

// Map state
export const mapState = writable({
  center: [47, 9],
  zoom: 5,
  bounds: null,
  ready: false
});

// Sidebar state
export const sidebarState = writable({
  visible: true,
  content: null,
  activeMarkers: []
});

// UI state
export const uiState = writable({
  loading: false,
  error: null,
  selectedEvent: null,
  showInstitutionPopup: false
});