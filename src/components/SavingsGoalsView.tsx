import React, { useState } from 'react';
import { 
  PiggyBank, 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Coins, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  onAddDeposit: (goalId: string, amount: number) => void;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  onAddDeposit,
  onAddGoal,
}) => {
  const [activeDepositGoalId, setActiveDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  // New Goal form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [category, setCategory] = useState('Projet Familial');

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const globalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleDepositSubmit = (goalId: string) => {
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      onAddDeposit(goalId, val);
      setDepositAmount('');
      setActiveDepositGoalId(null);
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddGoal({
      title: title.trim(),
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || '2028-12-31',
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      category: category || 'Projet Familial',
      color: randomColor,
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setMonthlyContribution('');
    setShowAddGoalModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-300" />
              <h2 className="text-xl font-bold tracking-tight">Objectifs d'Épargne & Projets de Vie</h2>
            </div>
            <p className="text-xs text-teal-100 mt-1 max-w-xl">
              Fonds d'urgence, vacances au soleil, épargne pour les études ou futur logement :
              suivez la progression de chaque cagnotte familiale.
            </p>
          </div>
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="self-start md:self-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un nouvel objectif</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-6 border-t border-teal-700/60">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-teal-200">Patrimoine d'épargne globale constitué :</span>
            <span className="font-bold text-white text-sm">
              {formatCurrency(totalSaved)} / {formatCurrency(totalTarget)} ({globalProgress.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-teal-950/60 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
              style={{ width: `${Math.min(100, globalProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Goal Modal / Dialog */}
      {showAddGoalModal && (
        <form onSubmit={handleCreateGoal} className="bg-white p-6 rounded-2xl border border-teal-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Nouvel Objectif Financier</h3>
            <button
              type="button"
              onClick={() => setShowAddGoalModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Fermer
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Nom du projet</label>
              <input
                type="text"
                required
                placeholder="Ex: Voyage au Sénégal, Permis..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Montant Cible (€)</label>
              <input
                type="number"
                step="50"
                min="100"
                required
                placeholder="Ex: 5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Déjà épargné (€)</label>
              <input
                type="number"
                step="50"
                min="0"
                placeholder="Ex: 1200"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Date cible souhaitée</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Épargne mensuelle prévue (€)</label>
              <input
                type="number"
                step="25"
                min="0"
                placeholder="Ex: 200"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Catégorie</label>
              <input
                type="text"
                placeholder="Ex: Vacances, Avenir, Sécurité"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Créer cet objectif
          </button>
        </form>
      )}

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const isDepositing = activeDepositGoalId === goal.id;

          // Estimated months to finish at current monthly rate
          const monthsLeft = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;

          return (
            <div
              key={goal.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                      {goal.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{goal.title}</h3>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: goal.color }}
                  >
                    <PiggyBank className="w-5 h-5" />
                  </div>
                </div>

                {/* Amounts & Progress */}
                <div className="mt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-xs text-slate-400">Objectif : {formatCurrency(goal.targetAmount)}</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: goal.color,
                        width: `${Math.min(100, progress)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span className="font-semibold">{progress.toFixed(0)}% atteint</span>
                    <span>Reste à épargner : {formatCurrency(remaining)}</span>
                  </div>
                </div>

                {/* Timeline and pace */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Cible : {formatDate(goal.targetDate)}
                  </span>
                  {monthsLeft !== null && !isCompleted && (
                    <span className="text-slate-600 font-medium">
                      ~ {monthsLeft} mois restants ({formatCurrency(goal.monthlyContribution)} / mois)
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Objectif atteint !
                    </span>
                  )}
                </div>
              </div>

              {/* Deposit Quick Action */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                {isDepositing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="20"
                      min="1"
                      placeholder="Montant du virement (€)"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                    <button
                      onClick={() => handleDepositSubmit(goal.id)}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => setActiveDepositGoalId(null)}
                      className="px-2 py-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveDepositGoalId(goal.id)}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200/80"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Effectuer un versement vers cette cagnotte</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
