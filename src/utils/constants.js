export const frequencies = [
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" }
];

export const getFrequencyLabel = (value) => {
  const freq = frequencies.find(f => f.value === value);
  return freq ? freq.label : value;
};