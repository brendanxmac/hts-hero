# Builds libs/sourcing/transit.json: the sea distance from each country's main port (ports.json)
# to the US West Coast, East Coast and Gulf, and the days at sea that makes, for the Tracker's
# Sourcing tab. An estimate, not a schedule: real voyages add port calls, transshipment and dwell.
#
# Distances come from searoute (Apache-2.0, https://github.com/genthalili/searoute-py), built on
# Eurostat's maritime network. Run once, or when ports.json changes:
#   python3 -m venv .venv-searoute && .venv-searoute/bin/pip install searoute
#   .venv-searoute/bin/python scripts/sourcing/transit.py
import json
import os

import searoute

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../libs/sourcing/transit.json")
# A container ship's typical service speed, in knots
KNOTS = 16

ports = json.load(open(os.path.join(HERE, "ports.json")))
us = ports["us"]
countries = {}
for code, port in ports["countries"].items():
    name, lon, lat = port[0], port[1], port[2]
    legs = {}
    for coast, (_, ulon, ulat) in us.items():
        miles = searoute.searoute([lon, lat], [ulon, ulat], units="naut").properties["length"]
        legs[coast] = {"nm": round(miles), "days": round(miles / (KNOTS * 24))}
    countries[code] = {"port": name, **({"via": port[3]} if len(port) > 3 else {}), **legs}

json.dump(
    {
        "source": "Sea distances from searoute (Apache-2.0), on Eurostat's maritime network",
        "url": "https://github.com/genthalili/searoute-py",
        "knots": KNOTS,
        "us": {coast: p[0] for coast, p in us.items()},
        "countries": countries,
    },
    open(OUT, "w"),
    indent=1,
    ensure_ascii=False,
)
print(f"Wrote {len(countries)} countries to {OUT}")
