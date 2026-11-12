"""Recalculate CN_Valuation_Model.xlsx with an independent formula engine and compare with the Python engine."""
import formulas, json, os, sys
H = os.path.dirname(os.path.abspath(__file__)); R = json.load(open(f"{H}/results.json"))
m = formulas.ExcelModel().load(f"{H}/CN_Valuation_Model.xlsx").finish(); sol = m.calculate()
def cell(sheet, ref):
    v = sol[f"'[CN_Valuation_Model.xlsx]{sheet.upper()}'!{ref}"].value
    return v[0][0] if hasattr(v, "__len__") and not isinstance(v, str) else v
B = R["results"]["Base"]; rows = B["rows"]
checks = [("WACC", cell("WACC", "C16"), B["wacc"]), ("Cost of equity", cell("WACC", "C8"), B["ke"]), ("Revenue 2030", cell("Forecast", "H6"), rows[-1]["revenue"]),
          ("Net income 2030", cell("Forecast", "H17"), rows[-1]["ni"]), ("EPS 2030", cell("Forecast", "H20"), rows[-1]["eps"]), ("FCF 2026", cell("Forecast", "D53"), rows[0]["fcf"]),
          ("FCF 2030", cell("Forecast", "H53"), rows[-1]["fcf"]), ("Enterprise value", cell("DCF", "C15"), B["ev"]), ("Equity value", cell("DCF", "C19"), B["equity"]),
          ("Value per share", cell("DCF", "C23"), B["per_share"]), ("Sensitivity centre", cell("Sensitivity", "E8"), R["sens"]["grid"][2][2]), ("Sensitivity corner", cell("Sensitivity", "C6"), R["sens"]["grid"][0][0]),
          ("Sensitivity corner 2", cell("Sensitivity", "G10"), R["sens"]["grid"][4][4]), ("Peer median EV/EBITDA", cell("Comps", "P9"), R["comp_median"]["ev_ebitda"]),
          ("Implied by P/E median", cell("Comps", "E18"), R["implied"]["pe"]["median"]), ("Implied by EV/EBITDA median", cell("Comps", "E16"), R["implied"]["ev_ebitda"]["median"]),
          ("Balance check 2030", cell("Forecast", "H44"), 0.0), ("Cash 2030 = cash 2025", cell("Forecast", "H34"), R["cash"])]
bad = 0
for name, a, b in checks:
    ok = abs(float(a) - b) < 1e-6 * max(1, abs(b)); bad += not ok
    print(f"{'OK ' if ok else 'BAD'} {name:28} workbook {float(a):>14,.4f}   python {b:>14,.4f}")
print("integrity cells:", [cell("Summary", f"C{r}") for r in range(17, 22)])
sys.exit(bad)
