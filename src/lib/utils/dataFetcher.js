const WEBAPP_URL = 'https://script.google.com/a/macros/stanford.edu/s/AKfycbypdmnFDUbOudVBC03fD_bhgL14uXgt_TcAf6SPvEY2Ze0hN-dFu5vKvJLZUTrSKpvo1g/exec';

export async function fetchSheetData(sheetName) {
  try {
    console.log(`Fetching data for sheet: ${sheetName}`);
    
    const url = `${WEBAPP_URL}?sheet=${encodeURIComponent(sheetName)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the response contains an error
    if (data.error) {
      throw new Error(`Server error: ${data.message || data.error}`);
    }

    console.log(`Successfully fetched ${data.length} records for ${sheetName}`);
    return data;
    
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    throw new Error(`Failed to fetch ${sheetName}: ${error.message}`);
  }
}

export async function fetchAllSheets() {
  const sheets = [
    'Events', 
    'Locations', 
    'Bio_Composers', 
    'Bio_Musicians', 
    'Bio_Nonmusicians', 
    'Institutions', 
    'Headers',
    'Doc_Entries',
    'Occasions',
    'Archival_Docs',
    'Bibliography'
  ];
  
  const results = {};
  
  for (const sheet of sheets) {
    try {
      results[sheet] = await fetchSheetData(sheet);
    } catch (error) {
      console.error(`Failed to fetch ${sheet}:`, error);
      results[sheet] = [];
    }
  }
  
  return results;
}
