/**
 * BACKEND PARA JOYFIT (Google Apps Script)
 * 
 * Instrucciones:
 * 1. Abre tu Google Sheets: https://docs.google.com/spreadsheets/d/1Riz_9M7BZzKc-S78xLrVG98uMzSIhn95Dvrjq85W_A8/edit
 * 2. Ve a "Extensiones" -> "Apps Script"
 * 3. Borra el código que haya y pega todo este archivo.
 * 4. Crea una pestaña nueva en tu Excel que se llame: Historial
 * 5. Dale a "Implementar" -> "Nueva Implementación" -> "Aplicación Web". 
 * 6. Acceso: "Cualquier persona". 
 * 7. Copia la "URL de la aplicación web" y pégala en la app de React (App.jsx → API_URL)
 */

const SPREADSHEET_ID = '1Riz_9M7BZzKc-S78xLrVG98uMzSIhn95Dvrjq85W_A8'; 

// Esta función se ejecuta cuando la App React pide datos
function doGet(e) {
  // ── Acción: guardar ejercicio (enviado como GET para evitar problemas de redirect 302) ──
  if (e && e.parameter && e.parameter.action === 'save') {
    return handleSave(e.parameter.data);
  }

  // ── Acción por defecto: devolver los ejercicios ──
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Plantillas');
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const rows = data.slice(1);
  const result = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(result))
         .setMimeType(ContentService.MimeType.JSON);
}

// Esta función procesa los datos de un ejercicio completado y los guarda en Historial
function handleSave(dataStr) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Historial');
    
    // Si no existe, la creamos en lugar de dar error
    if (!sheet) {
      sheet = ss.insertSheet('Historial');
    }
    
    const body = JSON.parse(dataStr);
    
    // Escribimos una CABECERA en la primera fila si está vacía
    if(sheet.getLastRow() === 0) {
      sheet.appendRow(["Fecha", "Programa", "Semana", "Día", "Ejercicio", "Serie", "Reps", "Kgs", "Bandas", "Sensaciones"]);
    }

    // Transformamos las "series" en filas de Excel
    const rowsToAppend = body.sets.map((set, index) => [
      new Date(body.date),
      body.program,
      body.week,
      body.day,
      body.exercise,
      set.id,                     // Serie N°
      set.reps,                   // Repeticiones
      set.kgs,                    // Kilos
      (set.bands || []).join(' + '),  // Bandas combinadas (Ej: Roja + Negra)
      body.notes                  // Notas generales
    ]);
    
    // Vuelca todas las series de golpe en el Excel
    if (rowsToAppend.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
           .setMimeType(ContentService.MimeType.JSON);
           
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
           .setMimeType(ContentService.MimeType.JSON);
  }
}

// Mantener doPost por si se llama directamente (ej. desde un test)
function doPost(e) {
  try {
    return handleSave(e.postData.contents);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
           .setMimeType(ContentService.MimeType.JSON);
  }
}
