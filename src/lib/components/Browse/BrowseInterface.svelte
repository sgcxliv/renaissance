/**
 * Svelte component that creates a tabbed interface for browsing between events and documents with loading states and dynamic tab content switching.
 * Loads data on mount and displays appropriate table component based on active tab.
 * Includes tab navigation with item counts and loading indicators.
 */
<script>
	import { onMount } from 'svelte';
	import EventsTable from './EventsTable.svelte';
	import DocumentsTable from './DocumentsTable.svelte';
	
	let activeTab = 'events';
	let events = [];
	let documents = [];
	let loading = true;
	
	onMount(async () => {
		await loadData();
		loading = false;
	});
	
	async function loadData() {
		try {
			events = [];
			documents = [];
		} catch (error) {
			console.error('Error loading browse data:', error);
		}
	}
	
	function setActiveTab(tab) {
		activeTab = tab;
	}
</script>

<div class="browse-interface">
	<div class="tab-navigation">
		<button 
			class="tab-button" 
			class:active={activeTab === 'events'}
			on:click={() => setActiveTab('events')}
		>
			Events ({events.length})
		</button>
		<button 
			class="tab-button" 
			class:active={activeTab === 'documents'}
			on:click={() => setActiveTab('documents')}
		>
			Documents ({documents.length})
		</button>
	</div>
	
	<div class="tab-content">
		{#if loading}
		<div class="loading">Loading data...</div>
		{:else if activeTab === 'events'}
		<EventsTable {events} />
		{:else if activeTab === 'documents'}
		<DocumentsTable {documents} />
		{/if}
	</div>
</div>

<style>
	.browse-interface {
		width: 100%;
	}
	
	.tab-navigation {
		display: flex;
		border-bottom: 2px solid var(--border-color);
		margin-bottom: var(--spacing-lg);
	}
	
	.tab-button {
		padding: var(--spacing-md) var(--spacing-lg);
		background: none;
		border: none;
		cursor: pointer;
		font-size: var(--font-lg);
		color: var(--text-color);
		border-bottom: 3px solid transparent;
		transition: all 0.2s;
	}
	
	.tab-button:hover {
		background-color: var(--hover-color);
	}
	
	.tab-button.active {
		color: var(--primary-color);
		border-bottom-color: var(--primary-color);
		font-weight: bold;
	}
	
	.tab-content {
		min-height: 400px;
	}
	
	.loading {
		text-align: center;
		padding: var(--spacing-xl);
		color: #666;
		font-style: italic;
	}
</style>
