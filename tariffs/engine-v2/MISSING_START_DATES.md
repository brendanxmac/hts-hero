# Headings missing a start date

These Chapter 99 headings were migrated from the legacy data with `effective: {}`, so the engine treats them as always in effect and the duty calculator can't show an "Effective …" date on their lines in the Duty estimate table.

To fix one, set `effective.from` on the heading's first record (the base record passed to `tariffVersions`, if it has changes) to the date the heading legally took effect, with the citation in `source`. Use the legal effective date, not the HTS revision that first listed it, and check that setting it doesn't drop the heading from calculations for earlier dates the tests rely on.

Generated Oct 2, 2026 (65 of 234 headings). Tick each one off as you go.

| Done | Heading | Name | Program | File |
|---|---|---|---|---|
| [ ] | 9903.94.01 | Section 232 Autos: Passenger Vehicles and Light Trucks | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.33 | Section 232 Auto Parts: Parts of the United Kingdom for United Kingdom Vehicles | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.40 | Section 232 Autos: Vehicles of Japan (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.41 | Section 232 Autos: Vehicles of Japan (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.42 | Section 232 Auto Parts: Parts of Japan (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.43 | Section 232 Auto Parts: Parts of Japan (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.44 | Section 232 Auto Parts: Parts of the European Union for United States Production or Repair (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.45 | Section 232 Auto Parts: Parts of the European Union for United States Production or Repair (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.50 | Section 232 Autos: Vehicles of the European Union (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.51 | Section 232 Autos: Vehicles of the European Union (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.52 | Section 232 Auto Parts: Parts of the European Union (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.53 | Section 232 Auto Parts: Parts of the European Union (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.54 | Section 232 Auto Parts: Parts of Japan for United States Production or Repair (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.55 | Section 232 Auto Parts: Parts of Japan for United States Production or Repair (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.60 | Section 232 Autos: Vehicles of South Korea (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.61 | Section 232 Autos: Vehicles of South Korea (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.62 | Section 232 Auto Parts: Parts of South Korea (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.63 | Section 232 Auto Parts: Parts of South Korea (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.64 | Section 232 Auto Parts: Parts of South Korea for United States Production or Repair (Base Duty 15% or More) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.94.65 | Section 232 Auto Parts: Parts of South Korea for United States Production or Repair (15% Including Base Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) |
| [ ] | 9903.82.03 | Section 232 Metals Exemption: Metal Under 15% of the Article's Weight | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.82.04 | Section 232 Metals: Articles of the United Kingdom (95%+ Smelted, Cast or Poured in the United Kingdom) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.82.10 | Section 232 Metals: Machinery & Equipment (15% Including Base Duty) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.82.11 | Section 232 Metals: Machinery & Equipment (Base Duty 15% or More) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.82.12 | Section 232 Metals: Machinery & Equipment of Belarus, Cuba, North Korea or Russia | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.82.14 | Section 232 Metals: Steel, Copper and Listed Derivatives of Russia | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.82.17 | Section 232 Metals: Machinery & Equipment of Russia | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.85.67 | Section 232 Aluminum: Russian Aluminum (Smelted or Cast in Russia) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.85.68 | Section 232 Aluminum: Derivatives Made With Russian Aluminum | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) |
| [ ] | 9903.74.01 | Section 232 Trucks & Buses: Medium- and Heavy-Duty Vehicles | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.02 | Section 232 Trucks & Buses: Buses | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.03 | Section 232 Trucks & Buses: Foreign Content of USMCA Vehicles (Commerce Approved) | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.05 | Section 232 Trucks & Buses Exemption: Not a Medium- or Heavy-Duty Vehicle | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.06 | Section 232 Trucks & Buses Exemption: Approved United States Content | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.07 | Section 232 Trucks & Buses Exemption: Vehicles at Least 25 Years Old | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.08 | Section 232 Trucks & Buses: Parts | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.09 | Section 232 Trucks & Buses: Parts for Production or Repair in the United States | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.10 | Section 232 Trucks & Buses Exemption: USMCA Parts | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.74.11 | Section 232 Trucks & Buses Exemption: Not a Medium- or Heavy-Duty Vehicle Part | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) |
| [ ] | 9903.79.01 | Section 232 Semiconductors: Certain Advanced Computing Chips | Section 232 – Semiconductors | [232-semiconductors.ts](data/headings/232-semiconductors.ts) |
| [ ] | 9903.76.01 | Section 232 Wood: Softwood Timber and Lumber | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) |
| [ ] | 9903.76.04 | Section 232 Wood Exemption: Not a Kitchen Cabinet, Vanity or Part | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) |
| [ ] | 9903.76.20 | Section 232 Wood: Furniture, Cabinets and Vanities of the United Kingdom | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) |
| [ ] | 9903.76.21 | Section 232 Wood: Furniture, Cabinets and Vanities of Japan (15% Including Base Duty) | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) |
| [ ] | 9903.76.22 | Section 232 Wood: Furniture, Cabinets and Vanities of the European Union (15% Including Base Duty) | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) |
| [ ] | 9903.76.23 | Section 232 Wood: Furniture, Cabinets and Vanities of South Korea (15% Including Base Duty) | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) |
| [ ] | 9903.88.01 | Section 301 China: List 1 | Section 301 – China | [301-china.ts](data/headings/301-china.ts) |
| [ ] | 9903.88.02 | Section 301 China: List 2 | Section 301 – China | [301-china.ts](data/headings/301-china.ts) |
| [ ] | 9903.88.03 | Section 301 China: List 3 | Section 301 – China | [301-china.ts](data/headings/301-china.ts) |
| [ ] | 9903.88.04 | Section 301 China: List 3 (Other Products) | Section 301 – China | [301-china.ts](data/headings/301-china.ts) |
| [ ] | 9903.88.15 | Section 301 China: List 4A | Section 301 – China | [301-china.ts](data/headings/301-china.ts) |
| [ ] | 9903.92.10 | Section 301 China: Ship-to-Shore Gantry Cranes | Section 301 – China | [301-china.ts](data/headings/301-china.ts) |
| [ ] | 9903.02.19 | European Union Deal Tariff (Base Duty 15% or More) | United States–European Union Framework Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.20 | European Union Deal Tariff (15% Including Base Duty) | United States–European Union Framework Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.72 | Japan Deal Tariff (Base Duty 15% or More) | United States–Japan Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.73 | Japan Deal Tariff (15% Including Base Duty) | United States–Japan Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.74 | European Union Deal Exemption: Listed Products | United States–European Union Framework Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.75 | European Union Deal Exemption: Essential Oils | United States–European Union Framework Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.76 | European Union Deal Exemption: Civil Aircraft | United States–European Union Framework Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.77 | European Union Deal Exemption: Non-Patented Pharmaceutical Articles | United States–European Union Framework Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.78 | IEEPA Reciprocal Exemption: Listed Agricultural Products | IEEPA – Reciprocal Tariffs | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.79 | South Korea Deal Tariff (Base Duty 15% or More) | United States–South Korea Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.80 | South Korea Deal Tariff (15% Including Base Duty) | United States–South Korea Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.02.81 | South Korea Deal Exemption: Civil Aircraft | United States–South Korea Agreement | [deals.ts](data/headings/deals.ts) |
| [ ] | 9903.96.02 | Articles of Civil Aircraft of Japan | Civil Aircraft Agreements (United Kingdom, European Union, Japan, South Korea, Taiwan) | [deals.ts](data/headings/deals.ts) |
