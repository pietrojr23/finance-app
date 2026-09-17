import { formatCurrency, formatDate } from "../utils/format";
import { getFrequencyLabel } from "../utils/constants";
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconPencil,
  IconTrash,
  IconPause,
  IconPlay,
  IconCheckCircle,
  IconInbox,
  IconCalendar
} from "./Icon";

function RecurringTab({ recurringTransactions, onNew, onEdit, onDelete, onToggle, onGenerate }) {
  return (
    <div className="transactions-section">
      <div className="section-head">
        <h2>Pagamentos Recorrentes</h2>
        <span className="section-count">{recurringTransactions.length}</span>
      </div>
      {recurringTransactions.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <IconInbox width={48} height={48} />
          </span>
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
                <span
                  className={`transaction-type ${recurring.type}`}
                  aria-hidden="true"
                >
                  {recurring.type === "income" ? (
                    <IconArrowDownLeft width={20} height={20} />
                  ) : (
                    <IconArrowUpRight width={20} height={20} />
                  )}
                </span>
                <div className="transaction-details">
                  <strong>{recurring.description}</strong>
                  <span className="transaction-meta">
                    {recurring.category} • {getFrequencyLabel(recurring.frequency)}
                  </span>
                  <span className="transaction-meta">
                    <span className={`status-pill ${recurring.isActive ? "active" : "paused"}`}>
                      {recurring.isActive ? "Ativo" : "Pausado"}
                    </span>
                  </span>
                  <span className="transaction-meta next-due">
                    <IconCalendar width={12} height={12} />
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
                      aria-label={`Gerar transação de ${recurring.description}`}
                    >
                      <IconCheckCircle width={18} height={18} />
                    </button>
                  )}
                  <button
                    className="btn-icon"
                    onClick={() => onToggle(recurring)}
                    title={recurring.isActive ? "Pausar" : "Ativar"}
                    aria-label={recurring.isActive ? "Pausar" : "Ativar"}
                  >
                    {recurring.isActive ? (
                      <IconPause width={18} height={18} />
                    ) : (
                      <IconPlay width={18} height={18} />
                    )}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onEdit(recurring)}
                    title="Editar"
                    aria-label={`Editar ${recurring.description}`}
                  >
                    <IconPencil width={18} height={18} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => onDelete(recurring.id)}
                    title="Excluir"
                    aria-label={`Excluir ${recurring.description}`}
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

export default RecurringTab;