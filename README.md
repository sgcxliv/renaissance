# Renaissance Mapping

An interactive web application for exploring Renaissance music events, documents, and people through maps and timelines.

## Quick Start

```bash
npm install
npm run dev
```

## Technology Stack

SvelteKit + Vite

## Features

- Interactive maps showing musical events and locations
- Timeline visualization with histogram displays
- Advanced filtering by date, institution, and person type
- Browse database of music events and documents
- Story maps for narrative exploration
- Detailed information about Renaissance composers, musicians, and places

## Project Structure

### Root Files

**package.json / package-lock.json** — Lists the building blocks (dependencies) the website needs to function.

**node_modules/** — A storage folder that contains all those building blocks (managed by the system, not by hand).

**eslint.config.js** — Helps check that the coding style and rules are followed.

**svelte.config.js** — Configures the Svelte framework, which the site is built on.

**tsconfig.json** — Settings for writing code in TypeScript (a programming language).

**vite.config.ts** — Adjusts how the site is built and previewed for developers.

**vitest-setup-client.ts** — Setup file for automated tests (making sure code works as it should).

### src/ (The main website source)

**app.css, app.d.ts, app.html** — Foundation files for the site's appearance and typing, and the initial web page template.

**demo.spec.ts** — An example test, helps make sure features work correctly.

### src/lib/ (Reusable building blocks and helpers)

**components/** — Reusable parts of the website (like building blocks for pages).

#### Browse/
**BrowseInterface.svelte** — Controls how the browsing page looks and works.

**DocumentsTable.svelte** — Shows a list of relevant documents.

**EventsTable.svelte** — Shows a list of musical events.

#### Filters/
**DateSlider.svelte** — Lets you pick a range of years.

**InstitutionFilter.svelte** — Filter events by the type of institution.

**PersonTypeFilter.svelte** — Filter by type of person, like composer or musician.

**SearchBox.svelte** — Lets you look up specific names, places, or events.

#### Map/
**MapContainer.svelte** — The main map you see.

**MapPopup.svelte** — Info that pops up when you click a spot on the map.

#### Navigation/
**Navbar.svelte** — The menu at the top of the page.

#### Sidebar/
**EventDetails.svelte** — Shows details for a selected event.

**EventsList.svelte** — List of events shown in the sidebar.

#### StoryMap/
**StoryMapTemplate.svelte** — The base for interactive narrative/map pages.

#### Timeline/
**Histogram.svelte** — A bar graph showing the distribution of events over time.

**index.ts** — Links together and exports the pieces in this folder for easy importing elsewhere.

### stores/
**data.js** — Stores the main project data (events, places, people).

**filters.js** — Stores filter settings (like which types of events are shown).

**map.js** — Stores map-related information (like current view/location).

### styles/
**components.css, map.css, variables.css** — Style/appearance rules for components, the map, and shared color/font settings.

### utils/
**api.js** — Tools for talking to remote servers or loading data.

**dataFetcher.js** — Helps get data from files or services.

**dataProcessing.js** — Cleans and organizes raw data for the site to use.

**filterHelpers.js** — Functions to make filtering faster and easier.

**mapHelpers.js** — Functions that help with maps (like translating locations).

## Site Pages (src/routes/)

Every file or folder here is a page on your website:

**+layout.svelte** — The base layout shared across every page (like a frame, header/footer).

**+page.svelte** — The main homepage. This is where you will manage most of the styling for the main page. 

**about/+page.svelte** — The "About" page (project background and information).

**browse/+page.svelte** — A tool for exploring the database of music events, documents, and people.

**contact/+page.svelte** — How to reach the project team.

**events/+page.svelte** — Shows a list or map of music-related events.

**page.svelte.test.ts** — Test file to make sure the main page works.

**people/+page.svelte** — Information about the people (composers, musicians, etc.) in the project.

**places/+page.svelte** — Information about the places featured in the project (towns, cities, institutions).

**story-maps/+page.svelte** — Interactive narrative pages, showing stories on the map. Here, you can see that story maps are dynamically managed, and all you have to do is add the code and unique content for the person/event/place you are trying to generate story maps for, and it will automatically generate a story map with the given media and associated events. 

## Development

To run the development server:

```bash
npm install
npm run dev
```

Open your browser to `http://localhost:5173` to view the application.

## Testing

Run tests with:

```bash
npm test
```

## Contributing

This project explores Renaissance music history through interactive digital humanities tools. Contributions are welcome for historical data, UI improvements, and new visualization features.

# Linking Vercel and Supabase

Deploy directly on vercel using a copy of the repository. In Vercel, go to "Settings", and you must hadd two environment variables from Supabase. Go to "Settings" in your Supabase project, and find your PUBLIC_SUPABASE_URL (your Project URL from Supabase) and PUBLIC_SUPABASE_ANON_KEY (Your public anon key), which can be found under "Data API" and "API Keys" respectively for you to copy and paste directly. In Supabase, all you have to do is create two standard public storage buckets with the "SELECT" configuration functions, one for images, one for audio, and upload content labeled correctly in their respective buckets! 
