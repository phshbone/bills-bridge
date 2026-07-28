/**
 * Bill's Universe Asset Bridge
 * Google Apps Script backend
 *
 * Setup:
 * 1. Create a Google Sheet and copy its ID into SHEET_ID.
 * 2. Create a Drive folder and copy its ID into ASSET_FOLDER_ID.
 * 3. Deploy as Web App:
 *    Execute as: Me
 *    Who has access: Anyone with the link
 */

const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const ASSET_FOLDER_ID = 'PASTE_DRIVE_FOLDER_ID_HERE';
const SHEET_NAME = 'Assets';

function doGet(e) {
  try {
    const action = String((e.parameter && e.parameter.action) || '');
    if (action === 'listIncoming') {
      return json_({ ok: true, assets: listIncoming_(String(e.parameter.destinationApp || '')) });
    }
    if (action === 'getAsset') {
      return json_({ ok: true, asset: getAsset_(String(e.parameter.assetId || '')) });
    }
    return json_({ ok: true, message: "Bill's Universe Asset Bridge is running." });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (body.action === 'uploadAsset') return json_({ ok: true, asset: uploadAsset_(body) });
    if (body.action === 'acceptAsset') return json_({ ok: true, asset: updateStatus_(body.assetId, 'accepted') });
    if (body.action === 'dismissAsset') return json_({ ok: true, asset: updateStatus_(body.assetId, 'dismissed') });
    return json_({ ok: false, error: 'Unknown action.' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function uploadAsset_(body) {
  requireConfig_();
  const folder = DriveApp.getFolderById(ASSET_FOLDER_ID);
  const bytes = Utilities.base64Decode(String(body.fileBase64 || ''));
  const blob = Utilities.newBlob(bytes, body.mimeType || 'image/png', safeName_(body.name || 'asset'));
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const record = {
    assetId: body.assetId || ('asset_' + Date.now()),
    name: body.name || file.getName(),
    mimeType: body.mimeType || file.getMimeType(),
    sourceApp: body.sourceApp || 'unknown',
    destinationApp: body.destinationApp || '',
    project: body.project || '',
    tags: Array.isArray(body.tags) ? body.tags.join(', ') : String(body.tags || ''),
    driveFileId: file.getId(),
    dataUrlPublic: 'https://drive.google.com/uc?export=view&id=' + file.getId(),
    createdAt: body.createdAt || new Date().toISOString(),
    status: body.status || 'incoming'
  };
  append_(record);
  return record;
}

function listIncoming_(destinationApp) {
  return rows_()
    .filter(r => r.destinationApp === destinationApp && r.status === 'incoming')
    .sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function getAsset_(assetId) {
  const item = rows_().find(r => r.assetId === assetId);
  if (!item) throw new Error('Asset not found.');
  return item;
}

function updateStatus_(assetId, status) {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) throw new Error('Asset not found.');
  const headers = values[0];
  const idCol = headers.indexOf('assetId');
  const statusCol = headers.indexOf('status');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(assetId)) {
      sh.getRange(i + 1, statusCol + 1).setValue(status);
      const updated = {};
      headers.forEach((h,j) => updated[h] = j === statusCol ? status : values[i][j]);
      return updated;
    }
  }
  throw new Error('Asset not found.');
}

function append_(record) {
  const sh = sheet_();
  const headers = headers_();
  sh.appendRow(headers.map(h => record[h] == null ? '' : record[h]));
}

function rows_() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  if (!values.length) return [];
  const headers = values[0];
  return values.slice(1).filter(r => r.some(v => v !== '')).map(row => {
    const o = {}; headers.forEach((h,i) => o[h] = row[i]); return o;
  });
}

function sheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(headers_());
  return sh;
}

function headers_() {
  return ['assetId','name','mimeType','sourceApp','destinationApp','project','tags','driveFileId','dataUrlPublic','createdAt','status'];
}

function requireConfig_() {
  if (SHEET_ID.indexOf('PASTE_') === 0 || ASSET_FOLDER_ID.indexOf('PASTE_') === 0) {
    throw new Error('Add the Google Sheet ID and Drive folder ID in Code.gs.');
  }
}

function safeName_(name) {
  return String(name).replace(/[\\/:*?"<>|]+/g,'_').slice(0,120) || 'asset';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
