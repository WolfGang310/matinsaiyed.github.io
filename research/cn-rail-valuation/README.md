# Canadian National Railway: DCF and comparable-company valuation

**Author:** Matin Saiyed

A full valuation of Canadian National Railway (TSX: CNR) built from eight years of financial statements as
filed with the U.S. SEC, with a formula-driven Excel model and a written memo.

| File | What it is |
|---|---|
| `memo.pdf` | Six-page valuation memo |
| `CN_Valuation_Model.xlsx` | Excel workbook. Every calculated cell is a live formula; change the scenario switch on the Inputs sheet |
| `download.py` | Pulls CN's filed financials (XBRL) from SEC EDGAR into `data/cn_facts.csv` |
| `market.py` | Share prices (Yahoo Finance), 10-year Government of Canada yield (Bank of Canada), peer fundamentals (EDGAR) |
| `build_model.py` | Runs the valuation in Python and writes the workbook with matching Excel formulas |
| `verify.py` | Recalculates the workbook with an independent formula engine and checks 18 outputs against Python |
| `build_memo.py` | Writes the memo, charts included, from `results.json` |

## Reproduce

```
pip install pandas numpy matplotlib requests openpyxl formulas
python download.py && python market.py && python build_model.py && python verify.py && python build_memo.py
```

`market.py` fetches current prices, so re-running it moves the valuation date and the results.

## Method in brief

- Five-year forecast from nine drivers; condensed balance sheet that balances by construction.
- WACC from CAPM (60-month beta vs S&P/TSX Composite, Blume-adjusted) and market-value weights.
- Unlevered free cash flow, mid-year discounting, Gordon-growth terminal value, bridge to equity incl. after-tax pension surplus.
- Sensitivities, three scenarios, and a reverse DCF solving for what the market price implies.
- Trading multiples for the four other listed Class I railroads.

Educational exercise from public information. Not investment advice.
