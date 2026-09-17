import { useState } from "react";
import CategorySelect from "./CategorySelect";
import { frequencies } from "../utils/constants";
import { toISODate } from "../utils/format";

const buildInitialForm = (editing) => ({
  type: editing?.type || "expense",
  description: editing?.description || "",
  amount: editing ? editing.amount.toString() : "",
  category: editing?.category || "",
  frequency: editing?.frequency || "monthly",
  startDate: editing ? toISODate(editing.startDate) : toISODate(),
  iptu: editing?.iptu ? editing.iptu.toString() : "",
  condominio: editing?.condominio ? editing.condominio.toString() : "",
  isActive: editing?.isActive ?? true
});

function RecurringModal({
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
        <h2>{editing ? "Editar Pagamento Recorrente" : "Novo Pagamento Recorrente"}</h2>
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
              placeholder="Ex: Aluguel apartamento, Conta de luz..."
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

          <CategorySelect
            type={form.type}
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
            categories={categories[form.type]}
            defaultNames={defaultNames}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
          />

          <div className="form-group">
            <label>Frequência</label>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              required
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Data de Início</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>

          {editing && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Ativo</span>
              </label>
            </div>
          )}

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

export default RecurringModal;