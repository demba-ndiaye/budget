import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Repeat,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { Transaction, TransactionType, FamilyMember, CategoryBudget } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  members: FamilyMember[];
  categories: CategoryBudget[];
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  members,
  categories,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filter logic
  const filtered = transactions.filter((t) => {
    if (searchTerm) {
      const matchTitle = t.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchNotes = t.notes ? t.notes.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      if (!matchTitle && !matchCategory && !matchNotes) return false;
    }
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (memberFilter !== 'all' && t.memberId !== memberFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortOrder === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortOrder === 'amount_desc') return b.amount - a.amount;
    if (sortOrder === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  const filteredIncome = sorted.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const filteredExpenses = sorted.filter((t) => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'income': return { label: 'Revenu', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'fixed_expense': return { label: 'Charge Fixe', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'variable_expense': return { label: 'Dépense Courante', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'savings': return { label: 'Épargne', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par libellé, note ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajouter une ligne</span>
            </button>
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Tous les types</option>
              <option value="income">Revenus</option>
              <option value="fixed_expense">Charges fixes</option>
              <option value="variable_expense">Dépenses variables</option>
              <option value="savings">Épargne</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Membre</label>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Tous les membres</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Catégorie</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Statut bancaire</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Tous les statuts</option>
              <option value="cleared">Pointé / Débité</option>
              <option value="pending">En attente / Prévu</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Tri</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="date_desc">Date récente d'abord</option>
              <option value="date_asc">Date ancienne d'abord</option>
              <option value="amount_desc">Montant décroissant</option>
              <option value="amount_asc">Montant croissant</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
          <span>{sorted.length} opération(s) affichée(s)</span>
          <div className="flex items-center gap-4">
            <span>Entrées : <strong className="text-emerald-600">+{formatCurrency(filteredIncome)}</strong></span>
            <span>Sorties : <strong className="text-rose-600">-{formatCurrency(filteredExpenses)}</strong></span>
            <span>Solde : <strong className={filteredIncome - filteredExpenses >= 0 ? 'text-blue-600' : 'text-rose-600'}>
              {formatCurrency(filteredIncome - filteredExpenses)}
            </strong></span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3.5 px-4 text-center w-12">Pointé</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Libellé & Catégorie</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Membre</th>
                <th className="py-3.5 px-4 text-right">Montant</th>
                <th className="py-3.5 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucune opération ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                sorted.map((tx) => {
                  const member = members.find((m) => m.id === tx.memberId) || { name: 'Foyer', color: '#64748b' };
                  const typeMeta = getTypeLabel(tx.type);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Status toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onToggleStatus(tx.id)}
                          title={tx.status === 'cleared' ? 'Pointé (cliquez pour passer en attente)' : 'En attente'}
                          className="focus:outline-none"
                        >
                          {tx.status === 'cleared' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 hover:text-emerald-700" />
                          ) : (
                            <Clock className="w-5 h-5 text-slate-300 hover:text-amber-500" />
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{tx.title}</span>
                          {tx.isRecurring && (
                            <span title="Dépense ou revenu récurrent" className="p-0.5 text-blue-500">
                              <Repeat className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{tx.category}</span>
                          {tx.notes && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-400 truncate max-w-xs">{tx.notes}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeMeta.bg}`}>
                          {typeMeta.label}
                        </span>
                      </td>

                      {/* Family member */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${member.color}15`, color: member.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.color }} />
                          {member.name}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Modifier l'opération"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Supprimer la ligne"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
