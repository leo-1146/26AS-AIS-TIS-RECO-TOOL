# AIS / TIS / 26AS Reconciliation — Browser Tool v1.2.0

**One URL → upload AIS + TIS + 26AS → download the reconciliation in the supplied Excel template.**

## v1.2.0 changes
- Added AIS **194Q → 94Q - Purchases** support.
- Added AIS **194R → 94R - Benefits / Perquisites** support.
- Added the 94R head to the Summary/Masters template.
- TIS **Business receipts** is reconciled as one category across 194C + 194H + 194Q + 194R. When the category total agrees with AIS, the TIS amount is allocated to each AIS party using its AIS amount. When it does not agree, TIS party allocation is withheld and the rows are marked Review.
- Difference formulas now distinguish **zero from blank / N/A**; a real zero-versus-nonzero difference is not suppressed.
- Added **Start New Client** reset button.
- Client name / AY / FY are populated from the uploaded documents; old client data is not retained in the clean template.

## Use
Put `index.html`, `app.js`, and `template.xlsx` in the same web location. GitHub Pages works well:

1. Upload the three files to the repository root.
2. GitHub **Settings → Pages**.
3. **Deploy from a branch → main → /(root)**.
4. Open the generated Pages URL.

No installation is required on the user's computer.

## Inputs
Exactly three PDFs:
- AIS
- TIS
- Form 26AS

Books figures remain blank for manual entry in the supplied template.

## Privacy model
PDF processing is performed in the browser. No Claude/API key is required. The page loads public JavaScript libraries and the local `template.xlsx` file.

## Important
The supplied Reco area has 54 detail rows. The tool stops instead of silently truncating a client with more than 54 AIS base rows.
