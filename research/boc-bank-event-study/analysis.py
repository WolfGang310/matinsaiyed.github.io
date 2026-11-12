"""Event study: Canadian Big Six bank stocks around Bank of Canada policy-rate changes, 2010-2026.
Run download.py first. Writes results/results.json, results/*.csv and figures/*.png."""
import os, json, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
from scipy import stats
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
warnings.filterwarnings("ignore")
HERE = os.path.dirname(os.path.abspath(__file__)); D = f"{HERE}/data"
os.makedirs(f"{HERE}/results", exist_ok=True); os.makedirs(f"{HERE}/figures", exist_ok=True)
BANKS = ["RY", "TD", "BNS", "BMO", "CM", "NA"]
EST = (-260, -11); PRE, POST = 5, 10
WINDOWS = {"[0,0]": (0, 0), "[0,+1]": (0, 1), "[-1,+1]": (-1, 1), "[0,+5]": (0, 5), "[+2,+10]": (2, 10)}
NAVY, BRONZE, RED, GREEN, GREY = "#14213d", "#8f6428", "#b3412f", "#1f7a55", "#667089"
plt.rcParams.update({"font.family": "serif", "font.size": 10, "axes.spines.top": False, "axes.spines.right": False, "axes.edgecolor": GREY, "figure.dpi": 200})

def load(name, col): return pd.read_csv(f"{D}/{name}.csv", parse_dates=["date"]).set_index("date")[col]
px = pd.DataFrame({b: load(f"px_{b}", "adj_close") for b in BANKS + ["GSPTSE"]}).dropna()
ret = np.log(px).diff().dropna()
ret["EW"] = ret[BANKS].mean(axis=1)
rate = load("policy_rate", "policy_rate"); y2 = load("yield_2y", "yield_2y")
days = ret.index

# ---- events: announcement dates of every change in the target rate, per Bank of Canada press releases.
# The Valet series records a change on the announcement day in some years and on the next business day
# in others, so dates are pinned here and the size of each change is read from the series.
ANNOUNCEMENTS = """2010-06-01 2010-07-20 2010-09-08 2015-01-21 2015-07-15 2017-07-12 2017-09-06 2018-01-17 2018-07-11 2018-10-24
2020-03-04 2020-03-13 2020-03-27 2022-03-02 2022-04-13 2022-06-01 2022-07-13 2022-09-07 2022-10-26 2022-12-07 2023-01-25 2023-06-07
2023-07-12 2024-06-05 2024-07-24 2024-09-04 2024-10-23 2024-12-11 2025-01-29 2025-03-12 2025-09-17 2025-10-29""".split()
rr = rate.reindex(days).ffill(); y = y2.reindex(days).ffill()
events = []
for a_ in ANNOUNCEMENTS:
    t0 = pd.Timestamp(a_); i = days.get_loc(t0)
    c = rr.iloc[i + 1] - rr.iloc[i - 1]                       # change, whichever day the series steps
    assert abs(c) > 1e-9, f"no rate change found around {a_}"
    events.append({"date": t0, "change_bp": round(c * 100), "new_rate": rr.iloc[i + 1], "d2y_bp": (y.iloc[i] - y.iloc[i - 1]) * 100, "i": i})
EXCLUDED_RECENT = None
steps = rr.diff().abs() > 1e-9                                # every step in the series must be explained by an announcement
ann_idx = {e["i"] for e in events}
for j in np.where(steps.values)[0]:
    if j + POST >= len(days): EXCLUDED_RECENT = str(days[j].date()); continue   # too recent for a full post-event window
    assert j in ann_idx or (j - 1) in ann_idx, f"unexplained step in policy rate on {days[j].date()}"
ev = pd.DataFrame(events)
ev = ev[(ev.i + EST[0] >= 0) & (ev.i + POST < len(days))].reset_index(drop=True)
ev["type"] = np.where(ev.change_bp > 0, "hike", "cut")

def market_model(series, i):
    w = slice(i + EST[0], i + EST[1] + 1)
    X = sm.add_constant(ret["GSPTSE"].iloc[w].values); m = sm.OLS(ret[series].iloc[w].values, X).fit()
    span = slice(i - PRE, i + POST + 1)
    ar = ret[series].iloc[span].values - (m.params[0] + m.params[1] * ret["GSPTSE"].iloc[span].values)
    return ar, m.params[1], np.sqrt(m.mse_resid)

AR = {s: [] for s in BANKS + ["EW"]}; beta = {s: [] for s in BANKS + ["EW"]}; sig = {s: [] for s in BANKS + ["EW"]}
for i in ev.i:
    for s in AR:
        a, b, sd = market_model(s, i); AR[s].append(a); beta[s].append(b); sig[s].append(sd)
AR = {s: np.array(v) for s, v in AR.items()}; sig = {s: np.array(v) for s, v in sig.items()}
tau = np.arange(-PRE, POST + 1)
def car(s, a, b): return AR[s][:, (tau >= a) & (tau <= b)].sum(axis=1)
for k, (a, b) in WINDOWS.items(): ev[f"CAR{k}"] = car("EW", a, b) * 100
ev["SAR0"] = AR["EW"][:, tau == 0].ravel() / sig["EW"]

def test(x):
    x = np.asarray(x); n = len(x)
    t, p = stats.ttest_1samp(x, 0) if n > 2 else (np.nan, np.nan)
    pos = int((x > 0).sum()); ps = stats.binomtest(pos, n, 0.5).pvalue if n else np.nan
    w = stats.wilcoxon(x).pvalue if n > 5 else np.nan
    return {"n": n, "mean": float(x.mean()), "median": float(np.median(x)), "t": float(t), "p_t": float(p), "pct_pos": pos / n if n else np.nan, "p_sign": float(ps), "p_wilcoxon": float(w)}

def bmp(s, a, b, mask):                              # Boehmer-Musumeci-Poulsen standardized test
    L = b - a + 1; sc = car(s, a, b)[mask] / (sig[s][mask] * np.sqrt(L))
    return float(sc.mean() / (sc.std(ddof=1) / np.sqrt(len(sc)))) if len(sc) > 2 else np.nan

res = {"sample": {"n_events": int(len(ev)), "n_hikes": int((ev.type == "hike").sum()), "n_cuts": int((ev.type == "cut").sum()),
                  "first": str(ev.date.min().date()), "last": str(ev.date.max().date()), "price_start": str(days[0].date()), "price_end": str(days[-1].date()),
                  "mean_beta_EW": float(np.mean(beta["EW"])), "excluded_recent_change": EXCLUDED_RECENT}, "tables": {}}
groups = {"All changes": np.ones(len(ev), bool), "Hikes": (ev.type == "hike").values, "Cuts": (ev.type == "cut").values,
          "Hawkish surprise (Δ2y>0)": (ev.d2y_bp > 0).values, "Dovish surprise (Δ2y<0)": (ev.d2y_bp < 0).values,
          "Excl. March 2020": ~((ev.date >= "2020-03-01") & (ev.date <= "2020-03-31")).values}
rows = []
for g, m in groups.items():
    for k, (a, b) in WINDOWS.items():
        r = test(ev.loc[m, f"CAR{k}"]); r.update({"group": g, "window": k, "z_bmp": bmp("EW", a, b, m)}); rows.append(r)
T1 = pd.DataFrame(rows); T1.to_csv(f"{HERE}/results/car_by_group.csv", index=False); res["tables"]["car_by_group"] = rows

# hikes vs cuts difference
h, c = ev.loc[ev.type == "hike", "CAR[0,+1]"], ev.loc[ev.type == "cut", "CAR[0,+1]"]
tt = stats.ttest_ind(h, c, equal_var=False); res["hike_minus_cut"] = {"diff": float(h.mean() - c.mean()), "t": float(tt.statistic), "p": float(tt.pvalue)}

# cross-sectional regressions (HC3)
def ols(y, cols, mask=None):
    d = ev if mask is None else ev[mask]
    X = sm.add_constant(d[cols].astype(float)); m = sm.OLS(d[y], X).fit(cov_type="HC3")
    return {"y": y, "n": int(m.nobs), "r2": float(m.rsquared), "coef": {k: float(v) for k, v in m.params.items()}, "t": {k: float(v) for k, v in m.tvalues.items()}, "p": {k: float(v) for k, v in m.pvalues.items()}}
ev["hike"] = (ev.type == "hike").astype(int)
res["regressions"] = {"surprise": ols("CAR[0,+1]", ["d2y_bp"]), "surprise_ctrl": ols("CAR[0,+1]", ["d2y_bp", "change_bp"]),
                      "surprise_ex2020": ols("CAR[0,+1]", ["d2y_bp"], groups["Excl. March 2020"]), "surprise_day0": ols("CAR[0,0]", ["d2y_bp"]),
                      "surprise_wide": ols("CAR[0,+5]", ["d2y_bp"])}

# bank-level
bk = []
for b in BANKS:
    x = car(b, 0, 1) * 100
    m = sm.OLS(x, sm.add_constant(ev.d2y_bp.values)).fit(cov_type="HC3")
    r = test(x); bk.append({"bank": b, "mean_car": r["mean"], "t": r["t"], "p": r["p_t"], "pct_pos": r["pct_pos"], "slope_per_bp": float(m.params[1]), "slope_t": float(m.tvalues[1]), "slope_p": float(m.pvalues[1]), "beta": float(np.mean(beta[b]))})
pd.DataFrame(bk).to_csv(f"{HERE}/results/by_bank.csv", index=False); res["by_bank"] = bk

# placebo: distribution of the same statistic on non-event days
rng = np.random.default_rng(42); ok = np.arange(-EST[0], len(days) - POST - 1)
near = np.zeros(len(days), bool)
for i in ev.i: near[max(0, i - 5): i + 6] = True
pool = ok[~near[ok]]
def car01(i):
    a, _, _ = market_model("EW", i); return a[(tau >= 0) & (tau <= 1)].sum() * 100
pl_abs, pl_mean = [], []
sample_days = rng.choice(pool, 1500, replace=False); plc = np.array([car01(i) for i in sample_days])
for _ in range(5000):
    s = rng.choice(plc, len(ev), replace=False); pl_mean.append(s.mean()); pl_abs.append(np.abs(s).mean())
obs_mean, obs_abs = ev["CAR[0,+1]"].mean(), ev["CAR[0,+1]"].abs().mean()
res["placebo"] = {"obs_mean": float(obs_mean), "p_mean_two_sided": float((np.abs(pl_mean) >= abs(obs_mean)).mean()), "obs_mean_abs": float(obs_abs),
                  "placebo_mean_abs": float(np.mean(pl_abs)), "p_abs": float((np.array(pl_abs) >= obs_abs).mean()), "placebo_sd_car": float(plc.std())}
res["vol"] = {"mean_abs_SAR0": float(ev.SAR0.abs().mean()), "expected_abs_SAR_normal": float(np.sqrt(2 / np.pi)), "share_abs_SAR0_gt_1_96": float((ev.SAR0.abs() > 1.96).mean())}

# placebo excluding the March 2020 emergency cuts, and statistical power
x_ex = ev.loc[groups["Excl. March 2020"], "CAR[0,+1]"]; pa = []
for _ in range(5000): pa.append(np.abs(rng.choice(plc, len(x_ex), replace=False)).mean())
res["placebo"].update({"obs_mean_abs_ex2020": float(x_ex.abs().mean()), "p_abs_ex2020": float((np.array(pa) >= x_ex.abs().mean()).mean())})
sd_all, sd_ex = float(ev["CAR[0,+1]"].std(ddof=1)), float(x_ex.std(ddof=1))
res["power"] = {"sd_car": sd_all, "sd_car_ex2020": sd_ex, "mde_80": 2.8 * sd_all / np.sqrt(len(ev)), "mde_80_ex2020": 2.8 * sd_ex / np.sqrt(len(x_ex))}
print("PLC", res["placebo"]); print("POW", res["power"])
# variance test on day-0 standardized abnormal returns: under H0 they are ~N(0,1), so sum of squares ~ chi2(n)
q = float((ev.SAR0 ** 2).sum()); res["vol"].update({"chi2": q, "df": int(len(ev)), "p_chi2": float(stats.chi2.sf(q, len(ev))), "var_ratio": q / len(ev)})
ex = groups["Excl. March 2020"]; q2 = float((ev.SAR0[ex] ** 2).sum())
res["vol"].update({"var_ratio_ex2020": q2 / int(ex.sum()), "p_chi2_ex2020": float(stats.chi2.sf(q2, int(ex.sum())))})
# does the size of the surprise explain the size of the move?
ev["absCAR"] = ev["CAR[0,+1]"].abs(); ev["abs_d2y"] = ev.d2y_bp.abs(); ev["abs_chg"] = ev.change_bp.abs()
res["regressions"]["magnitude"] = ols("absCAR", ["abs_d2y", "abs_chg"]); res["regressions"]["magnitude_ex2020"] = ols("absCAR", ["abs_d2y", "abs_chg"], ex)
print("VOL", res["vol"]); print("MAG", res["regressions"]["magnitude"]["coef"], res["regressions"]["magnitude"]["p"], res["regressions"]["magnitude_ex2020"]["coef"], res["regressions"]["magnitude_ex2020"]["p"])
ev.drop(columns=["i"]).to_csv(f"{HERE}/results/events.csv", index=False)
res["events"] = json.loads(ev.drop(columns=["i"]).assign(date=ev.date.dt.strftime("%Y-%m-%d")).to_json(orient="records"))
json.dump(res, open(f"{HERE}/results/results.json", "w"), indent=1)

# ---- figures
fig, ax = plt.subplots(figsize=(7.2, 2.9))
r = rate[rate.index >= "2009-06-01"]; ax.step(r.index, r.values, where="post", color=NAVY, lw=1.6)
for _, e in ev.iterrows(): ax.axvline(e.date, color=GREEN if e.type == "hike" else RED, lw=0.6, alpha=0.6)
ax.set_ylabel("Target overnight rate (%)"); ax.set_title("Figure 1. Bank of Canada policy rate and the %d rate changes in the sample" % len(ev), loc="left", fontsize=10)
fig.tight_layout(); fig.savefig(f"{HERE}/figures/fig1_policy_rate.png"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7.2, 3.4))
for name, m, col in [("Hikes", groups["Hikes"], GREEN), ("Cuts", groups["Cuts"], RED), ("All", groups["All changes"], NAVY)]:
    path = np.cumsum(AR["EW"][m], axis=1) * 100; mu = path.mean(0); se = path.std(0, ddof=1) / np.sqrt(m.sum())
    ax.plot(tau, mu, color=col, lw=1.8, label=f"{name} (n={m.sum()})"); ax.fill_between(tau, mu - 1.96 * se, mu + 1.96 * se, color=col, alpha=0.10, lw=0)
ax.axhline(0, color=GREY, lw=0.6); ax.axvline(0, color=GREY, lw=0.6, ls=":"); ax.set_xlabel("Trading days relative to announcement"); ax.set_ylabel("Cumulative abnormal return (%)")
ax.legend(frameon=False, fontsize=8); ax.set_title("Figure 2. Cumulative abnormal return of the equal-weighted Big Six portfolio", loc="left", fontsize=10)
fig.tight_layout(); fig.savefig(f"{HERE}/figures/fig2_car_path.png"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7.2, 3.6))
for t, col in [("hike", GREEN), ("cut", RED)]:
    d = ev[ev.type == t]; ax.scatter(d.d2y_bp, d["CAR[0,+1]"], color=col, s=22, alpha=0.8, label=t.capitalize() + "s", edgecolor="white", lw=0.4)
m = res["regressions"]["surprise"]; xs = np.linspace(ev.d2y_bp.min(), ev.d2y_bp.max(), 50)
ax.plot(xs, m["coef"]["const"] + m["coef"]["d2y_bp"] * xs, color=NAVY, lw=1.4)
ax.axhline(0, color=GREY, lw=0.6); ax.axvline(0, color=GREY, lw=0.6); ax.set_xlabel("Announcement-day change in 2-year Government of Canada yield (bp)"); ax.set_ylabel("CAR [0,+1] (%)")
ax.legend(frameon=False, fontsize=8); ax.set_title("Figure 3. Bank abnormal returns against the yield surprise (slope %.3f%% per bp, t = %.2f)" % (m["coef"]["d2y_bp"], m["t"]["d2y_bp"]), loc="left", fontsize=10)
fig.tight_layout(); fig.savefig(f"{HERE}/figures/fig3_surprise.png"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7.2, 2.9))
ax.hist(plc, bins=60, color=GREY, alpha=0.45, density=True, label="Non-event days (n=1,500)")
ax.hist(ev["CAR[0,+1]"], bins=14, color=BRONZE, alpha=0.75, density=True, label=f"Rate-change announcements (n={len(ev)})")
ax.set_xlabel("CAR [0,+1] (%)"); ax.set_yticks([]); ax.legend(frameon=False, fontsize=8); ax.set_title("Figure 4. Announcement-window returns against a placebo distribution", loc="left", fontsize=10)
fig.tight_layout(); fig.savefig(f"{HERE}/figures/fig4_placebo.png"); plt.close(fig)

print(json.dumps(res["sample"], indent=1)); print(T1[T1.window.isin(["[0,0]", "[0,+1]", "[0,+5]"])][["group", "window", "n", "mean", "t", "p_t", "pct_pos", "z_bmp"]].round(3).to_string(index=False))
print("hike-cut", res["hike_minus_cut"]); print({k: (round(v["coef"].get("d2y_bp", 0), 4), round(v["t"].get("d2y_bp", 0), 2), round(v["p"].get("d2y_bp", 1), 3), round(v["r2"], 3), v["n"]) for k, v in res["regressions"].items()})
print(pd.DataFrame(bk).round(3).to_string(index=False)); print(res["placebo"]); print(res["vol"])
print(ev[["date", "change_bp", "d2y_bp", "CAR[0,+1]"]].round(2).to_string(index=False))
