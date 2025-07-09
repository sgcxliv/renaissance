const WEBAPP_URL = 'https://script.google.com/a/macros/stanford.edu/s/AKfycbzSaTTclxO-sOMOqPUgJkCeFWyMqHyhCvh_EjQd6UohLnBzUbh8l0-Eozt2mLa-CoDwow/exec';

export async function fetchSheetData(sheetName) {
  const url = `${WEBAPP_URL}?sheet=${sheetName}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    throw error;
  }
}

export async function loadAllData() {
  const sheets = ['Events', 'Locations', 'Bio_Composers', 'Bio_Musicians', 'Bio_Nonmusicians', 'Institutions'];
  const data = {};
  for (const sheet of sheets) {
    data[sheet] = await fetchSheetData(sheet);
  }
  return data;
}