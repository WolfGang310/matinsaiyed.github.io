# Do bank stocks react to Bank of Canada rate changes?

**Author:** Matin Saiyed

An event study of Canada's six largest banks around all 32 changes in the Bank of Canada's target overnight
rate from 2010 to 2025.

| File | What it is |
|---|---|
| `paper.pdf` | The working paper (10 pages) |
| `download.py` | Policy rate and 2-year yield (Bank of Canada Valet API); adjusted prices (Yahoo Finance) |
| `analysis.py` | Market-model abnormal returns, tests, regressions, placebo and power analysis; writes `results/` and `figures/` |
| `build_paper.py` | Writes the paper directly from `results/results.json`, so no number is typed by hand |
| `data/` | Raw downloaded series |
| `results/` | Event-level CARs, tables, and the full results file |

## Reproduce

```
pip install pandas numpy scipy statsmodels matplotlib requests
python download.py && python analysis.py && python build_paper.py
```

## Finding

No systematic abnormal return for increases, decreases, or yield surprises. Apparent excess volatility on
announcement days is driven by March 2020. The design can rule out average effects above roughly 0.6 percentage points.
