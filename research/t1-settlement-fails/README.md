# Did T+1 settlement increase settlement fails?

**Author:** Matin Saiyed

An interrupted time-series study of every fail-to-deliver position reported by the U.S. central counterparty
(NSCC) from 2022 to 2026, around the move from T+2 to T+1 settlement on 28 May 2024.

| File | What it is |
|---|---|
| `paper.pdf` | The working paper (9 pages) |
| `download.py` | Downloads ~115 SEC fails-to-deliver files (6.5 million records), aggregates to daily, rebuilds fail spells, adds market controls |
| `analysis.py` | Segmented regression with Newey-West errors, robustness, placebo break dates, duration analysis, figures |
| `build_paper.py` | Writes the paper from `results/results.json` |
| `data/daily_fails.csv` | One row per settlement date |
| `results/` | Full results file and monthly summary |

Raw SEC files (~170 MB) and the spell-level file are not stored here; `download.py` recreates them.

## Reproduce

```
pip install pandas numpy scipy statsmodels matplotlib requests
python download.py && python analysis.py && python build_paper.py
```

## Finding

No detectable change in the value, number or ageing of fails at the transition (+5%, 95% CI -7% to +19%;
placebo p = 0.45). New fails became about 3.4 percentage points more likely to persist into a second day.
