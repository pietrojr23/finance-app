import { formatCurrency, formatDate } from "../utils/format";
import { getFrequencyLabel } from "../utils/constants";

function RecurringTab({ recurringTransactions, onNew, onEdit, onDelete, onToggle, onGenerate }) {
  return (
    <>
      <div className="transactions-section">
        <div className="section-head">
          <h2>Pagamentos Recorrentes</h2>
          <span className="section-count">{recurringTransactions.length}</span>
        </div>
        {recurringTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum pagamento recorrente cadastrado.</p>
            <button className="btn-secondary" onClick={onNew}>
              Adicionar primeiro pagamento recorrente
            </button>
          </div>
        ) : (
          <ul className="transactions-list">
            {recurringTransactions.map((recurring) => (
              <li key={recurring.id} className="transaction-item recurring-item">
                <div className="transaction-info">
                  <span className={`transaction-type ${recurring.type}`}>
                    {recurring.type === "income" ? "↑" : "↓"}
                  </span>
                  <div className="transaction-details">
                    <strong>{recurring.description}</strong>
                    <span className="transaction-meta">
                      {recurring.category} • {getFrequencyLabel(recurring.frequency)}
                    </span>
                    <span className="transaction-meta">
                      <span className={`status-pill ${recurring.isActive ? "active" : "paused"}`}>
                        {recurring.isActive ? "● Ativo" : "◾ Pausado"}
                      </span>
                    </span>
                    <span className="transaction-meta next-due">
                      Próximo: {formatDate(recurring.nextDueDate)}
                    </span>
                  </div>
                </div>
                <div className="transaction-actions">
                  <span className={`amount ${recurring.type}`}>
                    {recurring.type === "income" ? "+" : "-"}
                    {formatCurrency(recurring.amount)}
                  </span>
                  <div className="action-buttons">
                    {recurring.isActive && (
                      <button
                        className="btn-icon generate"
                        onClick={() => onGenerate(recurring)}
                        title="Gerar transação agora"
                      >
                        ⚡
                      </button>
                    )}
                    <button
                      className="btn-icon"
                      onClick={() => onToggle(recurring)}
                      title={recurring.isActive ? "Pausar" : "Ativar"}
                    >
                      {recurring.isActive ? "⏸️" : "▶️"}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(recurring)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => onDelete(recurring.id)}
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

export default RecurringTab;