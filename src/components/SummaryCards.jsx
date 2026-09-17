import { formatCurrency } from "../utils/format";

function SummaryCards({ totalIncome, totalExpenses, balance }) {
  return (
    <div className="summary-cards">
      <div className="card income">
        <h3>Entradas</h3>
        <p className="amount positive">{formatCurrency(totalIncome)}</p>
      </div>
      <div className="card balance">
        <h3>Saldo</h3>
        <p className="amount">{formatCurrency(balance)}</p>
      </div>
      <div className="card expense">
        <h3>Saídas</h3>
        <p className="amount negative">{formatCurrency(totalExpenses)}</p>
      </div>
    </div>
  );
}

export default SummaryCards;