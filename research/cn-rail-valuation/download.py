"""Download Canadian National Railway's filed financial statements (US GAAP, CAD) from SEC EDGAR.

Two sources are combined:
  1. The XBRL "company facts" API (all structured facts the SEC has indexed).
  2. The XBRL instance documents of the annual 6-K filings for FY2021-FY2023, which the
     company-facts API does not index.
Output: data/cn_facts.csv  (tag, year, value, kind, source accession)
"""
import requests, json, re, csv, os, time
import xml.etree.ElementTree as ET
H = os.path.dirname(os.path.abspath(__file__)); D = f"{H}/data"; os.makedirs(f"{D}/raw", exist_ok=True)
UA = {"User-Agent": "academic-research-script research@example.com"}
CIK = 16868
EXTRA = ["0000016868-22-000012", "0000016868-23-000013", "0000016868-24-000009"]   # annual 6-Ks, FY2021-23

def get(url, path, binary=True):
    if not os.path.exists(path):
        r = requests.get(url, headers=UA, timeout=60); r.raise_for_status()
        open(path, "wb").write(r.content); time.sleep(0.3)
    return open(path, "rb").read()

rows = {}   # (tag, year, kind) -> (value, filed, accn)
def put(tag, start, end, val, filed, accn):
    if end[5:] != "12-31": return
    if start and (start[5:] != "01-01" or start[:4] != end[:4]): return
    k = (tag, int(end[:4]), "flow" if start else "stock")
    if k not in rows or filed >= rows[k][1]: rows[k] = (val, filed, accn)

facts = json.loads(get(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{CIK:010d}.json", f"{D}/raw/CNI_companyfacts.json"))
for tag, v in facts["facts"]["us-gaap"].items():
    for unit, rs in v["units"].items():
        for r in rs: put(tag, r.get("start"), r["end"], r["val"], r["filed"], r["accn"])

for accn in EXTRA:
    a = accn.replace("-", "")
    idx = json.loads(get(f"https://www.sec.gov/Archives/edgar/data/{CIK}/{a}/index.json", f"{D}/raw/{a}_index.json"))
    name = next(i["name"] for i in idx["directory"]["item"] if i["name"].endswith("_htm.xml"))
    root = ET.fromstring(get(f"https://www.sec.gov/Archives/edgar/data/{CIK}/{a}/{name}", f"{D}/raw/{a}_instance.xml"))
    ns = {"x": "http://www.xbrl.org/2003/instance"}
    ctx = {}
    for c in root.findall("x:context", ns):
        if c.find("x:entity/x:segment", ns) is not None: continue          # skip dimensional facts
        p = c.find("x:period", ns)
        inst = p.find("x:instant", ns)
        ctx[c.get("id")] = (None, inst.text) if inst is not None else (p.find("x:startDate", ns).text, p.find("x:endDate", ns).text)
    filed = "20" + accn.split("-")[1] + "-02-01"
    for el in root:
        if "us-gaap" not in el.tag or el.get("contextRef") not in ctx or el.text is None: continue
        try: val = float(el.text)
        except ValueError: continue
        s, e = ctx[el.get("contextRef")]
        tag = el.tag.split("}")[1]
        k = (tag, int(e[:4]), "flow" if s else "stock")
        if e[5:] == "12-31" and (not s or (s[5:] == "01-01" and s[:4] == e[:4])) and k not in rows:   # API values win
            rows[k] = (val, filed, accn)

with open(f"{D}/cn_facts.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["tag", "year", "kind", "value", "filed", "accession"])
    for (t, y, k), (v, fl, ac) in sorted(rows.items()): w.writerow([t, y, k, v, fl, ac])
print("facts:", len(rows))
