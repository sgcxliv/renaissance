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
                <span class="color-sample" style="background-color: #8B4513;"></span>
                Composers
            </div>
            <div class="legend-item">
                <span class="color-sample" style="background-color: #CD853F;"></span>
                Musicians
            </div>
            <div class="legend-item">
                <span class="color-sample" style="background-color: #DAA520;"></span>
                Non-Musicians
            </div>
        </div>
    </section>
</div>

<style>
    .about-page {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        line-height: 1.6;
        font-family: 'Georgia', serif;
        color: #2C1810;
        background-color: #FFF8E1;
        min-height: 100vh;
    }

    h1 {
        color: #8B4513;
        margin-bottom: 2rem;
        font-size: 2.5rem;
        text-align: center;
        border-bottom: 2px solid #CD853F;
        padding-bottom: 1rem;
    }

    h2 {
        color: #5D4037;
        margin: 2rem 0 1rem 0;
        font-size: 1.5rem;
        border-left: 4px solid #DAA520;
        padding-left: 1rem;
    }

    section {
        margin-bottom: 2rem;
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #D7CCC8;
    }

    p {
        margin-bottom: 1rem;
        color: #2C1810;
        font-size: 1.1rem;
    }

    ul {
        padding-left: 1.5rem;
        color: #2C1810;
    }

    li {
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }

    .legend {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: #F5F5DC;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #D7CCC8;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        font-size: 1rem;
    }

    .color-sample {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-block;
        border: 2px solid white;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .about-page {
            padding: 1rem;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
        }

        h2 {
            font-size: 1.3rem;
            margin: 1.5rem 0 0.75rem 0;
        }

        section {
            padding: 1rem;
            margin-bottom: 1.5rem;
        }

        p, li {
            font-size: 1rem;
        }
    }

    @media (max-width: 480px) {
        .about-page {
            padding: 0.5rem;
        }

        h1 {
            font-size: 1.8rem;
        }

        section {
            padding: 0.75rem;
        }
    }
</style>
