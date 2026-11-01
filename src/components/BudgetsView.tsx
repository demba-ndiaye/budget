import React, { useState } from 'react';
import { 
  PiggyBank, 
  AlertTriangle, 
  CheckCircle, 
  Edit2, 
  Plus, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { CategoryBudget, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BudgetsViewProps {
  categories: CategoryBudget[];
  transactions: Transaction[];
  onUpdateCategoryBudget: (id: string, newAmount: number) => void;
  onAddCategory: (category: Omit<CategoryBudget, 'id'>) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  transactions,
  onUpdateCategoryBudget,
  onAddCategory,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');
  const [newCatType, setNewCatType] = useState<'needs' | 'wants' | 'savings'>('needs');

  // Compute spend per category
  const spendMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'fixed_expense' || t.type === 'variable_expense' || t.type === 'savings')
    .forEach((t) => {
      spendMap[t.category] = (spendMap[t.category] || 0) + t.amount;
    });

  const totalBudgeted = categories.reduce((sum, c) => sum + c.budgetedAmount, 0);
  const totalSpentInEnvelopes = categories.reduce((sum, c) => sum + (spendMap[c.name] || 0), 0);
  const overallRemaining = totalBudgeted - totalSpentInEnvelopes;

  const handleStartEdit = (cat: CategoryBudget) => {
    setEditingId(cat.id);
    setEditValue(cat.budgetedAmount.toString());
  };

  const handleSaveEdit = (catId: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateCategoryBudget(catId, val);
    }
    setEditingId(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const amount = parseFloat(newCatAmount) || 0;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddCategory({
      name: newCatName.trim(),
      budgetedAmount: amount,
      iconName: 'Layers',
      color: randomColor,
      type: newCatType,
    });

    setNewCatName('');
    setNewCatAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Envelope Summary */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold tracking-tight">Système d'Enveloppes Budgétaires</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Fixez un plafond pour chaque catégorie de dépenses. Surveillez en temps réel les dépassements pour anticiper les fins de mois sereinement.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="self-start md:self-auto px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une enveloppe</span>
          </button>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-indigo-900/60">
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-indigo-200 uppercase">Plafond total alloué</span>
            <p className="text-xl font-bold mt-1">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-indigo-200 uppercase">Dépenses consommées</span>
            <p className="text-xl font-bold mt-1">{formatCurrency(totalSpentInEnvelopes)}</p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-indigo-200 uppercase">Reste disponible</span>
            <p className={`text-xl font-bold mt-1 ${overallRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(overallRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Add Category Form Modal / Accordion */}
      {showAddForm && (
        <form onSubmit={handleCreateCategory} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Créer une nouvelle catégorie budgétaire</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Annuler
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Nom de l'enveloppe</label>
              <input
                type="text"
                required
                placeholder="Ex: Animaux de compagnie, Jardin..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Plafond mensuel (€)</label>
              <input
                type="number"
                step="10"
                min="0"
                required
                placeholder="Ex: 150"
                value={newCatAmount}
                onChange={(e) => setNewCatAmount(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Classification 50/30/20</label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value as any)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="needs">Besoins vitaux / Fixes (50%)</option>
                <option value="wants">Envies & Loisirs (30%)</option>
                <option value="savings">Épargne & Projets (20%)</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Enregistrer l'enveloppe
          </button>
        </form>
      )}

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const spent = spendMap[cat.name] || 0;
          const ratio = cat.budgetedAmount > 0 ? (spent / cat.budgetedAmount) * 100 : 0;
          const isOver = spent > cat.budgetedAmount;
          const isWarning = ratio >= 80 && !isOver;
          const isEditing = editingId === cat.id;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                isOver ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {cat.type === 'needs' ? 'Besoins (50%)' : cat.type === 'wants' ? 'Envies (30%)' : 'Épargne (20%)'}
                    </span>
                  </div>
                </div>

                {/* Edit Ceiling Action */}
                <div className="flex items-center">
                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(cat)}
                      title="Ajuster le plafond"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Budget Limit / Editable input */}
              <div className="mt-4">
                {isEditing ? (
                  <div className="flex items-center gap-2 my-1">
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-28 p-1.5 border border-indigo-400 rounded-lg text-sm font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">Plafond fixé :</span>
                    <span className="text-base font-extrabold text-slate-900">{formatCurrency(cat.budgetedAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-xs text-slate-500">Dépensé :</span>
                  <span className={`text-sm font-bold ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>
                    {formatCurrency(spent)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, ratio)}%` }}
                  />
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{ratio.toFixed(0)}% consommé</span>
                {isOver ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> +{formatCurrency(spent - cat.budgetedAmount)}
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium">
                    Reste {formatCurrency(cat.budgetedAmount - spent)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
