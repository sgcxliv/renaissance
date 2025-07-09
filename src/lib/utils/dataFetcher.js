const WEBAPP_URL = 'https://script.google.com/a/macros/stanford.edu/s/AKfycbzSaTTclxO-sOMOqPUgJkCeFWyMqHyhCvh_EjQd6UohLnBzUbh8l0-Eozt2mLa-CoDwow/exec';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchSheetData(sheetName) {
  const url = `${WEBAPP_URL}?sheet=${sheetName}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response for ${sheetName}:`, response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched data for ${sheetName}`);
    return data;
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    throw error;
  }
}

export async function loadAllData() {
  const sheets = ['Events', 'Locations', 'Bio_Composers', 'Bio_Musicians', 'Bio_Nonmusicians', 'Institutions'];
  const data = {};
  for (const sheet of sheets) {
    try {
      data[sheet] = await fetchSheetData(sheet);
      await delay(1000); // 1 second delay between requests
    } catch (error) {
      console.error(`Failed to load data for ${sheet}:`, error);

    }
  }
  return data;
}

export async function loadSingleSheet(sheetName) {
  try {
    const data = await fetchSheetData(sheetName);
    console.log(`Data for ${sheetName}:`, data);
    return data;
  } catch (error) {
    console.error(`Failed to load data for ${sheetName}:`, error);
    throw error;
  }
}
