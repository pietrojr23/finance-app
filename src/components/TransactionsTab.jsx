import { formatCurrency, formatDate } from "../utils/format";
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconPencil,
  IconTrash,
  IconInbox
} from "./Icon";

function TransactionsTab({ transactions, onNew, onEdit, onDelete }) {
  return (
    <div className="transactions-section">
      <div className="section-head">
        <h2>Transações</h2>
        <span className="section-count">{transactions.length}</span>
      </div>
      {transactions.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <IconInbox width={48} height={48} />
          </span>
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
                <span
                  className={`transaction-type ${transaction.type}`}
                  aria-hidden="true"
                >
                  {transaction.type === "income" ? (
                    <IconArrowDownLeft width={20} height={20} />
                  ) : (
                    <IconArrowUpRight width={20} height={20} />
                  )}
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
                    aria-label={`Editar ${transaction.description}`}
                  >
                    <IconPencil width={18} height={18} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => onDelete(transaction.id)}
                    title="Excluir"
                    aria-label={`Excluir ${transaction.description}`}
                  >
                    <IconTrash width={18} height={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionsTab;