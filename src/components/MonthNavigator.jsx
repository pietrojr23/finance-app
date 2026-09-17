import { IconChevronLeft, IconChevronRight } from "./Icon";

function MonthNavigator({ date, onChange }) {
  const now = new Date();
  const isCurrentMonth =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth();

  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });
  const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);

  const shift = (months) =>
    onChange(new Date(date.getFullYear(), date.getMonth() + months, 1));

  return (
    <div className="month-nav" role="toolbar" aria-label="Navegação por mês">
      <button
        type="button"
        className="btn-icon month-nav-btn"
        onClick={() => shift(-1)}
        aria-label="Mês anterior"
      >
        <IconChevronLeft width={20} height={20} />
      </button>
      <span className="month-nav-label">{displayLabel}</span>
      <button
        type="button"
        className="btn-icon month-nav-btn"
        onClick={() => shift(1)}
        aria-label="Próximo mês"
      >
        <IconChevronRight width={20} height={20} />
      </button>
      {!isCurrentMonth && (
        <button
          type="button"
          className="month-nav-today"
          onClick={() => onChange(new Date(now.getFullYear(), now.getMonth(), 1))}
        >
          Hoje
        </button>
      )}
    </div>
  );
}

export default MonthNavigator;