# Builds tariffs/hts-concordance/successors.json (see its README). Run with, in DIR:
#   - the Census import concordance files impconcord02.xls … impconcord22.xlsx (curl)
#   - the UN Statistics Division's HS correlation tables HS2022toHS2017… and HS2017toHS2012…
#     ConversionAndCorrelationTables.xlsx (unstats.un.org/unsd/classifications/Econ/tables/)
#   - revisions.json from `npx tsx scripts/adcvd/hts-snapshots.ts DIR` (the stored HTS revisions)
# Needs xlrd (2002–2019 .xls) and openpyxl.
#
#   python3 scripts/adcvd/build-successors.py DIR > tariffs/hts-concordance/successors.json
#
# For each 10-digit code gone from the current HTS, the codes that replaced it: among the codes added
# in the next snapshot after it last appeared, those under its heading or under the subheadings the
# HS correlation tables say its subheading went to (HS 2022 moved whole groups to new subheadings:
# R-125 2903.39 → 2903.44, PET resin 3907.60 → 3907.61/.69), picked by how alike their descriptions
# are, then followed forward until current.
#   how "one"    one clear replacement: as good as the old code (libs/adcvd/codes.ts)
#   how "split"  every code added on its 8-digit line when there are several (the line was
#                restructured); 2–4 close candidates; or, with no confident pick, every code added on
#                the same 8-digit line, else the same 6-digit subheading
import sys, os, json, re, collections
import xlrd, openpyxl

DIR = sys.argv[1]
snapshots = []  # (name, {code: description})
for yy in range(2, 23):
    path = os.path.join(DIR, f"impconcord{yy:02d}.{'xlsx' if yy >= 20 else 'xls'}")
    codes = {}
    if path.endswith(".xls"):
        for sh in xlrd.open_workbook(path).sheets():
            for i in range(sh.nrows):
                v = str(sh.cell_value(i, 0)).split(".")[0].strip()
                if re.fullmatch(r"\d{10}", v): codes[v] = str(sh.cell_value(i, 1))
    else:
        for ws in openpyxl.load_workbook(path, read_only=True).worksheets:
            for row in ws.iter_rows(values_only=True):
                v = str(row[0]).split(".")[0].strip() if row and row[0] is not None else ""
                if re.fullmatch(r"\d{10}", v): codes[v] = str(row[1])
    snapshots.append((f"20{yy:02d}", codes))
for r in json.load(open(os.path.join(DIR, "revisions.json"))):
    # A revision's descriptions are full paths: the last two levels say what the line is
    snapshots.append((r["name"], {c: " ".join(d.split(" > ")[-2:]) for c, d in r["codes"].items()}))

# Where each HS subheading went in the next HS edition (6 digits, old → new)
went = collections.defaultdict(set)
for name, sheet, new_col, old_col in [
    ("HS2022toHS2017ConversionAndCorrelationTables.xlsx", "HS2022-HS2017 Correlations", 0, 1),
    ("HS2017toHS2012ConversionAndCorrelationTables.xlsx", "Correlation HS17-HS12", 0, 2),
]:
    for row in openpyxl.load_workbook(os.path.join(DIR, name), read_only=True)[sheet].iter_rows(values_only=True):
        new, old = (str(row[new_col] or "").strip(), str(row[old_col] or "").strip())
        if re.fullmatch(r"\d{6}", new) and re.fullmatch(r"\d{6}", old): went[old].add(new)

current = snapshots[-1][1]
LAST = {}
for i, (_, codes) in enumerate(snapshots):
    for c in codes: LAST[c] = i
ADDED = [set()] + [set(snapshots[i][1]) - set(snapshots[i - 1][1]) for i in range(1, len(snapshots))]

STOP = set("OF AND OR THE IN WITH NOT FOR BY ETC NESOI OTHER THAN TO A AN WHETHER".split())
def words(text):
    return {w for w in re.findall(r"[A-Z0-9]+", text.upper()) if w not in STOP and len(w) > 1}
def alike(a, b):
    wa, wb = words(a), words(b)
    return len(wa & wb) / max(1, len(wa | wb))

# One step forward from the snapshot a code last appeared in: (codes, "one" | "split") or None
def step(code):
    i = LAST[code]
    if i + 1 >= len(snapshots): return None
    added = ADDED[i + 1]
    old = snapshots[i][1][code]
    same8 = sorted(c for c in added if c[:8] == code[:8])
    # Several new lines on its 8-digit line: the line was restructured, products carved out of it
    # (9403.20.0081 "fixtures of metal, NESOI" → .0082 "Steel racks" + .0086 "Other"; 7310.10.0010
    # "empty steel drums" → .0005 "kegs" + .0015 drums), and the carved-out one is often what an
    # order covers, which descriptions can't tell. Every new line on it is a candidate.
    if len(same8) >= 2:
        return same8, "split"
    subheadings = {code[:6]} | went.get(code[:6], set())
    pool = [c for c in added if c[:6] in subheadings or c[:4] == code[:4]]
    scored = sorted(((alike(old, snapshots[i + 1][1][c]), c) for c in pool), reverse=True)
    if scored:
        best = scored[0][0]
        near = [c for s, c in scored if s >= best - 0.1 and s >= 0.4]
        if best >= 0.5 and len(near) == 1: return near, "one"
        if near and len(near) <= 4: return near, "split"
    # No confident pick: every code added on its 8-digit line, else its 6-digit subheading
    same = [c for c in added if c[:8] == code[:8]] or [c for c in added if c[:6] == code[:6]]
    return (same, "split") if same else None

def resolve(code, depth=0):
    if code in current: return {code}, "one"
    if depth > 6 or code not in LAST: return set(), None
    nxt = step(code)
    if not nxt: return set(), None
    out, how = set(), nxt[1]
    for c in nxt[0]:
        got, h = resolve(c, depth + 1)
        out |= got
        if h == "split": how = "split"
    if not out: return set(), None
    return out, ("one" if how == "one" and len(out) == 1 else "split")

result = {}
for code in set(LAST) - set(current):
    to, how = resolve(code)
    if to: result[code] = {"to": sorted(to), "how": how}
json.dump({
    "source": "Census import concordance 2002-2022 + stored HTS revisions; UN HS correlation tables 2012-2017-2022",
    "snapshots": [n for n, _ in snapshots],
    "successors": result,
}, sys.stdout)
