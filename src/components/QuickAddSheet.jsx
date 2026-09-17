function QuickAddSheet({ onNewTransaction, onNewRecurring, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quick-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h3>O que deseja adicionar?</h3>
        <div className="quick-options">
          <button className="quick-option" onClick={onNewTransaction}>
            <span className="quick-icon income">▲</span>
            <span className="quick-text">
              <strong>Nova Transação</strong>
              <span>Entrada ou saída avulsa</span>
            </span>
          </button>
          <button className="quick-option" onClick={onNewRecurring}>
            <span className="quick-icon expense">🔁</span>
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