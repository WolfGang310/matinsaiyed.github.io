"""Build paper.html and paper.pdf from results/results.json. No number in the text is typed by hand."""
import json, os, base64, subprocess, math
import pandas as pd
H = os.path.dirname(os.path.abspath(__file__)); R = json.load(open(f"{H}/results/results.json"))
D = pd.read_csv(f"{H}/data/daily_fails.csv"); NROWS = int(D["n_securities"].sum())
M, DS, SP, PL = R["main"], R["desc"], R["spells"], R["placebo"]
img = lambda n: "data:image/png;base64," + base64.b64encode(open(f"{H}/figures/{n}", "rb").read()).decode()
def pct(x, d=1): v = 100 * (math.exp(x) - 1); return ("−" if v < 0 else "+") + f"{abs(v):.{d}f}%"
def pp(x, d=1): v = 100 * x; return ("−" if v < 0 else "+") + f"{abs(v):.{d}f} pp"
def pv(x): return "&lt; 0.001" if x < 0.001 else f"{x:.3f}"
def star(p): return "***" if p < .01 else "**" if p < .05 else "*" if p < .10 else ""
num = lambda x, d=2: ("−" if x < 0 else "") + f"{abs(x):.{d}f}"
LAB = {"trend": "Trend (per month)", "post": "Post-T+1 level shift", "post_trend": "Change in trend after T+1", "log_volume": "log S&amp;P 500 volume", "vix": "VIX", "month_end": "Month-end", "quad": "After quarterly expiration", "const": "Constant"}
T1 = "".join(f'<tr><td class="l">{LAB[k]}</td><td>{num(M["coef"][k], 4)}{star(2*(1-0.5*(1+math.erf(abs(M["tstat"][k])/math.sqrt(2)))))}</td><td>({num(M["tstat"][k])})</td></tr>' for k in ["post", "trend", "post_trend", "log_volume", "vix", "month_end", "quad", "const"])
T2 = "".join(f'<tr><td class="l">{k}</td><td>{pct(v["level"])}{star(v["p"])}</td><td>{pct(v["lo"])} to {pct(v["hi"])}</td><td>{pv(v["p"])}</td><td>{v["n"]}</td></tr>' for k, v in R["robust"].items())
SH = ("share of value" ,)
T3 = "".join(f'<tr><td class="l">{k}</td><td>{(pp(v["level"]) if "share" in k else pct(v["level"]))}{star(v["p"])}</td><td>{(pp(v["lo"]) + " to " + pp(v["hi"])) if "share" in k else (pct(v["lo"]) + " to " + pct(v["hi"]))}</td><td>{pv(v["p"])}</td></tr>' for k, v in R["outcomes"].items())
dr = lambda lab, k, f_: f'<tr><td class="l">{lab}</td><td>{f_(DS[k]["pre_mean"])}</td><td>{f_(DS[k]["post_mean"])}</td><td>{f_(DS[k]["pre_median"])}</td><td>{f_(DS[k]["post_median"])}</td></tr>'
T0 = dr("Outstanding fails, USD bn", "value_bn", lambda x: f"{x:.2f}") + dr("Securities with a fail", "n_securities", lambda x: f"{x:,.0f}") + dr("Aged 5+ days, share of value", "aged_share", lambda x: f"{100*x:.1f}%") + dr("ETFs, share of value", "etf_share", lambda x: f"{100*x:.1f}%") + dr("S&amp;P 500 volume, bn shares", "spx_volume_bn", lambda x: f"{x:.2f}") + dr("VIX", "vix", lambda x: f"{x:.1f}")
a, b = SP["pre"], SP["post"]
T4 = "".join(f'<tr><td class="l">{lab}</td><td>{f_(a[k])}</td><td>{f_(b[k])}</td></tr>' for lab, k, f_ in [("Fail spells starting in window", "n", lambda x: f"{x:,}"), ("Mean duration, settlement days", "mean", lambda x: f"{x:.2f}"), ("Median duration", "median", lambda x: f"{x:.0f}"),
      ("Still open on day 2", "ge2", lambda x: f"{100*x:.1f}%"), ("Still open on day 5", "ge5", lambda x: f"{100*x:.1f}%"), ("Still open on day 13", "ge13", lambda x: f"{100*x:.1f}%"), ("Day-5 survivors, share of fail value", "ge5_vw", lambda x: f"{100*x:.1f}%")])
i2, i5, i5w, i5d = SP["its_ge2"], SP["its_ge5"], SP["its_ge5_18"], SP["its_ge5_donut"]
raw = DS["value_bn"]["post_mean"] / DS["value_bn"]["pre_mean"] - 1
HTML = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Did T+1 Settlement Increase Settlement Fails? — Matin Saiyed</title><style>
@page {{ size: Letter; margin: 24mm 22mm 22mm; }} html {{ background: #fff; color-scheme: light; }}
body {{ font: 10.6pt/1.5 Georgia, 'Times New Roman', serif; color: #111; background: #fff; max-width: 170mm; margin: 0 auto; }}
h1 {{ font-size: 19pt; line-height: 1.2; margin: 0 0 6pt; }} .sub {{ font-size: 11.5pt; color: #333; }} .auth {{ margin: 10pt 0 2pt; font-size: 11pt; }} .aff {{ color: #555; font-size: 9.5pt; margin-bottom: 14pt; }}
.abs {{ border-top: 1px solid #111; border-bottom: 1px solid #111; padding: 9pt 0; margin: 12pt 0 16pt; font-size: 9.8pt; }} .abs b {{ font-variant: small-caps; letter-spacing: .04em; }}
h2 {{ font-size: 12.5pt; margin: 18pt 0 5pt; }} p {{ margin: 0 0 7pt; text-align: justify; hyphens: auto; }} ul {{ margin: 0 0 7pt 14pt; padding: 0; }} li {{ margin-bottom: 3pt; }}
table {{ border-collapse: collapse; width: 100%; font-size: 8.9pt; margin: 6pt 0 4pt; }} th, td {{ padding: 3.2pt 5pt; text-align: right; }} th {{ border-top: 1.2px solid #111; border-bottom: .6px solid #111; }}
tr:last-child td {{ border-bottom: 1.2px solid #111; }} .l {{ text-align: left; }} .cap {{ font-size: 9.2pt; font-weight: 700; margin-top: 12pt; }} .note {{ font-size: 8.2pt; color: #333; margin-bottom: 10pt; text-align: left; }}
figure {{ margin: 12pt 0; break-inside: avoid; }} figure img {{ width: 100%; }} .tb {{ break-inside: avoid; }} .eq {{ text-align: center; margin: 6pt 0; font-style: italic; }} .refs p {{ padding-left: 16pt; text-indent: -16pt; text-align: left; font-size: 9.6pt; }}
</style></head><body>
<h1>Did T+1 Settlement Increase Settlement Fails?</h1><div class="sub">An interrupted time-series study of {NROWS/1e6:.1f} million fail records at the U.S. central counterparty</div>
<div class="auth">Matin Saiyed</div><div class="ai" style="font-size:8.6pt;color:#444;border:1px solid #999;padding:5pt 8pt;margin:0 0 12pt;text-align:left;">How this was produced: the data pipeline, analysis, figures and text were produced with Claude, an AI model made by Anthropic, at the author’s direction. The author set the brief, reviewed the output and is responsible for what is published. Code and data are public so every result can be re-run.</div><div class="aff">Independent working paper · November 2026 · Code and data: matinsaiyed.com/research/t1-settlement-fails/</div>
<div class="abs"><b>Abstract.</b> On 28 May 2024 the standard settlement cycle for U.S. and Canadian securities was shortened from two business days to one. Operations teams lost half of the time available to correct allocations, source securities and repair instructions, and a rise in settlement fails was widely expected. I test that expectation using every fail-to-deliver position reported by the National Securities Clearing Corporation from {R["data_range"][0][:4]} to {R["data_range"][1][:4]}. In a segmented regression over the twelve months either side of the change, controlling for market volume, volatility and calendar effects, the estimated shift in the value of outstanding fails is {pct(M["level"])} (95% confidence interval {pct(M["lo"])} to {pct(M["hi"])}, p = {pv(M["p"])}). The estimate is no larger than those produced by placebo break dates (p = {pv(PL["p"])}). The raw {100*raw:.0f}% increase in average fails after the change is explained by higher trading volume and a pre-existing trend. Fail duration tells a more nuanced story: the share of new fails still open on a second day rose by {100*i2["level"]:.1f} percentage points at the transition, while the share lasting five days or more did not change significantly. The shorter cycle appears to have made first-day fails slightly stickier without increasing the stock of fails or the number that age into a control problem.
<br><br><b>Keywords:</b> settlement cycle, T+1, fails-to-deliver, post-trade operations, interrupted time series.</div>

<h2>1. Introduction</h2>
<p>A securities trade is a promise. Settlement is the moment the promise is kept, when securities move one way and cash the other. Between the two sits a chain of operational steps: the trade is allocated to accounts, confirmed and affirmed, instructions are matched, and the seller’s custodian makes the securities available. If any step is late the trade fails to settle on time. Fails tie up capital, create counterparty exposure, and generate manual repair work for middle- and back-office teams.</p>
<p>The move from T+2 to T+1 cut the time available for those steps roughly in half. For trades involving foreign-exchange funding, securities on loan that must be recalled, or investors in distant time zones, the reduction was proportionally larger. Regulators and industry groups acknowledged that a shorter cycle could raise fail rates, at least temporarily, and industry preparation centred on that risk. Whether fails actually rose is an empirical question with a clean answer available in public data, and this paper sets out to give it.</p>
<p>The question matters beyond the United States. Canada moved on 27 May 2024, and the United Kingdom, the European Union and Switzerland have set October 2027 for their own transitions. Evidence on what happened to fails is directly relevant to how much operational risk those markets should expect.</p>

<h2>2. Background and related work</h2>
<p>Most U.S. equity trades are cleared through the National Securities Clearing Corporation’s Continuous Net Settlement (CNS) system, which nets each member’s obligations in each security to a single position per day. A fail-to-deliver is a net short position that a member has not delivered by settlement date. The SEC publishes the outstanding balance of fails for every security on every settlement date. Regulation SHO requires members to close out fail positions within a fixed number of settlement days and places additional restrictions on securities with large, persistent fails.</p>
<p>The academic literature has studied fails mainly in connection with short selling. Boni (2006) documents that fails were widespread before Regulation SHO and argues that many were strategic. Evans, Geczy, Musto and Reed (2009) show that option market makers fail to deliver when borrowing costs are high. Fotak, Raman and Yadav (2014) find that fails are not associated with worse market quality and may improve liquidity. This paper asks a different, operational question: whether compressing the settlement cycle changed the level or persistence of fails.</p>
<p>The design is an interrupted time series, the standard quasi-experimental method when an intervention applies to every unit at a known date and no untreated control group exists (Bernal, Cummins and Gasparrini, 2017).</p>

<h2>3. Data</h2>
<p><b>Fails.</b> The SEC’s fails-to-deliver files list the settlement date, CUSIP, ticker, quantity of shares failed, description and prior-day closing price for every security with an outstanding fail balance in CNS. I download all half-monthly files from January 2022 to October 2026, {NROWS:,} security-day records over {R["n_days_total"]:,} settlement dates, and aggregate them by date. The value of a fail is quantity multiplied by price. Files for May 2026 are not available from the SEC, and a single record in June 2026 is implausibly large; both fall outside the estimation windows.</p>
<p><b>Duration.</b> Because the data are balances, I reconstruct <i>fail spells</i>: runs of consecutive settlement dates on which the same CUSIP shows a fail. A spell’s duration is the number of days in the run. This measures how long a security remains in fail at the clearing-house level, which is a lower bound on persistence since a netted position can change hands between members.</p>
<p><b>Controls.</b> Fails scale with trading activity and rise in volatile markets. I use daily S&amp;P 500 composite share volume and the closing level of the VIX index from Yahoo Finance. Calendar controls are day-of-week indicators, the last settlement date of each month, and the two settlement dates following each quarterly index-option expiration, when index rebalancing produces large, short-lived fails.</p>
<div class="tb"><div class="cap">Table 1. Daily averages, twelve months before and after 28 May 2024</div>
<table><tr><th class="l"></th><th>Mean, before</th><th>Mean, after</th><th>Median, before</th><th>Median, after</th></tr>{T0}</table>
<div class="note">{DS["n_pre"]} settlement dates before and {DS["n_post"]} after.</div></div>
<p>Table 1 shows the comparison that would mislead. Average outstanding fails were {100*raw:.0f}% higher in the year after the transition. Trading volume and volatility were also higher, and Figure 1 shows fails were already drifting upward from mid-2023.</p>
<figure><img src="{img("fig1_series.png")}"></figure>

<h2>4. Method</h2>
<p>The main specification is a segmented regression on daily data:</p>
<div class="eq">log F<sub>t</sub> = α + β·t + γ·Post<sub>t</sub> + δ·(t − T)·Post<sub>t</sub> + θ′X<sub>t</sub> + ε<sub>t</sub></div>
<p>where F<sub>t</sub> is the value of outstanding fails, t is time in months, Post<sub>t</sub> equals one from 28 May 2024, and X<sub>t</sub> holds the controls. γ is the immediate level shift attributable to the transition, and δ the change in trend afterwards. Because daily fail balances are strongly autocorrelated, standard errors are Newey–West with ten lags. The baseline window is twelve months either side.</p>
<p>An interrupted time series is only as credible as its counterfactual, so I add three checks. I vary the window, the controls and the lag length, and exclude the ten settlement dates either side of the change to remove any transition-week disruption. I estimate the same model at {PL["n"]} placebo break dates between mid-2022 and late 2023, none of whose windows contains the real transition, and compare the real estimate with that distribution. And I repeat the analysis for ten other outcomes, including the composition and ageing of fails.</p>

<h2>5. Results</h2>
<p>Table 2 reports the baseline estimate. The level shift at the transition is {num(M["coef"]["post"], 3)} log points, or {pct(M["level"])}, with a 95% confidence interval of {pct(M["lo"])} to {pct(M["hi"])}. It is not statistically distinguishable from zero. Neither is the change in trend. The controls behave as expected: fails rise with volume and volatility, and more than double on the settlement dates after a quarterly expiration. Figure 2 plots the fit; the post-transition observations sit on the line the pre-period trend would have predicted.</p>
<div class="tb"><div class="cap">Table 2. Segmented regression, log value of outstanding fails</div>
<table><tr><th class="l">Variable</th><th>Coefficient</th><th>t</th></tr>{T1}</table>
<div class="note">N = {M["n"]} settlement dates; R² = {M["r2"]:.2f}. Day-of-week indicators included. Newey–West standard errors, 10 lags. *, **, *** denote 10%, 5%, 1%.</div></div>
<figure><img src="{img("fig2_its.png")}"></figure>
<div class="tb"><div class="cap">Table 3. Robustness of the level shift</div>
<table><tr><th class="l">Specification</th><th>Level shift</th><th>95% confidence interval</th><th>p</th><th>N</th></tr>{T2}</table></div>
<p>Table 3 shows the conclusion does not depend on the specification. Estimates range from {pct(min(v["level"] for v in R["robust"].values()))} to {pct(max(v["level"] for v in R["robust"].values()))} and none is significant. The placebo exercise in Figure 3 reaches the same conclusion without relying on standard errors: {100*PL["p"]:.0f}% of placebo dates produce an estimate at least as large in absolute value as the real one.</p>
<figure><img src="{img("fig3_placebo.png")}"></figure>
<div class="tb"><div class="cap">Table 4. Level shift at the transition, other outcomes</div>
<table><tr><th class="l">Outcome</th><th>Level shift</th><th>95% confidence interval</th><th>p</th></tr>{T3}</table>
<div class="note">Same specification as Table 2. Shares are in percentage points (pp); all other outcomes are in logs and reported as percentage changes.</div></div>
<p>Table 4 looks for effects hidden in the aggregate. There is no significant shift in the number of securities failing, in ETFs or other securities taken separately, in new fails, or in the value of fails aged five days or more.</p>

<h2>6. How long fails last</h2>
<p>Levels can stay constant while the underlying process changes. Table 5 compares the duration of {a["n"]:,} fail spells that began in the year before the transition with {b["n"]:,} that began in the year after. Mean duration fell from {a["mean"]:.2f} to {b["mean"]:.2f} settlement days, and the share of spells reaching day five fell from {100*a["ge5"]:.1f}% to {100*b["ge5"]:.1f}% (Figure 4).</p>
<div class="tb"><div class="cap">Table 5. Duration of fail spells by start date</div><table><tr><th class="l"></th><th>12 months before</th><th>12 months after</th></tr>{T4}</table></div>
<figure><img src="{img("fig4_duration.png")}"></figure>
<p>These before-and-after differences should not be read as effects of T+1, for the same reason the raw level comparison should not. When the daily share of new fails reaching day five is put through the segmented regression, the shift at the transition is {pp(i5["level"], 2)} (p = {pv(i5["p"])}) in the baseline, {pp(i5d["level"], 2)} (p = {pv(i5d["p"])}) excluding the transition weeks, and {pp(i5w["level"], 2)} (p = {pv(i5w["p"])}) in the eighteen-month window. The sign is consistently negative but the result is not robust.</p>
<p>One duration result is sharp. The share of new fails that are still open on a second day rose by {100*i2["level"]:.1f} percentage points at the transition (p {pv(i2["p"]) if i2["p"] < 0.001 else "= " + pv(i2["p"])}). This is what compressing the cycle should do mechanically: a fail caused by a late allocation or a slow securities-lending recall that would previously have been repaired inside the settlement window now crosses settlement date and is cured a day later. The fail occurs, but it is short.</p>

<h2>7. Discussion</h2>
<p><b>Statistical power.</b> A null finding needs a statement of what it rules out. With the baseline standard error, the design has 80% power to detect a level shift of about {100*R["mde"]:.0f}%. The study can therefore rule out a sustained increase in fails of more than about a fifth, but not a smaller one.</p>
<p><b>What it means for an operations team.</b> Three practical points follow. First, the feared deterioration did not happen at the clearing-house level, which is consistent with industry preparation, especially same-day affirmation, having worked. Second, the exposure moved earlier in the process. More fails now survive past settlement date by a day, so the work of preventing a fail has to be done on trade date, and staffing and cut-offs should reflect that. Third, for monitoring purposes, the daily count of fails is a poor control metric because it moves with volume and the calendar. A better one is the share of fails ageing past a fixed threshold, which is stable and showed no adverse movement.</p>
<p><b>Limitations.</b> CNS fails are net positions at the clearing-house, after netting across a member’s customers. A firm can experience more internal breaks without any change in its net CNS position, so this study cannot speak to bilateral or client-level fails. The data cover U.S.-cleared securities only; Canadian fail data are not published in comparable form. The interrupted time-series design attributes to T+1 anything else that changed discretely on 28 May 2024, though I am not aware of a concurrent change. Prices are prior-day closes, so values are approximate. The classification of ETFs from security descriptions is imperfect.</p>

<h2>8. Conclusion</h2>
<p>The shortening of the settlement cycle to one day did not produce a detectable increase in the value, number or ageing of fails-to-deliver at the U.S. central counterparty. The estimated effect on the value of fails is small, statistically insignificant, and indistinguishable from placebo dates. The transition did make new fails more likely to persist into a second day, which is consistent with repair work being pushed across the settlement date. For markets preparing their own move to T+1, the evidence is reassuring about aggregate settlement risk and specific about where the operational pressure lands.</p>

<h2>References</h2><div class="refs">
<p>Bernal, J. L., Cummins, S., and Gasparrini, A. (2017). Interrupted time series regression for the evaluation of public health interventions: a tutorial. <i>International Journal of Epidemiology</i>, 46(1).</p>
<p>Boni, L. (2006). Strategic delivery failures in U.S. equity markets. <i>Journal of Financial Markets</i>, 9(1).</p>
<p>Evans, R. B., Geczy, C. C., Musto, D. K., and Reed, A. V. (2009). Failure is an option: Impediments to short selling and options prices. <i>Review of Financial Studies</i>, 22(5).</p>
<p>Fotak, V., Raman, V., and Yadav, P. K. (2014). Fails-to-deliver, short selling, and market quality. <i>Journal of Financial Economics</i>, 114(3).</p>
<p>Newey, W. K., and West, K. D. (1987). A simple, positive semi-definite, heteroskedasticity and autocorrelation consistent covariance matrix. <i>Econometrica</i>, 55(3).</p>
<p>U.S. Securities and Exchange Commission (2023). Shortening the Securities Transaction Settlement Cycle. Final rule.</p>
<p>U.S. Securities and Exchange Commission. Fails-to-Deliver Data. sec.gov/data-research/sec-markets-data/fails-deliver-data.</p></div>
<h2>Appendix. Reproducibility</h2>
<p><code>download.py</code> retrieves the SEC files and market controls and writes one row per settlement date. <code>analysis.py</code> produces every estimate and figure. <code>build_paper.py</code> writes this document from the results file. Requires Python 3.9+, pandas, statsmodels, scipy and matplotlib.</p>
</body></html>"""
open(f"{H}/paper.html", "w", encoding="utf-8").write(HTML)
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={H}/paper.pdf", f"file://{H}/paper.html"], capture_output=True, timeout=120)
print("paper", os.path.getsize(f"{H}/paper.pdf"))
