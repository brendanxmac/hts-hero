import re, subprocess, json, sys
revs = [l.split()[0] for l in open("revs.txt") if l.strip()]
FN = re.compile(r"(?<![\d/])(?:\d{1,2}/)+(?!\d)")
CODE = re.compile(r"\d{4}\.\d{2}(?:\.\d{2})?")
def load(r):
    return [FN.sub("", l) for l in open(f"txt/{r}.txt").read().splitlines()]
def norm(lines): return "".join(l.split("|",1)[1] for l in lines)
out = {}
skip = set(sys.argv[1:])
for a, b in zip(revs, revs[1:]):
    if b in skip: continue
    A, B = load(a), load(b)
    open("a.tmp","w").write("\n".join(A)+"\n"); open("b.tmp","w").write("\n".join(B)+"\n")
    d = subprocess.run(["diff","a.tmp","b.tmp"],capture_output=True,text=True).stdout
    hunks=[]; cur=None
    for line in d.splitlines():
        if re.match(r"^\d", line):
            m = re.match(r"^(\d+)(?:,(\d+))?[acd]", line); cur={"old":[],"new":[],"ln":int(m.group(1))}; hunks.append(cur)
        elif line.startswith("< "): cur["old"].append(line[2:])
        elif line.startswith("> "): cur["new"].append(line[2:])
    real=[]
    for h in hunks:
        if norm(h["old"]) == norm(h["new"]): continue
        # location: last code at or above the hunk
        at = "?"
        for l in reversed(A[max(0,h["ln"]-40):h["ln"]+len(h["old"])]):
            c = CODE.findall(l)
            if c: at = c[-1]; break
        h["at"]=at; real.append(h)
    out[b]=real
    print(f"{b:14} real hunks={len(real)}", flush=True)
json.dump(out, open("results/diff.json","w"), indent=1)
