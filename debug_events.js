// Debug script to check what's in the Events CSV
import Papa from 'papaparse';

const eventsUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8tt4L7gHwTKjEuXIM52IbLZ9q-Sz-ANl1TU0BZM-SxlGtgPQjNUSUX1w46Smv9rzLqHgpbdG0VCx6/pub?gid=2002075686&single=true&output=csv";

async function debugEvents() {
  try {
    console.log("Fetching Events CSV...");
    const response = await fetch(eventsUrl);
    const csvText = await response.text();
    
    console.log("Raw CSV (first 500 chars):", csvText.substring(0, 500));
    
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parsed results:", results);
        
        if (results.data && results.data.length > 0) {
          console.log("Total events:", results.data.length);
          console.log("Column headers:", Object.keys(results.data[0]));
          
          console.log("First 3 events:");
          results.data.slice(0, 3).forEach((event, i) => {
            console.log(`Event ${i + 1}:`, event);
          });
          
          // Look for description fields
          const firstEvent = results.data[0];
          const descriptionFields = Object.keys(firstEvent).filter(key => 
            key.toLowerCase().includes('info') || 
            key.toLowerCase().includes('description') || 
            key.toLowerCase().includes('einfo')
          );
          console.log("Potential description fields:", descriptionFields);
          
          // Check for events with descriptions
          let eventsWithDescriptions = 0;
          results.data.slice(0, 10).forEach((event, i) => {
            const hasDesc = descriptionFields.some(field => event[field] && event[field].trim());
            if (hasDesc) {
              eventsWithDescriptions++;
              console.log(`Event ${i + 1} has description:`, descriptionFields.reduce((obj, field) => {
                if (event[field]) obj[field] = event[field];
                return obj;
              }, {}));
            }
          });
          console.log(`${eventsWithDescriptions} out of first 10 events have descriptions`);
        }
      },
      error: (error) => {
        console.error("Parse error:", error);
      }
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

debugEvents();
