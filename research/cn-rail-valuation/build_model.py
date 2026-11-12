"""Canadian National Railway valuation model.

Reads data/cn_facts.csv (filed financials) and data/market.json (prices, yields, peers), then
  * runs the valuation in Python (engine below), and
  * writes CN_Valuation_Model.xlsx in which every calculated cell is a live Excel formula.
The Python engine and the workbook implement the same logic; verify.py compares the two.
"""
import json, os, math, datetime as dt
import pandas as pd, numpy as np
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L
H = os.path.dirname(os.path.abspath(__file__))
F = pd.read_csv(f"{H}/data/cn_facts.csv").pivot_table(index="tag", columns="year", values="value", aggfunc="first") / 1e6
M = json.load(open(f"{H}/data/market.json"))
YRS = list(range(2018, 2026)); FY = [2026, 2027, 2028, 2029, 2030]
def g(*tags):
    s = pd.Series(index=YRS, dtype=float)
    for t in tags:
        if t in F.index: s = s.fillna(F.loc[t].reindex(YRS))
    return s
HIST = {
 "Revenue": g("RevenueFromContractWithCustomerExcludingAssessedTax"), "Labor and fringe benefits": g("LaborAndRelatedExpense"), "Fuel": g("FuelCosts"),
 "Depreciation and amortization": g("DepreciationDepletionAndAmortization", "DepreciationAndAmortization"), "Total operating expenses": g("CostsAndExpenses"),
 "Operating income (EBIT)": g("OperatingIncomeLoss"), "Interest expense": g("InterestExpenseNonoperating", "InterestExpense"),
 "Income before income taxes": g("IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest"), "Income tax expense": g("IncomeTaxExpenseBenefit"),
 "Net income": g("NetIncomeLoss"), "Diluted weighted-average shares (m)": g("WeightedAverageNumberOfDilutedSharesOutstanding"),
 "Cash from operating activities": g("NetCashProvidedByUsedInOperatingActivities"), "Property additions (capex)": g("PaymentsToAcquirePropertyPlantAndEquipment"),
 "Dividends paid": g("PaymentsOfDividendsCommonStock"), "Share repurchases": g("PaymentsForRepurchaseOfCommonStock"),
 "Cash and cash equivalents": g("CashAndCashEquivalentsAtCarryingValue"), "Accounts receivable": g("AccountsReceivableNetCurrent"), "Material and supplies": g("MaterialsSuppliesAndOther"),
 "Accounts payable and other": g("AccountsPayableAndAccruedLiabilitiesCurrent"),
 "Properties, net": g("PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetAfterAccumulatedDepreciationAndAmortization", "PropertyPlantAndEquipmentNet"),
 "Total assets": g("Assets"), "Total debt (incl. current)": g("LongTermDebtAndCapitalLeaseObligationsIncludingCurrentMaturities"), "Shareholders' equity": g("StockholdersEquity"),
 "Pension asset": g("DefinedBenefitPlanAssetsForPlanBenefitsNoncurrent"), "Pension and OPEB liability": g("PensionAndOtherPostretirementDefinedBenefitPlansLiabilitiesNoncurrent"),
 "Shares outstanding, year-end (m)": g("CommonStockSharesOutstanding"),
}
h = lambda k, y=2025: float(HIST[k][y])
assert all(not math.isnan(h(k)) for k in HIST), "missing FY2025 value"

# ---------- market inputs ----------
price = round(M["prices"]["CNR.TO"]["price"], 2); price_date = M["asof"]; rf = M["rf"]["value"] / 100
m = pd.DataFrame({k: pd.Series(v["adj"], index=v["dates"]) for k, v in M["monthly"].items()}).dropna()
r = np.log(m / m.shift(1)).dropna().iloc[-61:-1]          # 60 complete months
raw_beta = round(float(np.cov(r["CNR.TO"], r["^GSPTSE"])[0, 1] / np.var(r["^GSPTSE"], ddof=1)), 2)
kd = round(h("Interest expense") / ((h("Total debt (incl. current)") + h("Total debt (incl. current)", 2024)) / 2), 4)
ERP = 0.05
da_pct = round(h("Depreciation and amortization") / h("Revenue"), 3)
capex_avg = round(float((HIST["Property additions (capex)"] / HIST["Revenue"]).loc[2021:2025].mean()), 3)
lev = round(h("Total debt (incl. current)") / (h("Operating income (EBIT)") + h("Depreciation and amortization")), 1)
payout = round(h("Dividends paid") / h("Net income"), 2)
dps = round(h("Dividends paid") / h("Diluted weighted-average shares (m)"), 2)
SCEN = {  # name: (rev growth, 2030 operating ratio, D&A %, capex %, NWC % of change in revenue, tax, terminal g, payout, debt/EBITDA)
 "Base":     (0.040, 0.600, da_pct, capex_avg,        0.02, 0.245, 0.025, payout, lev),
 "Upside":   (0.055, 0.585, da_pct, capex_avg - 0.01, 0.02, 0.245, 0.030, payout, lev),
 "Downside": (0.020, 0.625, da_pct, capex_avg + 0.01, 0.02, 0.245, 0.020, payout, lev),
}
DRIVERS = ["Revenue growth (per year, 2026–2030)", "Operating ratio reached by 2030", "Depreciation and amortization, % of revenue", "Capital expenditure, % of revenue",
           "Net working capital, % of change in revenue", "Tax rate", "Terminal growth rate", "Dividend payout, % of net income", "Total debt / EBITDA held at"]
elapsed = (dt.date.fromisoformat(price_date) - dt.date(2025, 12, 31)).days / 365
pension_net = h("Pension asset") - h("Pension and OPEB liability")
shares0 = h("Shares outstanding, year-end (m)"); debt0 = h("Total debt (incl. current)"); cash0 = h("Cash and cash equivalents")

# ---------- python engine (mirrors the workbook) ----------
def engine(sc, wacc_override=None, g_override=None):
    gr, or30, dap, cxp, nwcp, tax, tg, pay, levt = sc
    if g_override is not None: tg = g_override
    beta = 0.67 * raw_beta + 0.33; ke = rf + beta * ERP
    mcap = price * shares0; ev_w = mcap + debt0
    wacc = ke * mcap / ev_w + kd * (1 - tax) * debt0 / ev_w
    if wacc_override is not None: wacc = wacc_override
    rev0 = h("Revenue"); or0 = 1 - h("Operating income (EBIT)") / rev0
    other = h("Income before income taxes") - h("Operating income (EBIT)") + h("Interest expense")
    rev, debt, sh, eq = rev0, debt0, shares0, h("Shareholders' equity")
    rows = []
    for n, y in enumerate(FY, 1):
        prev_rev, prev_debt, prev_sh = rev, debt, sh
        rev = prev_rev * (1 + gr); opr = or0 + (or30 - or0) * n / 5
        ebit = rev - rev * opr; da = rev * dap; ebitda = ebit + da
        interest = kd * prev_debt; pretax = ebit - interest + other; ni = pretax - pretax * tax
        capex = rev * cxp; dnwc = (rev - prev_rev) * nwcp; div = ni * pay
        debt = levt * ebitda; ddebt = debt - prev_debt
        buy = ni + da - capex - dnwc - div + ddebt
        sh = prev_sh - buy / (price * (1 + ke) ** (n - 0.5)); eps = ni / ((prev_sh + sh) / 2)
        eq = eq + ni - div - buy
        fcf = ebit - ebit * tax + da - capex - dnwc
        rows.append(dict(year=y, revenue=rev, op_ratio=opr, ebit=ebit, da=da, ebitda=ebitda, interest=interest, ni=ni, capex=capex, dnwc=dnwc, div=div, buyback=buy, debt=debt, shares=sh, eps=eps, equity=eq, fcf=fcf))
    pv = sum(x["fcf"] / (1 + wacc) ** (n - 0.5) for n, x in enumerate(rows, 1))
    tv = rows[-1]["fcf"] * (1 + tg) / (wacc - tg); pv_tv = tv / (1 + wacc) ** 4.5
    ev = pv + pv_tv; pension = pension_net * (1 - tax)
    equity = ev - debt0 + cash0 + pension; ps0 = equity / shares0
    ps = ps0 * (1 + ke) ** elapsed - dps * elapsed
    return dict(rows=rows, beta=beta, ke=ke, wacc=wacc, tg=tg, pv_fcf=pv, tv=tv, pv_tv=pv_tv, ev=ev, pension=pension, equity=equity, per_share_fy=ps0, per_share=ps,
                premium=ps / price - 1, tv_share=pv_tv / ev, tv_multiple=tv / (rows[-1]["ebitda"] * (1 + tg)), ev_ebitda_0=ev / (h("Operating income (EBIT)") + h("Depreciation and amortization")))
RES = {k: engine(v) for k, v in SCEN.items()}; B = RES["Base"]
WG = [B["wacc"] + d for d in (-0.010, -0.005, 0, 0.005, 0.010)]; GG = [0.015, 0.020, 0.025, 0.030, 0.035]
GRID = [[engine(SCEN["Base"], w, x)["per_share"] for x in GG] for w in WG]
OG = [0.58, 0.59, 0.60, 0.61, 0.62]; RG = [0.02, 0.03, 0.04, 0.05, 0.06]
GRID2 = [[engine((rg, o) + SCEN["Base"][2:])["per_share"] for rg in RG] for o in OG]
def solve(fn, lo, hi):
    for _ in range(80):
        mid = (lo + hi) / 2
        if fn(mid) > price: hi = mid
        else: lo = mid
    return (lo + hi) / 2
implied_g = solve(lambda x: engine(SCEN["Base"], None, x)["per_share"], 0.0, B["wacc"] - 0.002)
implied_w = solve(lambda x: -engine(SCEN["Base"], x)["per_share"] + 2 * price, 0.03, 0.12)   # value falls as WACC rises
implied_gr = solve(lambda x: engine((x,) + SCEN["Base"][1:])["per_share"], 0.0, 0.25)

# ---------- comparables ----------
P = M["peers"]; TK = {"UNP": "UNP", "CSX": "CSX", "NSC": "NSC", "CP": "CP.TO"}
NAMES = {"UNP": "Union Pacific", "CSX": "CSX", "NSC": "Norfolk Southern", "CP": "Canadian Pacific Kansas City"}
COMPS = []
for k in ["CP", "UNP", "CSX", "NSC"]:
    p = P[k]; COMPS.append(dict(name=NAMES[k], ccy=p["unit"], price=round(M["prices"][TK[k]]["price"], 2), shares=p["shares"] / 1e6, debt=(p["debt_lt"] + p["debt_cur"]) / 1e6,
                                cash=p["cash"] / 1e6, revenue=p["revenue"] / 1e6, ebit=p["ebit"] / 1e6, da=p["da"] / 1e6, ni=p["ni"] / 1e6, eps=p["eps"]))
CN = dict(name="Canadian National", ccy="CAD", price=price, shares=shares0, debt=debt0, cash=cash0, revenue=h("Revenue"), ebit=h("Operating income (EBIT)"), da=h("Depreciation and amortization"),
          ni=h("Net income"), eps=h("Net income") / h("Diluted weighted-average shares (m)"))
def mult(c):
    ev = c["price"] * c["shares"] + c["debt"] - c["cash"]
    return dict(mcap=c["price"] * c["shares"], ev=ev, ev_ebitda=ev / (c["ebit"] + c["da"]), ev_ebit=ev / c["ebit"], pe=c["price"] / c["eps"], op_ratio=1 - c["ebit"] / c["revenue"])
for c in COMPS + [CN]: c.update(mult(c))
med = {k: float(np.median([c[k] for c in COMPS])) for k in ("ev_ebitda", "ev_ebit", "pe")}
lo = {k: min(c[k] for c in COMPS) for k in med}; hi = {k: max(c[k] for c in COMPS) for k in med}
def implied(k, v):
    if k == "pe": return v * CN["eps"]
    base = CN["ebit"] + CN["da"] if k == "ev_ebitda" else CN["ebit"]
    return (v * base - debt0 + cash0) / shares0
IMPL = {k: dict(low=implied(k, lo[k]), median=implied(k, med[k]), high=implied(k, hi[k])) for k in med}

# ---------- workbook ----------
wb = Workbook(); NAVY = "1F2A44"
BLUE = Font(name="Calibri", size=10, color="0000FF"); BLK = Font(name="Calibri", size=10); BOLD = Font(name="Calibri", size=10, bold=True)
HDR = Font(name="Calibri", size=10, bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor=NAVY); SUB = PatternFill("solid", fgColor="E9ECF2"); KEY = PatternFill("solid", fgColor="FFF4CC")
TOP = Border(top=Side(style="thin", color="000000"))
N0, N1, N2, PC, PC2, MX = '#,##0;(#,##0);"–"', '#,##0.0;(#,##0.0);"–"', '#,##0.00;(#,##0.00);"–"', '0.0%;(0.0%);"–"', '0.00%', '0.0"x"'
def sheet(name, widths, title, sub=""):
    ws = wb.create_sheet(name); ws.sheet_view.showGridLines = False
    for i, w in enumerate(widths, 1): ws.column_dimensions[L(i)].width = w
    ws["B1"] = title; ws["B1"].font = Font(name="Calibri", size=14, bold=True, color=NAVY); ws["B2"] = sub; ws["B2"].font = Font(name="Calibri", size=9, italic=True, color="666666")
    return ws
def put(ws, ref, v, fmt=None, font=None, fill=None, align=None, border=None):
    c = ws[ref]; c.value = v; c.font = font or (BLK if isinstance(v, str) and v.startswith("=") else BLK)
    if fmt: c.number_format = fmt
    if fill: c.fill = fill
    if align: c.alignment = Alignment(horizontal=align)
    if border: c.border = border
    return c
def header(ws, row, labels, c0=2):
    for i, t in enumerate(labels):
        put(ws, f"{L(c0+i)}{row}", t, font=HDR, fill=HF, align="left" if i == 0 else "right")
def section(ws, row, text, ncol):
    for i in range(2, 2 + ncol): ws[f"{L(i)}{row}"].fill = SUB
    put(ws, f"B{row}", text, font=BOLD, fill=SUB)

# Inputs
wi = sheet("Inputs", [2, 46, 14, 14, 14, 14, 50], "Inputs and assumptions", "Blue = hard-coded input. Black = formula. Change the scenario switch in C4 and the whole model updates.")
put(wi, "B4", "Scenario switch (1 = Base, 2 = Upside, 3 = Downside)", font=BOLD); put(wi, "C4", 1, font=BLUE, fill=KEY, align="right")
put(wi, "D4", '=CHOOSE(C4,"Base","Upside","Downside")', font=BOLD)
header(wi, 7, ["Operating drivers", "Base", "Upside", "Downside", "Live"])
DF = [PC, PC, PC, PC, PC, PC, PC, PC, MX]
NOTE = ["Volume plus price. 2018–2025 revenue CAGR was %.1f%%." % ((h("Revenue") / h("Revenue", 2018)) ** (1 / 7) * 100 - 100), "FY2025 actual was %.1f%%. Glides linearly from there." % ((1 - h("Operating income (EBIT)") / h("Revenue")) * 100),
        "FY2025 actual.", "Average of FY2021–FY2025.", "Receivables plus supplies less payables.", "FY2025 effective rate was %.1f%%." % (h("Income tax expense") / h("Income before income taxes") * 100),
        "Long-run nominal GDP growth; Bank of Canada inflation target is 2%.", "FY2025 actual.", "FY2025 actual. Debt grows with EBITDA."]
for i, d in enumerate(DRIVERS):
    r_ = 8 + i; put(wi, f"B{r_}", d)
    for j, s in enumerate(["Base", "Upside", "Downside"]): put(wi, f"{L(3+j)}{r_}", SCEN[s][i], DF[i], BLUE, align="right")
    put(wi, f"F{r_}", f"=CHOOSE($C$4,C{r_},D{r_},E{r_})", DF[i], BOLD, KEY); put(wi, f"G{r_}", NOTE[i], font=Font(name="Calibri", size=9, italic=True, color="666666"))
header(wi, 19, ["Market and capital inputs", "Value", "", "", "", "Source"])
MK = [("Share price, CNR on TSX (CAD)", price, N2, f"Yahoo Finance, close {price_date}"), ("Price date", dt.date.fromisoformat(price_date), "yyyy-mm-dd", ""),
      ("Shares outstanding (millions)", shares0, N1, "CN annual report, 31 Dec 2025"), ("Total debt incl. current portion (CAD m)", debt0, N0, "CN annual report, 31 Dec 2025"),
      ("Cash and cash equivalents (CAD m)", cash0, N0, "CN annual report, 31 Dec 2025"), ("Net pension asset, pre-tax (CAD m)", pension_net, N0, "Pension asset less pension and OPEB liability"),
      ("Risk-free rate: Government of Canada 10-year", rf, PC2, f"Bank of Canada, {M['rf']['date']}"), ("Equity risk premium", ERP, PC2, "Assumption; within the 4–6% range of published estimates"),
      ("Raw beta vs S&P/TSX Composite", raw_beta, N2, "Regression, 60 monthly returns to " + r.index[-1][:7]), ("Pre-tax cost of debt", kd, PC2, "FY2025 interest expense / average debt"),
      ("Balance sheet date", dt.date(2025, 12, 31), "yyyy-mm-dd", ""), ("Dividends per share, FY2025 (CAD)", dps, N2, "Dividends paid / diluted shares")]
for i, (lab, v, fmt, src) in enumerate(MK):
    r_ = 20 + i; put(wi, f"B{r_}", lab); put(wi, f"C{r_}", v, fmt, BLUE, align="right"); put(wi, f"G{r_}", src, font=Font(name="Calibri", size=9, italic=True, color="666666"))
I = dict(gr="Inputs!$F$8", or30="Inputs!$F$9", dap="Inputs!$F$10", cxp="Inputs!$F$11", nwc="Inputs!$F$12", tax="Inputs!$F$13", tg="Inputs!$F$14", pay="Inputs!$F$15", lev="Inputs!$F$16",
         price="Inputs!$C$20", pdate="Inputs!$C$21", sh="Inputs!$C$22", debt="Inputs!$C$23", cash="Inputs!$C$24", pens="Inputs!$C$25", rf="Inputs!$C$26", erp="Inputs!$C$27", beta="Inputs!$C$28",
         kd="Inputs!$C$29", bsdate="Inputs!$C$30", dps="Inputs!$C$31")

# Historical
wh = sheet("Historical", [2, 40] + [11] * 8, "Historical financials, FY2018–FY2025", "CAD millions, US GAAP, as filed with the SEC (annual Form 6-K XBRL). Blue cells are filed values; black cells are formulas.")
header(wh, 4, ["Fiscal year ended 31 December"] + [f"{y}A" for y in YRS]); HR = {}
def hrow(r_, key, fmt=N0, bold=False):
    HR[key] = r_; put(wh, f"B{r_}", key, font=BOLD if bold else BLK)
    for j, y in enumerate(YRS):
        v = HIST[key][y]
        if not math.isnan(v): put(wh, f"{L(3+j)}{r_}", float(v), fmt, BLUE)
def hform(r_, label, fn, fmt=N0, bold=False, start=0):
    HR[label] = r_; put(wh, f"B{r_}", label, font=BOLD if bold else BLK)
    for j in range(start, 8): put(wh, f"{L(3+j)}{r_}", fn(L(3 + j), L(2 + j)), fmt, BOLD if bold else BLK)
section(wh, 5, "Income statement", 9)
for r_, k in [(6, "Revenue"), (7, "Labor and fringe benefits"), (8, "Fuel"), (9, "Depreciation and amortization")]: hrow(r_, k)
hform(10, "Other operating expenses", lambda c, p: f"={c}11-{c}7-{c}8-{c}9"); hrow(11, "Total operating expenses"); hrow(12, "Operating income (EBIT)", bold=True); hrow(13, "Interest expense")
hform(14, "Other income, incl. pension", lambda c, p: f"={c}15-{c}12+{c}13"); hrow(15, "Income before income taxes"); hrow(16, "Income tax expense"); hrow(17, "Net income", bold=True)
hrow(18, "Diluted weighted-average shares (m)", N1); hform(19, "Diluted earnings per share (CAD)", lambda c, p: f"={c}17/{c}18", N2, True)
section(wh, 21, "Cash flow", 9); hrow(22, "Cash from operating activities"); hrow(23, "Property additions (capex)"); hform(24, "Free cash flow (CFO less capex)", lambda c, p: f"={c}22-{c}23", N0, True)
hrow(25, "Dividends paid"); hrow(26, "Share repurchases")
section(wh, 28, "Balance sheet", 9)
for i, k in enumerate(["Cash and cash equivalents", "Accounts receivable", "Material and supplies", "Accounts payable and other", "Properties, net", "Total assets", "Total debt (incl. current)", "Shareholders' equity", "Pension asset", "Pension and OPEB liability"]): hrow(29 + i, k)
hrow(39, "Shares outstanding, year-end (m)", N1)
section(wh, 41, "Ratios", 9)
hform(42, "Revenue growth", lambda c, p: f"={c}6/{p}6-1", PC, start=1); hform(43, "Operating ratio", lambda c, p: f"={c}11/{c}6", PC); hform(44, "EBITDA margin", lambda c, p: f"=({c}12+{c}9)/{c}6", PC)
hform(45, "Capex, % of revenue", lambda c, p: f"={c}23/{c}6", PC); hform(46, "D&A, % of revenue", lambda c, p: f"={c}9/{c}6", PC); hform(47, "Effective tax rate", lambda c, p: f"={c}16/{c}15", PC)
hform(48, "Total debt / EBITDA", lambda c, p: f"={c}35/({c}12+{c}9)", MX); hform(49, "Dividend payout", lambda c, p: f"={c}25/{c}17", PC); hform(50, "Return on equity", lambda c, p: f"={c}17/(({c}36+{p}36)/2)", PC, start=1)
hform(51, "Free cash flow conversion (FCF / net income)", lambda c, p: f"={c}24/{c}17", PC)

# WACC
ww = sheet("WACC", [2, 44, 14, 52], "Cost of capital", "Capital asset pricing model for equity; market-value weights.")
WR = [("Risk-free rate", f"={I['rf']}", PC2, ""), ("Raw beta", f"={I['beta']}", N2, ""), ("Adjusted beta", "=0.67*C5+0.33", N2, "Blume adjustment toward 1.0"), ("Equity risk premium", f"={I['erp']}", PC2, ""),
      ("Cost of equity", "=C4+C6*C7", PC2, "Risk-free rate + adjusted beta × equity risk premium"), ("Pre-tax cost of debt", f"={I['kd']}", PC2, ""), ("Tax rate", f"={I['tax']}", PC2, ""),
      ("After-tax cost of debt", "=C9*(1-C10)", PC2, ""), ("Market value of equity (CAD m)", f"={I['price']}*{I['sh']}", N0, "Share price × shares outstanding"), ("Debt (CAD m)", f"={I['debt']}", N0, "Book value used as proxy for market value"),
      ("Equity weight", "=C12/(C12+C13)", PC, ""), ("Debt weight", "=C13/(C12+C13)", PC, ""), ("Weighted average cost of capital (WACC)", "=C14*C8+C15*C11", PC2, "")]
header(ww, 3, ["Component", "Value", "Note"])
for i, (lab, f_, fmt, note) in enumerate(WR):
    r_ = 4 + i; bold = lab.startswith(("Cost of equity", "Weighted")); put(ww, f"B{r_}", lab, font=BOLD if bold else BLK); put(ww, f"C{r_}", f_, fmt, BOLD if bold else BLK, KEY if bold else None); put(ww, f"D{r_}", note, font=Font(name="Calibri", size=9, italic=True, color="666666"))
KE, WACC = "WACC!$C$8", "WACC!$C$16"

# Forecast
wf = sheet("Forecast", [2, 44] + [12] * 6, "Forecast: income statement, cash flow, balance sheet", "CAD millions. FY2025 is actual; FY2026–FY2030 are driven by the Inputs sheet.")
header(wf, 4, ["Fiscal year"] + ["2025A"] + [f"{y}E" for y in FY])
def frow(r_, label, c_formula, fn, fmt=N0, bold=False, border=False):
    put(wf, f"B{r_}", label, font=BOLD if bold else BLK)
    if c_formula is not None: put(wf, f"C{r_}", c_formula, fmt, BOLD if bold else BLK, border=TOP if border else None)
    for n in range(1, 6):
        c, p = L(3 + n), L(2 + n); put(wf, f"{c}{r_}", fn(c, p, n), fmt, BOLD if bold else BLK, border=TOP if border else None)
HJ = lambda key: f"Historical!$J${HR[key]}"
section(wf, 5, "Income statement", 7)
frow(6, "Revenue", f"={HJ('Revenue')}", lambda c, p, n: f"={p}6*(1+{I['gr']})", bold=True)
frow(7, "  growth", None, lambda c, p, n: f"={c}6/{p}6-1", PC)
frow(8, "Operating ratio", f"=1-{HJ('Operating income (EBIT)')}/{HJ('Revenue')}", lambda c, p, n: f"=$C$8+({I['or30']}-$C$8)*{n}/5", PC)
frow(9, "Operating expenses", "=C6*C8", lambda c, p, n: f"={c}6*{c}8")
frow(10, "Operating income (EBIT)", "=C6-C9", lambda c, p, n: f"={c}6-{c}9", bold=True, border=True)
frow(11, "Depreciation and amortization", f"={HJ('Depreciation and amortization')}", lambda c, p, n: f"={c}6*{I['dap']}")
frow(12, "EBITDA", "=C10+C11", lambda c, p, n: f"={c}10+{c}11")
frow(13, "Interest expense", f"={HJ('Interest expense')}", lambda c, p, n: f"={I['kd']}*{p}41")
frow(14, "Other income, incl. pension", f"={HJ('Other income, incl. pension')}", lambda c, p, n: "=$C$14")
frow(15, "Income before income taxes", "=C10-C13+C14", lambda c, p, n: f"={c}10-{c}13+{c}14")
frow(16, "Income tax expense", f"={HJ('Income tax expense')}", lambda c, p, n: f"={c}15*{I['tax']}")
frow(17, "Net income", "=C15-C16", lambda c, p, n: f"={c}15-{c}16", bold=True, border=True)
frow(18, "Shares outstanding, year-end (m)", f"={I['sh']}", lambda c, p, n: f"={p}18-{c}30/{c}19", N1)
frow(19, "Assumed repurchase price (CAD)", None, lambda c, p, n: f"={I['price']}*(1+{KE})^({n}-0.5)", N2)
frow(20, "Earnings per share (CAD)", f"={HJ('Diluted earnings per share (CAD)')}", lambda c, p, n: f"={c}17/(({p}18+{c}18)/2)", N2, True)
frow(21, "  growth", None, lambda c, p, n: f"={c}20/{p}20-1", PC)
section(wf, 23, "Cash flow", 7)
frow(24, "Net income", "=C17", lambda c, p, n: f"={c}17")
frow(25, "Depreciation and amortization", "=C11", lambda c, p, n: f"={c}11")
frow(26, "Capital expenditure", f"={HJ('Property additions (capex)')}", lambda c, p, n: f"={c}6*{I['cxp']}")
frow(27, "Increase in net working capital", None, lambda c, p, n: f"=({c}6-{p}6)*{I['nwc']}")
frow(28, "Dividends", f"={HJ('Dividends paid')}", lambda c, p, n: f"={c}17*{I['pay']}")
frow(29, "Net debt issued", None, lambda c, p, n: f"={c}41-{p}41")
frow(30, "Share repurchases (balancing item)", f"={HJ('Share repurchases')}", lambda c, p, n: f"={c}24+{c}25-{c}26-{c}27-{c}28+{c}29")
frow(31, "Change in cash", None, lambda c, p, n: f"={c}24+{c}25-{c}26-{c}27-{c}28+{c}29-{c}30", bold=True, border=True)
section(wf, 33, "Balance sheet (condensed)", 7)
frow(34, "Cash", f"={HJ('Cash and cash equivalents')}", lambda c, p, n: f"={p}34+{c}31")
frow(35, "Net working capital", f"={HJ('Accounts receivable')}+{HJ('Material and supplies')}-{HJ('Accounts payable and other')}", lambda c, p, n: f"={p}35+{c}27")
frow(36, "Properties, net", f"={HJ('Properties, net')}", lambda c, p, n: f"={p}36+{c}26-{c}25")
frow(37, "Other net assets (held flat)", "=C41+C42-C34-C35-C36", lambda c, p, n: f"={p}37")
frow(38, "Net assets", "=SUM(C34:C37)", lambda c, p, n: f"=SUM({c}34:{c}37)", bold=True, border=True)
frow(41, "Debt", f"={I['debt']}", lambda c, p, n: f"={I['lev']}*{c}12")
frow(42, "Shareholders' equity", f"={HJ(chr(83)+'hareholders'+chr(39)+' equity')}", lambda c, p, n: f"={p}42+{c}17-{c}28-{c}30")
frow(43, "Debt plus equity", "=C41+C42", lambda c, p, n: f"={c}41+{c}42", bold=True, border=True)
frow(44, "Balance check (should be zero)", "=C38-C43", lambda c, p, n: f"={c}38-{c}43", N2)
section(wf, 46, "Unlevered free cash flow", 7)
frow(47, "Operating income (EBIT)", "=C10", lambda c, p, n: f"={c}10")
frow(48, "Less: taxes on EBIT", f"=C47*{I['tax']}", lambda c, p, n: f"={c}47*{I['tax']}")
frow(49, "Net operating profit after tax", "=C47-C48", lambda c, p, n: f"={c}47-{c}48", border=True)
frow(50, "Plus: depreciation and amortization", "=C11", lambda c, p, n: f"={c}11")
frow(51, "Less: capital expenditure", "=C26", lambda c, p, n: f"={c}26")
frow(52, "Less: increase in net working capital", None, lambda c, p, n: f"={c}27")
frow(53, "Unlevered free cash flow", "=C49+C50-C51", lambda c, p, n: f"={c}49+{c}50-{c}51-{c}52", bold=True, border=True)
frow(54, "Return on invested capital (NOPAT / average debt + equity)", None, lambda c, p, n: f"={c}49/(({p}43+{c}43)/2)", PC)

# DCF
wd = sheet("DCF", [2, 50, 14] + [12] * 5, "Discounted cash flow valuation", "CAD millions except per share. Mid-year convention; valued at 31 Dec 2025 and rolled forward to the price date.")
header(wd, 4, ["", ""] + [f"{y}E" for y in FY])
put(wd, "B5", "Unlevered free cash flow"); put(wd, "B6", "Discount period (years, mid-year)"); put(wd, "B7", "Discount factor"); put(wd, "B8", "Present value", font=BOLD)
for n in range(1, 6):
    c = L(3 + n); put(wd, f"{c}5", f"=Forecast!{c}53", N0); put(wd, f"{c}6", n - 0.5, N1); put(wd, f"{c}7", f"=1/(1+{WACC})^{c}6", "0.000"); put(wd, f"{c}8", f"={c}5*{c}7", N0, BOLD)
DR = [(10, "WACC", f"={WACC}", PC2, 0), (11, "Terminal growth rate", f"={I['tg']}", PC2, 0), (12, "Sum of present values, FY2026–FY2030", "=SUM(D8:H8)", N0, 0),
      (13, "Terminal value at end of FY2030 (Gordon growth)", "=H5*(1+C11)/(C10-C11)", N0, 0), (14, "Present value of terminal value", "=C13/(1+C10)^4.5", N0, 0),
      (15, "Enterprise value", "=C12+C14", N0, 1), (16, "Less: total debt", f"={I['debt']}", N0, 0), (17, "Plus: cash", f"={I['cash']}", N0, 0),
      (18, "Plus: net pension asset, after tax", f"={I['pens']}*(1-{I['tax']})", N0, 0), (19, "Equity value", "=C15-C16+C17+C18", N0, 1), (20, "Shares outstanding (m)", f"={I['sh']}", N1, 0),
      (21, "Value per share at 31 Dec 2025 (CAD)", "=C19/C20", N2, 1), (22, "Years from balance sheet date to price date", f"=({I['pdate']}-{I['bsdate']})/365", N2, 0),
      (23, "Value per share at price date (CAD)", f"=C21*(1+{KE})^C22-{I['dps']}*C22", N2, 2), (24, "Current share price (CAD)", f"={I['price']}", N2, 0),
      (25, "Intrinsic value vs price", "=C23/C24-1", PC, 2), (27, "Terminal value, % of enterprise value", "=C14/C15", PC, 0),
      (28, "Terminal value / FY2031 EBITDA (implied exit multiple)", "=C13/(Forecast!H12*(1+C11))", MX, 0), (29, "Enterprise value / FY2025 EBITDA (implied)", "=C15/Forecast!C12", MX, 0),
      (30, "Enterprise value at market price / FY2025 EBITDA", f"=({I['price']}*{I['sh']}+{I['debt']}-{I['cash']})/Forecast!C12", MX, 0)]
for r_, lab, f_, fmt, lvl in DR: put(wd, f"B{r_}", lab, font=BOLD if lvl else BLK); put(wd, f"C{r_}", f_, fmt, BOLD if lvl else BLK, KEY if lvl == 2 else None, border=TOP if lvl else None)

# Sensitivity
wsn = sheet("Sensitivity", [2, 30] + [13] * 5, "Sensitivity analysis", "Value per share at the price date (CAD). The first table is live formulas; the second is computed by build_model.py for the Base case.")
put(wsn, "B4", "WACC (rows) × terminal growth (columns)", font=BOLD); header(wsn, 5, ["WACC \\ terminal growth"] + ["" for _ in GG])
for j, x in enumerate(GG): put(wsn, f"{L(3+j)}5", x, PC, HDR, HF, "right")
for i, d in enumerate((-0.010, -0.005, 0, 0.005, 0.010)):
    r_ = 6 + i; put(wsn, f"B{r_}", f"={WACC}+({d})", PC2, BOLD)
    for j in range(5):
        c = L(3 + j)
        put(wsn, f"{c}{r_}", f"=((SUMPRODUCT(DCF!$D$5:$H$5/(1+$B{r_})^DCF!$D$6:$H$6)+DCF!$H$5*(1+{c}$5)/($B{r_}-{c}$5)/(1+$B{r_})^4.5-{I['debt']}+{I['cash']}+DCF!$C$18)/{I['sh']})*(1+{KE})^DCF!$C$22-{I['dps']}*DCF!$C$22", N0, BOLD if (i, j) == (2, 2) else BLK, KEY if (i, j) == (2, 2) else None)
put(wsn, "B13", "2030 operating ratio (rows) × revenue growth (columns), Base case, static", font=BOLD); header(wsn, 14, ["Operating ratio \\ growth"] + ["" for _ in RG])
for j, x in enumerate(RG): put(wsn, f"{L(3+j)}14", x, PC, HDR, HF, "right")
for i, o in enumerate(OG):
    put(wsn, f"B{15+i}", o, PC, BOLD)
    for j in range(5): put(wsn, f"{L(3+j)}{15+i}", round(GRID2[i][j], 2), N0, BLUE)
put(wsn, "B22", "Reverse DCF: what the market price implies (Base case, static)", font=BOLD)
for i, (lab, v, fmt) in enumerate([("Terminal growth implied by the share price", implied_g, PC2), ("WACC implied by the share price", implied_w, PC2), ("Five-year revenue growth implied by the share price", implied_gr, PC2)]):
    put(wsn, f"B{23+i}", lab); put(wsn, f"C{23+i}", round(v, 4), fmt, BLUE)

# Comps
wc = sheet("Comps", [2, 30, 6, 10, 10, 12, 11, 10, 12, 11, 10, 10, 11, 10, 10, 11, 11, 9, 10], "Comparable companies: Class I railroads", "FY2025 results as filed with the SEC; share prices at the price date. Local currency, millions except per share. Multiples are currency-neutral.")
CH = ["Company", "Ccy", "Price", "Shares", "Market cap", "Debt", "Cash", "Ent. value", "Revenue", "EBIT", "D&A", "EBITDA", "Net income", "EPS", "EV/EBITDA", "EV/EBIT", "P/E", "Op. ratio"]
header(wc, 4, CH)
for i, c in enumerate(COMPS + [CN]):
    r_ = 5 + i if i < 4 else 11; isCN = i == 4
    put(wc, f"B{r_}", c["name"], font=BOLD if isCN else BLK); put(wc, f"C{r_}", c["ccy"])
    if isCN:
        for col, f_, fmt in [("D", f"={I['price']}", N2), ("E", f"={I['sh']}", N1), ("G", f"={I['debt']}", N0), ("H", f"={I['cash']}", N0), ("J", "=Forecast!C6", N0), ("K", "=Forecast!C10", N0), ("L", "=Forecast!C11", N0), ("N", "=Forecast!C17", N0), ("O", "=Forecast!C20", N2)]: put(wc, f"{col}{r_}", f_, fmt)
    else:
        for col, k, fmt in [("D", "price", N2), ("E", "shares", N1), ("G", "debt", N0), ("H", "cash", N0), ("J", "revenue", N0), ("K", "ebit", N0), ("L", "da", N0), ("N", "ni", N0), ("O", "eps", N2)]: put(wc, f"{col}{r_}", float(c[k]), fmt, BLUE)
    for col, f_, fmt in [("F", f"=D{r_}*E{r_}", N0), ("I", f"=F{r_}+G{r_}-H{r_}", N0), ("M", f"=K{r_}+L{r_}", N0), ("P", f"=I{r_}/M{r_}", MX), ("Q", f"=I{r_}/K{r_}", MX), ("R", f"=D{r_}/O{r_}", MX), ("S", f"=1-K{r_}/J{r_}", PC)]: put(wc, f"{col}{r_}", f_, fmt, BOLD if isCN else BLK)
for r_, lab, fn in [(9, "Peer median", "MEDIAN"), (10, "Peer low – high", None)]:
    put(wc, f"B{r_}", lab, font=BOLD)
    for col in "PQR":
        if fn: put(wc, f"{col}{r_}", f"=MEDIAN({col}5:{col}8)", MX, BOLD, border=TOP)
        else: put(wc, f"{col}{r_}", f'=TEXT(MIN({col}5:{col}8),"0.0")&" – "&TEXT(MAX({col}5:{col}8),"0.0")', None, BLK, align="right")
    if fn: put(wc, f"S{r_}", "=MEDIAN(S5:S8)", PC, BOLD, border=TOP)
put(wc, "B14", "CN value per share implied by peer multiples (CAD)", font=BOLD); header(wc, 15, ["Multiple", "", "Low", "Median", "High"])
for i, (lab, col, kind) in enumerate([("EV / EBITDA", "P", "ev"), ("EV / EBIT", "Q", "ev"), ("P / E", "R", "pe")]):
    r_ = 16 + i; put(wc, f"B{r_}", lab)
    for j, fn in enumerate(["MIN", "MEDIAN", "MAX"]):
        base = {"P": "$M$11", "Q": "$K$11"}.get(col)
        f_ = f"={fn}({col}$5:{col}$8)*$O$11" if kind == "pe" else f"=({fn}({col}$5:{col}$8)*{base}-$G$11+$H$11)/$E$11"
        put(wc, f"{L(4+j)}{r_}", f_, N0, BOLD if j == 1 else BLK)
put(wc, "B20", "Note: Norfolk Southern is subject to an agreed merger with Union Pacific, so its price reflects deal terms as well as fundamentals. Peer pension surpluses and equity investments are not adjusted.", font=Font(name="Calibri", size=9, italic=True, color="666666"))

# Summary
wsu = sheet("Summary", [2, 44, 14, 14, 14, 40], "Valuation summary", "All figures CAD per share unless stated. Live formulas except where marked static.")
put(wsu, "B4", "Scenario shown in the DCF row below", font=BOLD); put(wsu, "C4", "=Inputs!D4", font=BOLD, fill=KEY, align="right")
header(wsu, 6, ["Method", "Low", "Mid", "High", "Basis"])
SR = [("DCF, live scenario, WACC ± 0.5% and g ± 0.5%", "=Sensitivity!D9", "=DCF!C23", "=Sensitivity!F7", "Sensitivity grid corners around the selected scenario"),
      ("DCF, three scenarios (static)", round(RES["Downside"]["per_share"], 2), round(RES["Base"]["per_share"], 2), round(RES["Upside"]["per_share"], 2), "Downside / Base / Upside, from build_model.py"),
      ("Peers: EV / EBITDA", "=Comps!D16", "=Comps!E16", "=Comps!F16", "FY2025, four Class I railroads"), ("Peers: EV / EBIT", "=Comps!D17", "=Comps!E17", "=Comps!F17", ""), ("Peers: P / E", "=Comps!D18", "=Comps!E18", "=Comps!F18", "")]
for i, (lab, a, b, c, basis) in enumerate(SR):
    r_ = 7 + i; put(wsu, f"B{r_}", lab)
    for col, v in zip("CDE", (a, b, c)): put(wsu, f"{col}{r_}", v, N0, BLUE if not isinstance(v, str) else (BOLD if col == "D" else BLK))
    put(wsu, f"F{r_}", basis, font=Font(name="Calibri", size=9, italic=True, color="666666"))
put(wsu, "B13", "Current share price", font=BOLD); put(wsu, "D13", f"={I['price']}", N2, BOLD, KEY)
put(wsu, "B14", "DCF value vs price (selected scenario)"); put(wsu, "D14", "=DCF!C25", PC, BOLD)
put(wsu, "B16", "Model integrity checks", font=BOLD)
CK = [("Forecast balance sheet balances in every year", '=IF(MAX(ABS(Forecast!C44),ABS(Forecast!D44),ABS(Forecast!E44),ABS(Forecast!F44),ABS(Forecast!G44),ABS(Forecast!H44))<0.01,"OK","ERROR")'),
      ("Forecast cash is unchanged (repurchases absorb free cash)", '=IF(ABS(Forecast!H34-Forecast!C34)<0.01,"OK","ERROR")'), ("WACC exceeds terminal growth", '=IF(DCF!C10>DCF!C11,"OK","ERROR")'),
      ("Historical opex ties: revenue less expenses equals EBIT (FY2025)", '=IF(ABS(Historical!J6-Historical!J11-Historical!J12)<1,"OK","ERROR")'),
      ("Sensitivity centre cell equals DCF value", '=IF(ABS(Sensitivity!E8-DCF!C23)<0.01,"OK","ERROR")')]
for i, (lab, f_) in enumerate(CK): put(wsu, f"B{17+i}", lab); put(wsu, f"C{17+i}", f_, font=BOLD, align="right")
put(wsu, "B24", "This workbook is an educational valuation exercise built from public filings. It is not investment advice or a recommendation to buy or sell any security.", font=Font(name="Calibri", size=9, italic=True, color="666666"))

# Cover
wcv = wb["Sheet"]; wcv.title = "Cover"; wcv.sheet_view.showGridLines = False; wcv.column_dimensions["A"].width = 2; wcv.column_dimensions["B"].width = 24; wcv.column_dimensions["C"].width = 96
put(wcv, "B2", "Canadian National Railway (TSX: CNR)", font=Font(name="Calibri", size=18, bold=True, color=NAVY)); put(wcv, "B3", "Discounted cash flow and comparable-company valuation", font=Font(name="Calibri", size=12, color="444444"))
CV = [("Prepared by", "Matin Saiyed"), ("Price date", price_date), ("Financials", "FY2018–FY2025, US GAAP, CAD millions, from XBRL data filed with the U.S. SEC (EDGAR)"), ("Market data", "Yahoo Finance (prices); Bank of Canada Valet API (10-year yield)"),
      ("", ""), ("Inputs", "Scenario switch, operating drivers, market and capital inputs. Start here."), ("Historical", "Eight years of filed income statement, cash flow and balance sheet items, with ratios"), ("Forecast", "Five-year income statement, cash flow, condensed balance sheet and unlevered free cash flow"),
      ("WACC", "Cost of equity (CAPM), cost of debt, market-value weights"), ("DCF", "Present values, terminal value, bridge from enterprise value to value per share"), ("Sensitivity", "WACC × terminal growth (live), operating ratio × growth, reverse DCF"),
      ("Comps", "Four Class I railroad peers and the CN value their multiples imply"), ("Summary", "Value ranges by method and model integrity checks"), ("", ""),
      ("Colour code", "Blue font = hard-coded input or filed figure. Black = formula. Yellow fill = key output or switch."), ("Reproducibility", "Generated by build_model.py from data/cn_facts.csv and data/market.json. Run download.py, market.py, build_model.py."),
      ("Disclaimer", "Educational exercise using public information only. Not investment advice. Views are the author's own and not those of any employer.")]
for i, (a, b) in enumerate(CV): put(wcv, f"B{5+i}", a, font=BOLD); put(wcv, f"C{5+i}", b)
wb._sheets = [wb[n] for n in ["Cover", "Summary", "Inputs", "Historical", "Forecast", "WACC", "DCF", "Sensitivity", "Comps"]]
for ws in wb: ws.freeze_panes = "C5" if ws.title in ("Historical", "Forecast") else None
wb.save(f"{H}/CN_Valuation_Model.xlsx")

clean = lambda o: json.loads(json.dumps(o, default=float))
json.dump(clean(dict(price=price, price_date=price_date, rf=rf, erp=ERP, raw_beta=raw_beta, kd=kd, elapsed=elapsed, dps=dps, shares=shares0, debt=debt0, cash=cash0, pension_net=pension_net,
     scenarios={k: dict(zip(["growth", "op_ratio_2030", "da_pct", "capex_pct", "nwc_pct", "tax", "terminal_g", "payout", "leverage"], v)) for k, v in SCEN.items()}, results=RES,
     sens=dict(wacc=WG, g=GG, grid=GRID, op_ratio=OG, growth=RG, grid2=GRID2), reverse=dict(g=implied_g, wacc=implied_w, growth=implied_gr),
     comps=COMPS, cn=CN, comp_median=med, comp_low=lo, comp_high=hi, implied=IMPL, hist={k: {int(y): (None if math.isnan(v) else float(v)) for y, v in s.items()} for k, s in HIST.items()})), open(f"{H}/results.json", "w"), indent=1)
print(f"price {price} | beta raw {raw_beta} adj {B['beta']:.2f} | ke {B['ke']:.4f} kd {kd} WACC {B['wacc']:.4f}")
for k, v in RES.items(): print(f"{k:9} EV {v['ev']:,.0f}  per share {v['per_share']:.2f}  vs price {v['premium']:+.1%}  TV share {v['tv_share']:.0%}  exit {v['tv_multiple']:.1f}x")
print("FCF base", [round(x["fcf"]) for x in B["rows"]], "EPS", [round(x["eps"], 2) for x in B["rows"]], "buyback", [round(x["buyback"]) for x in B["rows"]])
print("implied g %.4f  wacc %.4f  growth %.4f" % (implied_g, implied_w, implied_gr))
for c in COMPS + [CN]: print(f"{c['name']:30} EV/EBITDA {c['ev_ebitda']:.1f} EV/EBIT {c['ev_ebit']:.1f} P/E {c['pe']:.1f} OR {c['op_ratio']:.1%}")
print({k: {a: round(b, 1) for a, b in v.items()} for k, v in IMPL.items()})
