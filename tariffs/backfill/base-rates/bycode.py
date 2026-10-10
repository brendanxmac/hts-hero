import re, json, sys
from collections import defaultdict
revs = [l.split()[0] for l in open("revs.txt") if l.strip()]
FN = re.compile(r"(?<![\d/])(?:\d{1,2}/)+(?!\d)")
CODE = re.compile(r"(\d{4}\.\d{2}\.\d{2})(?=Free|\d|\$|The|See)")
TOK = re.compile(r"Free(?:\([^)]*\))?|\d+(?:\.\d+)?(?:%|¢/[a-zA-Z.]+|¢)(?:\+\d+(?:\.\d+)?%)?(?:\([^)]*\))?|\$\d+(?:\.\d+)?/[a-zA-Z.]+(?:\+\d+(?:\.\d+)?%)?(?:\([^)]*\))?")
def sigs(rev):
    text = "".join(FN.sub("", l.split("|",1)[1]) for l in open(f"txt/{rev}.txt"))
    out = {}
    for m in CODE.finditer(text):
        tail = text[m.end():m.end()+400]
        toks=[]; pos=0
        while True:
            t = TOK.match(tail, pos)
            if not t: break
            toks.append(t.group()); pos=t.end()
        # strip a trailing stat suffix glued to col2 isn't possible; keep as is
        if toks: out[m.group(1)] = " | ".join(toks)
    return out
prev=None; changes={}
for r in revs:
    s=sigs(r)
    if prev:
        p=prev[1]
        ch=[(c,p[c],s[c]) for c in s if c in p and p[c]!=s[c]]
        added=[c for c in s if c not in p]; removed=[c for c in p if c not in s]
        changes[r]={"changed":ch,"added":added,"removed":removed}
        print(f"{r:14} codes={len(s):5} rate-changed={len(ch):4} added={len(added):4} removed={len(removed):4}")
    prev=(r,s)
json.dump(changes,open("results/bycode.json","w"),indent=1)
