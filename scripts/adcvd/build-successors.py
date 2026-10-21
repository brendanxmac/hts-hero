# Builds tariffs/hts-concordance/successors.json (see its README). Run with the Census files
# downloaded (curl) into DIR, plus revisions.json: [{"name": ..., "codes": [10-digit, ...]}] for the
# stored HTS revisions, oldest first. Needs xlrd (2002–2019 .xls) and openpyxl.
#
#   python3 scripts/adcvd/build-successors.py DIR > tariffs/hts-concordance/successors.json
import sys, os, json, re
import xlrd, openpyxl

DIR = sys.argv[1]
snapshots = []
for yy in range(2, 23):
    path = os.path.join(DIR, f"impconcord{yy:02d}.{'xlsx' if yy >= 20 else 'xls'}")
    codes = set()
    if path.endswith(".xls"):
        for sh in xlrd.open_workbook(path).sheets():
            for i in range(sh.nrows):
                v = str(sh.cell_value(i, 0)).split(".")[0].strip()
                if re.fullmatch(r"\d{10}", v): codes.add(v)
    else:
        for ws in openpyxl.load_workbook(path, read_only=True).worksheets:
            for row in ws.iter_rows(values_only=True):
                v = str(row[0]).split(".")[0].strip() if row and row[0] is not None else ""
                if re.fullmatch(r"\d{10}", v): codes.add(v)
    snapshots.append((f"20{yy:02d}", codes))
for r in json.load(open(os.path.join(DIR, "revisions.json"))):
    snapshots.append((r["name"], set(r["codes"])))

current = snapshots[-1][1]
ADDED = [set()] + [snapshots[i][1] - snapshots[i - 1][1] for i in range(1, len(snapshots))]
LAST = {c: i for i, (_, codes) in enumerate(snapshots) for c in codes}

def successors(code, idx, depth=0):
    if depth > 6 or idx + 1 >= len(snapshots): return set()
    added = ADDED[idx + 1]
    succ = [c for c in added if c[:8] == code[:8]] or [c for c in added if c[:6] == code[:6]]
    out = set()
    for c in succ:
        out |= {c} if c in current else successors(c, LAST[c], depth + 1)
    return out

result = {}
for code in set().union(*[s for _, s in snapshots]) - current:
    succ = successors(code, LAST[code])
    if succ: result[code] = sorted(succ)
json.dump({"source": "Census import concordance 2002-2022 + stored USITC revisions", "snapshots": [n for n, _ in snapshots], "successors": result}, sys.stdout)
