import Papa from 'papaparse';
import { fetchSheetData } from './dataFetcher.js'; // Adjust path if needed

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

export async function loadAllMetadata() {
  const sheets = Object.keys(CSV_URLS);
  const metadata = {};
  await Promise.all(
    sheets.map(async (sheet) => {
      try {
        metadata[sheet] = await fetchSheetData(sheet);
      } catch (err) {
        console.error(`Failed to load ${sheet}:`, err);
        metadata[sheet] = [];
      }
    })
  );
  // Robust normalization at the source (optional, not required!)
  if (metadata.Events) {
    metadata.Events = metadata.Events
      .map(event => ({
        ...event,
        LOCID: event.LOCID || getField(
          event,
          "Location ID (LOC)", " Location ID (LOC)", "Location Id (LOC)"
        ),
        BIOID: event.BIOID || getField(
          event,
          "Biography ID (BCO, BMU, BNO)",
          "Biography Musician (BMU) ID",
          "Biography Composer (BCO) ID",
          "Biography Nonmusician (BNO) ID"
        ),
        INSID: event.INSID || getField(event, "Institution ID (INS)")
      }))
      .filter(event => event.LOCID && event.BIOID);
  }
  return metadata;
}

// You would also need to define getField above:
function getField(obj, ...possibleKeys) {
  for (const key of possibleKeys) {
    if (obj[key] !== undefined) return obj[key];
    let found = Object.keys(obj).find(k => k.trim() === key.trim());
    if (found) return obj[found];
    found = Object.keys(obj).find(
      k => k.trim().toLowerCase() === key.trim().toLowerCase()
    );
    if (found) return obj[found];
  }
  return undefined;
}