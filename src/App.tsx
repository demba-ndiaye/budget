import React, { useState, useEffect } from 'react';
import { 
  INITIAL_MEMBERS, 
  INITIAL_CATEGORIES, 
  INITIAL_SAVINGS_GOALS, 
  INITIAL_TRANSACTIONS 
} from './data/initialData';
import { Transaction, CategoryBudget, FamilyMember, SavingsGoal } from './types';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { FamilyShareView } from './components/FamilyShareView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { SimulatorView } from './components/SimulatorView';
import { TransactionModal } from './components/TransactionModal';

export const App: React.FC = () => {
  // Current month default
  const today = new Date();
  const defaultMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    return localStorage.getItem('budget_current_month') || defaultMonthStr;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistence with LocalStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('budget_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored transactions', e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('budget_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored categories', e);
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('budget_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored members', e);
      }
    }
    return INITIAL_MEMBERS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('budget_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored goals', e);
      }
    }
    return INITIAL_SAVINGS_GOALS;
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('budget_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budget_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('budget_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('budget_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('budget_current_month', currentMonth);
  }, [currentMonth]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Available months list derived from transactions
  const availableMonths = React.useMemo(() => {
    const set = new Set<string>();
    set.add(defaultMonthStr);
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions, defaultMonthStr]);

  // Current month's filtered transactions
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

  // Calculations for current month
  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFixed = monthTransactions
    .filter((t) => t.type === 'fixed_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVariable = monthTransactions
    .filter((t) => t.type === 'variable_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = monthTransactions
    .filter((t) => t.type === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = totalFixed + totalVariable;
  const remainingDisposable = totalIncome - totalExpenses - totalSavings;

  // Handlers
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    if (txData.id) {
      // Update
      setTransactions((prev) =>
        prev.map((t) => (t.id === txData.id ? ({ ...t, ...txData } as Transaction) : t))
      );
      showToast('Opération modifiée avec succès');
    } else {
      // Add
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: txData.title || 'Nouvelle dépense',
        amount: txData.amount || 0,
        type: txData.type || 'variable_expense',
        category: txData.category || 'Alimentation & Courses',
        date: txData.date || `${currentMonth}-01`,
        memberId: txData.memberId || 'common',
        status: txData.status || 'cleared',
        isRecurring: !!txData.isRecurring,
        notes: txData.notes,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Opération ajoutée');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Opération supprimée');
  };

  const handleToggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'cleared' ? 'pending' : 'cleared' } : t
      )
    );
  };

  const handleUpdateCategoryBudget = (catId: string, newAmount: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, budgetedAmount: newAmount } : c))
    );
    showToast('Plafond de budget mis à jour');
  };

  const handleAddCategory = (newCat: Omit<CategoryBudget, 'id'>) => {
    const id = `cat-${Date.now()}`;
    setCategories((prev) => [...prev, { ...newCat, id }]);
    showToast(`Enveloppe "${newCat.name}" créée`);
  };

  const handleUpdateMemberIncome = (memberId: string, income: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, monthlyIncome: income } : m))
    );
    showToast('Revenu du membre mis à jour');
  };

  const handleAddMember = (newMember: Omit<FamilyMember, 'id'>) => {
    const id = `m-${Date.now()}`;
    setMembers((prev) => [...prev, { ...newMember, id }]);
    showToast(`Membre "${newMember.name}" ajouté`);
  };

  const handleAddDeposit = (goalId: string, amount: number) => {
    // 1. Update goal
    const targetGoal = goals.find((g) => g.id === goalId);
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );

    // 2. Also log as a savings transaction for this month
    const newTx: Transaction = {
      id: `tx-dep-${Date.now()}`,
      title: `Versement : ${targetGoal?.title || 'Épargne'}`,
      amount,
      type: 'savings',
      category: 'Épargne & Investissement',
      date: new Date().toISOString().split('T')[0],
      memberId: 'common',
      status: 'cleared',
      isRecurring: false,
      notes: `Versement vers objectif ${targetGoal?.title}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Versement de ${amount} € enregistré vers l'objectif`);
  };

  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const id = `goal-${Date.now()}`;
    setGoals((prev) => [...prev, { ...newGoal, id }]);
    showToast(`Projet "${newGoal.title}" créé`);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Titre', 'Montant', 'Type', 'Categorie', 'Membre', 'Statut', 'Notes'];
    const rows = monthTransactions.map((t) => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${t.category.replace(/"/g, '""')}"`,
      t.memberId,
      t.status,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `budget-familial-${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV téléchargé');
  };

  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données avec le jeu d’exemple du budget familial ?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setCategories(INITIAL_CATEGORIES);
      setMembers(INITIAL_MEMBERS);
      setGoals(INITIAL_SAVINGS_GOALS);
      showToast('Données réinitialisées avec succès');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header with Navigation and Quick Summary */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        availableMonths={availableMonths}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        remainingDisposable={remainingDisposable}
        onOpenAddModal={handleOpenAddModal}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={monthTransactions}
            categories={categories}
            members={members}
            onOpenAddModal={handleOpenAddModal}
            onSelectTab={setActiveTab}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={monthTransactions}
            members={members}
            categories={categories}
            onOpenAddModal={handleOpenAddModal}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            categories={categories}
            transactions={monthTransactions}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
            onAddCategory={handleAddCategory}
          />
        )}

        {activeTab === 'family' && (
          <FamilyShareView
            members={members}
            transactions={monthTransactions}
            onUpdateMemberIncome={handleUpdateMemberIncome}
            onAddMember={handleAddMember}
          />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsView
            goals={goals}
            onAddDeposit={handleAddDeposit}
            onAddGoal={handleAddGoal}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            transactions={monthTransactions}
            goals={goals}
          />
        )}
      </main>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialTransaction={editingTransaction}
        members={members}
        categories={categories}
        currentMonth={currentMonth}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Budget Familial — Gestion saine et sereine des finances du foyer.</p>
          <div className="flex items-center gap-4">
            <span>Règle 50/30/20</span>
            <span>•</span>
            <span>Répartition équitable</span>
            <span>•</span>
            <span>Objectifs d'épargne</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
