<svelte:head>
    <title>About - Historical Music Events</title>
</svelte:head>

<div class="about-page">
    <h1>About This Project</h1>
    
    <section>
        <h2>Overview</h2>
        <p>
            This interactive map displays historical events related to musicians, composers,
            and other figures in music history from 1400-1600.
        </p>
    </section>

    <section>
        <h2>Data Sources</h2>
        <p>
            The data is compiled from various historical documents, archives, and scholarly sources.
            Each event is linked to its primary source documentation when available.
        </p>
    </section>

    <section>
        <h2>How to Use</h2>
        <ul>
            <li>Use the checkboxes to filter by person type (composers, musicians, non-musicians)</li>
            <li>Adjust the date slider to focus on specific time periods</li>
            <li>Search for specific names, places, or events</li>
            <li>Click on map markers to view detailed information</li>
            <li>Use the institution filter to see events by institution type</li>
        </ul>
    </section>

    <section>
        <h2>Legend</h2>
        <div class="legend">
            <div class="legend-item">
                <span class="color-sample" style="background-color: var(--primary-color);"></span>
                Composers
            </div>
            <div class="legend-item">
                <span class="color-sample" style="background-color: var(--secondary-color);"></span>
                Musicians
            </div>
            <div class="legend-item">
                <span class="color-sample" style="background-color: var(--accent-color);"></span>
                Non-Musicians
            </div>
        </div>
    </section>
</div>

<style>
    .about-page {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--spacing-xl);
        line-height: 1.6;
    }

    h1 {
        color: var(--primary-color);
        margin-bottom: var(--spacing-xl);
    }

    h2 {
        color: var(--text-color);
        margin: var(--spacing-xl) 0 var(--spacing-md) 0;
    }

    section {
        margin-bottom: var(--spacing-xl);
    }

    ul {
        padding-left: var(--spacing-lg);
    }

    li {
        margin-bottom: var(--spacing-xs);
    }

    .legend {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .color-sample {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: inline-block;
    }
</style>
