import re, json
from collections import Counter, defaultdict
revs = [l.split()[0] for l in open("revs.txt") if l.strip()]
FN = re.compile(r"(?<![\d/])(?:\d{1,2}/)+(?!\d)")
TOK = re.compile(r"Free\([^)]*\)|\d+(?:\.\d+)?(?:%|¢/[a-zA-Z.]+|¢)(?:\+\d+(?:\.\d+)?%)?(?:\([^)]*\))?|\$\d+(?:\.\d+)?/[a-zA-Z.]+(?:\+\d+(?:\.\d+)?%)?(?:\([^)]*\))?|Free")
def toks(rev):
    by=defaultdict(str)
    for l in open(f"txt/{rev}.txt"):
        ch,t=l.rstrip("\n").split("|",1); by[int(ch)]+=FN.sub("",t)
    return {ch:Counter(TOK.findall(t)) for ch,t in by.items()}
prev=None; out={}
for r in revs:
    t=toks(r)
    if prev:
        diffs={}
        for ch in sorted(set(t)|set(prev)):
            a,b=prev.get(ch,Counter()),t.get(ch,Counter())
            if a!=b: diffs[ch]={"removed":dict(a-b),"added":dict(b-a)}
        out[r]=diffs
        print(f"{r:14} chapters with rate-token differences: {list(diffs) or '-'}")
    prev=t
json.dump(out,open("results/tokens.json","w"),indent=1,ensure_ascii=False)
