import { useState, useEffect } from "react";
import { transactionService } from "./services/transactionService";
import { recurringTransactionService } from "./services/recurringTransactionService";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions"); // "transactions" | "recurring"

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);

  const [formData, setFormData] = useState({
    type: "expense",
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0]
  });

  const [recurringFormData, setRecurringFormData] = useState({
    type: "expense",
    description: "",
    amount: "",
    category: "",
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    isActive: true
  });

  const categories = {
    income: ["Aluguel"],
    expense: ["Luz", "Internet", "Seguro carro", "Parcelamento"]
  };

  const frequencies = [
    { value: "weekly", label: "Semanal" },
    { value: "monthly", label: "Mensal" },
    { value: "quarterly", label: "Trimestral" },
    { value: "yearly", label: "Anual" }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTransactions, allRecurring, bal, income, expenses] = await Promise.all([
        transactionService.getAll(),
        recurringTransactionService.getAll(),
        transactionService.getBalance(),
        transactionService.getTotalIncome(),
        transactionService.getTotalExpenses()
      ]);
      setTransactions(allTransactions);
      setRecurringTransactions(allRecurring);
      setBalance(bal);
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(
        "Não foi possível conectar ao Firebase. Verifique se o Firestore Database foi criado no console do Firebase e se as regras de segurança permitem leitura/escrita."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Transaction handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date)
      };

      if (editingTransaction) {
        await transactionService.delete(editingTransaction.id);
        await transactionService.add(transaction);
      } else {
        await transactionService.add(transaction);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await transactionService.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: transaction.date.toISOString().split("T")[0]
    });
    setShowModal(true);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: "expense",
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0]
    });
    setEditingTransaction(null);
  };

  // Recurring transaction handlers
  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    try {
      const recurring = {
        ...recurringFormData,
        amount: parseFloat(recurringFormData.amount),
        startDate: new Date(recurringFormData.startDate),
        nextDueDate: new Date(recurringFormData.startDate)
      };

      if (editingRecurring) {
        await recurringTransactionService.delete(editingRecurring.id);
        await recurringTransactionService.add(recurring);
      } else {
        await recurringTransactionService.add(recurring);
      }

      setShowRecurringModal(false);
      resetRecurringForm();
      loadData();
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
    }
  };

  const handleRecurringDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este pagamento recorrente?")) {
      try {
        await recurringTransactionService.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting recurring transaction:", error);
      }
    }
  };

  const handleRecurringToggle = async (recurring) => {
    try {
      await recurringTransactionService.toggleActive(recurring.id, !recurring.isActive);
      loadData();
    } catch (error) {
      console.error("Error toggling recurring transaction:", error);
    }
  };

  const handleRecurringEdit = (recurring) => {
    setEditingRecurring(recurring);
    setRecurringFormData({
      type: recurring.type,
      description: recurring.description,
      amount: recurring.amount.toString(),
      category: recurring.category,
      frequency: recurring.frequency,
      startDate: recurring.startDate.toISOString().split("T")[0],
      isActive: recurring.isActive
    });
    setShowRecurringModal(true);
  };

  const handleNewRecurring = () => {
    setEditingRecurring(null);
    resetRecurringForm();
    setShowRecurringModal(true);
  };

  const resetRecurringForm = () => {
    setRecurringFormData({
      type: "expense",
      description: "",
      amount: "",
      category: "",
      frequency: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      isActive: true
    });
    setEditingRecurring(null);
  };

  // Generate transaction from recurring (manual action)
  const handleGenerateFromRecurring = async (recurring) => {
    try {
      // Use the nextDueDate from the recurring transaction as the transaction date
      const transactionDate = new Date(recurring.nextDueDate);
      const transaction = {
        type: recurring.type,
        description: recurring.description,
        amount: recurring.amount,
        category: recurring.category,
        date: transactionDate
      };
      await transactionService.add(transaction);

      // Update next due date
      const nextDueDate = recurringTransactionService.calculateNextDueDate(recurring.nextDueDate, recurring.frequency);
      await recurringTransactionService.updateNextDueDate(recurring.id, nextDueDate);

      loadData();
    } catch (error) {
      console.error("Error generating transaction from recurring:", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getFrequencyLabel = (value) => {
    const freq = frequencies.find(f => f.value === value);
    return freq ? freq.label : value;
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error">
        <div className="error-container">
          <h2>⚠️ Erro de Conexão</h2>
          <p>{error}</p>
          <a
            href="https://console.firebase.google.com/project/despesas-f59e5/firestore"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: 'inline-block', marginTop: '1rem' }}
          >
            Abrir Console do Firebase
          </a>
          <p className="error-hint">
            Passos: Criar banco de dados → Modo de teste → Região: southamerica-east1 (São Paulo)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Gerenciador Financeiro</h1>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        <button
          className={activeTab === "transactions" ? "active" : ""}
          onClick={() => setActiveTab("transactions")}
        >
          📋 Transações
        </button>
        <button
          className={activeTab === "recurring" ? "active" : ""}
          onClick={() => setActiveTab("recurring")}
        >
          🔄 Recorrentes
        </button>
      </nav>

      <main className="main">
        {/* Summary Cards - only show on transactions tab */}
        {activeTab === "transactions" && (
          <div className="summary-cards">
            <div className="card income">
              <h3>Entradas</h3>
              <p className="amount positive">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="card balance">
              <h3>Saldo</h3>
              <p className="amount">{formatCurrency(balance)}</p>
            </div>
            <div className="card expense">
              <h3>Saídas</h3>
              <p className="amount negative">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <>
            <div className="actions">
              <button className="btn-primary" onClick={handleNewTransaction}>
                + Nova Transação
              </button>
            </div>

            <div className="transactions-section">
              <h2>Transações</h2>
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma transação registrada ainda.</p>
                  <button className="btn-secondary" onClick={handleNewTransaction}>
                    Adicionar primeira transação
                  </button>
                </div>
              ) : (
                <ul className="transactions-list">
                  {transactions.map((transaction) => (
                    <li key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <span className={`transaction-type ${transaction.type}`}>
                          {transaction.type === "income" ? "↑" : "↓"}
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
                            onClick={() => handleEdit(transaction)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDelete(transaction.id)}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* Recurring Transactions Tab */}
        {activeTab === "recurring" && (
          <>
            <div className="actions">
              <button className="btn-primary" onClick={handleNewRecurring}>
                + Novo Pagamento Recorrente
              </button>
            </div>

            <div className="transactions-section">
              <h2>Pagamentos Recorrentes</h2>
              {recurringTransactions.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum pagamento recorrente cadastrado.</p>
                  <button className="btn-secondary" onClick={handleNewRecurring}>
                    Adicionar primeiro pagamento recorrente
                  </button>
                </div>
              ) : (
                <ul className="transactions-list">
                  {recurringTransactions.map((recurring) => (
                    <li key={recurring.id} className="transaction-item recurring-item">
                      <div className="transaction-info">
                        <span className={`transaction-type ${recurring.type}`}>
                          {recurring.type === "income" ? "↑" : "↓"}
                        </span>
                        <div className="transaction-details">
                          <strong>{recurring.description}</strong>
                          <span className="transaction-meta">
                            {recurring.category} • {getFrequencyLabel(recurring.frequency)}
                            {recurring.isActive ? " • Ativo" : " • Pausado"}
                          </span>
                          <span className="transaction-meta next-due">
                            Próximo: {formatDate(recurring.nextDueDate)}
                          </span>
                        </div>
                      </div>
                      <div className="transaction-actions">
                        <span className={`amount ${recurring.type}`}>
                          {recurring.type === "income" ? "+" : "-"}
                          {formatCurrency(recurring.amount)}
                        </span>
                        <div className="action-buttons">
                          {recurring.isActive && (
                            <button
                              className="btn-icon generate"
                              onClick={() => handleGenerateFromRecurring(recurring)}
                              title="Gerar transação agora"
                            >
                              ⚡
                            </button>
                          )}
                          <button
                            className="btn-icon"
                            onClick={() => handleRecurringToggle(recurring)}
                            title={recurring.isActive ? "Pausar" : "Ativar"}
                          >
                            {recurring.isActive ? "⏸️" : "▶️"}
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleRecurringEdit(recurring)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleRecurringDelete(recurring.id)}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

      </main>

      {/* Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTransaction ? "Editar Transação" : "Nova Transação"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="income">Entrada (+)</option>
                  <option value="expense">Saída (-)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories[formData.type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingTransaction ? "Salvar Alterações" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recurring Transaction Modal */}
      {showRecurringModal && (
        <div className="modal-overlay" onClick={() => setShowRecurringModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingRecurring ? "Editar Pagamento Recorrente" : "Novo Pagamento Recorrente"}</h2>
            <form onSubmit={handleRecurringSubmit}>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={recurringFormData.type}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, type: e.target.value })}
                >
                  <option value="income">Entrada (+)</option>
                  <option value="expense">Saída (-)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={recurringFormData.description}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, description: e.target.value })}
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
                  value={recurringFormData.amount}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={recurringFormData.category}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, category: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories[recurringFormData.type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Frequência</label>
                <select
                  value={recurringFormData.frequency}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, frequency: e.target.value })}
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
                  value={recurringFormData.startDate}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, startDate: e.target.value })}
                  required
                />
              </div>

              {editingRecurring && (
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={recurringFormData.isActive}
                      onChange={(e) => setRecurringFormData({ ...recurringFormData, isActive: e.target.checked })}
                    />
                    <span>Ativo</span>
                  </label>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowRecurringModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingRecurring ? "Salvar Alterações" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;