import { IconList, IconRepeat, IconPlus } from "./Icon";

function BottomNav({ activeTab, onTabChange, onAdd }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação">
      <button
        className={`nav-btn ${activeTab === "transactions" ? "active" : ""}`}
        onClick={() => onTabChange("transactions")}
      >
        <IconList className="nav-icon" width={24} height={24} />
        <span className="nav-label">Transações</span>
      </button>

      <button
        className="fab"
        onClick={onAdd}
        title="Adicionar"
        aria-label="Adicionar nova transação ou pagamento"
      >
        <IconPlus width={26} height={26} />
      </button>

      <button
        className={`nav-btn ${activeTab === "recurring" ? "active" : ""}`}
        onClick={() => onTabChange("recurring")}
      >
        <IconRepeat className="nav-icon" width={24} height={24} />
        <span className="nav-label">Recorrentes</span>
      </button>
    </nav>
  );
}

export default BottomNav;