import { useState, useEffect, useMemo } from "react";
import { transactionService } from "./services/transactionService";
import { recurringTransactionService } from "./services/recurringTransactionService";
import { categoryService, DEFAULT_CATEGORIES } from "./services/categoryService";
import { authService } from "./services/authService";
import { toISODate, parseDateInput } from "./utils/format";
import Header from "./components/Header";
import AuthScreen from "./components/AuthScreen";
import SummaryCards from "./components/SummaryCards";
import MonthNavigator from "./components/MonthNavigator";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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

  const monthTransactions = useMemo(() => {
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d < end;
    });
  }, [transactions, viewMonth]);

  const monthStats = useMemo(() => {
    let income = 0;
    let netIncome = 0;
    let expenses = 0;
    for (const t of monthTransactions) {
      if (t.type === "income") {
        income += t.amount;
        netIncome += t.amount - (t.iptu || 0) - (t.condominio || 0);
      } else {
        expenses += t.amount;
      }
    }
    return { income, expenses, balance: netIncome - expenses };
  }, [monthTransactions]);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setTransactions([]);
        setRecurringTransactions([]);
        setCategories([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Live data subscriptions (real-time sync across devices)
  useEffect(() => {
    if (!user) return;

    let active = true;
    const unsubscribers = [];
    const handleError = (err) => {
      console.error("Realtime listener error:", err);
      setError("Erro ao carregar dados. Verifique a conexão.");
      setLoading(false);
    };

    (async () => {
      try {
        await categoryService.seedDefaults(user.uid);
      } catch (err) {
        console.error("Error seeding categories:", err);
      }
      if (!active) return;
      unsubscribers.push(
        transactionService.subscribe(
          user.uid,
          (txs) => {
            setTransactions(txs);
            setError(null);
            setLoading(false);
          },
          handleError
        )
      );
      unsubscribers.push(
        recurringTransactionService.subscribe(user.uid, setRecurringTransactions, handleError)
      );
      unsubscribers.push(
        categoryService.subscribe(user.uid, setCategories, handleError)
      );
    })();

    return () => {
      active = false;
      unsubscribers.forEach((unsub) => unsub && unsub());
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const addMonthsClamped = (date, months) => {
    const d = new Date(date);
    const day = d.getDate();
    const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, lastDay));
    return target;
  };

  // Transaction handlers
  const handleSubmitTransaction = async (form) => {
    if (!user) return;
    try {
      const baseDate = parseDateInput(form.date);
      const total = parseFloat(form.amount);
      const installments = Math.max(1, form.installments || 1);
      const base = {
        type: form.type,
        description: form.description,
        amount: total,
        category: form.category,
        date: baseDate
      };
      if (form.category === "Aluguel") {
        base.iptu = parseFloat(form.iptu) || 0;
        base.condominio = parseFloat(form.condominio) || 0;
      }

      if (editingTransaction || installments === 1) {
        if (editingTransaction) {
          await transactionService.update(user.uid, editingTransaction.id, base);
        } else {
          await transactionService.add(user.uid, base);
        }
      } else {
        const each = Math.round((total / installments) * 100) / 100;
        for (let i = 0; i < installments; i++) {
          const amount =
            i === installments - 1
              ? Math.round((total - each * (installments - 1)) * 100) / 100
              : each;
          const parcel = {
            ...base,
            description: `${base.description} (${i + 1}/${installments})`,
            amount,
            date: addMonthsClamped(baseDate, i)
          };
          if (base.category === "Aluguel") {
            parcel.iptu = i === 0 ? base.iptu : 0;
            parcel.condominio = i === 0 ? base.condominio : 0;
          }
          await transactionService.add(user.uid, parcel);
        }
      }

      setShowTransactionModal(false);
      setEditingTransaction(null);
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
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDuplicateTransaction = async (transaction) => {
    if (!user) return;
    try {
      const copy = {
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        date: new Date(transaction.date),
        iptu: transaction.iptu || 0,
        condominio: transaction.condominio || 0
      };
      if (transaction.category !== "Aluguel") {
        delete copy.iptu;
        delete copy.condominio;
      }
      await transactionService.add(user.uid, copy);
    } catch (error) {
      console.error("Error duplicating transaction:", error);
    }
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
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!user) return;
    if (window.confirm("Tem certeza que deseja excluir este pagamento recorrente?")) {
      try {
        await recurringTransactionService.delete(user.uid, id);
      } catch (error) {
        console.error("Error deleting recurring transaction:", error);
      }
    }
  };

  const handleToggleRecurring = async (recurring) => {
    if (!user) return;
    try {
      await recurringTransactionService.toggleActive(user.uid, recurring.id, !recurring.isActive);
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
    } catch (error) {
      console.error("Error generating transaction from recurring:", error);
    }
  };

  // Category handlers
  const handleAddCategory = async (type, name) => {
    await categoryService.add(user.uid, type, name);
  };

  const handleDeleteCategory = async (id) => {
    await categoryService.delete(user.uid, id);
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
              <div className="summary-column">
                <MonthNavigator date={viewMonth} onChange={setViewMonth} />
                <SummaryCards
                  totalIncome={monthStats.income}
                  totalExpenses={monthStats.expenses}
                  balance={monthStats.balance}
                />
              </div>
              <TransactionsTab
                transactions={monthTransactions}
                categories={categories}
                onNew={handleNewTransaction}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onDuplicate={handleDuplicateTransaction}
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