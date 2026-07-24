# Data Source Matrix

| Domain | Frequency | Official source | Endpoint / process | Unit | Earliest verified | Notes |
|---|---|---|---|---|---|---|
| Red-feather chicken | daily | MOA Open Data | `/api/v1/PoultryTransType_RedFeather` | TWD / 600g | 2014-04-01 | 500-row practical cap; query by `Start_time` and `End_time` |
| Black-feather chicken | daily | MOA Open Data | `/api/v1/PoultryTransType_BlackFeather` | TWD / 600g | 2014-04-01 | Southern housed male/female |
| Broiler / eggs | daily | MOA Open Data | `/api/v1/PoultryTransType_BoiledChicken_Eggs` | TWD / 600g | 2010-10-07 | Endpoint spelling is official; includes Kaohsiung/Pingtung store price and egg prices |
| Poultry daily cross-check | daily | National Animal Industry Foundation | public daily poultry table | TWD / 600g | source-dependent | Used for validation, not scraped as an unreviewed canonical feed |
| Commercial chicks | weekly/monthly | NAIF reports / approved industry source | raw snapshot -> candidate parse -> human approval | source-defined | unverified | Never publish OCR output automatically |

For every ingestion retain raw payload, SHA-256, parser version, validation status, normalized record, source publication time and fetch time. Missing/closed-market values remain missing. `$top` and `$skip` are not documented for these MOA feeds; use date ranges and narrow chunks.

