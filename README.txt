BILL'S UNIVERSE ASSET BRIDGE — STARTER PACKAGE

FILES
-----
image-lab-bridge.html
  A working sender prototype. Choose a PNG/JPEG/WebP, name it, assign a project,
  and send it to Bill's App Maker.

app-maker-bridge.html
  A working receiver prototype. It lists incoming assets, previews them,
  and adds them to a phone-frame canvas where they can be dragged.

Code.gs
  Optional Google Apps Script backend. This stores image files in Google Drive
  and metadata in Google Sheets.

QUICK TEST — NO BACKEND
-----------------------
1. Put image-lab-bridge.html and app-maker-bridge.html in the SAME GitHub Pages folder.
2. Open image-lab-bridge.html.
3. Leave the Apps Script URL blank.
4. Choose an image and press "Send to Bill's Universe."
5. Press "Open App Maker."
6. The asset should appear under Incoming Assets.
7. Press "Add to Project."

This demo mode uses localStorage, so both pages must be:
- on the same website origin,
- in the same browser,
- on the same device.

REAL CLOUD TEST — GOOGLE DRIVE
------------------------------
1. Create a Google Drive folder for assets.
2. Create a Google Sheet for metadata.
3. Open script.google.com and create a new Apps Script project.
4. Replace the default code with Code.gs.
5. Paste the Sheet ID and Drive folder ID into Code.gs.
6. Deploy as a Web App:
   - Execute as: Me
   - Access: Anyone with the link
7. Copy the web app URL.
8. Paste that URL into both HTML pages.
9. Send an image from Image Lab and load it in App Maker.

IMPORTANT
---------
This package proves the bridge. It is not yet merged into the full Image Lab
or full Bill's Blueprint/App Maker. Once the workflow is confirmed, the same
sender and receiver code can be inserted into the real apps.

NEXT INTEGRATION STEP
---------------------
- Add "Send to Universe" after background removal in Bill's Image Lab.
- Add Incoming / Universe Library tabs to Bill's Blueprint/App Maker.
- Store accepted asset IDs in project JSON.
- Add a shared endpoint setting so the Apps Script URL only needs to be entered once.
