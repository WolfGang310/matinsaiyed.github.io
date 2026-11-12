"""Download SEC fails-to-deliver files (NSCC Continuous Net Settlement) and aggregate them to one row per
settlement date. Raw half-monthly files (~1.5 MB each) are cached outside the repository; only the daily
aggregate and the market controls are kept in data/.

Each raw row is the *outstanding balance* of fails in one security on one settlement date, not new fails.
"""
import requests, zipfile, io, os, re, sys, time, datetime as dt
import pandas as pd, numpy as np
H = os.path.dirname(os.path.abspath(__file__)); RAW = sys.argv[1] if len(sys.argv) > 1 else f"{H}/data/raw"; os.makedirs(RAW, exist_ok=True)
SEC = {"User-Agent": "academic-research-script research@example.com"}
names = [f"cnsfails{y}{m:02d}{h}" for y in range(2022, 2027) for m in range(1, 13) for h in "ab" if (y, m) <= (2026, 10)]
frames = []
for n in names:
    p = f"{RAW}/{n}.zip"
    if not os.path.exists(p):
        r = requests.get(f"https://www.sec.gov/files/data/fails-deliver-data/{n}.zip", headers=SEC, timeout=120)
        if r.status_code != 200: print("missing", n, r.status_code); continue
        open(p, "wb").write(r.content); time.sleep(0.25)
    z = zipfile.ZipFile(p); txt = z.read(z.namelist()[0]).decode("latin-1")
    d = pd.read_csv(io.StringIO(txt), sep="|", dtype=str, on_bad_lines="skip", quoting=3)
    d.columns = ["date", "cusip", "symbol", "qty", "desc", "price"][:len(d.columns)]
    d = d[d["date"].str.fullmatch(r"\d{8}", na=False)]
    frames.append(d)
D = pd.concat(frames, ignore_index=True)
D["qty"] = pd.to_numeric(D["qty"], errors="coerce"); D["price"] = pd.to_numeric(D["price"], errors="coerce")
D = D.dropna(subset=["qty"]); D = D[D["qty"] > 0]
D["date"] = pd.to_datetime(D["date"]); D["value"] = D["qty"] * D["price"]
D["etf"] = D["desc"].fillna("").str.contains(r"\bETF\b|ISHARES|SPDR|PROSHARES|DIREXION|VANGUARD|INVESCO|WISDOMTREE|\bETN\b|SELECT SECTOR|GLOBAL X|FIRST TR", regex=True)
D = D.sort_values(["cusip", "date"]).reset_index(drop=True)
days = np.sort(D["date"].unique()); idx = {d: i for i, d in enumerate(days)}
D["di"] = D["date"].map(idx)
new_run = (D["cusip"] != D["cusip"].shift()) | (D["di"] != D["di"].shift() + 1)
D["age"] = D.groupby(new_run.cumsum()).cumcount() + 1            # consecutive settlement days this security has had a fail balance
D["v_new"] = D["value"].where(D["age"] == 1, 0.0); D["v_old5"] = D["value"].where(D["age"] >= 5, 0.0)
D["v_etf"] = D["value"].where(D["etf"], 0.0); D["v_big"] = D["value"].where(D["value"] >= 1e6, 0.0)
agg = D.groupby("date").agg(n_securities=("cusip", "size"), shares=("qty", "sum"), value=("value", "sum"), value_etf=("v_etf", "sum"), value_new=("v_new", "sum"), value_aged5=("v_old5", "sum"),
                            value_large=("v_big", "sum"), n_new=("age", lambda s: int((s == 1).sum())), n_aged5=("age", lambda s: int((s >= 5).sum())), n_priced=("price", "count"),
                            top10_share=("value", lambda s: float(s.nlargest(10).sum() / s.sum()) if s.sum() > 0 else np.nan)).reset_index()
# run lengths (completed spells), by the date the spell began
runs = D.groupby(new_run.cumsum()).agg(start=("date", "first"), length=("age", "max"), peak_value=("value", "max"), etf=("etf", "first"))
runs.to_csv(f"{H}/data/fail_spells.csv.gz", index=False, compression="gzip")

UA = {"User-Agent": "Mozilla/5.0"}
def yahoo(t):
    r = requests.get(f"https://query1.finance.yahoo.com/v8/finance/chart/{t}", params={"period1": int(dt.datetime(2021, 12, 1).timestamp()), "period2": int(dt.datetime(2026, 11, 5).timestamp()), "interval": "1d"}, headers=UA, timeout=30).json()["chart"]["result"][0]
    q = r["indicators"]["quote"][0]; return pd.DataFrame({"date": pd.to_datetime(r["timestamp"], unit="s").normalize(), "close": q["close"], "volume": q["volume"]})
spx, vix = yahoo("^GSPC"), yahoo("^VIX")
mk = spx.rename(columns={"close": "spx", "volume": "spx_volume"}).merge(vix[["date", "close"]].rename(columns={"close": "vix"}), on="date")
agg = agg.merge(mk, on="date", how="left"); agg.to_csv(f"{H}/data/daily_fails.csv", index=False)
print(len(names), "files |", len(D), "security-day rows |", len(agg), "settlement dates", agg["date"].min().date(), "→", agg["date"].max().date(), "| spells", len(runs))
print(agg.describe().T[["mean", "min", "max"]].to_string())
