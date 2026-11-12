"""Market data: share prices (Yahoo Finance chart API), Government of Canada 10-year yield (Bank of Canada
Valet API), USD/CAD, and peer fundamentals (SEC EDGAR company facts). Writes data/market.json."""
import requests, json, os, time, datetime as dt
H = os.path.dirname(os.path.abspath(__file__)); D = f"{H}/data"
UA = {"User-Agent": "Mozilla/5.0"}; SEC = {"User-Agent": "academic-research-script research@example.com"}

def yahoo(t, rng="6y", iv="1mo"):
    r = requests.get(f"https://query1.finance.yahoo.com/v8/finance/chart/{t}", params={"range": rng, "interval": iv}, headers=UA, timeout=30).json()["chart"]["result"][0]
    ts = [dt.datetime.utcfromtimestamp(x).strftime("%Y-%m-%d") for x in r["timestamp"]]
    adj = r["indicators"]["adjclose"][0]["adjclose"]; cl = r["indicators"]["quote"][0]["close"]
    return {"meta_price": r["meta"]["regularMarketPrice"], "currency": r["meta"]["currency"], "dates": ts, "adj": adj, "close": cl}

out = {"asof": None, "prices": {}, "monthly": {}}
for t in ["CNR.TO", "CP.TO", "UNP", "CSX", "NSC", "^GSPTSE", "CAD=X"]:
    d = yahoo(t, "5d", "1d"); out["prices"][t] = {"price": [c for c in d["close"] if c][-1], "date": d["dates"][-1], "currency": d["currency"]}
    time.sleep(0.4)
out["asof"] = out["prices"]["CNR.TO"]["date"]
for t in ["CNR.TO", "^GSPTSE"]:
    d = yahoo(t, "6y", "1mo"); out["monthly"][t] = {"dates": d["dates"], "adj": d["adj"]}; time.sleep(0.4)

v = requests.get("https://www.bankofcanada.ca/valet/observations/BD.CDN.10YR.DQ.YLD/json?recent=5", timeout=30).json()["observations"]
out["rf"] = {"series": "BD.CDN.10YR.DQ.YLD", "date": v[-1]["d"], "value": float(v[-1]["BD.CDN.10YR.DQ.YLD"]["v"])}

# CN latest interim balance sheet (most recent quarter end in company facts)
F = json.load(open(f"{D}/raw/CNI_companyfacts.json"))["facts"]["us-gaap"]
def latest(tag):
    rows = [r for u in F[tag]["units"].values() for r in u if not r.get("start")]
    r = max(rows, key=lambda r: (r["end"], r["filed"])); return r["end"], r["val"]
out["cn_latest"] = {t: latest(t) for t in ["LongTermDebtAndCapitalLeaseObligations", "LongTermDebtAndCapitalLeaseObligationsCurrent", "CashAndCashEquivalentsAtCarryingValue", "CommonStockSharesOutstanding", "StockholdersEquity"]}

# Peers: FY2025 fundamentals from EDGAR
PEERS = {"UNP": 100885, "CSX": 277948, "NSC": 702165, "CP": 16875}
CAND = {"revenue": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax"], "ebit": ["OperatingIncomeLoss"],
        "da": ["DepreciationDepletionAndAmortization", "DepreciationAndAmortization", "Depreciation", "DepreciationAmortizationAndAccretionNet"], "ni": ["NetIncomeLoss"],
        "eps": ["EarningsPerShareDiluted"], "dil": ["WeightedAverageNumberOfDilutedSharesOutstanding"],
        "debt_lt": ["LongTermDebtAndCapitalLeaseObligations", "LongTermDebtNoncurrent", "LongTermDebtAndFinanceLeasesNoncurrent"],
        "debt_cur": ["LongTermDebtAndCapitalLeaseObligationsCurrent", "DebtCurrent", "LongTermDebtCurrent", "LongTermDebtAndFinanceLeasesCurrent"],
        "cash": ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents", "Cash"], "capex": ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"]}
out["peers"] = {}
for name, cik in PEERS.items():
    p = f"{D}/raw/{name}_companyfacts.json"
    if not os.path.exists(p): open(p, "wb").write(requests.get(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json", headers=SEC, timeout=60).content)
    J = json.load(open(p)); G = J["facts"]["us-gaap"]; row = {"tags": {}}
    for k, tags in CAND.items():
        for t in tags:
            if t not in G: continue
            best = None
            for u, rs in G[t]["units"].items():
                for r in rs:
                    if r["end"] != "2025-12-31": continue
                    s = r.get("start")
                    if s and s != "2025-01-01": continue
                    if best is None or r["filed"] >= best["filed"]: best = dict(r, unit=u)
            if best: row[k] = best["val"]; row["tags"][k] = t; row["unit"] = best["unit"] if k == "revenue" else row.get("unit"); break
    sh = [r for u in J["facts"]["dei"]["EntityCommonStockSharesOutstanding"]["units"].values() for r in u]
    r = max(sh, key=lambda r: r["end"]); row["shares"] = r["val"]; row["shares_date"] = r["end"]
    out["peers"][name] = row
json.dump(out, open(f"{D}/market.json", "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("monthly",)}, indent=1)[:3800])
