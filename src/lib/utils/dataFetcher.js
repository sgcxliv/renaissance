import Papa from 'papaparse';

// Map each sheet name to its CSV URL (fill these in as you publish each tab)
const CSV_URLS = {
  Events:         "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=2002075686&single=true&output=csv",
  Bio_Composers:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=576281292&single=true&output=csv",
  Bio_Musicians:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=50716405&single=true&output=csv",
  Bio_Nonmusicians:"https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=1177910087&single=true&output=csv",
  Locations:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=1472256039&single=true&output=csv",
  Institutions:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=844808436&single=true&output=csv",
  Doc_Entries:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=1338879625&single=true&output=csv",
  Archival_Docs:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=1869779751&single=true&output=csv",
  Bibliography:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=1074180020&single=true&output=csv",
  Headers:        "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=1188976420&single=true&output=csv",
  Occasions:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=720598622&single=true&output=csv"
};

export async function fetchSheetData(sheetName) {
  const url = CSV_URLS[sheetName];
  if (!url) throw new Error(`No CSV URL for sheet: ${sheetName}`);

  // Check cache first (cache for 5 minutes to speed up development)
  const cacheKey = `sheet_${sheetName}`;
  const cachedData = localStorage.getItem(cacheKey);
  const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
  
  if (cachedData && cacheTimestamp) {
    const age = Date.now() - parseInt(cacheTimestamp);
    const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (age < maxAge) {
      console.log(`Using cached data for ${sheetName} (${Math.round(age/1000)}s old)`);
      return JSON.parse(cachedData);
    }
  }

  console.log(`Fetching fresh data for ${sheetName}...`);
  const response = await fetch(url);
  const csv = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Cache the results
        try {
          localStorage.setItem(cacheKey, JSON.stringify(results.data));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          console.log(`Cached data for ${sheetName}`);
        } catch (e) {
          console.warn(`Failed to cache ${sheetName}:`, e);
        }
        resolve(results.data);
      },
      error: reject
    });
  });
}
