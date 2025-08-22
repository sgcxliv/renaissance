<!--
 * Svelte component that displays a sortable, searchable, and paginated table of events with person, date, place, and description columns.
 * Includes search functionality across all event fields, column sorting with date sorting by earliest year, and pagination controls.
 * Features responsive design and handles empty states with appropriate messaging.
-->
<script>
    export let events = [];
    
    let searchTerm = '';
    let sortColumn = 'date';
    let sortDirection = 'asc';
    let currentPage = 1;
    let itemsPerPage = 50;

    // Renamed to avoid conflict with `filteredEvents` store
    $: filteredTableEvents = events.filter(event => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            event.person?.toLowerCase().includes(searchLower) ||
            event.place?.toLowerCase().includes(searchLower) ||
            event.description?.toLowerCase().includes(searchLower) ||
            event.date?.toLowerCase().includes(searchLower)
        );
    });
    
    $: sortedEvents = [...filteredTableEvents].sort((a, b) => {
        let aVal = a[sortColumn] || '';
        let bVal = b[sortColumn] || '';
        
        if (sortColumn === 'date') {
            aVal = a.earliestYear || 0;
            bVal = b.earliestYear || 0;
        }
        
        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    $: paginatedEvents = sortedEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    $: totalPages = Math.ceil(filteredTableEvents.length / itemsPerPage);
    
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
</script>

<div class="events-table-container">
    <div class="table-controls">
        <input
            type="text"
            placeholder="Search events..."
            bind:value={searchTerm}
            class="search-input"
        />
        <div class="results-info">
            Showing {paginatedEvents.length} of {filteredTableEvents.length} events
        </div>
    </div>
    
    <div class="table-wrapper">
        <table class="events-table">
            <thead>
                <tr>
                    <th on:click={() => handleSort('person')} class="sortable">
                        Person
                        {#if sortColumn === 'person'}
                            <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                    </th>
                    <th on:click={() => handleSort('date')} class="sortable">
                        Date
                        {#if sortColumn === 'date'}
                            <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                    </th>
                    <th on:click={() => handleSort('place')} class="sortable">
                        Place
                        {#if sortColumn === 'place'}
                            <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                    </th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {#each paginatedEvents as event}
                <tr>
                    <td class="person-cell">{event.person || ''}</td>
                    <td class="date-cell">{event.date || ''}</td>
                    <td class="place-cell">{event.place || ''}</td>
                    <td class="description-cell">{event.description || ''}</td>
                </tr>
                {:else}
                <tr>
                    <td colspan="4" class="no-results">No events found</td>
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
    .events-table-container {
        width: 100%;
    }
    
    .table-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        gap: var(--spacing-md);
    }
    
    .search-input {
        flex: 1;
        max-width: 400px;
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        font-size: var(--font-md);
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
    
    .events-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
    }
    
    .events-table th {
        background-color: #f8f9fa;
        padding: var(--spacing-md);
        text-align: left;
        font-weight: bold;
        border-bottom: 2px solid var(--border-color);
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .events-table th.sortable {
        cursor: pointer;
        user-select: none;
    }
    
    .events-table th.sortable:hover {
        background-color: var(--hover-color);
    }
    
    .sort-indicator {
        margin-left: var(--spacing-xs);
        color: var(--primary-color);
    }
    
    .events-table td {
        padding: var(--spacing-md);
        border-bottom: 1px solid #eee;
        vertical-align: top;
    }
    
    .events-table tr:hover {
        background-color: #fafafa;
    }
    
    .person-cell {
        font-weight: 500;
        min-width: 150px;
    }
    
    .date-cell {
        min-width: 120px;
        white-space: nowrap;
    }
    
    .place-cell {
        min-width: 150px;
    }
    
    .description-cell {
        max-width: 300px;
        word-wrap: break-word;
    }
    
    .no-results {
        text-align: center;
        padding: var(--spacing-xl);
        color: #666;
        font-style: italic;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-lg);
    }
    
    .pagination button {
        padding: var(--spacing-xs) var(--spacing-md);
        border: 1px solid var(--border-color);
        background: white;
        cursor: pointer;
        border-radius: var(--border-radius);
    }
    .pagination button:hover:not(:disabled) {
        background-color: var(--hover-color);
    }
    
    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .pagination .page-btn.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
</style>
