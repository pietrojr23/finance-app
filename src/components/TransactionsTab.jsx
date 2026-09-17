import { formatCurrency, formatDate } from "../utils/format";

function TransactionsTab({ transactions, onNew, onEdit, onDelete }) {
  return (
    <>
      <div className="transactions-section">
        <div className="section-head">
          <h2>Transações</h2>
          <span className="section-count">{transactions.length}</span>
        </div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma transação registrada ainda.</p>
            <button className="btn-secondary" onClick={onNew}>
              Adicionar primeira transação
            </button>
          </div>
        ) : (
          <ul className="transactions-list">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <span className={`transaction-type ${transaction.type}`}>
                    {transaction.type === "income" ? "↑" : "↓"}
                  </span>
                  <div className="transaction-details">
                    <strong>{transaction.description}</strong>
                    <span className="transaction-meta">
                      {transaction.category} • {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
                <div className="transaction-actions">
                  <span className={`amount ${transaction.type}`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(transaction)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => onDelete(transaction.id)}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default TransactionsTab;