"""Did the move to T+1 settlement (28 May 2024) change fails-to-deliver at NSCC?
Interrupted time-series analysis with HAC standard errors, placebo break dates, and fail-duration analysis."""
import json, os, warnings; warnings.filterwarnings("ignore")
import numpy as np, pandas as pd, statsmodels.api as sm
from scipy import stats
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
H = os.path.dirname(os.path.abspath(__file__)); T0 = pd.Timestamp("2024-05-28")
d = pd.read_csv(f"{H}/data/daily_fails.csv", parse_dates=["date"]).dropna(subset=["spx_volume", "vix"]).query("spx_volume > 0").set_index("date").sort_index()
d["value_other"] = d["value"] - d["value_etf"]; d["aged_share"] = d["value_aged5"] / d["value"]; d["etf_share"] = d["value_etf"] / d["value"]
d["avg_size"] = d["value"] / d["n_priced"]
me = d.index.to_series().groupby([d.index.year, d.index.month]).transform("max"); d["month_end"] = (d.index == me.values).astype(int)
third_fri = [x for x in pd.date_range("2022-01-01", "2026-12-31", freq="WOM-3FRI") if x.month in (3, 6, 9, 12)]
d["quad"] = 0
for x in third_fri:                                     # trades on quarterly expiration settle on the next 1-2 settlement days
    nxt = d.index[d.index > x][:2]; d.loc[nxt, "quad"] = 1
dow = pd.get_dummies(d.index.dayofweek, prefix="dow", drop_first=True).set_index(d.index).astype(float)

def its(y, lo, hi, controls=True, donut=0, t0=T0, hac=10):
    s = d.loc[lo:hi].copy(); pos = np.arange(len(s)); k = int((s.index < t0).sum())
    if donut: keep = np.abs(pos - k) > donut
    else: keep = np.ones(len(s), bool)
    X = pd.DataFrame({"trend": (pos - k) / 21.0, "post": (s.index >= t0).astype(float)}, index=s.index); X["post_trend"] = X["trend"] * X["post"]
    if controls:
        X["log_volume"] = np.log(s["spx_volume"]); X["vix"] = s["vix"]; X["month_end"] = s["month_end"]; X["quad"] = s["quad"]; X = X.join(dow.loc[s.index])
    X = sm.add_constant(X); yy = s[y] if y.endswith("share") else np.log(s[y])
    m = sm.OLS(yy[keep], X[keep]).fit(cov_type="HAC", cov_kwds={"maxlags": hac})
    ci = m.conf_int().loc["post"]
    return dict(n=int(m.nobs), level=float(m.params["post"]), se=float(m.bse["post"]), t=float(m.tvalues["post"]), p=float(m.pvalues["post"]), lo=float(ci[0]), hi=float(ci[1]),
                slope_change=float(m.params["post_trend"]), slope_p=float(m.pvalues["post_trend"]), pre_trend=float(m.params["trend"]), pre_trend_p=float(m.pvalues["trend"]), r2=float(m.rsquared),
                coef={k_: float(v) for k_, v in m.params.items()}, tstat={k_: float(v) for k_, v in m.tvalues.items()}), m, s, X, keep
W = lambda months: (T0 - pd.DateOffset(months=months), T0 + pd.DateOffset(months=months) - pd.Timedelta(days=1))
lo12, hi12 = W(12)
OUT = {"t0": str(T0.date()), "window": [str(lo12.date()), str(hi12.date())], "data_range": [str(d.index.min().date()), str(d.index.max().date())], "n_days_total": int(len(d))}
main, M, S, X, _ = its("value", lo12, hi12); OUT["main"] = main
OUTC = {"Total value of fails": "value", "Number of securities with fails": "n_securities", "Shares failed": "shares", "Value, ETFs": "value_etf", "Value, other securities": "value_other",
        "Value of new fails (first day)": "value_new", "Value aged 5+ days": "value_aged5", "Average fail size": "avg_size", "Aged 5+ days, share of value": "aged_share", "Top-10 securities, share of value": "top10_share"}
OUT["outcomes"] = {k: {a: b for a, b in its(v, lo12, hi12)[0].items() if a not in ("coef", "tstat")} for k, v in OUTC.items()}
ROB = {"Baseline (±12 months, controls)": its("value", lo12, hi12)[0], "No controls": its("value", lo12, hi12, controls=False)[0], "Exclude ±10 settlement days": its("value", lo12, hi12, donut=10)[0],
       "±6 months": its("value", *W(6))[0], "±18 months": its("value", *W(18))[0], "HAC lag 20": its("value", lo12, hi12, hac=20)[0]}
OUT["robust"] = {k: {a: b for a, b in v.items() if a not in ("coef", "tstat")} for k, v in ROB.items()}

# placebo break dates: ±6-month windows that end before the real transition
real6 = its("value", *W(6))[0]["level"]; plc = []
cands = d.loc["2022-07-05":(T0 - pd.DateOffset(months=6) - pd.Timedelta(days=1))].index[::3]
for c in cands:
    lo_, hi_ = c - pd.DateOffset(months=6), c + pd.DateOffset(months=6) - pd.Timedelta(days=1)
    plc.append(its("value", lo_, hi_, t0=c)[0]["level"])
plc = np.array(plc); OUT["placebo"] = dict(n=int(len(plc)), real=float(real6), mean=float(plc.mean()), sd=float(plc.std(ddof=1)), p=float((np.abs(plc) >= abs(real6)).mean()), q05=float(np.quantile(plc, .05)), q95=float(np.quantile(plc, .95)))

# descriptive pre/post
pre, post = d.loc[lo12:T0 - pd.Timedelta(days=1)], d.loc[T0:hi12]
def desc(col, scale=1.0):
    u = stats.mannwhitneyu(pre[col], post[col]); return dict(pre_mean=float(pre[col].mean() / scale), post_mean=float(post[col].mean() / scale), pre_median=float(pre[col].median() / scale), post_median=float(post[col].median() / scale), mw_p=float(u.pvalue))
OUT["desc"] = {"value_bn": desc("value", 1e9), "n_securities": desc("n_securities"), "aged_share": desc("aged_share"), "etf_share": desc("etf_share"), "spx_volume_bn": desc("spx_volume", 1e9), "vix": desc("vix"), "n_pre": int(len(pre)), "n_post": int(len(post))}

# power: minimum detectable level shift
OUT["mde"] = float(np.exp(2.8 * main["se"]) - 1)

# fail spells
sp = pd.read_csv(f"{H}/data/fail_spells.csv.gz", parse_dates=["start"])
last = d.index.max()
a, b = sp[(sp.start >= lo12) & (sp.start < T0)], sp[(sp.start >= T0) & (sp.start <= hi12)]
def spell(x):
    w = x["peak_value"].fillna(0)
    return dict(n=int(len(x)), mean=float(x.length.mean()), median=float(x.length.median()), ge2=float((x.length >= 2).mean()), ge5=float((x.length >= 5).mean()), ge13=float((x.length >= 13).mean()),
                ge5_vw=float(w[x.length >= 5].sum() / w.sum()), surv=[float((x.length >= k).mean()) for k in range(1, 21)])
OUT["spells"] = {"pre": spell(a), "post": spell(b)}
for k in ("ge2", "ge5", "ge13"):
    thr = int(k[2:]); tab = [[int((a.length >= thr).sum()), int((a.length < thr).sum())], [int((b.length >= thr).sum()), int((b.length < thr).sum())]]
    OUT["spells"][f"chi2_p_{k}"] = float(stats.chi2_contingency(tab)[1])
# daily-clustered version of the ge5 comparison (spells starting the same day are not independent)
da = sp.assign(ge5=(sp.length >= 5).astype(float), ge2=(sp.length >= 2).astype(float)).groupby("start")[["ge5", "ge2"]].mean()
pa, pb = da.loc[lo12:T0 - pd.Timedelta(days=1)], da.loc[T0:hi12]
OUT["spells"]["daily_ge5"] = dict(pre=float(pa.ge5.mean()), post=float(pb.ge5.mean()), t_p=float(stats.ttest_ind(pa.ge5, pb.ge5, equal_var=False).pvalue), pre2=float(pa.ge2.mean()), post2=float(pb.ge2.mean()), t_p2=float(stats.ttest_ind(pa.ge2, pb.ge2, equal_var=False).pvalue))
d["persist5_share"] = da["ge5"].reindex(d.index); d["persist2_share"] = da["ge2"].reindex(d.index)
OUT["spells"]["its_ge5"] = {k_: v_ for k_, v_ in its("persist5_share", lo12, hi12)[0].items() if k_ not in ("coef", "tstat")}
OUT["spells"]["its_ge2"] = {k_: v_ for k_, v_ in its("persist2_share", lo12, hi12)[0].items() if k_ not in ("coef", "tstat")}
OUT["spells"]["its_ge5_18"] = {k_: v_ for k_, v_ in its("persist5_share", *W(18))[0].items() if k_ not in ("coef", "tstat")}
OUT["spells"]["its_ge5_donut"] = {k_: v_ for k_, v_ in its("persist5_share", lo12, hi12, donut=10)[0].items() if k_ not in ("coef", "tstat")}
print("ITS persistence:", {k_: (round(100 * v_["level"], 2), round(v_["p"], 4), round(100*v_["slope_change"],3), round(v_["slope_p"],3)) for k_, v_ in OUT["spells"].items() if k_.startswith("its")})
mon = d.loc["2022-01":"2026-04"].resample("M").agg(value=("value", "median"), n=("n_securities", "median"), aged_share=("aged_share", "median"), etf_share=("etf_share", "median"), volume=("spx_volume", "median"), vix=("vix", "median"))
mon.to_csv(f"{H}/results/monthly.csv"); json.dump(OUT, open(f"{H}/results/results.json", "w"), indent=1)

# ---------- figures ----------
INK, RED, GRY = "#1F2A44", "#B3261E", "#9AA3B2"; plt.rcParams.update({"font.family": "serif", "font.size": 9, "axes.spines.top": False, "axes.spines.right": False})
f1 = d.loc["2022-01":"2026-04"]; fig, ax = plt.subplots(figsize=(6.8, 2.8)); ax.plot(f1.index, f1.value / 1e9, color=GRY, lw=.6, label="Daily"); ax.plot(f1.index, (f1.value / 1e9).rolling(21).median(), color=INK, lw=1.8, label="21-day median")
ax.axvline(T0, color=RED, ls="--", lw=1.2); ax.text(T0, 11.2, " T+1 begins\n 28 May 2024", color=RED, fontsize=8, va="top"); ax.set_yscale("log"); ax.set_ylim(0.8, 12); ax.set_yticks([1, 2, 4, 8]); ax.set_yticklabels(["1", "2", "4", "8"])
ax.set_ylabel("Outstanding fails, USD bn (log scale)"); ax.legend(frameon=False, fontsize=8, loc="upper center", ncol=2); ax.set_title("Figure 1. Value of outstanding fails-to-deliver at NSCC", loc="left", fontsize=9.5, fontweight="bold"); fig.savefig(f"{H}/figures/fig1_series.png", dpi=200, bbox_inches="tight"); plt.close(fig)
fig, ax = plt.subplots(figsize=(6.8, 2.8)); yy = np.log(S.value); ax.scatter(S.index, np.exp(yy) / 1e9, s=5, color=GRY, label="Daily")
Xc = X.copy(); means = X.mean()
for c in Xc.columns:
    if c not in ("const", "trend", "post", "post_trend"): Xc[c] = means[c]
fit = np.exp(M.predict(Xc)) / 1e9; ax.plot(S.index[S.index < T0], fit[S.index < T0], color=INK, lw=2, label="Fitted, controls at their means"); ax.plot(S.index[S.index >= T0], fit[S.index >= T0], color=INK, lw=2)
Xcf = Xc.copy(); Xcf["post"] = 0; Xcf["post_trend"] = 0; cf = np.exp(M.predict(Xcf)) / 1e9; ax.plot(S.index[S.index >= T0], cf[S.index >= T0], color=RED, lw=1.4, ls=":", label="Pre-period trend continued")
ax.axvline(T0, color=RED, ls="--", lw=1); ax.set_yscale("log"); ax.set_ylim(0.9, 8); ax.set_yticks([1, 2, 4, 8]); ax.set_yticklabels(["1", "2", "4", "8"]); ax.set_ylabel("USD bn (log scale)"); ax.legend(frameon=False, fontsize=8, ncol=3, loc="upper center")
ax.set_title("Figure 2. Interrupted time-series fit, 12 months either side", loc="left", fontsize=9.5, fontweight="bold"); fig.savefig(f"{H}/figures/fig2_its.png", dpi=200, bbox_inches="tight"); plt.close(fig)
fig, ax = plt.subplots(figsize=(6.8, 2.4)); ax.hist(100 * (np.exp(plc) - 1), bins=30, color=GRY); ax.axvline(100 * (np.exp(real6) - 1), color=RED, lw=1.8); ax.set_xlabel("Estimated level shift at break date, %"); ax.set_ylabel("Placebo dates")
ax.set_title("Figure 3. Actual estimate (red) against placebo break dates", loc="left", fontsize=9.5, fontweight="bold"); fig.savefig(f"{H}/figures/fig3_placebo.png", dpi=200, bbox_inches="tight"); plt.close(fig)
fig, ax = plt.subplots(figsize=(6.8, 2.5)); ks = range(1, 21); ax.step(ks, [100 * x for x in OUT["spells"]["pre"]["surv"]], where="post", color=GRY, lw=1.8, label="Fails starting in the 12 months before T+1"); ax.step(ks, [100 * x for x in OUT["spells"]["post"]["surv"]], where="post", color=INK, lw=1.8, label="12 months after")
ax.set_xlabel("Consecutive settlement days outstanding"); ax.set_ylabel("% of fails still open"); ax.set_xticks(range(1, 21, 2)); ax.set_yscale("log"); ax.set_yticks([1, 3, 10, 30, 100]); ax.set_yticklabels(["1", "3", "10", "30", "100"]); ax.legend(frameon=False, fontsize=8)
ax.set_title("Figure 4. How long a fail stays open", loc="left", fontsize=9.5, fontweight="bold"); fig.savefig(f"{H}/figures/fig4_duration.png", dpi=200, bbox_inches="tight"); plt.close(fig)

pct = lambda x: f"{100*(np.exp(x)-1):+.1f}%"
print("main:", pct(main["level"]), "CI", pct(main["lo"]), pct(main["hi"]), "p", round(main["p"], 3), "n", main["n"], "| slope chg/mo", round(main["slope_change"], 4), "p", round(main["slope_p"], 3), "| pretrend", round(main["pre_trend"], 4), round(main["pre_trend_p"], 3), "R2", round(main["r2"], 2))
print({k: round(v, 2) for k, v in main["tstat"].items()})
for k, v in OUT["robust"].items(): print(f"  {k:32} {pct(v['level']):>8}  p={v['p']:.3f} n={v['n']}")
for k, v in OUT["outcomes"].items(): print(f"  {k:36} {(pct(v['level']) if not OUTC[k].endswith('share') else f'{100*v[chr(108)+chr(101)+chr(118)+chr(101)+chr(108)]:+.1f}pp'):>8}  p={v['p']:.3f}")
print("placebo", {k: round(v, 3) for k, v in OUT["placebo"].items()}); print("MDE", round(OUT["mde"], 3)); print("desc", json.dumps(OUT["desc"], default=float)[:900])
print("spells", {k: (v if not isinstance(v, dict) else {a: (round(b, 4) if not isinstance(b, list) else None) for a, b in v.items()}) for k, v in OUT["spells"].items()})
