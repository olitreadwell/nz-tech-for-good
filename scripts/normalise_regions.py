"""Normalise region values across all entries to canonical lowercase enum values."""
import glob, yaml, os

MAPPING = {
    "Auckland": "auckland",
    "Wellington": "wellington",
    "Nelson": "tasman-nelson",
    "Waikato": "waikato",
    "Taranaki": "taranaki",
    "Bay of Plenty": "bay-of-plenty",
    "Dunedin": "otago",
    "Christchurch": "canterbury",
    "Otago": "otago",
    "Canterbury": "canterbury",
    "Tauranga": "bay-of-plenty",
    "West Coast": "west-coast",
    "Gisborne": "gisborne",
    "Northland": "northland",
    "Marlborough": "marlborough",
    "Rotorua": "bay-of-plenty",
    "Southland": "southland",
    "Hawke's Bay": "hawkes-bay",
    "Tasman": "tasman-nelson",
    "Kaitaia": "northland",
    "Tamaki Makaurau": "auckland",
}

CANONICAL = sorted(set(list(MAPPING.values()) + ["national"]))

BASE = "data/entries"
changed = 0
for path in sorted(glob.glob(f"{BASE}/*.yaml")):
    with open(path) as f:
        data = yaml.safe_load(f)
    old = data.get("region", "")
    new = MAPPING.get(old, old)
    if old == new:
        continue
    # Read raw lines and replace the region line
    with open(path) as f:
        lines = f.readlines()
    with open(path, "w") as f:
        for line in lines:
            if line.startswith("region:") and old in line:
                f.write(f"region: {new}\n")
            else:
                f.write(line)
    changed += 1
    print(f"  {old:25s} → {new}  ({os.path.basename(path)})")

print(f"\n{changed} entries normalised.")
print(f"Canonical values: {CANONICAL}")
