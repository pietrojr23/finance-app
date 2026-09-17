export const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("pt-BR");
};

export const toISODate = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Parse a "YYYY-MM-DD" input as LOCAL midnight, so stored timestamps
// round-trip to the picked date regardless of the user's timezone.
export const parseDateInput = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const escapeCSV = (value) => {
  const str = String(value ?? "");
  if (/[;"\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const formatCSVDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatCSVNumber = (value) => {
  return Number(value || 0).toFixed(2).replace(".", ",");
};

// Build and download a pt-BR friendly CSV (Excel ";" separator, BOM for accents)
export const exportTransactionsCSV = (transactions, filename) => {
  const typeLabel = (t) => (t.type === "income" ? "Entrada" : "Saída");
  const rows = [
    ["Data", "Tipo", "Descrição", "Categoria", "Valor", "IPTU", "Condomínio"].join(";"),
    ...transactions.map((t) =>
      [
        formatCSVDate(t.date),
        typeLabel(t),
        t.description,
        t.category,
        formatCSVNumber(t.amount),
        formatCSVNumber(t.iptu),
        formatCSVNumber(t.condominio)
      ]
        .map(escapeCSV)
        .join(";")
    )
  ];

  const blob = new Blob(["\uFEFF" + rows.join("\r\n")], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};