# AIS / TIS / 26AS Reconciliation — Browser Tool

Version 1.3.1

Upload AIS + TIS + Form 26AS and download the reconciliation in the supplied Excel template. The tool runs locally in the browser and does not require a Claude/API key.

## Supported scope
The parser is designed to detect both business and individual information categories, including common TDS/TCS sections, salary, dividend, interest, securities transactions, GST turnover/purchases, and other relevant AIS/TIS categories. Unsupported/unclassified categories are surfaced as review items instead of being silently discarded.

## Safety rules
- AIS is the party/row base.
- AIS gross uses the AIS reporting-entity summary amount.
- AIS TDS/TCS uses active/current detail rows; inactive rows are excluded and noted.
- TIS uses Reported by Source where source detail can be isolated. If only the category-level value is safe to use because Processed by System equals Accepted by Taxpayer/Confirmed by Source, a visible fallback warning is generated.
- TIS category totals must reconcile to effective AIS totals before party-level TIS values are allocated.
- Duplicate SFT/TDS representations are retained in Reco but excluded from Summary/category totals when they are the same party, category and amount.
- 26AS reversals are netted at party + section level.
- The tool stops rather than truncating when the template row capacity is exceeded.
- A Start New Client button clears the current session.


### v1.4.0 changes
- Broader category coverage for business and individual cases.
- Better metadata extraction across AIS/TIS/26AS layouts.
- Improved 26AS summary-to-detail grouping using exact total matching.
- Inactive AIS TDS/TCS transactions are excluded from current reconciliation totals.
- SFT/TDS duplicate representations are excluded from Summary when they explain the TIS category total; source rows remain in Reco with a review note.
- Unsupported categories are surfaced as review exceptions instead of silently dropped.
- Start New Client reset remains available.
