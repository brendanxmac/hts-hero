# Headings missing a start date

These Chapter 99 headings were migrated from the legacy data with `effective: {}`, so the engine treats them as always in effect and the duty calculator can't show an "Effective …" date on their lines in the Duty estimate table.

To fix one, set `effective.from` on the heading's first record (the base record passed to `tariffVersions`, if it has changes) to the date the heading legally took effect, with the citation in `source`. Use the legal effective date, not the HTS revision that first listed it, and check that setting it doesn't drop the heading from calculations for earlier dates the tests rely on.

Generated Oct 2, 2026 (65 of 234 headings). Tick each one off as you go.

**First in HTS** is the earliest revision whose USITC Chapter 99 PDF (`https://hts.usitc.gov/reststop/file?release=<revision>&filename=Chapter 99`) contains the heading number, checked across every revision from 2025HTSBasic to 2026HTSRev20 on Oct 6, 2026. It's evidence of when the heading entered the HTS, not its legal effective date: take that from the heading text, the notice or proclamation. Every heading here appears in every revision after its first, and none first appears after 2026HTSRev5, so the missing `from` doesn't change results for any verified revision. Date each heading while backfilling the revision before its "First in HTS" (HowTariffsWork.md §17.13). "2025HTSBasic" means it was already in force when 2025 began.

| Done | Heading | Name | Program | File | First in HTS |
|---|---|---|---|---|---|
| [ ] | 9903.94.01 | Section 232 Automobiles | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev6 |
| [ ] | 9903.94.33 | Automobile parts of the United Kingdom that will be used in Automobiles of the United Kingdom | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev26 |
| [ ] | 9903.94.40 | Vehicles & Light Trucks of Japan, Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev23 |
| [ ] | 9903.94.41 | Vehicles & Light Trucks of Japan, Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev23 |
| [ ] | 9903.94.42 | Parts of Vehicles & Light Trucks of Japan, Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev23 |
| [ ] | 9903.94.43 | Parts of Vehicles & Light Trucks of Japan, Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev23 |
| [ ] | 9903.94.44 | Automobile parts of the European Union with Column 1 Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev26 |
| [ ] | 9903.94.45 | Automobile parts of the European Union with Column 1 Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev26 |
| [ ] | 9903.94.50 | Vehicles & Light Trucks of the European Union, Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev24 |
| [ ] | 9903.94.51 | Vehicles & Light Trucks of the European Union, Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev24 |
| [ ] | 9903.94.52 | Parts of Vehicles & Light Trucks of the European Union, Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev24 |
| [ ] | 9903.94.53 | Parts of Vehicles & Light Trucks of the European Union, Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev24 |
| [ ] | 9903.94.54 | Automobile parts of the Japan from 33(r), with Column 1 Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev26 |
| [ ] | 9903.94.55 | Automobile parts of Japan from 33(r), with Column 1 Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev26 |
| [ ] | 9903.94.60 | Vehicles & Light Trucks of South Korea, Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev32 |
| [ ] | 9903.94.61 | Vehicles & Light Trucks of South Korea, Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev32 |
| [ ] | 9903.94.62 | Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev32 |
| [ ] | 9903.94.63 | Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev32 |
| [ ] | 9903.94.64 | Parts of Vehicles & Light Trucks of South Korea from 33(r) & 33(t), with Column 1 Duty >=15% | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev32 |
| [ ] | 9903.94.65 | Parts of Vehicles & Light Trucks of South Korea from 33(r) & 33(t), with Column 1 Duty <15% (Replaces General Duty) | Section 232 – Autos & Auto Parts | [232-autos.ts](data/headings/232-autos.ts) | 2025HTSRev32 |
| [ ] | 9903.82.03 | Section 232 Metal Exemption: Aggregate 232 Metal weight is <15% of Article Weight | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2026HTSRev5 |
| [ ] | 9903.82.04 | 232 Metals of UK Origin (95%+ Smelted or Most Recently Cast or Poured in UK) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2026HTSRev5 |
| [ ] | 9903.82.10 | Section 232 Metal Articles, <15% Column 1 Ad Valorem Rate of Duty (Replaces General Duty) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2026HTSRev5 |
| [ ] | 9903.82.11 | Section 232 Metal Articles 15%+ Column 1 Ad Valorem Rate of Duty | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2026HTSRev5 |
| [ ] | 9903.82.12 | Section 232 Metal Articles from Non Normal-Trade Relation Countries listed in General Note 3(B) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2026HTSRev5 |
| [ ] | 9903.82.14 | Section 232 Metal Articles from Russia | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2026HTSRev5 |
| [ ] | 9903.82.17 | Section 232 Metal Articles from Russia | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2026HTSRev5 |
| [ ] | 9903.85.67 | Aluminum Smelted or Casted in Russia (Section 232) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2025HTSBasic |
| [ ] | 9903.85.68 | Derivative Aluminum Articles from Russia where Primary Aluminum is Smelted or Cast in Russia (Section 232) | Section 232 – Steel, Aluminum & Copper | [232-metals.ts](data/headings/232-metals.ts) | 2025HTSBasic |
| [ ] | 9903.74.01 | Medium & Heavy Duty Vehicles | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.02 | Buses & Similar Vehicles | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.03 | US Content Exemption: Pay 25% on ONLY the Non-US Content of Heavy Duty Vehicles that are USMCA Eligible & Approved by Secretary of Commerce | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.05 | Article is NOT a Medium or Heavy Duty Vehicle | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.06 | The US Content of an Article that Qualifies for 9903.74.03 | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.07 | Heavy Duty Vehicles, Buses, and Similar Vehicles that were Manufactured Over 25 Years Prior to Enrty | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.08 | Parts of Medium or Heavy Duty Vehicles | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.09 | Parts for Production or Repair of Medium & Heavy Duty Vehicles in the US | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.10 | USCMA Qualified Medium & Heavy Duty Vehicle Parts that are NOT knock-down kits or parts compilations, whether or not being imported by an importer who produces or repairs MHDV's | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.74.11 | Is not a part for medium of heavy duty vehicles | Section 232 – Medium & Heavy-Duty Vehicles and Buses | [232-mhdv.ts](data/headings/232-mhdv.ts) | 2025HTSRev26 |
| [ ] | 9903.79.01 | Semiconductor Articles Possibly Subject to Additional Tariffs | Section 232 – Semiconductors | [232-semiconductors.ts](data/headings/232-semiconductors.ts) | 2026HTSRev1 |
| [ ] | 9903.76.01 | Softwood & Timber Products | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) | 2025HTSRev25 |
| [ ] | 9903.76.04 | Is Not a Completed Kitchen Cabinets & Vanities or its parts) | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) | 2025HTSRev25 |
| [ ] | 9903.76.20 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from the United Kingdom | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) | 2025HTSRev25 |
| [ ] | 9903.76.21 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from Japan | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) | 2025HTSRev25 |
| [ ] | 9903.76.22 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from the European Union | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) | 2025HTSRev25 |
| [ ] | 9903.76.23 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from South Korea | Section 232 – Timber, Lumber & Wood Products | [232-wood.ts](data/headings/232-wood.ts) | 2025HTSRev32 |
| [ ] | 9903.88.01 | Articles the product of China from 20 (a) and (b) (Section 301) | Section 301 – China | [301-china.ts](data/headings/301-china.ts) | 2025HTSBasic |
| [ ] | 9903.88.02 | Articles the product of China from 20 (c) and (d) (Section 301) | Section 301 – China | [301-china.ts](data/headings/301-china.ts) | 2025HTSBasic |
| [ ] | 9903.88.03 | Articles of China from 20 (e) and (f) (Section 301) | Section 301 – China | [301-china.ts](data/headings/301-china.ts) | 2025HTSBasic |
| [ ] | 9903.88.04 | Articles of China from 20 (g) (Section 301) | Section 301 – China | [301-china.ts](data/headings/301-china.ts) | 2025HTSBasic |
| [ ] | 9903.88.15 | Articles of China from 20 (r) and (s) (Section 301) | Section 301 – China | [301-china.ts](data/headings/301-china.ts) | 2025HTSBasic |
| [ ] | 9903.92.10 | Ship-to-Shore Gantry Cranes of China Additional Tariff | Section 301 – China | [301-china.ts](data/headings/301-china.ts) | 2025HTSBasic |
| [ ] | 9903.02.19 | EU Trade Deal Tariff (General Duty >= 15%) | U.S.–EU Framework Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev18 |
| [ ] | 9903.02.20 | EU Trade Deal Tariff (Tops General Duty Up to 15%) | U.S.–EU Framework Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev18 |
| [ ] | 9903.02.72 | Japan Trade Deal Tariff (When General Duty >=15%) | U.S.–Japan Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev23 |
| [ ] | 9903.02.73 | Japan Trade Deal Tariff (Tops General Duty Up to 15%) | U.S.–Japan Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev23 |
| [ ] | 9903.02.74 | Articles of the European Union Exempt from Reciprocal Tariff listed in Ch.99, U.S. note 2(v)(xvi) | U.S.–EU Framework Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev24 |
| [ ] | 9903.02.75 | Essential Oils of the European Union Exempt from Reciprocal Tariff | U.S.–EU Framework Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev24 |
| [ ] | 9903.02.76 | Articles of Civil Aircraft of the European Union listed in Ch.99, U.S. note 2(v)(xviii) | U.S.–EU Framework Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev24 |
| [ ] | 9903.02.77 | Non-patented Articles for Use in Pharmaceutical Applications of the European Union listed in Ch.99, U.S. note 2(v)(xix) | U.S.–EU Framework Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev24 |
| [ ] | 9903.02.78 | Argicultural Products Exempt from Reciprocal Tariffs | U.S.–Korea Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev29 |
| [ ] | 9903.02.79 | South Korea Trade Deal Tariff (When General Duty >=15%) | U.S.–Korea Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev32 |
| [ ] | 9903.02.80 | South Korea Trade Deal Tariff (Tops General Duty Up to 15%) | U.S.–Korea Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev32 |
| [ ] | 9903.02.81 | Articles of Civil Aircraft of South Korea | U.S.–Korea Agreement | [deals.ts](data/headings/deals.ts) | 2025HTSRev32 |
| [ ] | 9903.96.02 | Articles of Civil Aircraft of Japan | Civil Aircraft Agreements (UK, Japan) | [deals.ts](data/headings/deals.ts) | 2025HTSRev23 |
