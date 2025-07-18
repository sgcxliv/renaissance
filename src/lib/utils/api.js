const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgg2GZbKDuMxKH7g5kdbDMYvFxI20UyusSy-y8V0eLQVy9IEInKBjyJG0a6qLiE7nq/exec';

// Fetch data from Google Apps Script
export async function fetchSheetData(sheetName) {
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?sheet=${sheetName}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    throw error;
  }
}

// Load all metadata (equivalent to your current includes)
export async function loadAllMetadata() {
  const sheets = [
    'Events', 'Bio_Composers', 'Bio_Musicians', 'Bio_Nonmusicians',
    'Locations', 'Institutions', 'Doc_Entries', 'Archival_Docs',
    'Bibliography', 'Headers', 'Occasions'
  ];
  
  const metadata = {};
  const promises = sheets.map(async (sheet) => {
    try {
      metadata[sheet] = await fetchSheetData(sheet);
    } catch (error) {
      console.error(`Failed to load ${sheet}:`, error);
      metadata[sheet] = [];
    }
  });
  
  await Promise.all(promises);
  return metadata;
}
