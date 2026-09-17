import { useState } from "react";

function CategorySelect({
  type,
  value,
  onChange,
  categories,
  defaultNames,
  onAddCategory,
  onDeleteCategory
}) {
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = categories.find(c => c.name === value);
  const isCustom = selected && !defaultNames.includes(selected.name);

  const handleSelect = (e) => {
    const next = e.target.value;
    if (next === "__new__") {
      setAddingNew(true);
      onChange("");
    } else {
      setAddingNew(false);
      onChange(next);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      await onAddCategory(type, newName.trim());
      onChange(newName.trim());
      setNewName("");
      setAddingNew(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !window.confirm(`Excluir a categoria "${selected.name}"?`)) return;
    await onDeleteCategory(selected.id);
    onChange("");
  };

  return (
    <div className="form-group">
      <label>Categoria</label>
      <div className="category-select-row">
        <select value={value} onChange={handleSelect} required>
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
          <option value="__new__">➕ Nova categoria...</option>
        </select>
        {isCustom && (
          <button
            type="button"
            className="btn-icon danger category-delete"
            onClick={handleDelete}
            title={`Excluir categoria ${selected.name}`}
          >
            🗑️
          </button>
        )}
      </div>

      {addingNew && (
        <div className="category-inline-add">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da nova categoria"
            maxLength={40}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
          >
            {saving ? "..." : "Adicionar"}
          </button>
        </div>
      )}
    </div>
  );
}

export default CategorySelect;