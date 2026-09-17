function TypeSwitch({ value, onChange }) {
  return (
    <div className="type-switch">
      <button
        type="button"
        className={`type-btn income ${value === "income" ? "selected" : ""}`}
        onClick={() => onChange("income")}
      >
        ▲ Entrada
      </button>
      <button
        type="button"
        className={`type-btn expense ${value === "expense" ? "selected" : ""}`}
        onClick={() => onChange("expense")}
      >
        ▼ Saída
      </button>
    </div>
  );
}

export default TypeSwitch;