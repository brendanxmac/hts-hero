import json, re, sys
from collections import Counter
d=json.load(open("results/diff.json"))
RT = re.compile(r"\d+(?:\.\d+)?%|\d+(?:\.\d+)?¢/\w+|\$\d+(?:\.\d+)?/\w+|Free")
PAREN_RATE = re.compile(r"(?:\d+(?:\.\d+)?(?:%|¢/\w+)|\$[\d.]+/\w+)(?:\+[\d.]+%)?\(([A-Z+*,\s]+)\)")
def txt(ls): return "".join(x.split("|",1)[1] for x in ls)
for rev in sys.argv[1:]:
    hs=d[rev]; staging=[]; other=[]
    for h in hs:
        o,n=txt(h["old"]),txt(h["new"])
        if Counter(RT.findall(o))==Counter(RT.findall(n)): continue
        # staging: removed parenthetical special rates only; general/col2 tokens unchanged
        o2=PAREN_RATE.sub("",o); n2=PAREN_RATE.sub("",n)
        if Counter(RT.findall(o2))==Counter(RT.findall(n2)) and PAREN_RATE.search(o) and len(PAREN_RATE.findall(n))<len(PAREN_RATE.findall(o)):
            staging.append(PAREN_RATE.findall(o))
        else: other.append(h)
    cs=Counter(c.strip() for s in staging for g in s for c in g.split(",") if c.strip())
    print(f"===== {rev}: staging-to-Free hunks={len(staging)} countries={dict(cs)}; other rate hunks={len(other)}")
    for h in other: print(f"  @{h['at']}: {txt(h['old'])[:170]}\n      => {txt(h['new'])[:200]}")
