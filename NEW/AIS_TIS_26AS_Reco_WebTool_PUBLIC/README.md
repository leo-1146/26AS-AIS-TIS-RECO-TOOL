# AIS / TIS / 26AS Reconciliation — Browser Tool

**One URL → upload AIS + TIS + 26AS → download your Excel reconciliation.**

## What it does

- Requires exactly three PDFs: AIS, TIS and Form 26AS.
- Uses AIS as the base party list.
- Creates one Reco row for each AIS reporting party + information code/section.
- Uses TIS **Reported by Source**.
- Reconciles 26AS after netting genuine reversal entries.
- Uses the supplied Excel template and keeps the `Reco`, `Summary` and `Masters` sheets and their formulas/formatting.
- Leaves Books columns blank for manual entry.
- Stops instead of truncating data if more than the template's 54 Reco rows are detected.
- Flags material differences in the Reco `Action` / `Remarks` columns.
- No Claude/API key is required.

## Use it without installing anything

The folder is a static website. Put `index.html`, `app.js` and `template.xlsx` in the same web location.

### Easiest: GitHub Pages

1. Create a GitHub repository.
2. Upload the three files in this folder.
3. Open **Settings → Pages**.
4. Set **Deploy from a branch → main → /(root)**.
5. Open the URL GitHub gives you.

Anyone can then use the URL in Chrome/Edge/Firefox. Nothing is installed on their computer.

## Privacy model

The PDFs are processed in the user's browser. The page does not send the uploaded AIS/TIS/26AS files to Claude or another reconciliation API. The only network requests are loading the static template and the public JavaScript libraries used by the page.

## Template

`template.xlsx` is the supplied reconciliation workbook. Do not rename it; the page loads it by that exact filename.

## Important

The supplied template has a fixed 54-row Reco area. The tool deliberately stops rather than silently dropping rows when a future AIS contains more than 54 base rows. In that case, the template should be expanded before the tool is used for that client.
