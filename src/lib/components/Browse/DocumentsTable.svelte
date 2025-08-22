<!--
 * Svelte component that displays a sortable, searchable, and paginated table of documents with filtering by type.
 * Includes search functionality across multiple fields, column sorting, type filtering, and pagination controls.
 * Provides responsive design and handles empty states with appropriate messaging.
-->
<script>
	export let documents = [];
	
	let searchTerm = '';
	let sortColumn = 'date';
	let sortDirection = 'asc';
	let currentPage = 1;
	let itemsPerPage = 50;
	let selectedDocumentType = 'all';
	
	$: documentTypes = [...new Set(documents.map(doc => doc.type).filter(Boolean))];
	
	$: filteredDocuments = documents.filter(doc => {
		if (selectedDocumentType !== 'all' && doc.type !== selectedDocumentType) {
			return false;
		}
		
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return (
			doc.title?.toLowerCase().includes(searchLower) ||
			doc.archive?.toLowerCase().includes(searchLower) ||
			doc.signature?.toLowerCase().includes(searchLower) ||
			doc.description?.toLowerCase().includes(searchLower)
		);
	});
	
	$: sortedDocuments = [...filteredDocuments].sort((a, b) => {
		let aVal = a[sortColumn] || '';
		let bVal = b[sortColumn] || '';
		
		if (sortDirection === 'asc') {
			return aVal > bVal ? 1 : -1;
		} else {
			return aVal < bVal ? 1 : -1;
		}
	});
	
	$: paginatedDocuments = sortedDocuments.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	
	$: totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
	
	function handleSort(column) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}
	
	function goToPage(page) {
		currentPage = Math.max(1, Math.min(page, totalPages));
	}
	
	function resetPage() {
		currentPage = 1;
	}
	
	$: searchTerm, selectedDocumentType, resetPage();
</script>

<div class="documents-table-container">
	<div class="table-controls">
		<input 
			type="text" 
			placeholder="Search documents..." 
			bind:value={searchTerm}
			class="search-input"
		/>
		
		<select bind:value={selectedDocumentType} class="type-filter">
			<option value="all">All Types</option>
			{#each documentTypes as type}
			<option value={type}>{type}</option>
			{/each}
		</select>
		
		<div class="results-info">
			Showing {paginatedDocuments.length} of {filteredDocuments.length} documents
		</div>
	</div>
	
	<div class="table-wrapper">
		<table class="documents-table">
			<thead>
				<tr>
					<th on:click={() => handleSort('title')} class="sortable">
						Title
						{#if sortColumn === 'title'}
							<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th on:click={() => handleSort('archive')} class="sortable">
						Archive
						{#if sortColumn === 'archive'}
							<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th on:click={() => handleSort('signature')} class="sortable">
						Signature
						{#if sortColumn === 'signature'}
							<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th on:click={() => handleSort('type')} class="sortable">
						Type
						{#if sortColumn === 'type'}
							<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each paginatedDocuments as document}
				<tr>
					<td class="title-cell">{document.title || ''}</td>
					<td class="archive-cell">{document.archive || ''}</td>
					<td class="signature-cell">{document.signature || ''}</td>
					<td class="type-cell">
						{#if document.type}
						<span class="type-badge">{document.type}</span>
						{/if}
					</td>
					<td class="description-cell">{document.description || ''}</td>
				</tr>
				{:else}
				<tr>
					<td colspan="5" class="no-results">No documents found</td>
				</tr>
				{/each}
			</tbody>
		</table>
	</div>
	
	{#if totalPages > 1}
	<div class="pagination">
		<button 
			on:click={() => goToPage(currentPage - 1)}
			disabled={currentPage === 1}
		>
			Previous
		</button>
		
		{#each Array(Math.min(5, totalPages)) as _, i}
			{@const page = Math.max(1, currentPage - 2) + i}
			{#if page <= totalPages}
			<button 
				class="page-btn"
				class:active={page === currentPage}
				on:click={() => goToPage(page)}
			>
				{page}
			</button>
			{/if}
		{/each}
		
		<button 
			on:click={() => goToPage(currentPage + 1)}
			disabled={currentPage === totalPages}
		>
			Next
		</button>
	</div>
	{/if}
</div>

<style>
	.documents-table-container {
		width: 100%;
	}
	
	.table-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}
	
	.search-input {
		flex: 1;
		max-width: 300px;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		font-size: var(--font-md);
	}
	
	.type-filter {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		font-size: var(--font-md);
		background: white;
	}
	
	.results-info {
		color: #666;
		font-size: var(--font-sm);
	}
	
	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
	}
	
	.documents-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
	}
	
	.documents-table th {
		background-color: #f8f9fa;
		padding: var(--spacing-md);
		text-align: left;
		font-weight: bold;
		border-bottom: 2px solid var(--border-color);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	
	.documents-table th.sortable {
		cursor: pointer;
		user-select: none;
	}
	
	.documents-table th.sortable:hover {
		background-color: var(--hover-color);
	}
	
	.sort-indicator {
		margin-left: var(--spacing-xs);
		color: var(--primary-color);
	}
	
	.documents-table td {
		padding: var(--spacing-md);
		border-bottom: 1px solid #eee;
		vertical-align: top;
	}
	
	.documents-table tr:hover {
		background-color: #fafafa;
	}
	
	.title-cell {
		font-weight: 500;
		min-width: 200px;
	}
	
	.archive-cell {
		min-width: 150px;
	}
	
	.signature-cell {
		min-width: 120px;
		font-family: monospace;
		font-size: var(--font-sm);
	}
	
	.type-cell {
		min-width: 100px;
	}
	
	.type-badge {
		display: inline-block;
		padding: 2px var(--spacing-xs);
		background-color: var(--hover-color);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		font-size: var(--font-sm);
		font-weight: 500;
	}
	
	.description-cell {
		max-width: 300px;
		word-wrap: break-word;
		line-height: 1.4;
	}
	
	.no-results {
		text-align: center;
		color: #666;
		font-style: italic;
		padding: var(--spacing-xl);
	}
	
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-lg);
	}
	
	.pagination button {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--border-color);
		background: white;
		border-radius: var(--border-radius);
		cursor: pointer;
		font-size: var(--font-sm);
		transition: all 0.2s ease;
	}
	
	.pagination button:hover:not(:disabled) {
		background-color: var(--hover-color);
		border-color: var(--primary-color);
	}
	
	.pagination button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.page-btn.active {
		background-color: var(--primary-color);
		color: white;
		border-color: var(--primary-color);
	}
	
	/* Responsive design */
	@media (max-width: 768px) {
		.table-controls {
			flex-direction: column;
			align-items: stretch;
		}
		
		.search-input {
			max-width: none;
		}
		
		.documents-table th,
		.documents-table td {
			padding: var(--spacing-sm);
		}
		
		.title-cell,
		.archive-cell,
		.signature-cell,
		.type-cell {
			min-width: auto;
		}
		
		.description-cell {
			max-width: 200px;
		}
		
		.pagination {
			flex-wrap: wrap;
		}
	}
	
	@media (max-width: 480px) {
		.documents-table {
			font-size: var(--font-sm);
		}
		
		.documents-table th,
		.documents-table td {
			padding: var(--spacing-xs);
		}
		
		.description-cell {
			max-width: 150px;
		}
		
		.pagination button {
			padding: var(--spacing-xs) var(--spacing-sm);
		}
	}
</style>
