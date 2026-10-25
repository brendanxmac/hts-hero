# Builds the per-product destination files for the Tracker's Sourcing tab: for every 6-digit
# product (HS 2022), each exporting country's exports to the world each year, and to its largest
# destinations, the US and the usual transshipment hubs. Where a country sells a product it barely
# sends to the US, and whether its exports to a hub rose as the hub's exports to the US appeared.
#
# Source: Harvard Growth Lab, Atlas of Economic Complexity, International Trade Data (HS 2022),
# hs22_country_country_product_year_6_2022_2024.csv (https://doi.org/10.7910/DVN/FTUUJU), CC0 1.0.
# Download it from the Dataverse page (about 1.7 GB), then, with DuckDB installed
# (python3 -m venv .venv-sourcing && .venv-sourcing/bin/pip install duckdb):
#   .venv-sourcing/bin/python scripts/sourcing/build_bilateral.py <the csv> <out dir>
# and upload the out dir with `npm run sourcing:upload-bilateral -- <out dir>`.
import json
import os
import sys

import duckdb

HERE = os.path.dirname(os.path.abspath(__file__))
# Destinations kept per exporter, largest in the latest year first
TOP = 10
# Exporters kept per product, largest first, and the least they must export in the latest year (USD)
EXPORTERS = 80
MIN_EXPORTS = 50_000
# Always kept: the US, and the places goods are most often routed through on their way to it
ALWAYS = ["USA", "ARE", "MYS", "VNM", "THA", "MEX", "SGP", "TWN", "KOR", "IDN", "KHM", "HKG", "CAN", "TUR", "IND"]

csv, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
# ISO 3166 alpha-3 to alpha-2, written by alpha3.mjs (the app uses two-letter codes)
alpha2 = json.load(open(os.path.join(HERE, "alpha3.json")))

con = duckdb.connect()
con.sql(
    f"""
    CREATE TABLE flows AS
    SELECT country_iso3_code AS e, partner_iso3_code AS p, product_hs22_code AS hs, year, export_value AS v
    FROM read_csv('{csv}', header = true, types = {{'product_hs22_code': 'VARCHAR'}})
    WHERE export_value > 0
    """
)
years = [r[0] for r in con.sql("SELECT DISTINCT year FROM flows ORDER BY year").fetchall()]
latest = years[-1]

# Each exporter's world total per product and year, and its rank among exporters in the latest year
con.sql(
    f"""
    CREATE TABLE totals AS
    SELECT hs, e, year, SUM(v) AS t FROM flows GROUP BY hs, e, year;
    CREATE TABLE exporters AS
    SELECT hs, e FROM (
      SELECT hs, e, t, ROW_NUMBER() OVER (PARTITION BY hs ORDER BY t DESC) AS r
      FROM totals WHERE year = {latest} AND t >= {MIN_EXPORTS}
    ) WHERE r <= {EXPORTERS};
    """
)
# The destinations kept: the largest in the latest year, and the US and hubs whatever their size
always = ", ".join(f"'{c}'" for c in ALWAYS)
con.sql(
    f"""
    CREATE TABLE kept AS
    SELECT f.hs, f.e, f.p FROM (
      SELECT hs, e, p, ROW_NUMBER() OVER (PARTITION BY hs, e ORDER BY SUM(CASE WHEN year = {latest} THEN v ELSE 0 END) DESC) AS r
      FROM flows GROUP BY hs, e, p
    ) f JOIN exporters x USING (hs, e)
    WHERE f.r <= {TOP} OR f.p IN ({always})
    """
)
rows = con.sql(
    """
    SELECT k.hs, k.e, k.p, f.year, f.v FROM kept k JOIN flows f USING (hs, e, p) ORDER BY k.hs
    """
).fetchall()
total_rows = con.sql("SELECT t.hs, t.e, t.year, t.t FROM totals t JOIN exporters x USING (hs, e)").fetchall()

by_hs = {}
yi = {y: i for i, y in enumerate(years)}
for hs, e, year, t in total_rows:
    e2 = alpha2.get(e)
    if not e2:
        continue
    entry = by_hs.setdefault(hs, {}).setdefault(e2, {"t": [0] * len(years), "d": {}})
    entry["t"][yi[year]] = round(t / 1000)
for hs, e, p, year, v in rows:
    e2, p2 = alpha2.get(e), alpha2.get(p)
    if not e2 or not p2 or e2 not in by_hs.get(hs, {}):
        continue
    d = by_hs[hs][e2]["d"].setdefault(p2, [0] * len(years))
    d[yi[year]] = round(v / 1000)

meta = {
    "source": "Harvard Growth Lab, Atlas of Economic Complexity (HS 2022), country to country",
    "url": "https://doi.org/10.7910/DVN/FTUUJU",
    "license": "CC0 1.0",
    "years": years,
    "unit": "thousands of USD",
}
for hs, exporters in by_hs.items():
    with open(os.path.join(out, f"{hs}.json"), "w") as f:
        json.dump({**meta, "e": exporters}, f, separators=(",", ":"))
with open(os.path.join(out, "meta.json"), "w") as f:
    json.dump({**meta, "products": len(by_hs)}, f, indent=1)
print(f"Wrote {len(by_hs)} products ({years[0]}-{latest}) to {out}")
