import { formatCurrency } from "../utils/format";
import { IconArrowDownLeft, IconArrowUpRight } from "./Icon";

function SummaryCards({ totalIncome, totalExpenses, balance }) {
  return (
    <section className="summary-hero" aria-label="Resumo financeiro">
      <span className="hero-label">Saldo total</span>
      <div className="hero-value">{formatCurrency(balance)}</div>

      <div className="summary-row">
        <div className="summary-mini">
          <span className="mini-label">
            <IconArrowDownLeft className="mini-dot income" width={14} height={14} />
            Entradas
          </span>
          <div className="mini-balance positive">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="summary-mini">
          <span className="mini-label">
            <IconArrowUpRight className="mini-dot expense" width={14} height={14} />
            Saídas
          </span>
          <div className="mini-balance negative">{formatCurrency(totalExpenses)}</div>
        </div>
      </div>
    </section>
  );
}

export default SummaryCards;