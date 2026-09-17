import { useState } from "react";
import { formatCurrency, formatDate, exportTransactionsCSV } from "../utils/format";
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconPencil,
  IconTrash,
  IconInbox,
  IconSearch,
  IconX,
  IconCopy,
  IconDownload
} from "./Icon";

function TransactionsTab({ transactions, categories, onNew, onEdit, onDelete, onDuplicate }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");

  const categoryList = categories ? categories.map((c) => c.name) : [];

  const filtered = transactions.filter((transaction) => {
    const query = search.trim().toLowerCase();
    if (query && !transaction.description.toLowerCase().includes(query)) return false;
    if (category !== "all" && transaction.category !== category) return false;
    if (type !== "all" && transaction.type !== type) return false;
    return true;
  });

  const hasFilters = search.trim() !== "" || category !== "all" || type !== "all";

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setType("all");
  };

  const handleExport = () => {
    const d = transactions[0]?.date || new Date();
    const d2 = new Date(d);
    const month = String(d2.getMonth() + 1).padStart(2, "0");
    exportTransactionsCSV(filtered, `transacoes-${d2.getFullYear()}-${month}.csv`);
  };

  return (
    <div className="transactions-section">
      <div className="section-head">
        <h2>Transações</h2>
        <div className="section-head-actions">
          <button
            className="btn-icon section-export"
            onClick={handleExport}
            disabled={filtered.length === 0}
            title="Exportar CSV"
            aria-label="Exportar transações em CSV"
          >
            <IconDownload width={18} height={18} />
          </button>
          <span className="section-count">{filtered.length}</span>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-search">
          <IconSearch className="filter-search-icon" width={18} height={18} />
          <input
            type="search"
            className="filter-search-input"
            placeholder="Buscar transação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar transações"
          />
          {search && (
            <button
              type="button"
              className="btn-icon filter-clear"
              onClick={() => setSearch("")}
              aria-label="Limpar busca"
            >
              <IconX width={16} height={16} />
            </button>
          )}
        </div>
        <div className="filters-row">
          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {categoryList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="all">Entradas e saídas</option>
            <option value="expense">Somente saídas</option>
            <option value="income">Somente entradas</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        hasFilters ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              <IconSearch width={48} height={48} />
            </span>
            <p>Nenhum resultado para os filtros.</p>
            <button className="btn-secondary" onClick={clearFilters}>
              Limpar filtros
            </button>
          </div>
        ) : transactions.length === 0 ? (
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
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              <IconInbox width={48} height={48} />
            </span>
            <p>Nenhuma transação neste mês.</p>
            <button className="btn-secondary" onClick={onNew}>
              Adicionar transação
            </button>
          </div>
        )
      ) : (
        <ul className="transactions-list">
          {filtered.map((transaction) => (
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
                    onClick={() => onDuplicate(transaction)}
                    title="Duplicar"
                    aria-label={`Duplicar ${transaction.description}`}
                  >
                    <IconCopy width={18} height={18} />
                  </button>
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