"""Build paper.html (and paper.pdf via headless Chrome) from results/results.json. Every number in the
text is read from the results file, so the paper cannot drift from the analysis."""
import json, os, subprocess, base64, statistics as st
H = os.path.dirname(os.path.abspath(__file__)); R = json.load(open(f"{H}/results/results.json"))
S, EV, REG, PL, VOL, POW = R["sample"], R["events"], R["regressions"], R["placebo"], R["vol"], R["power"]
T = {(r["group"], r["window"]): r for r in R["tables"]["car_by_group"]}
def f(x, d=2):
    v = f"{abs(x):.{d}f}"
    return ("−" if x < 0 and float(v) != 0 else "") + v
def p(x): return "&lt; 0.001" if x < 0.001 else f"{x:.3f}"
def img(n): return "data:image/png;base64," + base64.b64encode(open(f"{H}/figures/{n}", "rb").read()).decode()
def star(pv): return "***" if pv < .01 else "**" if pv < .05 else "*" if pv < .10 else ""
a01, a00, a05 = T[("All changes", "[0,+1]")], T[("All changes", "[0,0]")], T[("All changes", "[0,+5]")]
hk, ct = T[("Hikes", "[0,+1]")], T[("Cuts", "[0,+1]")]
x20 = T[("Excl. March 2020", "[0,+1]")]
sur = REG["surprise"]; mag = REG["magnitude"]; magx = REG["magnitude_ex2020"]
mean_abs_chg = st.mean(abs(e["change_bp"]) for e in EV); mean_abs_d2y = st.mean(abs(e["d2y_bp"]) for e in EV)
big = max(EV, key=lambda e: abs(e["CAR[0,+1]"]))

WIN = ["[0,0]", "[0,+1]", "[-1,+1]", "[0,+5]", "[+2,+10]"]
def t2():
    out = ""
    for g in ["All changes", "Hikes", "Cuts", "Hawkish surprise (Δ2y>0)", "Dovish surprise (Δ2y<0)", "Excl. March 2020"]:
        out += f'<tr><td class="l">{g.replace("<","&lt;").replace(">","&gt;")}</td><td>{T[(g,"[0,0]")]["n"]}</td>' + "".join(f'<td>{f(T[(g,w)]["mean"])}{star(T[(g,w)]["p_t"])}<br><span class="s">({f(T[(g,w)]["t"])}) [{f(T[(g,w)]["z_bmp"])}]</span></td>' for w in WIN) + "</tr>"
    return out
def t3():
    rows = [("(1) CAR[0,+1]", REG["surprise"]), ("(2) CAR[0,+1]", REG["surprise_ctrl"]), ("(3) CAR[0,+1], excl. Mar 2020", REG["surprise_ex2020"]), ("(4) CAR[0,0]", REG["surprise_day0"]), ("(5) CAR[0,+5]", REG["surprise_wide"])]
    out = ""
    for n, m in rows:
        c = lambda k: (f'{f(m["coef"][k],4)}{star(m["p"][k])}<br><span class="s">({f(m["t"][k])})</span>' if k in m["coef"] else "")
        out += f'<tr><td class="l">{n}</td><td>{c("d2y_bp")}</td><td>{c("change_bp")}</td><td>{c("const")}</td><td>{m["n"]}</td><td>{m["r2"]:.3f}</td></tr>'
    return out
NAMES = {"RY": "Royal Bank of Canada", "TD": "Toronto-Dominion Bank", "BNS": "Bank of Nova Scotia", "BMO": "Bank of Montreal", "CM": "CIBC", "NA": "National Bank of Canada"}
t4 = "".join(f'<tr><td class="l">{NAMES[b["bank"]]} ({b["bank"]})</td><td>{b["beta"]:.2f}</td><td>{f(b["mean_car"])}</td><td>{f(b["t"])}</td><td>{b["pct_pos"]*100:.0f}%</td><td>{f(b["slope_per_bp"],3)}</td><td>{f(b["slope_t"])}</td></tr>' for b in R["by_bank"])
ta = "".join(f'<tr><td class="l">{e["date"]}</td><td>{"+" if e["change_bp"]>0 else "−"}{abs(e["change_bp"])}</td><td>{e["new_rate"]:.2f}</td><td>{f(e["d2y_bp"],0)}</td><td>{f(e["CAR[0,0]"])}</td><td>{f(e["CAR[0,+1]"])}</td><td>{f(e["CAR[0,+5]"])}</td></tr>' for e in EV)

HTML = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Do Bank Stocks React to Bank of Canada Rate Changes? — Matin Saiyed</title>
<style>
@page {{ size: Letter; margin: 24mm 22mm 22mm; }}
html {{ background: #fff; color-scheme: light; }} body {{ font: 10.6pt/1.5 Georgia, 'Times New Roman', serif; color: #111; background: #fff; max-width: 170mm; margin: 0 auto; }}
h1 {{ font-size: 19pt; line-height: 1.2; margin: 0 0 6pt; font-weight: 600; }}
.sub {{ font-size: 11.5pt; color: #333; margin-bottom: 12pt; }} .auth {{ margin: 10pt 0 2pt; font-size: 11pt; }} .aff {{ color: #555; font-size: 9.5pt; margin-bottom: 14pt; }}
.abs {{ border-top: 1px solid #111; border-bottom: 1px solid #111; padding: 9pt 0; margin: 12pt 0 16pt; font-size: 9.8pt; }} .abs b {{ font-variant: small-caps; letter-spacing: .04em; }}
h2 {{ font-size: 12.5pt; margin: 18pt 0 5pt; }} h3 {{ font-size: 10.8pt; margin: 12pt 0 3pt; font-style: italic; font-weight: 600; }}
p {{ margin: 0 0 7pt; text-align: justify; hyphens: auto; }}
table {{ border-collapse: collapse; width: 100%; font-size: 8.8pt; margin: 6pt 0 4pt; }} th, td {{ padding: 3.2pt 5pt; text-align: right; vertical-align: top; }}
th {{ border-top: 1.2px solid #111; border-bottom: .6px solid #111; font-weight: 600; }} tr:last-child td {{ border-bottom: 1.2px solid #111; }} .l {{ text-align: left; }}
.s {{ color: #444; font-size: 8pt; }} .cap {{ font-size: 9.2pt; font-weight: 600; margin-top: 12pt; }} .note {{ font-size: 8.2pt; color: #333; margin-bottom: 10pt; text-align: left; }}
figure {{ margin: 12pt 0; break-inside: avoid; }} figure img {{ width: 100%; }} .tb {{ break-inside: avoid; }}
.eq {{ text-align: center; margin: 6pt 0; font-style: italic; }} .refs p {{ padding-left: 16pt; text-indent: -16pt; text-align: left; font-size: 9.6pt; }}
code {{ font-size: 9pt; }}
</style></head><body>
<h1>Do Bank Stocks React to Bank of Canada Rate Changes?</h1>
<div class="sub">An event study of Canada’s Big Six banks, 2010–2025</div>
<div class="auth">Matin Saiyed</div>
<div class="aff">Independent working paper · November 2026 · matinsaiyed.com · Code and data: matinsaiyed.com/research/boc-bank-event-study/</div><div class="ai" style="font-size:8.6pt;color:#444;border:1px solid #999;padding:5pt 8pt;margin:0 0 12pt;text-align:left;">How this was produced: the data pipeline, analysis, figures and text were produced with Claude, an AI model made by Anthropic, at the author’s direction. The author set the brief, reviewed the output and is responsible for what is published. Code and data are public so every result can be re-run.</div>
<div class="abs"><b>Abstract.</b> Banks are widely described as beneficiaries of higher interest rates, yet theory is ambiguous: wider lending margins compete with higher discount rates and credit losses. I test the question on all {S["n_events"]} changes to the Bank of Canada’s target overnight rate between {S["first"][:4]} and {S["last"][:4]} ({S["n_hikes"]} increases, {S["n_cuts"]} decreases), using market-model abnormal returns for an equal-weighted portfolio of the six largest Canadian banks. The mean two-day cumulative abnormal return is {f(a01["mean"])}% (t = {f(a01["t"])}), and it is statistically indistinguishable from zero for increases, for decreases, and for hawkish and dovish yield surprises alike. Abnormal returns are unrelated to the announcement-day change in the two-year government yield (slope {f(sur["coef"]["d2y_bp"],4)}% per basis point, t = {f(sur["t"]["d2y_bp"])}). Announcement windows do look more volatile than ordinary days in the full sample, but that result is produced by the three cuts of March 2020, two of them unscheduled, and largely disappears when they are removed. The study can rule out average effects larger than roughly {POW["mde_80_ex2020"]:.1f} percentage points. The evidence is consistent with rate changes being anticipated by the time they are announced, and with bank equity being close to hedged against the level of the policy rate.
<br><br><b>Keywords:</b> event study, monetary policy, bank equity, interest-rate risk, Bank of Canada. &nbsp; <b>JEL:</b> G14, G21, E52.</div>

<h2>1. Introduction</h2>
<p>A common belief among investors and bank employees alike is that rising interest rates are good for bank shareholders. The reasoning is that banks borrow short and lend long, deposit rates adjust slowly, and so net interest margins widen when the policy rate rises. The opposite argument is just as easy to make. Higher rates raise the rate at which future earnings are discounted, reduce the market value of fixed-rate assets, and increase the probability that borrowers default. Which effect dominates is an empirical question.</p>
<p>Canada is a useful setting in which to ask it. Six banks hold the large majority of domestic banking assets, all six are listed on the Toronto Stock Exchange, and the Bank of Canada announces its policy rate on pre-scheduled dates at a fixed time of day. Mortgage lending in Canada is also dominated by terms of five years or less, so bank balance sheets reprice more quickly than in the United States, where most of the existing evidence comes from.</p>
<p>This paper measures the reaction of Big Six bank share prices to every change in the target overnight rate from {S["first"][:4]} to {S["last"][:4]}. I ask three questions. First, do bank stocks earn abnormal returns when the policy rate changes? Second, does the direction of the change matter? Third, is the reaction related to how surprising the announcement was, measured by the same-day move in the two-year Government of Canada yield?</p>
<p>The answer to all three is no. Average abnormal returns are small and statistically insignificant in every window and every subsample examined. The one apparent exception, elevated volatility around announcements, turns out to be a feature of March 2020 rather than of rate announcements in general. I argue this null result is informative: the sample is large enough to detect average effects of about {POW["mde_80_ex2020"]:.1f} percentage points, which is smaller than the effects usually claimed for rate changes on bank equity.</p>

<h2>2. Related literature</h2>
<p>Flannery and James (1984) established that the stock returns of US financial institutions co-move negatively with interest-rate changes, and that the sensitivity is related to the maturity mismatch on the balance sheet. English, Van den Heuvel and Zakrajšek (2018) use high-frequency data around Federal Reserve announcements and find that unanticipated increases in the level of rates lower bank share prices, with the effect muted for banks that rely more on core deposits. Drechsler, Savov and Schnabl (2021) offer an explanation for why the sensitivity is smaller than balance-sheet maturity mismatch would imply: market power over deposits makes deposit funding behave like long-term fixed-rate debt, so net interest margins are largely insulated from the level of rates.</p>
<p>For the stock market as a whole, Bernanke and Kuttner (2005) show that only the unanticipated component of a policy change moves equity prices, building on Kuttner’s (2001) separation of expected from unexpected changes using futures prices. Gürkaynak, Sack and Swanson (2005) show that statements about the future path of policy matter at least as much as the decision itself. Both findings imply that a study of raw rate changes, such as this one, should control for surprise.</p>
<p>Methodologically the paper follows the standard event-study design of Brown and Warner (1985) and MacKinlay (1997). Because all six banks experience each event on the same day, their abnormal returns are cross-sectionally correlated, which inflates test statistics that treat firms as independent (Kolari and Pynnönen, 2010). I avoid the problem by forming a single portfolio and treating the event, not the firm, as the unit of observation. I also report the standardized cross-sectional statistic of Boehmer, Musumeci and Poulsen (1991), which is robust to event-induced changes in variance.</p>

<h2>3. Data</h2>
<p><b>Policy rate.</b> The target for the overnight rate is series V39079 from the Bank of Canada’s Valet API. Announcement dates for every change are taken from the Bank’s press releases. The published series records a change on the announcement day in some years and on the following business day in others, so I pin the announcement dates explicitly and verify in code that every step in the series is matched to an announcement. The sample contains {S["n_events"]} changes: {S["n_hikes"]} increases and {S["n_cuts"]} decreases, with a mean absolute size of {mean_abs_chg:.0f} basis points (Figure 1). One further change, effective {S["excluded_recent_change"]}, is excluded because a full post-event window is not yet available.</p>
<p><b>Yield surprise.</b> Canada has no long-lived, liquid futures contract equivalent to US federal funds futures, so I proxy the unexpected component of each announcement with the same-day change in the two-year Government of Canada benchmark bond yield (Valet series BD.CDN.2YR.DQ.YLD). The two-year yield reflects the expected path of policy over the horizon most relevant to bank margins, and it moves only to the extent that the announcement changed expectations. Its mean absolute announcement-day change is {mean_abs_d2y:.1f} basis points.</p>
<p><b>Equity returns.</b> Daily dividend- and split-adjusted closing prices for Royal Bank of Canada, Toronto-Dominion Bank, Bank of Nova Scotia, Bank of Montreal, CIBC and National Bank of Canada, and for the S&amp;P/TSX Composite Index, are from Yahoo Finance for {S["price_start"]} to {S["price_end"]}. Returns are continuously compounded. The bank portfolio is the equal-weighted average of the six banks’ daily returns.</p>
<figure><img src="{img("fig1_policy_rate.png")}" alt="Policy rate"><div class="note">Green lines mark increases and red lines mark decreases. Source: Bank of Canada.</div></figure>

<h2>4. Methodology</h2>
<p>For each event I estimate a market model over the 250 trading days ending eleven days before the announcement:</p>
<div class="eq">R<sub>p,t</sub> = α + β R<sub>m,t</sub> + ε<sub>t</sub>, &nbsp;&nbsp; t ∈ [−260, −11]</div>
<p>where R<sub>p,t</sub> is the bank portfolio return and R<sub>m,t</sub> the S&amp;P/TSX Composite return. The abnormal return on event day τ is AR<sub>τ</sub> = R<sub>p,τ</sub> − (α̂ + β̂ R<sub>m,τ</sub>), and the cumulative abnormal return over a window is CAR[a,b] = Σ<sub>τ=a..b</sub> AR<sub>τ</sub>. The average estimated β is {S["mean_beta_EW"]:.2f}. Day 0 is the announcement day; Bank of Canada decisions are released during Toronto trading hours, so day 0 captures the immediate reaction. I report five windows: [0,0], [0,+1], [−1,+1], [0,+5], and a post-announcement drift window [+2,+10].</p>
<p>Three tests are applied to each mean CAR across events: a cross-sectional t-test; the Boehmer–Musumeci–Poulsen standardized test, in which each CAR is first scaled by its estimation-period standard deviation; and a non-parametric sign test. To relate the reaction to surprise I estimate</p>
<div class="eq">CAR<sub>i</sub>[0,+1] = γ<sub>0</sub> + γ<sub>1</sub> Δy<sup>2yr</sup><sub>i</sub> + γ<sub>2</sub> Δr<sub>i</sub> + u<sub>i</sub></div>
<p>by ordinary least squares with heteroskedasticity-robust (HC3) standard errors, where Δy<sup>2yr</sup> is the announcement-day change in the two-year yield and Δr the change in the policy rate, both in basis points. Finally, as a check that does not depend on distributional assumptions, I compare the event-window CARs with a placebo distribution built from 1,500 randomly chosen non-event days, each at least five trading days from any announcement and processed through the identical procedure.</p>

<h2>5. Results</h2>
<h3>5.1 Average abnormal returns</h3>
<p>Table 1 reports mean cumulative abnormal returns. Across all {S["n_events"]} rate changes the announcement-day abnormal return is {f(a00["mean"])}% (t = {f(a00["t"])}), the two-day return is {f(a01["mean"])}% (t = {f(a01["t"])}), and the six-day return is {f(a05["mean"])}% (t = {f(a05["t"])}). None is distinguishable from zero under any of the three tests, and the share of positive two-day CARs is {a01["pct_pos"]*100:.0f}%, close to the 50% expected by chance. Figure 2 shows the cumulative path: it stays within its confidence band around zero from five days before the announcement to ten days after, with no sign of either anticipation or drift.</p>
<div class="tb"><div class="cap">Table 1. Cumulative abnormal returns of the equal-weighted Big Six portfolio (%)</div>
<table><tr><th class="l">Sample</th><th>N</th>{"".join(f"<th>CAR{w}</th>" for w in WIN)}</tr>{t2()}</table>
<div class="note">Mean CAR in percent; cross-sectional t-statistic in parentheses; Boehmer–Musumeci–Poulsen z in brackets. *, **, *** denote significance at 10%, 5%, 1% (t-test).</div></div>
<figure><img src="{img("fig2_car_path.png")}" alt="CAR path"><div class="note">Mean cumulative abnormal return from five days before to ten days after the announcement. Shaded bands are ±1.96 standard errors across events.</div></figure>

<h3>5.2 Increases versus decreases</h3>
<p>If higher rates were good news for bank shareholders, increases should produce positive abnormal returns and decreases negative ones. They do not. The mean two-day CAR is {f(hk["mean"])}% for increases (t = {f(hk["t"])}) and {f(ct["mean"])}% for decreases (t = {f(ct["t"])}). The difference of {f(R["hike_minus_cut"]["diff"])} percentage points has the opposite sign to the conventional view and is not significant (Welch t = {f(R["hike_minus_cut"]["t"])}, p = {p(R["hike_minus_cut"]["p"])}).</p>

<h3>5.3 Does surprise matter?</h3>
<p>A rate change that was fully expected should not move prices, so the raw comparison above may simply reflect anticipated decisions. Table 2 relates the CAR to the announcement-day change in the two-year yield. The estimated slope in column (1) is {f(sur["coef"]["d2y_bp"],4)}% per basis point with a t-statistic of {f(sur["t"]["d2y_bp"])} and an R² of {sur["r2"]:.3f}. A ten-basis-point hawkish surprise, which is larger than the typical announcement-day move, is associated with a change in bank equity of only {f(sur["coef"]["d2y_bp"]*10)}%. Controlling for the size of the policy change, excluding March 2020, or changing the window does not alter the conclusion (columns 2–5). Figure 3 plots the relationship.</p>
<div class="tb"><div class="cap">Table 2. Abnormal returns and the yield surprise</div>
<table><tr><th class="l">Dependent variable</th><th>Δ 2-yr yield (bp)</th><th>Δ policy rate (bp)</th><th>Constant</th><th>N</th><th>R²</th></tr>{t3()}</table>
<div class="note">OLS; heteroskedasticity-robust (HC3) t-statistics in parentheses. CARs in percent.</div></div>
<figure><img src="{img("fig3_surprise.png")}" alt="Surprise scatter"></figure>

<h3>5.4 Individual banks</h3>
<p>Table 3 repeats the exercise bank by bank. No bank shows a mean two-day CAR significantly different from zero, and no bank’s CAR is significantly related to the yield surprise. The absence of an average effect is therefore not the result of offsetting reactions at different institutions.</p>
<div class="tb"><div class="cap">Table 3. Results by bank, CAR[0,+1]</div>
<table><tr><th class="l">Bank</th><th>Mean β</th><th>Mean CAR (%)</th><th>t</th><th>% positive</th><th>Slope on Δ2y (% per bp)</th><th>t</th></tr>{t4}</table></div>

<h2>6. Volatility and robustness</h2>
<p><b>Are announcement days unusually volatile?</b> A zero mean could hide large moves in both directions. In the full sample that appears to be the case: the mean absolute two-day CAR is {PL["obs_mean_abs"]:.2f}% against {PL["placebo_mean_abs"]:.2f}% for placebo days (permutation p {("= " + p(PL["p_abs"])) if PL["p_abs"] >= 0.001 else p(PL["p_abs"])}; Figure 4), and the variance of day-0 standardized abnormal returns is {VOL["var_ratio"]:.1f} times its expected value (χ² test p {p(VOL["p_chi2"]) if VOL["p_chi2"] < 0.001 else "= " + p(VOL["p_chi2"])}).</p>
<p>This result does not survive scrutiny. The largest observation by a wide margin is the emergency cut of {big["date"]}, with a two-day CAR of {f(big["CAR[0,+1]"])}%, during the most volatile fortnight for equities since 2008. When the three March 2020 announcements are removed, the day-0 variance ratio falls to {VOL["var_ratio_ex2020"]:.2f} (p = {p(VOL["p_chi2_ex2020"])}), meaning announcement days are no more volatile than ordinary days, and the mean absolute two-day CAR falls to {PL["obs_mean_abs_ex2020"]:.2f}% (p = {p(PL["p_abs_ex2020"])}), which is at best marginal. I conclude that there is no reliable evidence of elevated bank-stock volatility around rate changes outside a crisis.</p>
<figure><img src="{img("fig4_placebo.png")}" alt="Placebo"></figure>
<p><b>Does the size of the surprise explain the size of the move?</b> Regressing |CAR[0,+1]| on |Δy<sup>2yr</sup>| and |Δr| gives coefficients of {f(mag["coef"]["abs_d2y"],3)} (p = {p(mag["p"]["abs_d2y"])}) and {f(mag["coef"]["abs_chg"],3)} (p = {p(mag["p"]["abs_chg"])}). The coefficient on the size of the policy change is significant in the full sample but not once March 2020 is excluded (p = {p(magx["p"]["abs_chg"])}), again pointing to the crisis observations.</p>
<p><b>Statistical power.</b> A null result is only informative if the test could have detected an effect. The standard deviation of the two-day CAR is {POW["sd_car"]:.2f}% in the full sample and {POW["sd_car_ex2020"]:.2f}% excluding March 2020. With conventional 5% size and 80% power, the minimum detectable mean effect is {POW["mde_80"]:.2f}% and {POW["mde_80_ex2020"]:.2f}% respectively. The study can therefore rule out average reactions of the size commonly attributed to rate changes, though not effects of a few tenths of a percent.</p>

<h2>7. Limitations</h2>
<p>Four limitations qualify the findings. First, the sample covers rate <i>changes</i> only. Decisions to hold, which can be equally surprising, are omitted, and the sample of {S["n_events"]} events is small. Second, the surprise proxy is a daily yield change, which also absorbs other news released the same day; intraday data in a narrow window around 10:00 a.m. would be cleaner. Third, the six banks make up a large share of the S&amp;P/TSX Composite, so the market return used as a benchmark is itself partly a bank return. This biases abnormal returns toward zero, and an ex-financials index would be a better benchmark. Fourth, estimation windows for events in a tightening or easing cycle contain earlier events from the same cycle, which may inflate the estimated residual variance and lower power.</p>

<h2>8. Conclusion</h2>
<p>Between {S["first"][:4]} and {S["last"][:4]} the share prices of Canada’s six largest banks did not respond in any systematic way to changes in the Bank of Canada’s policy rate. The result holds for increases and decreases, for hawkish and dovish yield surprises, for each bank individually, and across event windows from one to ten days. The only evidence of unusual behaviour comes from the cuts of March 2020.</p>
<p>Two interpretations fit the evidence. The first is that the Bank of Canada’s decisions are largely anticipated, so little information arrives on the announcement day itself. The second is that Canadian bank equity is close to hedged against the level of short-term rates, as the deposit-franchise view of Drechsler, Savov and Schnabl (2021) would predict. Distinguishing between them requires a sharper measure of surprise and is the natural next step. For practitioners the implication is simple: the direction of the next rate decision is, by itself, a poor basis for a view on Canadian bank shares.</p>

<h2>References</h2><div class="refs">
<p>Bernanke, B. S., and Kuttner, K. N. (2005). What explains the stock market’s reaction to Federal Reserve policy? <i>Journal of Finance</i>, 60(3).</p>
<p>Boehmer, E., Musumeci, J., and Poulsen, A. B. (1991). Event-study methodology under conditions of event-induced variance. <i>Journal of Financial Economics</i>, 30(2).</p>
<p>Brown, S. J., and Warner, J. B. (1985). Using daily stock returns: The case of event studies. <i>Journal of Financial Economics</i>, 14(1).</p>
<p>Drechsler, I., Savov, A., and Schnabl, P. (2021). Banking on deposits: Maturity transformation without interest rate risk. <i>Journal of Finance</i>, 76(3).</p>
<p>English, W. B., Van den Heuvel, S. J., and Zakrajšek, E. (2018). Interest rate risk and bank equity valuations. <i>Journal of Monetary Economics</i>, 98.</p>
<p>Flannery, M. J., and James, C. M. (1984). The effect of interest rate changes on the common stock returns of financial institutions. <i>Journal of Finance</i>, 39(4).</p>
<p>Gürkaynak, R. S., Sack, B., and Swanson, E. T. (2005). Do actions speak louder than words? The response of asset prices to monetary policy actions and statements. <i>International Journal of Central Banking</i>, 1(1).</p>
<p>Kolari, J. W., and Pynnönen, S. (2010). Event study testing with cross-sectional correlation of abnormal returns. <i>Review of Financial Studies</i>, 23(11).</p>
<p>Kuttner, K. N. (2001). Monetary policy surprises and interest rates: Evidence from the Fed funds futures market. <i>Journal of Monetary Economics</i>, 47(3).</p>
<p>MacKinlay, A. C. (1997). Event studies in economics and finance. <i>Journal of Economic Literature</i>, 35(1).</p></div>

<h2>Appendix A. Events</h2>
<table><tr><th class="l">Announcement</th><th>Change (bp)</th><th>New rate (%)</th><th>Δ 2-yr yield (bp)</th><th>CAR[0,0] %</th><th>CAR[0,+1] %</th><th>CAR[0,+5] %</th></tr>{ta}</table>
<h2>Appendix B. Reproducibility</h2>
<p>All results can be regenerated with three scripts: <code>download.py</code> retrieves the raw series from the Bank of Canada and Yahoo Finance; <code>analysis.py</code> produces every number, table and figure; <code>build_paper.py</code> writes this document directly from the results file, so no figure in the text is typed by hand. Requires Python 3.9+, pandas, statsmodels, scipy and matplotlib. Random seeds are fixed.</p>
</body></html>"""
open(f"{H}/paper.html", "w", encoding="utf-8").write(HTML)
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if os.path.exists(chrome):
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={H}/paper.pdf", f"file://{H}/paper.html"], capture_output=True, timeout=120)
print("paper.html", len(HTML), "| pdf:", os.path.exists(f"{H}/paper.pdf") and os.path.getsize(f"{H}/paper.pdf"))
