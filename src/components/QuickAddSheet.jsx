import { IconBanknote, IconCard, IconX } from "./Icon";

function QuickAddSheet({ onNewTransaction, onNewRecurring, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quick-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="O que deseja adicionar?">
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={onClose} aria-label="Fechar">
          <IconX width={18} height={18} />
        </button>
        <h3>O que deseja adicionar?</h3>
        <div className="quick-options">
          <button className="quick-option" onClick={onNewTransaction}>
            <span className="quick-icon income">
              <IconBanknote width={24} height={24} />
            </span>
            <span className="quick-text">
              <strong>Nova Transação</strong>
              <span>Entrada ou saída avulsa</span>
            </span>
          </button>
          <button className="quick-option" onClick={onNewRecurring}>
            <span className="quick-icon recurring">
              <IconCard width={24} height={24} />
            </span>
            <span className="quick-text">
              <strong>Pagamento Recorrente</strong>
              <span>Conta fixa mensal, semanal etc.</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickAddSheet;