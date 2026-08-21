# AIS / TIS / 26AS Reconciliation — Browser Tool

Version 1.6.1 — Enterprise UI refinement

Upload AIS + TIS + Form 26AS and download the reconciliation in the supplied Excel template. The tool runs locally in the browser and does not require a Claude/API key.

## Supported scope
The parser is designed for both business and individual clients. It covers common TDS/TCS sections, salary, dividend, multiple interest categories, securities transactions, GST turnover/purchases, vehicle purchases, and other AIS/TIS categories. Unsupported/unclassified information codes are surfaced as review items instead of being silently discarded.

## v1.5.2 reliability changes
- Reworked 26AS matching around the **summary table**. The 26AS summary Gross / TDS / TCS totals are treated as authoritative for a deductor/collector when PDF transaction-detail pagination does not provide a clean exact block.
- Preserves TAN-aware matching first, then party + section matching.
- Handles the common 26AS PDF layout where summary rows and transaction details appear offset by one block.
- Detail-block variance/orphan diagnostics no longer turn into false reconciliation failures when the summary itself is usable.
- TIS category fallback is informational when Processed by System equals Accepted by Taxpayer / Confirmed by Source; it does not create a false Review action.
- Duplicate SFT/TDS representations remain excluded from Summary only when the duplicate explanation is supported by the category total; the underlying Reco row is retained for audit trail.
- The workbook is never truncated when the template row capacity is exceeded.
- Start New Client clears the current browser session.

## Safety rules
- AIS is the party/row base.
- AIS gross uses the AIS reporting-entity summary amount.
- AIS TDS/TCS uses active/current detail rows; inactive rows are excluded and noted.
- TIS uses Reported by Source where source detail can be isolated. If only the category-level value is safe because Processed by System equals Accepted by Taxpayer / Confirmed by Source, that fallback is retained as an informational validation note.
- TIS category totals must reconcile to effective AIS totals before party-level TIS values are allocated.
- 26AS reversals/cancellations are netted at party + section level where transaction detail is available.
- When detail pagination prevents an exact section block but the party has a unique TAN/summary match, the 26AS summary Gross and TDS/TCS totals are used rather than fabricating a detail value.
- The tool stops rather than truncating when the template row capacity is exceeded.

## Deployment
Keep `index.html`, `app.js`, and `template.xlsx` together in the GitHub Pages root. Replacing `template.xlsx` changes the workbook template used for future clients.


## v1.5.2 validation hardening
- Cross-document PAN, Financial Year and Assessment Year validation.
- Validates AY = FY + 1 relation.
- Client-name consistency validation hardened for PDF text-layout variants.
- Missing core metadata (PAN, name, FY, AY) stops generation instead of guessing.


## v1.5.6 final-test fixes
- Correctly parses 194I(b) rent rows and maps them to Rent received instead of Business receipts.
- Correctly parses 194IA(RV) and 194IA(R) property-detail TDS values and matches property Part-IV records in 26AS by seller PAN.
- Preserves both property representations in Reco while excluding the duplicate representation from Summary.
- Adds SFT-004(P) Cash Deposits and SFT-004(R) Cash Withdrawals mappings.
- Handles AIS layouts where the TAN appears inside the source field but is not separately delimited; TAN-aware 26AS matching is retained.
- Preserves the v1.5.5 regression behaviour for Kankanii, Asta Laxmi and Donty while adding the new Chukka Koteswara Rao regression.
- Fixes Financial Year / Assessment Year pair extraction for text-only PDF layouts.

## v1.6.1 hardening
- stricter top-level TIS category segmentation so annexure rows cannot bleed between categories
- robust handling of 194I(b), 194IA(RV/R), SFT-004(P/R), LRS and related property/cash/remittance categories
- wrapped AIS GST summary-row handling for EXC-GSTR1(P)/EXC-GSTR3B layouts
- TAN-aware 26AS matching with direct Part-IV property matching
- FY/AY/PAN/name validation remains mandatory before Excel generation
- genuine AIS/TIS source discrepancies remain Review items rather than being silently forced to No Action
- no Claude/API key or server dependency


## Enterprise UI refinement
- Refined presentation for client/firm use with structured workflow, upload cards, status panel, security/local-processing callout and responsive layout.
- Reconciliation engine and workbook structure are unchanged by the UI layer.
