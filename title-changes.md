# Tariff title changes

284 title changes on the Duty Breakdown and Possible Adjustments, each with its reason, plus 6 program names. Only the title text changed: codes, rates, dates and amounts didn't (all 358 tests pass unchanged).

## Conventions

- Every title starts with its program ("Section 232 Autos:", "Section 301 China:"), and exemptions say "Exemption:" ("Exclusion:" for USTR's Section 301 exclusions).
- Lines for one country's goods say "of" or "from" ("Parts of Japan", "Steel of the United Kingdom").
- Country names are spelled out (United Kingdom, European Union, United States). Agreement and agency acronyms people know by name stay (USMCA, CAFTA-DR, IEEPA, USTR).
- No note citations such as "20 (e) and (f)" or "16(c)(vi)–(viii)"; the line's legal text still shows them.
- No rates, since the Rate column shows them. Thresholds that define the line stay ("Base Duty 15% or More", "With 85%+ Metal From the United States").
- Caps say "(15% Including Base Duty)", and the paired line says "(Base Duty 15% or More)".
- Dates stay only when they're a condition you have to check ("Loaded Before Feb 24", "Admitted to a Foreign Trade Zone Before June 4, 2025").

## Reason key

| Key | Meaning |
|---|---|
| CITE | Replaced a legal note citation most users can't read; the citation still shows in the line's legal text |
| RATE | Dropped the rate: the Rate column already shows it, and the title would go stale when the rate changes across dates (as it will when we backfill 2025) |
| TOPUP | The line doesn't replace the base duty; it adds whatever brings the total to the cap. Now says "Including Base Duty" (or "Base Duty … or More" for the paired line), using the calculator's own term "Base duty" |
| PREFIX | Didn't name its tariff program, or named it differently from the program's other lines |
| TYPO | Typo or grammar |
| DATE | Had the tariff's own start date in the title; dates show separately (HowTariffsWork.md: no dates in names) |
| SAME | "Specific" and "Particular" mean the same thing in plain English; the note distinguishes products listed by HTS code from products described in words |
| PLAIN | Plainer wording |
| OF | Says "of" or "from" so it's clear the line is for goods of that country |
| ABBR | Spelled out an abbreviation (United Kingdom, European Union, United States, electric vehicle, Homeland Security, most-favored-nation) |
| WRONG | The old title said something the tariff doesn't do (explained on the row) |

## The 12 that were wrong

| Code | Old title | New title | What was wrong |
|---|---|---|---|
| 9903.03.02 | 122 Exemption: Articles Loaded Prior to Feb 24, or Entered for Consumption Before Feb 28 | Section 122 Exemption: Loaded Before Feb 24, Entered Before Feb 28 | Said "or": the exemption needs both (loaded before Feb 24 and entered before Feb 28) |
| 9903.03.09 | 122 Exemption: Articles of Apparel Entered via CAFTA-DR | Section 122 Exemption: Textiles or Apparel Entered via CAFTA-DR | Said apparel only; the heading also covers textiles |
| 9903.94.44 | Automobile parts of the European Union with Column 1 Duty >=15% | Section 232 Auto Parts: Parts of the European Union for United States Production or Repair (Base Duty 15% or More) | Didn't say these are the parts certified for U.S. production or repair (33(r)), so it read the same as 9903.94.52 |
| 9903.94.45 | Automobile parts of the European Union with Column 1 Duty <15% (Replaces General Duty) | Section 232 Auto Parts: Parts of the European Union for United States Production or Repair (15% Including Base Duty) | Didn't say these are the parts certified for U.S. production or repair (33(r)), so it read the same as 9903.94.53 |
| 9903.82.03 | Section 232 Metal Exemption: Aggregate 232 Metal weight is <15% of Article Weight | Section 232 Metals Exemption: Metal Under 15% of the Article's Weight | Said "aggregate" metal weight; note 16(c) counts the weight of the applicable metal |
| 9903.82.05 | Section 232 Metal Articles of UK Origin (95%+ Smelted or Most Recently Cast or Poured in UK) | Section 232 Metals: Lower-Rate Derivatives of the United Kingdom (95%+ Smelted, Cast or Poured in the United Kingdom) | Read the same as 9903.82.04; this one is for the derivative articles of 16(c)(vi)–(vii) |
| 9903.82.14 | Section 232 Metal Articles from Russia | Section 232 Metals: Steel, Copper and Listed Derivatives of Russia | Three Russia headings had the same title; this one is 16(c)(iii)–(v) |
| 9903.82.16 | Section 232 Metal Articles from Russia | Section 232 Metals: Other Derivative Articles of Russia (Lower Rate) | Three Russia headings had the same title; this one is 16(c)(vii)–(viii) |
| 9903.82.17 | Section 232 Metal Articles from Russia | Section 232 Metals: Machinery & Equipment of Russia | Three Russia headings had the same title; this one is 16(c)(x) |
| 9903.74.03 | US Content Exemption: Pay 25% on ONLY the Non-US Content of Heavy Duty Vehicles that are USMCA Eligible & Approved by Secretary of Commerce | Section 232 Trucks & Buses: Foreign Content of USMCA Vehicles (Commerce Approved) | Was labeled an exemption, but this heading charges the duty on the non-U.S. content (9903.74.06 exempts the U.S. content) |
| 9903.74.07 | Heavy Duty Vehicles, Buses, and Similar Vehicles that were Manufactured Over 25 Years Prior to Enrty | Section 232 Trucks & Buses Exemption: Vehicles at Least 25 Years Old | Said "over 25 years"; note 38(g) says at least 25 years |
| 9903.79.01 | Semiconductor Articles Possibly Subject to Additional Tariffs | Section 232 Semiconductors: Certain Advanced Computing Chips | "Possibly subject" reads as uncertain; the heading applies to logic chips meeting note 39(b)'s performance thresholds |

## Program names

Shown under each line in the Full view.

| Old | New | Why |
|---|---|---|
| Civil Aircraft Agreements (UK, EU, Japan, Korea) | Civil Aircraft Agreements (United Kingdom, European Union, Japan, South Korea, Taiwan) | ABBR, **WRONG:** left out Taiwan, whose heading 9903.96.03 is in this program |
| U.S.–EU Framework Agreement | United States–European Union Framework Agreement | ABBR |
| U.S.–Japan Agreement | United States–Japan Agreement | ABBR |
| U.S.–Korea Agreement | United States–South Korea Agreement | ABBR |
| U.S.–Switzerland Agreement | United States–Switzerland Agreement | ABBR |
| U.S.–Liechtenstein Agreement | United States–Liechtenstein Agreement | ABBR |

## IEEPA (before Feb 24, 2026)

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.01.01 | IEEPA Mexico (25%) | IEEPA Mexico: Fentanyl and Migration Tariff | RATE, PLAIN |
| 9903.01.05 | IEEPA Mexico: Potash (10%) | IEEPA Mexico: Potash | RATE |
| 9903.01.10 | IEEPA Canada (35%) | IEEPA Canada: Fentanyl Tariff | RATE, PLAIN |
| 9903.01.13 | IEEPA Canada: Energy and Critical Minerals (10%) | IEEPA Canada: Energy and Critical Minerals | RATE |
| 9903.01.15 | IEEPA Canada: Potash (10%) | IEEPA Canada: Potash | RATE |
| 9903.01.16 | IEEPA Canada: Transshipped Goods (40%) | IEEPA Canada: Transshipped Goods | RATE |
| 9903.01.24 | IEEPA China and Hong Kong (10%) | IEEPA China and Hong Kong: Fentanyl Tariff | RATE, PLAIN |
| 9903.01.25 | IEEPA Reciprocal Tariff (10%) | IEEPA Reciprocal Tariff: Baseline (Countries Without Their Own Rate) | RATE, PLAIN |
| 9903.01.29 | IEEPA Reciprocal Exemption: Column 2 Countries | IEEPA Reciprocal Exemption: Belarus, Cuba, North Korea and Russia | PLAIN |
| 9903.01.32 | IEEPA Reciprocal Exemption: Annex II Articles | IEEPA Reciprocal Exemption: Listed Products (Annex II) | PLAIN |
| 9903.01.34 | IEEPA Reciprocal Exemption: U.S. Content of 20% or More | IEEPA Reciprocal Exemption: United States Content of 20% or More | ABBR |
| 9903.01.77 | IEEPA Brazil (40%) | IEEPA Brazil Tariff | RATE |
| 9903.02.01 | IEEPA Reciprocal: Transshipped Goods (40%) | IEEPA Reciprocal Tariff: Transshipped Goods | RATE |
| 9903.02.02 | IEEPA Reciprocal Tariff: Afghanistan (15%) | IEEPA Reciprocal Tariff: Afghanistan | RATE |
| 9903.02.03 | IEEPA Reciprocal Tariff: Algeria (30%) | IEEPA Reciprocal Tariff: Algeria | RATE |
| 9903.02.04 | IEEPA Reciprocal Tariff: Angola (15%) | IEEPA Reciprocal Tariff: Angola | RATE |
| 9903.02.05 | IEEPA Reciprocal Tariff: Bangladesh (20%) | IEEPA Reciprocal Tariff: Bangladesh | RATE |
| 9903.02.06 | IEEPA Reciprocal Tariff: Bolivia (15%) | IEEPA Reciprocal Tariff: Bolivia | RATE |
| 9903.02.07 | IEEPA Reciprocal Tariff: Bosnia and Herzegovina (30%) | IEEPA Reciprocal Tariff: Bosnia and Herzegovina | RATE |
| 9903.02.08 | IEEPA Reciprocal Tariff: Botswana (15%) | IEEPA Reciprocal Tariff: Botswana | RATE |
| 9903.02.09 | IEEPA Reciprocal Tariff: Brazil (10%) | IEEPA Reciprocal Tariff: Brazil | RATE |
| 9903.02.10 | IEEPA Reciprocal Tariff: Brunei (25%) | IEEPA Reciprocal Tariff: Brunei | RATE |
| 9903.02.11 | IEEPA Reciprocal Tariff: Cambodia (19%) | IEEPA Reciprocal Tariff: Cambodia | RATE |
| 9903.02.12 | IEEPA Reciprocal Tariff: Cameroon (15%) | IEEPA Reciprocal Tariff: Cameroon | RATE |
| 9903.02.13 | IEEPA Reciprocal Tariff: Chad (15%) | IEEPA Reciprocal Tariff: Chad | RATE |
| 9903.02.14 | IEEPA Reciprocal Tariff: Costa Rica (15%) | IEEPA Reciprocal Tariff: Costa Rica | RATE |
| 9903.02.15 | IEEPA Reciprocal Tariff: Côte d'Ivoire (15%) | IEEPA Reciprocal Tariff: Côte d'Ivoire | RATE |
| 9903.02.16 | IEEPA Reciprocal Tariff: Democratic Republic of the Congo (15%) | IEEPA Reciprocal Tariff: Democratic Republic of the Congo | RATE |
| 9903.02.17 | IEEPA Reciprocal Tariff: Ecuador (15%) | IEEPA Reciprocal Tariff: Ecuador | RATE |
| 9903.02.18 | IEEPA Reciprocal Tariff: Equatorial Guinea (15%) | IEEPA Reciprocal Tariff: Equatorial Guinea | RATE |
| 9903.02.21 | IEEPA Reciprocal Tariff: Falkland Islands (10%) | IEEPA Reciprocal Tariff: Falkland Islands | RATE |
| 9903.02.22 | IEEPA Reciprocal Tariff: Fiji (15%) | IEEPA Reciprocal Tariff: Fiji | RATE |
| 9903.02.23 | IEEPA Reciprocal Tariff: Ghana (15%) | IEEPA Reciprocal Tariff: Ghana | RATE |
| 9903.02.24 | IEEPA Reciprocal Tariff: Guyana (15%) | IEEPA Reciprocal Tariff: Guyana | RATE |
| 9903.02.25 | IEEPA Reciprocal Tariff: Iceland (15%) | IEEPA Reciprocal Tariff: Iceland | RATE |
| 9903.02.26 | IEEPA Reciprocal Tariff: India (25%) | IEEPA Reciprocal Tariff: India | RATE |
| 9903.02.27 | IEEPA Reciprocal Tariff: Indonesia (19%) | IEEPA Reciprocal Tariff: Indonesia | RATE |
| 9903.02.28 | IEEPA Reciprocal Tariff: Iraq (35%) | IEEPA Reciprocal Tariff: Iraq | RATE |
| 9903.02.29 | IEEPA Reciprocal Tariff: Israel (15%) | IEEPA Reciprocal Tariff: Israel | RATE |
| 9903.02.31 | IEEPA Reciprocal Tariff: Jordan (15%) | IEEPA Reciprocal Tariff: Jordan | RATE |
| 9903.02.32 | IEEPA Reciprocal Tariff: Kazakhstan (25%) | IEEPA Reciprocal Tariff: Kazakhstan | RATE |
| 9903.02.33 | IEEPA Reciprocal Tariff: Laos (40%) | IEEPA Reciprocal Tariff: Laos | RATE |
| 9903.02.34 | IEEPA Reciprocal Tariff: Lesotho (15%) | IEEPA Reciprocal Tariff: Lesotho | RATE |
| 9903.02.35 | IEEPA Reciprocal Tariff: Libya (30%) | IEEPA Reciprocal Tariff: Libya | RATE |
| 9903.02.37 | IEEPA Reciprocal Tariff: Madagascar (15%) | IEEPA Reciprocal Tariff: Madagascar | RATE |
| 9903.02.38 | IEEPA Reciprocal Tariff: Malawi (15%) | IEEPA Reciprocal Tariff: Malawi | RATE |
| 9903.02.39 | IEEPA Reciprocal Tariff: Malaysia (19%) | IEEPA Reciprocal Tariff: Malaysia | RATE |
| 9903.02.40 | IEEPA Reciprocal Tariff: Mauritius (15%) | IEEPA Reciprocal Tariff: Mauritius | RATE |
| 9903.02.41 | IEEPA Reciprocal Tariff: Moldova (25%) | IEEPA Reciprocal Tariff: Moldova | RATE |
| 9903.02.42 | IEEPA Reciprocal Tariff: Mozambique (15%) | IEEPA Reciprocal Tariff: Mozambique | RATE |
| 9903.02.43 | IEEPA Reciprocal Tariff: Myanmar (Burma) (40%) | IEEPA Reciprocal Tariff: Myanmar (Burma) | RATE |
| 9903.02.44 | IEEPA Reciprocal Tariff: Namibia (15%) | IEEPA Reciprocal Tariff: Namibia | RATE |
| 9903.02.45 | IEEPA Reciprocal Tariff: Nauru (15%) | IEEPA Reciprocal Tariff: Nauru | RATE |
| 9903.02.46 | IEEPA Reciprocal Tariff: New Zealand (15%) | IEEPA Reciprocal Tariff: New Zealand | RATE |
| 9903.02.47 | IEEPA Reciprocal Tariff: Nicaragua (18%) | IEEPA Reciprocal Tariff: Nicaragua | RATE |
| 9903.02.48 | IEEPA Reciprocal Tariff: Nigeria (15%) | IEEPA Reciprocal Tariff: Nigeria | RATE |
| 9903.02.49 | IEEPA Reciprocal Tariff: North Macedonia (15%) | IEEPA Reciprocal Tariff: North Macedonia | RATE |
| 9903.02.50 | IEEPA Reciprocal Tariff: Norway (15%) | IEEPA Reciprocal Tariff: Norway | RATE |
| 9903.02.51 | IEEPA Reciprocal Tariff: Pakistan (19%) | IEEPA Reciprocal Tariff: Pakistan | RATE |
| 9903.02.52 | IEEPA Reciprocal Tariff: Papua New Guinea (15%) | IEEPA Reciprocal Tariff: Papua New Guinea | RATE |
| 9903.02.53 | IEEPA Reciprocal Tariff: the Philippines (19%) | IEEPA Reciprocal Tariff: the Philippines | RATE |
| 9903.02.54 | IEEPA Reciprocal Tariff: Serbia (35%) | IEEPA Reciprocal Tariff: Serbia | RATE |
| 9903.02.55 | IEEPA Reciprocal Tariff: South Africa (30%) | IEEPA Reciprocal Tariff: South Africa | RATE |
| 9903.02.57 | IEEPA Reciprocal Tariff: Sri Lanka (20%) | IEEPA Reciprocal Tariff: Sri Lanka | RATE |
| 9903.02.59 | IEEPA Reciprocal Tariff: Syria (41%) | IEEPA Reciprocal Tariff: Syria | RATE |
| 9903.02.60 | IEEPA Reciprocal Tariff: Taiwan (20%) | IEEPA Reciprocal Tariff: Taiwan | RATE |
| 9903.02.61 | IEEPA Reciprocal Tariff: Thailand (19%) | IEEPA Reciprocal Tariff: Thailand | RATE |
| 9903.02.62 | IEEPA Reciprocal Tariff: Trinidad and Tobago (15%) | IEEPA Reciprocal Tariff: Trinidad and Tobago | RATE |
| 9903.02.63 | IEEPA Reciprocal Tariff: Tunisia (25%) | IEEPA Reciprocal Tariff: Tunisia | RATE |
| 9903.02.64 | IEEPA Reciprocal Tariff: Turkey (15%) | IEEPA Reciprocal Tariff: Turkey | RATE |
| 9903.02.65 | IEEPA Reciprocal Tariff: Uganda (15%) | IEEPA Reciprocal Tariff: Uganda | RATE |
| 9903.02.66 | IEEPA Reciprocal Tariff: the United Kingdom (10%) | IEEPA Reciprocal Tariff: the United Kingdom | RATE |
| 9903.02.67 | IEEPA Reciprocal Tariff: Vanuatu (15%) | IEEPA Reciprocal Tariff: Vanuatu | RATE |
| 9903.02.68 | IEEPA Reciprocal Tariff: Venezuela (15%) | IEEPA Reciprocal Tariff: Venezuela | RATE |
| 9903.02.69 | IEEPA Reciprocal Tariff: Vietnam (20%) | IEEPA Reciprocal Tariff: Vietnam | RATE |
| 9903.02.70 | IEEPA Reciprocal Tariff: Zambia (15%) | IEEPA Reciprocal Tariff: Zambia | RATE |
| 9903.02.71 | IEEPA Reciprocal Tariff: Zimbabwe (15%) | IEEPA Reciprocal Tariff: Zimbabwe | RATE |
| 9903.02.82 | Switzerland Trade Deal Tariff (When General Duty >=15%) | Switzerland Deal Tariff (Base Duty 15% or More) | TOPUP |
| 9903.02.83 | Switzerland Trade Deal Tariff (Tops General Duty Up to 15%) | Switzerland Deal Tariff (15% Including Base Duty) | TOPUP |
| 9903.02.87 | Liechtenstein Trade Deal Tariff (When General Duty >=15%) | Liechtenstein Deal Tariff (Base Duty 15% or More) | TOPUP |
| 9903.02.88 | Liechtenstein Trade Deal Tariff (Tops General Duty Up to 15%) | Liechtenstein Deal Tariff (15% Including Base Duty) | TOPUP |

## Quotas

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.54.02 | Additional Quota: Lean Beef Trimmings (Sep 1 – Nov 30, 2026) | Additional Quota: Lean Beef Trimmings | DATE |

## Section 122

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.03.02 | 122 Exemption: Articles Loaded Prior to Feb 24, or Entered for Consumption Before Feb 28 | Section 122 Exemption: Loaded Before Feb 24, Entered Before Feb 28 | PREFIX, **WRONG:** Said "or": the exemption needs both (loaded before Feb 24 and entered before Feb 28) |
| 9903.03.03 | 122 Exemption: Specific Articles | Section 122 Exemption: Listed Products | PREFIX, PLAIN |
| 9903.03.04 | 122 Exemption: Agricultural Products | Section 122 Exemption: Agricultural Products | PREFIX |
| 9903.03.05 | 122 Exemption: Civil Aircraft Article | Section 122 Exemption: Civil Aircraft Articles | PREFIX, TYPO |
| 9903.03.06 | 122 Exemption: Section 232 Articles | Section 122 Exemption: Section 232 Articles | PREFIX |
| 9903.03.07 | 122 Exemption: Articles of Canada Entered via USMCA | Section 122 Exemption: Articles of Canada Entered via USMCA | PREFIX |
| 9903.03.08 | 122 Exemption: Articles of Mexico Entered via USMCA | Section 122 Exemption: Articles of Mexico Entered via USMCA | PREFIX |
| 9903.03.09 | 122 Exemption: Articles of Apparel Entered via CAFTA-DR | Section 122 Exemption: Textiles or Apparel Entered via CAFTA-DR | PREFIX, **WRONG:** Said apparel only; the heading also covers textiles |
| 9903.03.10 | 122 Exemption: Donation | Section 122 Exemption: Donations | PREFIX, TYPO |
| 9903.03.11 | 122 Exemption: Information Material | Section 122 Exemption: Informational Materials | PREFIX, TYPO |

## Section 232 autos

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.94.01 | Section 232 Automobiles | Section 232 Autos: Passenger Vehicles and Light Trucks | PLAIN |
| 9903.94.02 | The U.S Content of Articles of Ch.99, III, 33(b) OR non passenger vehicles / light trucks of those headings | Section 232 Autos Exemption: Not a Passenger Vehicle or Light Truck, or Approved United States Content | PREFIX, CITE, TYPO, ABBR |
| 9903.94.03 | Tariff On Only The Non-US Content of Passenger Vehicles / Light Trucks If Approved by Secretary of Commerce | Section 232 Autos: Foreign Content of USMCA Vehicles (Commerce Approved) | PREFIX, PLAIN, ABBR |
| 9903.94.04 | Manufactured at least 25 Years Prior to Date of Entry | Section 232 Autos Exemption: Vehicles at Least 25 Years Old | PREFIX |
| 9903.94.06 | Is not an auto part for passenger vehicles or light trucks, or is an auto part that is USCMA Eligible other than knock-down kits or parts compilations | Section 232 Auto Parts Exemption: USMCA Parts, or Not a Vehicle Part | PREFIX, TYPO, PLAIN |
| 9903.94.07 | Parts for Production or Repair of Automobiles in the US | Section 232 Auto Parts: For Vehicle Production or Repair in the United States | PREFIX, ABBR |
| 9903.94.31 | Passenger Vehicles from the United Kingdom | Section 232 Autos: Passenger Vehicles of the United Kingdom | PREFIX |
| 9903.94.32 | Parts of Vehicles & Light Trucks of the United Kingdom | Section 232 Auto Parts: Parts of the United Kingdom | PREFIX, OF |
| 9903.94.33 | Automobile parts of the United Kingdom that will be used in Automobiles of the United Kingdom | Section 232 Auto Parts: Parts of the United Kingdom for United Kingdom Vehicles | PREFIX, OF, ABBR |
| 9903.94.40 | Vehicles & Light Trucks of Japan, Duty >=15% | Section 232 Autos: Vehicles of Japan (Base Duty 15% or More) | PREFIX, TOPUP, OF |
| 9903.94.41 | Vehicles & Light Trucks of Japan, Duty <15% (Replaces General Duty) | Section 232 Autos: Vehicles of Japan (15% Including Base Duty) | PREFIX, TOPUP, OF |
| 9903.94.42 | Parts of Vehicles & Light Trucks of Japan, Duty >=15% | Section 232 Auto Parts: Parts of Japan (Base Duty 15% or More) | PREFIX, TOPUP, OF |
| 9903.94.43 | Parts of Vehicles & Light Trucks of Japan, Duty <15% (Replaces General Duty) | Section 232 Auto Parts: Parts of Japan (15% Including Base Duty) | PREFIX, TOPUP, OF |
| 9903.94.44 | Automobile parts of the European Union with Column 1 Duty >=15% | Section 232 Auto Parts: Parts of the European Union for United States Production or Repair (Base Duty 15% or More) | PREFIX, TOPUP, **WRONG:** Didn't say these are the parts certified for U.S. production or repair (33(r)), so it read the same as 9903.94.52, OF, ABBR |
| 9903.94.45 | Automobile parts of the European Union with Column 1 Duty <15% (Replaces General Duty) | Section 232 Auto Parts: Parts of the European Union for United States Production or Repair (15% Including Base Duty) | PREFIX, TOPUP, **WRONG:** Didn't say these are the parts certified for U.S. production or repair (33(r)), so it read the same as 9903.94.53, OF, ABBR |
| 9903.94.50 | Vehicles & Light Trucks of the European Union, Duty >=15% | Section 232 Autos: Vehicles of the European Union (Base Duty 15% or More) | PREFIX, TOPUP, OF |
| 9903.94.51 | Vehicles & Light Trucks of the European Union, Duty <15% (Replaces General Duty) | Section 232 Autos: Vehicles of the European Union (15% Including Base Duty) | PREFIX, TOPUP, OF |
| 9903.94.52 | Parts of Vehicles & Light Trucks of the European Union, Duty >=15% | Section 232 Auto Parts: Parts of the European Union (Base Duty 15% or More) | PREFIX, TOPUP, OF |
| 9903.94.53 | Parts of Vehicles & Light Trucks of the European Union, Duty <15% (Replaces General Duty) | Section 232 Auto Parts: Parts of the European Union (15% Including Base Duty) | PREFIX, TOPUP, OF |
| 9903.94.54 | Automobile parts of the Japan from 33(r), with Column 1 Duty >=15% | Section 232 Auto Parts: Parts of Japan for United States Production or Repair (Base Duty 15% or More) | PREFIX, TYPO, CITE, TOPUP, OF, ABBR |
| 9903.94.55 | Automobile parts of Japan from 33(r), with Column 1 Duty <15% (Replaces General Duty) | Section 232 Auto Parts: Parts of Japan for United States Production or Repair (15% Including Base Duty) | PREFIX, CITE, TOPUP, OF, ABBR |
| 9903.94.60 | Vehicles & Light Trucks of South Korea, Duty >=15% | Section 232 Autos: Vehicles of South Korea (Base Duty 15% or More) | PREFIX, TOPUP, OF |
| 9903.94.61 | Vehicles & Light Trucks of South Korea, Duty <15% (Replaces General Duty) | Section 232 Autos: Vehicles of South Korea (15% Including Base Duty) | PREFIX, TOPUP, OF |
| 9903.94.62 | Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty >=15% | Section 232 Auto Parts: Parts of South Korea (Base Duty 15% or More) | PREFIX, CITE, TOPUP, OF |
| 9903.94.63 | Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty <15% (Replaces General Duty) | Section 232 Auto Parts: Parts of South Korea (15% Including Base Duty) | PREFIX, CITE, TOPUP, OF |
| 9903.94.64 | Parts of Vehicles & Light Trucks of South Korea from 33(r) & 33(t), with Column 1 Duty >=15% | Section 232 Auto Parts: Parts of South Korea for United States Production or Repair (Base Duty 15% or More) | PREFIX, CITE, TOPUP, OF, ABBR |
| 9903.94.65 | Parts of Vehicles & Light Trucks of South Korea from 33(r) & 33(t), with Column 1 Duty <15% (Replaces General Duty) | Section 232 Auto Parts: Parts of South Korea for United States Production or Repair (15% Including Base Duty) | PREFIX, CITE, TOPUP, OF, ABBR |
| 9903.94.66 | Parts of Vehicles & Light Trucks of Taiwan (33(g) & 33(u)), Duty >=15% | Section 232 Auto Parts: Parts of Taiwan (Base Duty 15% or More) | PREFIX, CITE, TOPUP, OF |
| 9903.94.67 | Parts of Vehicles & Light Trucks of Taiwan (33(g) & 33(u)), Duty <15% (Topped Up to 15%) | Section 232 Auto Parts: Parts of Taiwan (15% Including Base Duty) | PREFIX, CITE, TOPUP, OF |
| 9903.94.68 | Parts of Vehicles & Light Trucks of Taiwan from 33(r) & 33(u), with Column 1 Duty >=15% | Section 232 Auto Parts: Parts of Taiwan for United States Production or Repair (Base Duty 15% or More) | PREFIX, CITE, TOPUP, OF, ABBR |
| 9903.94.69 | Parts of Vehicles & Light Trucks of Taiwan from 33(r) & 33(u), with Column 1 Duty <15% (Topped Up to 15%) | Section 232 Auto Parts: Parts of Taiwan for United States Production or Repair (15% Including Base Duty) | PREFIX, CITE, TOPUP, OF, ABBR |

## Section 232 drones

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.08.20 | Section 232 UAS: Not for Use With Unmanned Aircraft | Section 232 Drones Exemption: Not for Use With Drones | PLAIN |
| 9903.08.21 | Section 232 – Unmanned Aircraft, Parts and Components (100%) | Section 232 Drones: Drones, Parts and Components | PLAIN, RATE |
| 9903.08.22 | Section 232 – Unmanned Aircraft Without Thermal Imaging (25%) | Section 232 Drones: Drones Without Thermal Imaging | PLAIN, RATE |
| 9903.08.23 | Section 232 UAS: United Kingdom (Critical Components From the U.S. or Allies) | Section 232 Drones: Drones of the United Kingdom (Critical Components From the United States or Allies) | PLAIN, OF, ABBR |
| 9903.08.24 | Section 232 UAS: Japan, Liechtenstein, South Korea, Switzerland, Taiwan, EU (15% Total) | Section 232 Drones: Drones of Japan, South Korea, Taiwan, Switzerland, Liechtenstein or the European Union (15% Including Base Duty) | PLAIN, TOPUP, OF, ABBR |
| 9903.08.25 | Section 232 UAS: Onshoring Plan Approved by DHS or the Department of War | Section 232 Drones Exemption: Onshoring Plan Approved by Homeland Security or the Department of War | PLAIN, ABBR |
| 9903.08.26 | Section 232 UAS: Onshoring Plan Approved by the Secretary of Commerce | Section 232 Drones Exemption: Onshoring Plan Approved by Commerce | PLAIN |

## Section 232 metals (from Apr 6, 2026)

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.82.01 | Section 232 Metal Exemption: Article Contains No Aluminum, Steel, or Copper | Section 232 Metals Exemption: Contains No Steel, Aluminum or Copper | PREFIX, PLAIN |
| 9903.82.03 | Section 232 Metal Exemption: Aggregate 232 Metal weight is <15% of Article Weight | Section 232 Metals Exemption: Metal Under 15% of the Article's Weight | PLAIN, **WRONG:** Said "aggregate" metal weight; note 16(c) counts the weight of the applicable metal |
| 9903.82.04 | 232 Metals of UK Origin (95%+ Smelted or Most Recently Cast or Poured in UK) | Section 232 Metals: Articles of the United Kingdom (95%+ Smelted, Cast or Poured in the United Kingdom) | PREFIX, PLAIN, OF, ABBR |
| 9903.82.05 | Section 232 Metal Articles of UK Origin (95%+ Smelted or Most Recently Cast or Poured in UK) | Section 232 Metals: Lower-Rate Derivatives of the United Kingdom (95%+ Smelted, Cast or Poured in the United Kingdom) | PLAIN, **WRONG:** Read the same as 9903.82.04; this one is for the derivative articles of 16(c)(vi)–(vii), OF, ABBR |
| 9903.82.06 | Section 232 Metal Articles 95% smelted, cast, or poured in the US | Section 232 Metals: Metal 95%+ Smelted, Cast or Poured in the United States | PLAIN, ABBR |
| 9903.82.06 | Section 232 Metal Articles 85% smelted, cast, or poured in the US | Section 232 Metals: Metal 85%+ Smelted, Cast or Poured in the United States | PLAIN, ABBR |
| 9903.82.07 | Section 232 Metal Articles, with metals over 95% smelted, cast, or poured in the US, and <10% Column 1 Ad Valorem Rate of Duty (Replaces General Duty) | Section 232 Metals: Machinery & Equipment With 95%+ Metal From the United States (10% Including Base Duty) | TOPUP, CITE, PLAIN, ABBR |
| 9903.82.07 | Section 232 Metal Articles, with metals 85%+ smelted, cast, or poured in the US, and <10% Column 1 Ad Valorem Rate of Duty (Replaces General Duty) | Section 232 Metals: Machinery & Equipment With 85%+ Metal From the United States (10% Including Base Duty) | TOPUP, CITE, PLAIN, ABBR |
| 9903.82.08 | Section 232 Metal Articles, with metals 95%+ smelted, cast, or poured in the US, and 10%+ Column 1 Ad Valorem Rate of Duty | Section 232 Metals: Machinery & Equipment With 95%+ Metal From the United States (Base Duty 10% or More) | TOPUP, PLAIN, ABBR |
| 9903.82.08 | Section 232 Metal Articles, with metals 85%+ smelted, cast, or poured in the US, and 10%+ Column 1 Ad Valorem Rate of Duty | Section 232 Metals: Machinery & Equipment With 85%+ Metal From the United States (Base Duty 10% or More) | TOPUP, PLAIN, ABBR |
| 9903.82.09 | Section 232 Metal Articles provided for in 16(c)(vi)–(viii) | Section 232 Metals: Other Derivative Articles (Lower Rate) | CITE |
| 9903.82.10 | Section 232 Metal Articles, <15% Column 1 Ad Valorem Rate of Duty (Replaces General Duty) | Section 232 Metals: Machinery & Equipment (15% Including Base Duty) | TOPUP, PLAIN |
| 9903.82.11 | Section 232 Metal Articles 15%+ Column 1 Ad Valorem Rate of Duty | Section 232 Metals: Machinery & Equipment (Base Duty 15% or More) | TOPUP, PLAIN |
| 9903.82.12 | Section 232 Metal Articles from Non Normal-Trade Relation Countries listed in General Note 3(B) | Section 232 Metals: Machinery & Equipment of Belarus, Cuba, North Korea or Russia | CITE, PLAIN |
| 9903.82.13 | Section 232 Metal Exemption: Parts for Manufacture of Motorcycles in the US | Section 232 Metals Exemption: Motorcycle Parts for Manufacturing in the United States | PREFIX, PLAIN, ABBR |
| 9903.82.14 | Section 232 Metal Articles from Russia | Section 232 Metals: Steel, Copper and Listed Derivatives of Russia | **WRONG:** Three Russia headings had the same title; this one is 16(c)(iii)–(v), OF |
| 9903.82.15 | Section 232 Metal Articles from Russia, 95%+ smelted, cast, or poured in the US | Section 232 Metals: Articles of Russia With 95%+ Metal Smelted, Cast or Poured in the United States | PLAIN, OF, ABBR |
| 9903.82.15 | Section 232 Metal Articles from Russia, 85%+ smelted, cast, or poured in the US | Section 232 Metals: Articles of Russia With 85%+ Metal Smelted, Cast or Poured in the United States | PLAIN, OF, ABBR |
| 9903.82.16 | Section 232 Metal Articles from Russia | Section 232 Metals: Other Derivative Articles of Russia (Lower Rate) | **WRONG:** Three Russia headings had the same title; this one is 16(c)(vii)–(viii), OF |
| 9903.82.17 | Section 232 Metal Articles from Russia | Section 232 Metals: Machinery & Equipment of Russia | **WRONG:** Three Russia headings had the same title; this one is 16(c)(x), OF |
| 9903.82.20 | Section 232 Mobile Industrial Equipment (16(c)(xi)) under USMCA: Non-U.S. Content and U.S. Content Above 40% | Section 232 Metals: Mobile Industrial Equipment Under USMCA – Foreign Content and United States Content Above 40% | CITE, ABBR |
| 9903.82.21 | Section 232 Mobile Industrial Equipment (16(c)(xi)) under USMCA: U.S. Content up to 40% (No Duty) | Section 232 Metals Exemption: Mobile Industrial Equipment Under USMCA – United States Content up to 40% | CITE, PLAIN, ABBR |
| 9903.82.22 | Section 232 Mobile Industrial Equipment (16(c)(xi)) of Partner Countries: 15% Including Base Duty | Section 232 Metals: Mobile Industrial Equipment of Partner Countries (15% Including Base Duty) | CITE, TOPUP |
| 9903.82.23 | Parts for Agricultural/Industrial Equipment (16(k)), 85%+ U.S.-Melted Metal, <10% Column 1 Rate (Topped Up to 10%) | Section 232 Metals: Farm & Industrial Equipment Parts With 85%+ Metal From the United States (10% Including Base Duty) | PREFIX, CITE, TOPUP, ABBR |
| 9903.82.24 | Parts for Agricultural/Industrial Equipment (16(k)), 85%+ U.S.-Melted Metal, 10%+ Column 1 Rate | Section 232 Metals: Farm & Industrial Equipment Parts With 85%+ Metal From the United States (Base Duty 10% or More) | PREFIX, CITE, TOPUP, ABBR |
| 9903.82.25 | Parts for Agricultural/Industrial Equipment (16(k)), <15% Column 1 Rate (Topped Up to 15%) | Section 232 Metals: Farm & Industrial Equipment Parts (15% Including Base Duty) | PREFIX, CITE, TOPUP |
| 9903.82.26 | Parts for Agricultural/Industrial Equipment (16(k)), 15%+ Column 1 Rate | Section 232 Metals: Farm & Industrial Equipment Parts (Base Duty 15% or More) | PREFIX, CITE, TOPUP |
| 9903.85.67 | Aluminum Smelted or Casted in Russia (Section 232) | Section 232 Aluminum: Russian Aluminum (Smelted or Cast in Russia) | PREFIX, TYPO |
| 9903.85.68 | Derivative Aluminum Articles from Russia where Primary Aluminum is Smelted or Cast in Russia (Section 232) | Section 232 Aluminum: Derivatives Made With Russian Aluminum | PREFIX, PLAIN |

## Section 232 pharmaceuticals

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.04.60 | Section 232 – Patented Pharmaceuticals | Section 232 Pharmaceuticals: Patented Pharmaceuticals | PLAIN |
| 9903.04.61 | Section 232 Pharmaceuticals: Companies Identified by the Secretary (Before Sep 29, 2026) | Section 232 Pharmaceuticals: Companies Identified by Commerce | DATE |
| 9903.04.62 | Section 232 Pharmaceuticals: Japan, EU, South Korea, Switzerland, Liechtenstein (15% Total) | Section 232 Pharmaceuticals: Products of the European Union, Japan, South Korea, Switzerland or Liechtenstein (15% Including Base Duty) | TOPUP, OF, ABBR |
| 9903.04.63 | Section 232 Pharmaceuticals: United Kingdom | Section 232 Pharmaceuticals: Products of the United Kingdom | OF |
| 9903.04.65 | Section 232 Pharmaceuticals: Onshoring Plan and MFN Pricing Agreement | Section 232 Pharmaceuticals: Onshoring Plan and Most-Favored-Nation Pricing Agreement | ABBR |
| 9903.04.68 | Section 232 Pharmaceuticals: U.S. Active Ingredient in Dosage Form | Section 232 Pharmaceuticals: Active Ingredient From the United States in Dosage Form | ABBR |

## Section 232 semiconductors

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.79.01 | Semiconductor Articles Possibly Subject to Additional Tariffs | Section 232 Semiconductors: Certain Advanced Computing Chips | PREFIX, **WRONG:** "Possibly subject" reads as uncertain; the heading applies to logic chips meeting note 39(b)'s performance thresholds |

## Section 232 steel, aluminum and copper (before Apr 6, 2026)

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.78.01 | Section 232 Copper (50% of Copper Content) | Section 232 Copper: Copper Content | RATE |
| 9903.78.02 | Section 232 Copper: Non-Copper Content (No Additional Duty) | Section 232 Copper Exemption: Non-Copper Content | PLAIN |
| 9903.81.87 | Section 232 Steel (50%) | Section 232 Steel | RATE |
| 9903.81.88 | Section 232 Steel (50%), FTZ Privileged Foreign Status Before June 4, 2025 | Section 232 Steel: Admitted to a Foreign Trade Zone Before June 4, 2025 | RATE, PLAIN |
| 9903.81.89 | Section 232 Steel Derivatives, Note 16(l) (50%) | Section 232 Steel: Nails, Tacks and Vehicle Stampings | RATE, CITE |
| 9903.81.90 | Section 232 Steel Derivatives, Note 16(m) (50%) | Section 232 Steel: Derivative Articles of Iron or Steel | RATE, CITE |
| 9903.81.91 | Section 232 Steel Derivatives, Note 16(n) (50% of Steel Content) | Section 232 Steel: Other Derivative Products (Steel Content Only) | RATE, CITE |
| 9903.81.92 | Section 232 Steel Derivatives Processed Abroad from U.S.-Melted Steel (No Additional Duty) | Section 232 Steel Exemption: Derivatives Made Abroad From Steel Melted in the United States | PLAIN, ABBR |
| 9903.81.93 | Section 232 Steel Derivatives (50%), FTZ Privileged Foreign Status Before June 4, 2025 | Section 232 Steel: Derivatives Admitted to a Foreign Trade Zone Before June 4, 2025 | RATE, PLAIN |
| 9903.81.94 | Section 232 Steel of the United Kingdom (25%) | Section 232 Steel: Steel of the United Kingdom | RATE, OF |
| 9903.81.95 | Section 232 Steel of the United Kingdom (25%), FTZ Privileged Foreign Status Before June 4, 2025 | Section 232 Steel: Steel of the United Kingdom, Admitted to a Foreign Trade Zone Before June 4, 2025 | RATE, PLAIN, OF |
| 9903.81.96 | Section 232 Steel Derivatives of the United Kingdom, Note 16(s) (25%) | Section 232 Steel: Nails, Tacks and Vehicle Stampings of the United Kingdom | RATE, CITE, OF |
| 9903.81.97 | Section 232 Steel Derivatives of the United Kingdom, Note 16(t) (25%) | Section 232 Steel: Derivative Iron or Steel Articles of the United Kingdom | RATE, CITE, OF |
| 9903.81.98 | Section 232 Steel Derivatives of the United Kingdom, Note 16(u) (25% of Steel Content) | Section 232 Steel: Other Derivative Products of the United Kingdom (Steel Content Only) | RATE, CITE, OF |
| 9903.81.99 | Section 232 Steel Derivatives of the United Kingdom (25%), FTZ Privileged Foreign Status Before June 4, 2025 | Section 232 Steel: Derivatives of the United Kingdom Admitted to a Foreign Trade Zone Before June 4, 2025 | RATE, PLAIN, OF |
| 9903.85.02 | Section 232 Aluminum (50%) | Section 232 Aluminum | RATE |
| 9903.85.04 | Section 232 Aluminum Derivatives, Note 19(i) (50%) | Section 232 Aluminum: Stranded Wire and Vehicle Stampings | RATE, CITE |
| 9903.85.07 | Section 232 Aluminum Derivatives, Note 19(j) (50%) | Section 232 Aluminum: Derivative Articles of Aluminum | RATE, CITE |
| 9903.85.08 | Section 232 Aluminum Derivatives, Note 19(k) (50% of Aluminum Content) | Section 232 Aluminum: Other Derivative Products (Aluminum Content Only) | RATE, CITE |
| 9903.85.09 | Section 232 Aluminum Derivatives Processed Abroad from U.S.-Smelted Aluminum (No Additional Duty) | Section 232 Aluminum Exemption: Derivatives Made Abroad From Aluminum Smelted in the United States | PLAIN, ABBR |
| 9903.85.12 | Section 232 Aluminum of the United Kingdom (25%) | Section 232 Aluminum: Aluminum of the United Kingdom | RATE, OF |
| 9903.85.13 | Section 232 Aluminum Derivatives of the United Kingdom, Note 19(q) (25%) | Section 232 Aluminum: Stranded Wire and Vehicle Stampings of the United Kingdom | RATE, CITE, OF |
| 9903.85.14 | Section 232 Aluminum Derivatives of the United Kingdom, Note 19(r) (25%) | Section 232 Aluminum: Derivative Aluminum Articles of the United Kingdom | RATE, CITE, OF |
| 9903.85.15 | Section 232 Aluminum Derivatives of the United Kingdom, Note 19(s) (25% of Aluminum Content) | Section 232 Aluminum: Other Derivative Products of the United Kingdom (Aluminum Content Only) | RATE, CITE, OF |
| 9903.85.69 | Aluminum Smelted or Cast in Russia (200%), FTZ Privileged Foreign Status Before April 10, 2023 | Section 232 Aluminum: Russian Aluminum Admitted to a Foreign Trade Zone Before April 10, 2023 | PREFIX, RATE |
| 9903.85.70 | Derivative Aluminum Smelted or Cast in Russia (200%), FTZ Privileged Foreign Status Before April 10, 2023 | Section 232 Aluminum: Russian Aluminum Derivatives Admitted to a Foreign Trade Zone Before April 10, 2023 | PREFIX, RATE |

## Section 232 trucks and buses

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.74.01 | Medium & Heavy Duty Vehicles | Section 232 Trucks & Buses: Medium- and Heavy-Duty Vehicles | PREFIX |
| 9903.74.02 | Buses & Similar Vehicles | Section 232 Trucks & Buses: Buses | PREFIX |
| 9903.74.03 | US Content Exemption: Pay 25% on ONLY the Non-US Content of Heavy Duty Vehicles that are USMCA Eligible & Approved by Secretary of Commerce | Section 232 Trucks & Buses: Foreign Content of USMCA Vehicles (Commerce Approved) | PLAIN, **WRONG:** Was labeled an exemption, but this heading charges the duty on the non-U.S. content (9903.74.06 exempts the U.S. content), ABBR |
| 9903.74.05 | Article is NOT a Medium or Heavy Duty Vehicle | Section 232 Trucks & Buses Exemption: Not a Medium- or Heavy-Duty Vehicle | PREFIX |
| 9903.74.06 | The US Content of an Article that Qualifies for 9903.74.03 | Section 232 Trucks & Buses Exemption: Approved United States Content | PREFIX, PLAIN, ABBR |
| 9903.74.07 | Heavy Duty Vehicles, Buses, and Similar Vehicles that were Manufactured Over 25 Years Prior to Enrty | Section 232 Trucks & Buses Exemption: Vehicles at Least 25 Years Old | PREFIX, TYPO, **WRONG:** Said "over 25 years"; note 38(g) says at least 25 years |
| 9903.74.08 | Parts of Medium or Heavy Duty Vehicles | Section 232 Trucks & Buses: Parts | PREFIX |
| 9903.74.09 | Parts for Production or Repair of Medium & Heavy Duty Vehicles in the US | Section 232 Trucks & Buses: Parts for Production or Repair in the United States | PREFIX, ABBR |
| 9903.74.10 | USCMA Qualified Medium & Heavy Duty Vehicle Parts that are NOT knock-down kits or parts compilations, whether or not being imported by an importer who produces or repairs MHDV's | Section 232 Trucks & Buses Exemption: USMCA Parts | PREFIX, TYPO, PLAIN |
| 9903.74.11 | Is not a part for medium of heavy duty vehicles | Section 232 Trucks & Buses Exemption: Not a Medium- or Heavy-Duty Vehicle Part | PREFIX, TYPO |

## Section 232 wood

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.76.01 | Softwood & Timber Products | Section 232 Wood: Softwood Timber and Lumber | PREFIX |
| 9903.76.02 | Upholstered Wooden Furniture Products | Section 232 Wood: Upholstered Wooden Furniture | PREFIX |
| 9903.76.03 | Completed Kitchen Cabinets & Vanities (and parts thereof) | Section 232 Wood: Kitchen Cabinets and Vanities (and Parts) | PREFIX |
| 9903.76.04 | Is Not a Completed Kitchen Cabinets & Vanities or its parts) | Section 232 Wood Exemption: Not a Kitchen Cabinet, Vanity or Part | PREFIX, TYPO |
| 9903.76.20 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from the United Kingdom | Section 232 Wood: Furniture, Cabinets and Vanities of the United Kingdom | PREFIX, PLAIN, OF |
| 9903.76.21 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from Japan | Section 232 Wood: Furniture, Cabinets and Vanities of Japan (15% Including Base Duty) | PREFIX, PLAIN, TOPUP, OF |
| 9903.76.22 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from the European Union | Section 232 Wood: Furniture, Cabinets and Vanities of the European Union (15% Including Base Duty) | PREFIX, PLAIN, TOPUP, OF, ABBR |
| 9903.76.23 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from South Korea | Section 232 Wood: Furniture, Cabinets and Vanities of South Korea (15% Including Base Duty) | PREFIX, PLAIN, TOPUP, OF |
| 9903.76.24 | Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from Taiwan | Section 232 Wood: Furniture, Cabinets and Vanities of Taiwan (15% Including Base Duty) | PREFIX, PLAIN, TOPUP, OF |

## Section 301 Brazil

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.05.03 | Section 301 Brazil Exemption: Specific Articles | Section 301 Brazil Exemption: Listed Products | SAME |
| 9903.05.04 | Section 301 Brazil Exemption: Particular Articles | Section 301 Brazil Exemption: Described Products | SAME |
| 9903.05.08 | Section 301 Brazil Exemption: Donation | Section 301 Brazil Exemption: Donations | TYPO |
| 9903.05.09 | Section 301 Brazil Exemption: Information Material | Section 301 Brazil Exemption: Informational Materials | TYPO |

## Section 301 China

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.88.01 | Articles the product of China from 20 (a) and (b) (Section 301) | Section 301 China: List 1 | CITE |
| 9903.88.02 | Articles the product of China from 20 (c) and (d) (Section 301) | Section 301 China: List 2 | CITE |
| 9903.88.03 | Articles of China from 20 (e) and (f) (Section 301) | Section 301 China: List 3 | CITE |
| 9903.88.04 | Articles of China from 20 (g) (Section 301) | Section 301 China: List 3 (Other Products) | CITE |
| 9903.88.15 | Articles of China from 20 (r) and (s) (Section 301) | Section 301 China: List 4A | CITE |
| 9903.88.69 | Section 301 Exclusion Granted by USTR (U.S. Note 20(vvv)) | Section 301 China Exclusion: USTR Product Exclusions | CITE |
| 9903.88.70 | Section 301 Exclusion Granted by USTR (U.S. Note 20(www)) | Section 301 China Exclusion: Solar Manufacturing Equipment | CITE |
| 9903.91.01 | Entries from China in 31(b) after Sept.27, 2024 | Section 301 China: Steel, Aluminum, Critical Minerals and Electric Vehicle Batteries | CITE, DATE, ABBR |
| 9903.91.02 | Articles of China from 31(c) after Sept.27, 2024 | Section 301 China: Solar Cells | CITE, DATE |
| 9903.91.03 | Articles of China from 31(d) after Sept.27, 2024 | Section 301 China: Electric Vehicles, Syringes and Needles | CITE, DATE |
| 9903.91.04 | Articles of China from 31(e) | Section 301 China: Face Masks | CITE |
| 9903.91.05 | Articles of China from 31(f) | Section 301 China: Semiconductors, Polysilicon and Wafers | CITE |
| 9903.91.06 | Articles of China from 31(g) | Section 301 China: Lithium-Ion Batteries, Natural Graphite and Permanent Magnets | CITE |
| 9903.91.07 | Articles of China from 31(h) | Section 301 China: Face Masks | CITE |
| 9903.91.08 | Articles of China from 31(i) | Section 301 China: Medical Gloves | CITE |
| 9903.91.11 | Articles of China from 31(j) | Section 301 China: Tungsten Products | CITE |
| 9903.92.09 | Ship-to-Shore Gantry Cranes of China Exeception | Section 301 China Exemption: Ship-to-Shore Cranes Under Contracts Signed Before May 14, 2024 | PREFIX, TYPO, PLAIN |
| 9903.92.10 | Ship-to-Shore Gantry Cranes of China Additional Tariff | Section 301 China: Ship-to-Shore Gantry Cranes | PREFIX |

## Section 301 forced labor

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.05.38 | Section 301 Forced Labor – the European Union (General Duty ≥10%) | Section 301 Forced Labor – the European Union (Base Duty 10% or More) | TOPUP |
| 9903.05.39 | Section 301 Forced Labor – the European Union (Tops General Duty Up to 10%) | Section 301 Forced Labor – the European Union (10% Including Base Duty) | TOPUP |
| 9903.05.48 | Section 301 Forced Labor – Japan (General Duty ≥12.5%) | Section 301 Forced Labor – Japan (Base Duty 12.5% or More) | TOPUP |
| 9903.05.49 | Section 301 Forced Labor – Japan (Tops General Duty Up to 12.5%) | Section 301 Forced Labor – Japan (12.5% Including Base Duty) | TOPUP |
| 9903.05.70 | Section 301 Forced Labor – South Korea (General Duty ≥12.5%) | Section 301 Forced Labor – South Korea (Base Duty 12.5% or More) | TOPUP |
| 9903.05.71 | Section 301 Forced Labor – South Korea (Tops General Duty Up to 12.5%) | Section 301 Forced Labor – South Korea (12.5% Including Base Duty) | TOPUP |
| 9903.05.73 | Section 301 Forced Labor – Switzerland (General Duty ≥12.5%) | Section 301 Forced Labor – Switzerland (Base Duty 12.5% or More) | TOPUP |
| 9903.05.74 | Section 301 Forced Labor – Switzerland (Tops General Duty Up to 12.5%) | Section 301 Forced Labor – Switzerland (12.5% Including Base Duty) | TOPUP |
| 9903.05.75 | Section 301 Forced Labor – Taiwan (General Duty ≥10%) | Section 301 Forced Labor – Taiwan (Base Duty 10% or More) | TOPUP |
| 9903.05.76 | Section 301 Forced Labor – Taiwan (Tops General Duty Up to 10%) | Section 301 Forced Labor – Taiwan (10% Including Base Duty) | TOPUP |
| 9903.05.86 | Section 301 Forced Labor Exemption: Specific Articles | Section 301 Forced Labor Exemption: Listed Products | SAME |
| 9903.05.87 | Section 301 Forced Labor Exemption: Particular Articles | Section 301 Forced Labor Exemption: Described Products | SAME |
| 9903.05.91 | Section 301 Forced Labor Exemption: Donation | Section 301 Forced Labor Exemption: Donations | TYPO |
| 9903.05.92 | Section 301 Forced Labor Exemption: Information Material | Section 301 Forced Labor Exemption: Informational Materials | TYPO |
| 9903.05.99 | Section 301 Forced Labor Exemption: Specific Articles of Malaysia | Section 301 Forced Labor Exemption: Listed Products of Malaysia | SAME |
| 9903.06.01 | Section 301 Forced Labor Exemption: Particular Articles of Malaysia | Section 301 Forced Labor Exemption: Described Products of Malaysia | SAME |
| 9903.06.02 | Section 301 Forced Labor Exemption: Specific Articles of Cambodia | Section 301 Forced Labor Exemption: Listed Products of Cambodia | SAME |
| 9903.06.03 | Section 301 Forced Labor Exemption: Particular Articles of Cambodia | Section 301 Forced Labor Exemption: Described Products of Cambodia | SAME |
| 9903.06.04 | Section 301 Forced Labor Exemption: Specific Articles of Guatemala | Section 301 Forced Labor Exemption: Listed Products of Guatemala | SAME |
| 9903.06.05 | Section 301 Forced Labor Exemption: Particular Articles of Guatemala | Section 301 Forced Labor Exemption: Described Products of Guatemala | SAME |
| 9903.06.07 | Section 301 Forced Labor Exemption: Specific Articles of El Salvador | Section 301 Forced Labor Exemption: Listed Products of El Salvador | SAME |
| 9903.06.08 | Section 301 Forced Labor Exemption: Particular Articles of El Salvador | Section 301 Forced Labor Exemption: Described Products of El Salvador | SAME |
| 9903.06.10 | Section 301 Forced Labor Exemption: Specific Articles of Argentina | Section 301 Forced Labor Exemption: Listed Products of Argentina | SAME |
| 9903.06.11 | Section 301 Forced Labor Exemption: Particular Articles of Argentina | Section 301 Forced Labor Exemption: Described Products of Argentina | SAME |
| 9903.06.12 | Section 301 Forced Labor Exemption: Specific Articles of Bangladesh | Section 301 Forced Labor Exemption: Listed Products of Bangladesh | SAME |
| 9903.06.13 | Section 301 Forced Labor Exemption: Particular Articles of Bangladesh | Section 301 Forced Labor Exemption: Described Products of Bangladesh | SAME |
| 9903.06.14 | Section 301 Forced Labor Exemption: Specific Articles of Taiwan | Section 301 Forced Labor Exemption: Listed Products of Taiwan | SAME |
| 9903.06.15 | Section 301 Forced Labor Exemption: Particular Articles of Taiwan | Section 301 Forced Labor Exemption: Described Products of Taiwan | SAME |
| 9903.06.16 | Section 301 Forced Labor Exemption: Specific Articles of Indonesia | Section 301 Forced Labor Exemption: Listed Products of Indonesia | SAME |
| 9903.06.17 | Section 301 Forced Labor Exemption: Particular Articles of Indonesia | Section 301 Forced Labor Exemption: Described Products of Indonesia | SAME |
| 9903.06.18 | Section 301 Forced Labor Exemption: Specific Articles of Ecuador | Section 301 Forced Labor Exemption: Listed Products of Ecuador | SAME |
| 9903.06.19 | Section 301 Forced Labor Exemption: Particular Articles of Ecuador | Section 301 Forced Labor Exemption: Described Products of Ecuador | SAME |
| 9903.06.20 | Section 301 Forced Labor Exemption: Specific Articles of Jordan | Section 301 Forced Labor Exemption: Listed Products of Jordan | SAME |
| 9903.06.21 | Section 301 Forced Labor Exemption: Particular Articles of Jordan | Section 301 Forced Labor Exemption: Described Products of Jordan | SAME |

## Section 338 Canada

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.03.12 | Section 338 – Canada (note 51(b)(1)) | Section 338 Canada: Alcohol, Cheese, Hides and Other Listed Products | CITE |
| 9903.03.13 | Section 338 – Canada (note 51(b)(2)) | Section 338 Canada: Dairy, Sugar and Other Listed Products | CITE |
| 9903.03.14 | Section 338 – Canada (note 51(b)(3)) | Section 338 Canada: Wood, Furniture, Machinery and Other Listed Products | CITE |

## Trade deals and civil aircraft

| Code | Old title | New title | Why |
|---|---|---|---|
| 9903.02.19 | EU Trade Deal Tariff (General Duty >= 15%) | European Union Deal Tariff (Base Duty 15% or More) | TOPUP, ABBR |
| 9903.02.20 | EU Trade Deal Tariff (Tops General Duty Up to 15%) | European Union Deal Tariff (15% Including Base Duty) | TOPUP, ABBR |
| 9903.02.72 | Japan Trade Deal Tariff (When General Duty >=15%) | Japan Deal Tariff (Base Duty 15% or More) | TOPUP |
| 9903.02.73 | Japan Trade Deal Tariff (Tops General Duty Up to 15%) | Japan Deal Tariff (15% Including Base Duty) | TOPUP |
| 9903.02.74 | Articles of the European Union Exempt from Reciprocal Tariff | European Union Deal Exemption: Listed Products | PREFIX, PLAIN, ABBR |
| 9903.02.75 | Essential Oils of the European Union Exempt from Reciprocal Tariff | European Union Deal Exemption: Essential Oils | PREFIX, ABBR |
| 9903.02.76 | Articles of Civil Aircraft of the European Union | European Union Deal Exemption: Civil Aircraft | PREFIX, ABBR |
| 9903.02.77 | Non-patented Articles for Use in Pharmaceutical Applications of the European Union | European Union Deal Exemption: Non-Patented Pharmaceutical Articles | PREFIX, ABBR |
| 9903.02.78 | Agricultural Articles Exempt from Reciprocal Tariffs (Any Country) | IEEPA Reciprocal Exemption: Listed Agricultural Products | PREFIX |
| 9903.02.79 | South Korea Trade Deal Tariff (When General Duty >=15%) | South Korea Deal Tariff (Base Duty 15% or More) | TOPUP |
| 9903.02.80 | South Korea Trade Deal Tariff (Tops General Duty Up to 15%) | South Korea Deal Tariff (15% Including Base Duty) | TOPUP |
| 9903.02.81 | Articles of Civil Aircraft of South Korea | South Korea Deal Exemption: Civil Aircraft | PREFIX |
| 9903.96.01 | U.K. Civil Aircraft, Engines, Parts, Components, & Subassemblies | Civil Aircraft, Engines and Parts of the United Kingdom | OF, ABBR |
| 9903.96.03 | Taiwan Civil Aircraft Components (Exempt from Section 232 Metals) | Civil Aircraft Components of Taiwan (Exempt From Section 232 Metals) | OF |
