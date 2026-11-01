import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign } from 'lucide-react';
import { Transaction, TransactionType, FamilyMember, CategoryBudget } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => void;
  initialTransaction?: Transaction | null;
  members: FamilyMember[];
  categories: CategoryBudget[];
  currentMonth: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
  members,
  categories,
  currentMonth,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('variable_expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [memberId, setMemberId] = useState('common');
  const [status, setStatus] = useState<'cleared' | 'pending'>('cleared');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialTransaction) {
      setTitle(initialTransaction.title);
      setAmount(initialTransaction.amount.toString());
      setType(initialTransaction.type);
      setCategory(initialTransaction.category);
      setDate(initialTransaction.date);
      setMemberId(initialTransaction.memberId);
      setStatus(initialTransaction.status);
      setIsRecurring(!!initialTransaction.isRecurring);
      setNotes(initialTransaction.notes || '');
    } else {
      // Default new transaction
      setTitle('');
      setAmount('');
      setType('variable_expense');
      setCategory(categories[0]?.name || 'Alimentation & Courses');
      // Set to current date within currentMonth
      const today = new Date().toISOString().split('T')[0];
      setDate(today.startsWith(currentMonth) ? today : `${currentMonth}-01`);
      setMemberId('common');
      setStatus('cleared');
      setIsRecurring(false);
      setNotes('');
    }
  }, [initialTransaction, isOpen, currentMonth, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      id: initialTransaction ? initialTransaction.id : undefined,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      memberId,
      status,
      isRecurring,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">
            {initialTransaction ? 'Modifier l’opération' : 'Nouvelle opération financière'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Type d'opération</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'variable_expense', label: 'Dépense' },
                { id: 'fixed_expense', label: 'Charge Fixe' },
                { id: 'income', label: 'Revenu' },
                { id: 'savings', label: 'Épargne' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as TransactionType)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    type === item.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Libellé / Titre</label>
              <input
                type="text"
                required
                placeholder="Ex: Courses Carrefour, EDF, Salaire..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category & Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                {type === 'income' && <option value="Salaire & Revenus">Salaire & Revenus</option>}
                {type === 'income' && <option value="Aides & Allocations">Aides & Allocations</option>}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Attribué à / Payé par</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Bank Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Date de l'opération</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Statut bancaire</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'cleared' | 'pending')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="cleared">Pointé / Débité sur compte</option>
                <option value="pending">En attente / Chèque non débité</option>
              </select>
            </div>
          </div>

          {/* Options: Recurring & Notes */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">
                Opération récurrente chaque mois (ex: prélèvement automatique, salaire)
              </span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Notes ou remarques (facultatif)</label>
            <input
              type="text"
              placeholder="Ex: Facture #129, ticket de caisse..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              {initialTransaction ? 'Enregistrer les modifications' : 'Ajouter l’opération'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
