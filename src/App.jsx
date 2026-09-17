import { useState, useEffect, useMemo, useCallback } from "react";
import { transactionService } from "./services/transactionService";
import { recurringTransactionService } from "./services/recurringTransactionService";
import { categoryService, DEFAULT_CATEGORIES } from "./services/categoryService";
import { authService } from "./services/authService";
import { toISODate, parseDateInput } from "./utils/format";
import Header from "./components/Header";
import AuthScreen from "./components/AuthScreen";
import SummaryCards from "./components/SummaryCards";
import TransactionsTab from "./components/TransactionsTab";
import RecurringTab from "./components/RecurringTab";
import TransactionModal from "./components/TransactionModal";
import RecurringModal from "./components/RecurringModal";
import BottomNav from "./components/BottomNav";
import QuickAddSheet from "./components/QuickAddSheet";
import "./App.css";

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");

  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);

  const categoriesByType = useMemo(
    () => ({
      income: categories.filter(c => c.type === "income"),
      expense: categories.filter(c => c.type === "expense")
    }),
    [categories]
  );

  const defaultNames = useMemo(
    () => new Set(Object.values(DEFAULT_CATEGORIES).flat()),
    []
  );

  const loadData = useCallback(async (userId) => {
    setLoading(true);
    try {
      const [allTransactions, allRecurring, bal, income, expenses, cats] = await Promise.all([
        transactionService.getAll(userId),
        recurringTransactionService.getAll(userId),
        transactionService.getBalance(userId),
        transactionService.getTotalIncome(userId),
        transactionService.getTotalExpenses(userId),
        categoryService.seedDefaults(userId)
      ]);
      setTransactions(allTransactions);
      setRecurringTransactions(allRecurring);
      setCategories(cats);
      setBalance(bal);
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erro ao carregar dados. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        await loadData(currentUser.uid);
      } else {
        // Clear data when logged out
        setTransactions([]);
        setRecurringTransactions([]);
        setCategories([]);
        setBalance(0);
        setTotalIncome(0);
        setTotalExpenses(0);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [loadData]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Transaction handlers
  const handleSubmitTransaction = async (form) => {
    if (!user) return;
    try {
      const transaction = {
        type: form.type,
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        date: parseDateInput(form.date)
      };
      if (form.category === "Aluguel") {
        transaction.iptu = parseFloat(form.iptu) || 0;
        transaction.condominio = parseFloat(form.condominio) || 0;
      }

      if (editingTransaction) {
        await transactionService.update(user.uid, editingTransaction.id, transaction);
      } else {
        await transactionService.add(user.uid, transaction);
      }

      setShowTransactionModal(false);
      setEditingTransaction(null);
      loadData(user.uid);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!user) return;
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        const transaction = transactions.find((t) => t.id === id);

        await transactionService.delete(user.uid, id);

        if (transaction?.recurringId) {
          const recurringTpl = recurringTransactions.find(
            (r) => r.id === transaction.recurringId
          );
          if (
            recurringTpl &&
            recurringTpl.nextDueDate.getTime() > transaction.date.getTime()
          ) {
            await recurringTransactionService.updateNextDueDate(
              user.uid,
              recurringTpl.id,
              transaction.date
            );
          }
        }

        loadData(user.uid);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setShowQuickAdd(false);
    setShowTransactionModal(true);
  };

  // Recurring transaction handlers
  const handleSubmitRecurring = async (form) => {
    if (!user) return;
    try {
      const startDate = parseDateInput(form.startDate);
      const startDateChanged =
        editingRecurring && form.startDate !== toISODate(editingRecurring.startDate);
      const neverGenerated =
        editingRecurring &&
        editingRecurring.nextDueDate.getTime() === editingRecurring.startDate.getTime();

      const recurring = {
        type: form.type,
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        frequency: form.frequency,
        startDate,
        nextDueDate: editingRecurring
          ? startDateChanged && neverGenerated
            ? startDate
            : editingRecurring.nextDueDate
          : startDate,
        isActive: form.isActive
      };
      if (recurring.category === "Aluguel") {
        recurring.iptu = parseFloat(form.iptu) || 0;
        recurring.condominio = parseFloat(form.condominio) || 0;
      }

      if (editingRecurring) {
        await recurringTransactionService.update(user.uid, editingRecurring.id, recurring);
      } else {
        await recurringTransactionService.add(user.uid, recurring);
      }

      setShowRecurringModal(false);
      setEditingRecurring(null);
      loadData(user.uid);
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!user) return;
    if (window.confirm("Tem certeza que deseja excluir este pagamento recorrente?")) {
      try {
        await recurringTransactionService.delete(user.uid, id);
        loadData(user.uid);
      } catch (error) {
        console.error("Error deleting recurring transaction:", error);
      }
    }
  };

  const handleToggleRecurring = async (recurring) => {
    if (!user) return;
    try {
      await recurringTransactionService.toggleActive(user.uid, recurring.id, !recurring.isActive);
      loadData(user.uid);
    } catch (error) {
      console.error("Error toggling recurring transaction:", error);
    }
  };

  const handleEditRecurring = (recurring) => {
    setEditingRecurring(recurring);
    setShowRecurringModal(true);
  };

  const handleNewRecurring = () => {
    setEditingRecurring(null);
    setShowQuickAdd(false);
    setShowRecurringModal(true);
  };

  // Generate transaction from recurring (manual action)
  const handleGenerateFromRecurring = async (recurring) => {
    if (!user) return;
    try {
      const transaction = {
        type: recurring.type,
        description: recurring.description,
        amount: recurring.amount,
        category: recurring.category,
        date: new Date(recurring.nextDueDate),
        recurringId: recurring.id
      };
      if (recurring.category === "Aluguel") {
        transaction.iptu = recurring.iptu || 0;
        transaction.condominio = recurring.condominio || 0;
      }
      await transactionService.add(user.uid, transaction);

      const nextDueDate = recurringTransactionService.calculateNextDueDate(recurring.nextDueDate, recurring.frequency);
      await recurringTransactionService.updateNextDueDate(user.uid, recurring.id, nextDueDate);

      loadData(user.uid);
    } catch (error) {
      console.error("Error generating transaction from recurring:", error);
    }
  };

  // Category handlers
  const handleAddCategory = async (type, name) => {
    const updated = await categoryService.add(user.uid, type, name);
    setCategories(updated);
  };

  const handleDeleteCategory = async (id) => {
    await categoryService.delete(user.uid, id);
    setCategories(await categoryService.getAll(user.uid));
  };

  if (authLoading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

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
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />

      <main className="main">
        <div className={`tabs-view${activeTab === "transactions" ? " tabs-view-dashboard" : ""}`}>
          {activeTab === "transactions" && (
            <>
              <SummaryCards
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                balance={balance}
              />
              <TransactionsTab
                transactions={transactions}
                onNew={handleNewTransaction}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </>
          )}

          {activeTab === "recurring" && (
            <RecurringTab
              recurringTransactions={recurringTransactions}
              onNew={handleNewRecurring}
              onEdit={handleEditRecurring}
              onDelete={handleDeleteRecurring}
              onToggle={handleToggleRecurring}
              onGenerate={handleGenerateFromRecurring}
            />
          )}
        </div>
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAdd={() => setShowQuickAdd(true)}
      />

      {showQuickAdd && (
        <QuickAddSheet
          onNewTransaction={handleNewTransaction}
          onNewRecurring={handleNewRecurring}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          editing={editingTransaction}
          categories={categoriesByType}
          defaultNames={defaultNames}
          onClose={() => {
            setShowTransactionModal(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleSubmitTransaction}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {/* Recurring Transaction Modal */}
      {showRecurringModal && (
        <RecurringModal
          editing={editingRecurring}
          categories={categoriesByType}
          defaultNames={defaultNames}
          onClose={() => {
            setShowRecurringModal(false);
            setEditingRecurring(null);
          }}
          onSubmit={handleSubmitRecurring}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}
    </div>
  );
}

export default App;