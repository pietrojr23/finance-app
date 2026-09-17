import { IconArrowDownLeft, IconArrowUpRight } from "./Icon";

function TypeSwitch({ value, onChange }) {
  return (
    <div className="type-switch" role="radiogroup" aria-label="Tipo de transação">
      <button
        type="button"
        role="radio"
        aria-checked={value === "income"}
        className={`type-btn ${value === "income" ? "selected income" : ""}`}
        onClick={() => onChange("income")}
      >
        <IconArrowDownLeft width={18} height={18} />
        Entrada
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "expense"}
        className={`type-btn ${value === "expense" ? "selected expense" : ""}`}
        onClick={() => onChange("expense")}
      >
        <IconArrowUpRight width={18} height={18} />
        Saída
      </button>
    </div>
  );
}

export default TypeSwitch;