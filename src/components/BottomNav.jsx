function BottomNav({ activeTab, onTabChange, onAdd }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-btn ${activeTab === "transactions" ? "active" : ""}`}
        onClick={() => onTabChange("transactions")}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-bubble">Transações</span>
      </button>

      <span className="nav-spacer" />

      <button
        className="fab"
        onClick={onAdd}
        title="Adicionar"
        aria-label="Adicionar"
      >
        +
      </button>

      <span className="nav-spacer" />

      <button
        className={`nav-btn ${activeTab === "recurring" ? "active" : ""}`}
        onClick={() => onTabChange("recurring")}
      >
        <span className="nav-icon">🔄</span>
        <span className="nav-bubble">Recorrentes</span>
      </button>
    </nav>
  );
}

export default BottomNav;