import { formatCurrency } from "../utils/format";

function SummaryCards({ totalIncome, totalExpenses, balance }) {
  return (
    <div className="summary-hero">
      <span className="hero-label">Saldo total</span>
      <div className="hero-value">{formatCurrency(balance)}</div>

      <div className="summary-row">
        <div className="summary-mini">
          <span className="mini-label">
            <span className="mini-dot income">▲</span> Entradas
          </span>
          <div className="mini-balance">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="summary-mini">
          <span className="mini-label">
            <span className="mini-dot expense">▼</span> Saídas
          </span>
          <div className="mini-balance">{formatCurrency(totalExpenses)}</div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;