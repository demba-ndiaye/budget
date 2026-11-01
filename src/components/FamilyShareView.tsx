import React, { useState } from 'react';
import { 
  Users, 
  ArrowRightLeft, 
  Check, 
  DollarSign, 
  Plus, 
  UserPlus, 
  Scale, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { FamilyMember, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FamilyShareViewProps {
  members: FamilyMember[];
  transactions: Transaction[];
  onUpdateMemberIncome: (memberId: string, income: number) => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
}

export const FamilyShareView: React.FC<FamilyShareViewProps> = ({
  members,
  transactions,
  onUpdateMemberIncome,
  onAddMember,
}) => {
  const [splitMode, setSplitMode] = useState<'proportional' | 'equal'>('proportional');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberIncome, setNewMemberIncome] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  // Active earning members (excluding general 'common' or 'kids')
  const earningMembers = members.filter((m) => m.monthlyIncome !== undefined && m.monthlyIncome > 0);
  const totalIncomes = earningMembers.reduce((sum, m) => sum + (m.monthlyIncome || 0), 0);

  // Calculate expenses paid by each member for common household things
  // Any expense that is of category 'Logement & Charges', 'Alimentation & Courses', etc., or where memberId is 'common'
  // Or variable expenses paid by m1 or m2 tagged for common
  const commonExpenses = transactions.filter(
    (t) => t.type === 'fixed_expense' || (t.type === 'variable_expense' && (t.memberId === 'common' || t.category === 'Alimentation & Courses'))
  );

  const totalCommonExpense = commonExpenses.reduce((sum, t) => sum + t.amount, 0);

  // What each member actually paid/advanced for these common expenses
  const paidByMember: Record<string, number> = {};
  commonExpenses.forEach((t) => {
    paidByMember[t.memberId] = (paidByMember[t.memberId] || 0) + t.amount;
  });

  const memberShares = earningMembers.map((m) => {
    let targetPercent = 0;
    if (splitMode === 'proportional' && totalIncomes > 0) {
      targetPercent = ((m.monthlyIncome || 0) / totalIncomes) * 100;
    } else {
      targetPercent = earningMembers.length > 0 ? 100 / earningMembers.length : 0;
    }

    const shareDue = (totalCommonExpense * targetPercent) / 100;
    const sharePaid = paidByMember[m.id] || 0;
    const balance = sharePaid - shareDue; // positive = paid too much, negative = owes

    return {
      member: m,
      targetPercent,
      shareDue,
      sharePaid,
      balance,
    };
  });

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const income = parseFloat(newMemberIncome) || 0;
    const colors = ['#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed'];
    const randomColor = colors[members.length % colors.length];

    onAddMember({
      name: newMemberName.trim(),
      role: 'Membre de la famille',
      color: randomColor,
      initials: newMemberName.trim().substring(0, 2).toUpperCase(),
      monthlyIncome: income,
    });

    setNewMemberName('');
    setNewMemberIncome('');
    setShowAddMember(false);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Répartition Équitable des Charges du Foyer</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Partagez les dépenses communes du couple au prorata des revenus réels de chacun ou à parts égales (50/50).
            L'application calcule précisément le virement d'équilibrage nécessaire pour que personne ne soit lésé.
          </p>
        </div>

        {/* Split mode switch */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start md:self-center border border-slate-200">
          <button
            onClick={() => setSplitMode('proportional')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              splitMode === 'proportional' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Au prorata des revenus
          </button>
          <button
            onClick={() => setSplitMode('equal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              splitMode === 'equal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            50 / 50 Égalitaire
          </button>
        </div>
      </div>

      {/* Members Income & Contribution Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((m) => {
          const isEarner = m.monthlyIncome !== undefined && m.monthlyIncome > 0;
          const share = memberShares.find((s) => s.member.id === m.id);

          return (
            <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                      <p className="text-[11px] text-slate-400">{m.role}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  {isEarner ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Revenu mensuel :</span>
                        <span className="font-bold text-slate-800">{formatCurrency(m.monthlyIncome || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Part calculée :</span>
                        <span className="font-bold text-emerald-600">
                          {share ? `${share.targetPercent.toFixed(1)} %` : '—'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-400 text-xs italic py-2">Compte partagé ou bénéficiaire (enfants/foyer)</p>
                  )}
                </div>
              </div>

              {isEarner && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="text-[10px] uppercase font-semibold text-slate-400">Modifier salaire net (€)</label>
                  <input
                    type="number"
                    step="50"
                    defaultValue={m.monthlyIncome}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        onUpdateMemberIncome(m.id, val);
                      }
                    }}
                    className="mt-1 w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Balancing / Who owes Who Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <HeartHandshake className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Bilan d'Équilibrage des Comptes Communs</h3>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div>
              <span className="text-slate-500">Total des charges communes ce mois-ci :</span>
              <span className="font-bold text-slate-900 ml-2 text-sm">{formatCurrency(totalCommonExpense)}</span>
            </div>
            <div>
              <span className="text-slate-500">Mode actif :</span>
              <span className="font-semibold text-indigo-600 ml-1">
                {splitMode === 'proportional' ? 'Au prorata des revenus (équitable)' : '50 / 50 (égalitaire)'}
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Membre</th>
                <th className="py-3 px-4">Quote-part</th>
                <th className="py-3 px-4">Montant dû</th>
                <th className="py-3 px-4">Avancé / Réglé directement</th>
                <th className="py-3 px-4 text-right">Solde Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberShares.map(({ member, targetPercent, shareDue, sharePaid, balance }) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: member.color }} />
                    {member.name}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{targetPercent.toFixed(1)} %</td>
                  <td className="py-3.5 px-4 text-slate-800 font-semibold">{formatCurrency(shareDue)}</td>
                  <td className="py-3.5 px-4 text-slate-600">{formatCurrency(sharePaid)}</td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    <span className={balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {balance >= 0 ? `+ ${formatCurrency(balance)} (a trop versé)` : `- ${formatCurrency(Math.abs(balance))} (à régulariser)`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Settlement instructions card */}
        {memberShares.length >= 2 && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-3">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-indigo-900">Régularisation recommandée</h4>
              <p className="text-xs text-indigo-700 mt-1">
                Pour équilibrer parfaitement les finances du foyer selon la clé de répartition choisie :
                le conjoint ayant un solde négatif effectue un virement unique sur le compte commun ou directement à son conjoint.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Accordion */}
      {!showAddMember ? (
        <button
          onClick={() => setShowAddMember(true)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un membre à la famille</span>
        </button>
      ) : (
        <form onSubmit={handleAddMemberSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Nouveau membre de la famille</h3>
            <button
              type="button"
              onClick={() => setShowAddMember(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Annuler
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Prénom</label>
              <input
                type="text"
                required
                placeholder="Ex: Idrissa"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Revenu mensuel estimé (€) - Optionnel</label>
              <input
                type="number"
                step="50"
                min="0"
                placeholder="0 si enfant ou sans revenu direct"
                value={newMemberIncome}
                onChange={(e) => setNewMemberIncome(e.target.value)}
                className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Ajouter au foyer
          </button>
        </form>
      )}
    </div>
  );
};
