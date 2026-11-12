"""Write memo.html / memo.pdf from results.json. All numbers in the text come from the results file."""
import json, os, base64, subprocess, io
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
H = os.path.dirname(os.path.abspath(__file__)); R = json.load(open(f"{H}/results.json"))
B, U, D = (R["results"][k] for k in ("Base", "Upside", "Downside")); S = R["scenarios"]; hist = R["hist"]; P = R["price"]
YR = [str(y) for y in range(2018, 2026)]; INK, RED, GRY, GRN = "#1F2A44", "#B3261E", "#9AA3B2", "#2E7D5B"
plt.rcParams.update({"font.family": "serif", "font.size": 9, "axes.spines.top": False, "axes.spines.right": False})
def save(fig, n):
    fig.savefig(f"{H}/figures/{n}", dpi=200, bbox_inches="tight"); plt.close(fig)
    return "data:image/png;base64," + base64.b64encode(open(f"{H}/figures/{n}", "rb").read()).decode()
hv = lambda k: [hist[k][y] for y in YR]
# fig 1: revenue and operating ratio
fig, ax = plt.subplots(figsize=(6.8, 2.6)); ax.bar(YR, [v / 1000 for v in hv("Revenue")], color=INK, width=.6); ax.set_ylabel("Revenue, CAD bn")
ax2 = ax.twinx(); ax2.plot(YR, [100 * e / r for e, r in zip(hv("Total operating expenses"), hv("Revenue"))], color=RED, marker="o", lw=1.6); ax2.set_ylabel("Operating ratio, %"); ax2.spines["right"].set_visible(True); ax2.set_ylim(55, 70)
ax.set_title("Figure 1. Revenue (bars) and operating ratio (line), FY2018–FY2025", loc="left", fontsize=9.5, fontweight="bold"); F1 = save(fig, "fig1_history.png")
# fig 2: cash generation vs uses
fig, ax = plt.subplots(figsize=(6.8, 2.6)); x = range(len(YR)); w = .27
ax.bar([i - w for i in x], [v / 1000 for v in hv("Cash from operating activities")], w, color=INK, label="Cash from operations"); ax.bar(list(x), [v / 1000 for v in hv("Property additions (capex)")], w, color=GRY, label="Capital expenditure")
ax.bar([i + w for i in x], [(a + b) / 1000 for a, b in zip(hv("Dividends paid"), hv("Share repurchases"))], w, color=RED, label="Dividends + buybacks"); ax.set_xticks(list(x)); ax.set_xticklabels(YR); ax.set_ylabel("CAD bn"); ax.legend(frameon=False, ncol=3, fontsize=8, loc="upper left")
ax.set_ylim(0, 9); ax.set_title("Figure 2. Cash generated and where it went", loc="left", fontsize=9.5, fontweight="bold"); F2 = save(fig, "fig2_cash.png")
# fig 3: football field
I = R["implied"]; bars = [("DCF: Downside to Upside", D["per_share"], B["per_share"], U["per_share"]), ("DCF Base: WACC ±0.5%, g ±0.5%", R["sens"]["grid"][3][1], B["per_share"], R["sens"]["grid"][1][3]),
        ("Peers: EV / EBITDA", I["ev_ebitda"]["low"], I["ev_ebitda"]["median"], I["ev_ebitda"]["high"]), ("Peers: EV / EBIT", I["ev_ebit"]["low"], I["ev_ebit"]["median"], I["ev_ebit"]["high"]), ("Peers: P / E", I["pe"]["low"], I["pe"]["median"], I["pe"]["high"])]
fig, ax = plt.subplots(figsize=(6.8, 2.7))
for i, (lab, lo, mid, hi) in enumerate(bars[::-1]):
    ax.barh(i, hi - lo, left=lo, color=INK if "DCF" in lab else GRY, height=.5); ax.plot([mid, mid], [i - .25, i + .25], color="white", lw=2)
    ax.text(lo - 3, i, f"{lo:.0f}", ha="right", va="center", fontsize=8); ax.text(hi + 3, i, f"{hi:.0f}", ha="left", va="center", fontsize=8)
ax.set_yticks(range(len(bars))); ax.set_yticklabels([b[0] for b in bars[::-1]]); ax.axvline(P, color=RED, lw=1.4, ls="--"); ax.text(P + 2, -0.42, f"Price {P:.2f}", color=RED, fontsize=8.5, va="top"); ax.set_ylim(-0.95, len(bars) - .4)
ax.set_xlabel("CAD per share"); ax.set_xlim(50, 275); ax.set_title("Figure 3. Value per share by method (white tick = midpoint)", loc="left", fontsize=9.5, fontweight="bold"); F3 = save(fig, "fig3_football.png")
# fig 4: FCF forecast and PV split
fig, ax = plt.subplots(figsize=(6.8, 2.4)); ys = [str(r["year"]) + "E" for r in B["rows"]]
for k, c, res in (("Downside", GRY, D), ("Base", INK, B), ("Upside", GRN, U)): ax.plot(ys, [r["fcf"] / 1000 for r in res["rows"]], marker="o", color=c, label=k, lw=1.6)
ax.set_ylabel("Unlevered FCF, CAD bn"); ax.legend(frameon=False, ncol=3, fontsize=8); ax.set_title("Figure 4. Forecast unlevered free cash flow by scenario", loc="left", fontsize=9.5, fontweight="bold"); F4 = save(fig, "fig4_fcf.png")

n0 = lambda x: f"{x:,.0f}"; pc = lambda x, d=1: f"{100*x:.{d}f}%"; sg = lambda x: ("−" if x < 0 else "+") + f"{abs(100*x):.0f}%"
h25 = lambda k: hist[k]["2025"]; h18 = lambda k: hist[k]["2018"]
cagr = (h25("Revenue") / h18("Revenue")) ** (1 / 7) - 1; or25 = h25("Total operating expenses") / h25("Revenue"); ebitda25 = h25("Operating income (EBIT)") + h25("Depreciation and amortization")
ret = sum(hist["Dividends paid"][y] + hist["Share repurchases"][y] for y in YR); fcf = sum(hist["Cash from operating activities"][y] - hist["Property additions (capex)"][y] for y in YR)
eps25 = h25("Net income") / h25("Diluted weighted-average shares (m)"); eps18 = h18("Net income") / h18("Diluted weighted-average shares (m)")
def frow(lab, key, fmt=n0): return f'<tr><td class="l">{lab}</td>' + "".join(f"<td>{fmt(r[key])}</td>" for r in B["rows"]) + "</tr>"
T_F = (f'<tr><th class="l">Base case, CAD m</th>' + "".join(f'<th>{r["year"]}E</th>' for r in B["rows"]) + "</tr>" + frow("Revenue", "revenue") + frow("Operating ratio", "op_ratio", pc) + frow("Operating income (EBIT)", "ebit") + frow("EBITDA", "ebitda")
       + frow("Net income", "ni") + frow("Earnings per share (CAD)", "eps", lambda x: f"{x:.2f}") + frow("Capital expenditure", "capex") + frow("Unlevered free cash flow", "fcf") + frow("Share repurchases", "buyback"))
T_S = '<tr><th class="l">Driver</th><th>Downside</th><th>Base</th><th>Upside</th></tr>' + "".join(f'<tr><td class="l">{lab}</td>' + "".join(f"<td>{f_(S[k][key])}</td>" for k in ("Downside", "Base", "Upside")) + "</tr>"
      for lab, key, f_ in [("Revenue growth per year", "growth", pc), ("Operating ratio by 2030", "op_ratio_2030", pc), ("Capex, % of revenue", "capex_pct", pc), ("Terminal growth", "terminal_g", pc)]) + \
      "".join(f'<tr><td class="l">{lab}</td>' + "".join(f"<td>{f_(x[key])}</td>" for x in (D, B, U)) + "</tr>" for lab, key, f_ in [("Enterprise value (CAD m)", "ev", n0), ("Value per share (CAD)", "per_share", lambda x: f"{x:.0f}"), ("Versus share price", "premium", sg), ("Terminal value, % of EV", "tv_share", lambda x: pc(x, 0)), ("Implied exit EV/EBITDA", "tv_multiple", lambda x: f"{x:.1f}x")])
G = R["sens"]; T_G = '<tr><th class="l">WACC \\ terminal growth</th>' + "".join(f"<th>{pc(x)}</th>" for x in G["g"]) + "</tr>" + "".join(f'<tr><td class="l">{pc(w, 2)}</td>' + "".join(f'<td{" class=k" if (i, j) == (2, 2) else ""}>{v:.0f}</td>' for j, v in enumerate(row)) + "</tr>" for i, (w, row) in enumerate(zip(G["wacc"], G["grid"])))
T_G2 = '<tr><th class="l">2030 operating ratio \\ revenue growth</th>' + "".join(f"<th>{pc(x, 0)}</th>" for x in G["growth"]) + "</tr>" + "".join(f'<tr><td class="l">{pc(o, 0)}</td>' + "".join(f'<td{" class=k" if (i, j) == (2, 2) else ""}>{v:.0f}</td>' for j, v in enumerate(row)) + "</tr>" for i, (o, row) in enumerate(zip(G["op_ratio"], G["grid2"])))
crow = lambda c, b=False: f'<tr{" class=b" if b else ""}><td class="l">{c["name"]}</td><td>{c["ccy"]}</td><td>{n0(c["mcap"])}</td><td>{n0(c["ev"])}</td><td>{c["ev_ebitda"]:.1f}x</td><td>{c["ev_ebit"]:.1f}x</td><td>{c["pe"]:.1f}x</td><td>{pc(c["op_ratio"])}</td></tr>'
M = R["comp_median"]; T_C = '<tr><th class="l">Company</th><th>Ccy</th><th>Market cap (m)</th><th>Ent. value (m)</th><th>EV/EBITDA</th><th>EV/EBIT</th><th>P/E</th><th>Op. ratio</th></tr>' + "".join(crow(c) for c in R["comps"]) + \
      f'<tr class="b"><td class="l">Peer median</td><td></td><td></td><td></td><td>{M["ev_ebitda"]:.1f}x</td><td>{M["ev_ebit"]:.1f}x</td><td>{M["pe"]:.1f}x</td><td></td></tr>' + crow(R["cn"], True)
disc = 1 - R["cn"]["ev_ebitda"] / M["ev_ebitda"]
HTML = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Canadian National Railway: Valuation — Matin Saiyed</title><style>
@page {{ size: Letter; margin: 20mm 20mm 18mm; }} html {{ background: #fff; color-scheme: light; }} body {{ font: 10.3pt/1.48 Georgia, serif; color: #111; background: #fff; max-width: 175mm; margin: 0 auto; }}
h1 {{ font-size: 19pt; margin: 0 0 3pt; }} .sub {{ color: #444; font-size: 11pt; }} .by {{ color: #555; font-size: 9.3pt; margin: 6pt 0 12pt; }}
h2 {{ font-size: 12.3pt; margin: 16pt 0 5pt; color: {INK}; }} p {{ margin: 0 0 7pt; text-align: justify; }}
.box {{ border: 1px solid {INK}; padding: 9pt 12pt; margin: 8pt 0 12pt; }} .box p {{ margin: 0 0 5pt; text-align: left; }} .kpi {{ display: flex; gap: 10pt; margin: 8pt 0 2pt; }}
.kpi div {{ flex: 1; border-top: 2px solid {INK}; padding-top: 4pt; font-size: 8.4pt; color: #444; }} .kpi b {{ display: block; font-size: 14pt; color: #111; }}
table {{ border-collapse: collapse; width: 100%; font-size: 8.8pt; margin: 5pt 0 3pt; break-inside: avoid; }} th, td {{ padding: 3pt 5pt; text-align: right; }} th {{ border-top: 1.2px solid #111; border-bottom: .6px solid #111; }}
tr:last-child td {{ border-bottom: 1.2px solid #111; }} .l {{ text-align: left; }} .k {{ background: #FFF4CC; font-weight: 700; }} tr.b td {{ font-weight: 700; border-top: .6px solid #111; }}
.cap {{ font-weight: 700; font-size: 9.2pt; margin-top: 10pt; }} .note {{ font-size: 8.2pt; color: #444; text-align: left; }} figure {{ margin: 10pt 0; break-inside: avoid; }} img {{ width: 100%; }} ul {{ margin: 0 0 7pt 14pt; padding: 0; }} li {{ margin-bottom: 3pt; }}
</style></head><body>
<h1>Canadian National Railway (TSX: CNR)</h1><div class="sub">What is the franchise worth, and what is the share price assuming?</div>
<div class="by">Matin Saiyed · Valuation memo · Price date {R["price_date"]} · Companion workbook: CN_Valuation_Model.xlsx</div><div class="ai" style="font-size:8.6pt;color:#444;border:1px solid #999;padding:5pt 8pt;margin:0 0 12pt;text-align:left;">How this was produced: the data pipeline, analysis, figures and text were produced with Claude, an AI model made by Anthropic, at the author’s direction. The author set the brief, reviewed the output and is responsible for what is published. Code and data are public so every result can be re-run.</div>
<div class="box"><p><b>Summary.</b> CN is one of the highest-quality freight franchises in North America, and its shares trade at a discount to other Class I railroads. A discounted cash flow model built from eight years of filed financials nevertheless values the equity at about <b>C${B["per_share"]:.0f} per share</b> in the base case, {abs(100*B["premium"]):.0f}% below the C${P:.2f} market price, and at C${U["per_share"]:.0f} even in the upside case. Peer multiples point the other way, implying roughly C${I["ev_ebitda"]["median"]:.0f}.</p>
<p>The two methods disagree because the whole sector is priced richly. To justify today’s price the model needs either perpetual growth of {pc(R["reverse"]["g"])} a year, a cost of capital of {pc(R["reverse"]["wacc"])}, or five years of {pc(R["reverse"]["growth"])} annual revenue growth. My conclusion is that CN is <b>cheap relative to peers but expensive relative to its own cash flows</b>, and that the gap comes down to how much of its earnings must be reinvested in the network.</p>
<div class="kpi"><div><b>C${B["per_share"]:.0f}</b>DCF value per share, base</div><div><b>C${P:.2f}</b>Share price</div><div><b>{pc(B["wacc"], 2)}</b>WACC</div><div><b>{R["cn"]["ev_ebitda"]:.1f}x vs {M["ev_ebitda"]:.1f}x</b>EV/EBITDA, CN vs peer median</div></div></div>

<h2>1. The business</h2>
<p>CN operates a rail network connecting Canada’s Atlantic and Pacific coasts with the U.S. Gulf Coast. Freight railroads are natural duopolies or monopolies on most lanes: track cannot be replicated economically, and for bulk commodities over long distances there is no competitive substitute. That shows up as pricing power and high margins. It also shows up as heavy, non-discretionary capital spending, because the network has to be maintained whether volumes grow or not.</p>
<p>From FY2018 to FY2025 revenue grew from C${n0(h18("Revenue"))}m to C${n0(h25("Revenue"))}m, a compound rate of {pc(cagr)}. The operating ratio, operating expenses as a share of revenue and the industry’s standard efficiency measure, was {pc(or25)} in FY2025 (Figure 1). Diluted earnings per share rose from C${eps18:.2f} to C${eps25:.2f}, faster than net income, because the diluted share count fell from {h18("Diluted weighted-average shares (m)"):.0f}m to {h25("Diluted weighted-average shares (m)"):.0f}m.</p>
<figure><img src="{F1}"></figure>
<p>Figure 2 is the most important chart in this memo. Over eight years CN generated C${fcf/1000:.1f}bn of free cash flow after capital expenditure and returned C${ret/1000:.1f}bn to shareholders through dividends and buybacks. The difference was funded with debt, which rose from C${n0(h18("Total debt (incl. current)"))}m to C${n0(h25("Total debt (incl. current)"))}m. Capital expenditure has averaged {pc(S["Base"]["capex_pct"])} of revenue over the last five years against depreciation of {pc(S["Base"]["da_pct"])}. Reported earnings therefore overstate the cash an owner can take out.</p>
<figure><img src="{F2}"></figure>

<h2>2. Forecast</h2>
<p>The forecast is driven by nine inputs, set out on the Inputs sheet of the workbook. In the base case revenue grows {pc(S["Base"]["growth"])} a year, about two points of volume and two of price, and the operating ratio improves to {pc(S["Base"]["op_ratio_2030"])} by 2030. Capital expenditure stays at its five-year average share of revenue, debt is held at {S["Base"]["leverage"]:.1f} times EBITDA, {pc(S["Base"]["payout"], 0)} of net income is paid as dividends, and all remaining cash repurchases shares. The forecast balance sheet balances in every year by construction, which the workbook checks.</p>
<div class="cap">Table 1. Base-case forecast</div><table>{T_F}</table>

<h2>3. Cost of capital</h2>
<p>The cost of equity is {pc(B["ke"], 2)}, from a risk-free rate of {pc(R["rf"], 2)} (Government of Canada 10-year benchmark), an equity risk premium of {pc(R["erp"], 1)}, and a beta of {B["beta"]:.2f}. The beta is a 60-month regression against the S&amp;P/TSX Composite ({R["raw_beta"]:.2f}), adjusted toward one. The pre-tax cost of debt is {pc(R["kd"], 2)}, FY2025 interest expense over average debt. At market-value weights the weighted average cost of capital is <b>{pc(B["wacc"], 2)}</b>.</p>

<h2>4. Discounted cash flow</h2>
<p>Free cash flows for FY2026–FY2030 are discounted with a mid-year convention, and a Gordon-growth terminal value assumes {pc(B["tg"])} perpetual growth. Enterprise value is C${n0(B["ev"])}m. Subtracting C${n0(R["debt"])}m of debt, adding C${n0(R["cash"])}m of cash and C${n0(B["pension"])}m for the after-tax pension surplus gives equity of C${n0(B["equity"])}m, or C${B["per_share_fy"]:.0f} per share at the balance sheet date and C${B["per_share"]:.0f} rolled forward to the price date. Terminal value is {pc(B["tv_share"], 0)} of enterprise value, which is typical for a long-lived infrastructure asset and is the reason the sensitivity tables matter more than the point estimate.</p>
<div class="cap">Table 2. Scenarios</div><table>{T_S}</table>
<figure><img src="{F4}"></figure>
<div class="cap">Table 3. Value per share (CAD): WACC and terminal growth</div><table>{T_G}</table>
<div class="cap">Table 4. Value per share (CAD): operating ratio and revenue growth</div><table>{T_G2}</table>
<p>No cell in either table reaches the current share price except the most favourable corner of Table 3. Table 4 shows that even a 58% operating ratio with 6% growth, well beyond anything in CN’s eight-year record, yields C${G["grid2"][0][4]:.0f}.</p>

<h2>5. Comparable companies</h2>
<p>The four other publicly traded Class I railroads trade at a median of {M["ev_ebitda"]:.1f} times FY2025 EBITDA and {M["pe"]:.1f} times earnings. CN trades at {R["cn"]["ev_ebitda"]:.1f} and {R["cn"]["pe"]:.1f} times, a discount of {pc(disc, 0)} on EV/EBITDA despite an operating ratio better than three of the four. Applying peer medians to CN’s FY2025 results implies C${I["ev_ebitda"]["median"]:.0f}–{I["ev_ebit"]["median"]:.0f} per share.</p>
<div class="cap">Table 5. Class I railroads, FY2025</div><table>{T_C}</table>
<div class="note">Local currency. Norfolk Southern is subject to an agreed merger with Union Pacific, so its price reflects deal terms. Source: SEC filings; prices at {R["price_date"]}.</div>
<figure><img src="{F3}"></figure>

<h2>6. Reconciling the two answers</h2>
<p>A relative valuation says CN is worth more than its price, and an intrinsic valuation says it is worth less. Both are correct on their own terms. Multiples only say that CN is cheaper than its peers, not that any of them are cheap. The reverse DCF makes the market’s assumptions explicit. Holding everything else at the base case, the share price is justified by any one of:</p>
<ul><li>terminal growth of {pc(R["reverse"]["g"])} a year forever, above long-run nominal GDP growth;</li><li>a cost of capital of {pc(R["reverse"]["wacc"])}, about {100*(B["wacc"]-R["reverse"]["wacc"]):.1f} points below my estimate;</li><li>revenue growth of {pc(R["reverse"]["growth"])} a year for five years, against {pc(cagr)} achieved since 2018.</li></ul>
<p>None of these is impossible, and a combination of smaller moves in each would do it. Investors may reasonably view a railroad as a long-duration, inflation-protected asset deserving a lower discount rate than CAPM produces. But the model shows what is being paid for, and I would want a specific reason to believe it before paying.</p>

<h2>7. Risks and limitations</h2>
<ul><li><b>Capital intensity is the swing factor.</b> If maintenance capex is closer to depreciation than to recent spending, base value rises materially. I use reported spending because CN does not disclose a maintenance/growth split.</li>
<li><b>Macro and trade.</b> Volumes depend on commodity cycles, cross-border trade policy and labour disruptions, none of which is modelled explicitly.</li>
<li><b>Simplifications.</b> Deferred taxes are treated as cash taxes, which understates cash flow slightly. Debt is taken at book value. Peer multiples are not adjusted for pensions, leases or one-off items. The comparison uses trailing FY2025 results, not forward estimates.</li>
<li><b>Timing.</b> The balance sheet is at 31 December 2025 and the price is {R["elapsed"]*12:.0f} months later; value is rolled forward at the cost of equity less dividends.</li></ul>
<p class="note" style="margin-top:14pt">Sources: Canadian National Railway annual financial statements (US GAAP) as filed with the U.S. Securities and Exchange Commission; peer filings on SEC EDGAR; Bank of Canada; Yahoo Finance. This memo is an educational valuation exercise based on public information. It is not investment advice or a recommendation to buy or sell any security, and the views are the author’s own and not those of any employer.</p>
</body></html>"""
open(f"{H}/memo.html", "w", encoding="utf-8").write(HTML)
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={H}/memo.pdf", f"file://{H}/memo.html"], capture_output=True, timeout=120)
print("memo ok", os.path.getsize(f"{H}/memo.pdf"))
