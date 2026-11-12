"""Download the raw data for the study. Sources: Bank of Canada Valet API (policy rate, 2-year
benchmark yield) and Yahoo Finance chart API (adjusted daily closes, Toronto listings)."""
import json, time, urllib.request, csv, datetime as dt, os
START, END = "2009-01-01", "2026-10-31"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return json.loads(urllib.request.urlopen(req, timeout=40).read())
def valet(series, name):
    j = get(f"https://www.bankofcanada.ca/valet/observations/{series}/json?start_date={START}&end_date={END}")
    rows = [(o["d"], o[series]["v"]) for o in j["observations"] if series in o and o[series].get("v") not in (None, "")]
    with open(f"{OUT}/{name}.csv", "w", newline="") as f:
        w = csv.writer(f); w.writerow(["date", name]); w.writerows(rows)
    print(name, len(rows), rows[0][0], rows[-1][0])
def yahoo(ticker):
    p1 = int(dt.datetime(2009, 1, 1).timestamp()); p2 = int(dt.datetime(2026, 11, 1).timestamp())
    j = get(f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?period1={p1}&period2={p2}&interval=1d&events=div%2Csplit")
    r = j["chart"]["result"][0]; ts = r["timestamp"]; adj = r["indicators"]["adjclose"][0]["adjclose"]
    rows = [(dt.datetime.utcfromtimestamp(t + r["meta"]["gmtoffset"]).strftime("%Y-%m-%d"), round(a, 6)) for t, a in zip(ts, adj) if a is not None]
    name = ticker.replace("^", "").replace(".TO", "")
    with open(f"{OUT}/px_{name}.csv", "w", newline="") as f:
        w = csv.writer(f); w.writerow(["date", "adj_close"]); w.writerows(rows)
    print(ticker, len(rows), rows[0][0], rows[-1][0])
if __name__ == "__main__":
    valet("V39079", "policy_rate"); valet("BD.CDN.2YR.DQ.YLD", "yield_2y")
    for t in ["RY.TO", "TD.TO", "BNS.TO", "BMO.TO", "CM.TO", "NA.TO", "^GSPTSE"]:
        yahoo(t); time.sleep(1)
