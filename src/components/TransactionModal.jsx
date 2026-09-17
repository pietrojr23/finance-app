import { useState } from "react";
import CategorySelect from "./CategorySelect";
import { toISODate } from "../utils/format";

const buildInitialForm = (editing) => ({
  type: editing?.type || "expense",
  description: editing?.description || "",
  amount: editing ? editing.amount.toString() : "",
  category: editing?.category || "",
  date: editing ? toISODate(editing.date) : toISODate(),
  iptu: editing?.iptu ? editing.iptu.toString() : "",
  condominio: editing?.condominio ? editing.condominio.toString() : ""
});

function TransactionModal({
  editing,
  categories,
  defaultNames,
  onClose,
  onSubmit,
  onAddCategory,
  onDeleteCategory
}) {
  const [form, setForm] = useState(() => buildInitialForm(editing));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? "Editar Transação" : "Nova Transação"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="income">Entrada (+)</option>
              <option value="expense">Saída (-)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Aluguel, Luz, Internet..."
              required
            />
          </div>

          <div className="form-group">
            <label>Valor</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>

          <CategorySelect
            type={form.type}
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
            categories={categories[form.type]}
            defaultNames={defaultNames}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
          />

          {form.category === "Aluguel" && (
            <>
              <div className="form-group">
                <label>Valor IPTU</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.iptu}
                  onChange={(e) => setForm({ ...form, iptu: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="form-group">
                <label>Valor Condomínio</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.condominio}
                  onChange={(e) => setForm({ ...form, condominio: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Salvar Alterações" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;