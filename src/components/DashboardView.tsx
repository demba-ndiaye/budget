import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PieChart as PieIcon,
  ChevronRight
} from 'lucide-react';
import { Transaction, CategoryBudget, FamilyMember } from '../types';
import { formatCurrency, formatDate, getDaysRemainingInMonth } from '../utils/formatters';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: CategoryBudget[];
  members: FamilyMember[];
  onOpenAddModal: () => void;
  onSelectTab: (tab: string) => void;
  onToggleStatus: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  categories,
  members,
  onOpenAddModal,
  onSelectTab,
  onToggleStatus,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Totals calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFixed = transactions
    .filter((t) => t.type === 'fixed_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVariable = transactions
    .filter((t) => t.type === 'variable_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = transactions
    .filter((t) => t.type === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = totalFixed + totalVariable;
  const netRemainder = totalIncome - totalExpenses - totalSavings;
  const savingsRate = totalIncome > 0 ? ((totalSavings + Math.max(0, netRemainder)) / totalIncome) * 100 : 0;

  const { daysLeft } = getDaysRemainingInMonth();
  const dailyDisposable = Math.max(0, netRemainder) / daysLeft;

  // 50/30/20 Standard Rule
  // Needs: Fixed + Needs Categories (Food, Housing, Health, School, Transport)
  // Wants: Leisure, Shopping, Vacation
  // Savings: Savings items
  const needsSpend = transactions
    .filter((t) => {
      if (t.type === 'fixed_expense') return true;
      if (t.type === 'variable_expense') {
        const cat = categories.find((c) => c.name === t.category);
        return cat?.type === 'needs' || !cat;
      }
      return false;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const wantsSpend = transactions
    .filter((t) => {
      if (t.type === 'variable_expense') {
        const cat = categories.find((c) => c.name === t.category);
        return cat?.type === 'wants';
      }
      return false;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const needsPercentage = totalIncome > 0 ? (needsSpend / totalIncome) * 100 : 0;
  const wantsPercentage = totalIncome > 0 ? (wantsSpend / totalIncome) * 100 : 0;
  const savingsPercentage = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  // Breakdown by category
  const categorySpendMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'fixed_expense' || t.type === 'variable_expense')
    .forEach((t) => {
      categorySpendMap[t.category] = (categorySpendMap[t.category] || 0) + t.amount;
    });

  const categoryBreakdown = Object.entries(categorySpendMap)
    .map(([catName, amount]) => {
      const budgetDef = categories.find((c) => c.name === catName);
      return {
        name: catName,
        amount,
        budget: budgetDef?.budgetedAmount || 0,
        color: budgetDef?.color || '#94a3b8',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Financial health assessment
  let healthTitle = 'Situation Équilibrée';
  let healthDesc = 'Votre budget est bien maîtrisé, continuez à surveiller les dépenses variables.';
  let healthColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let healthIcon = ShieldCheck;

  if (netRemainder < 0) {
    healthTitle = 'Déficit budgétaire';
    healthDesc = `Vos dépenses et épargnes dépassent les revenus de ${formatCurrency(Math.abs(netRemainder))}. Réduisez les dépenses variables pour équilibrer.`;
    healthColor = 'text-rose-700 bg-rose-50 border-rose-200';
    healthIcon = AlertCircle;
  } else if (savingsRate >= 20) {
    healthTitle = 'Excellente santé financière';
    healthDesc = `Superbe performance ! Vous épargnez ${savingsRate.toFixed(1)}% de vos revenus mensuels, bien au-delà de la recommandation de 20%.`;
    healthColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    healthIcon = Sparkles;
  } else if (netRemainder < 150) {
    healthTitle = 'Marge serrée';
    healthDesc = `Il vous reste ${formatCurrency(netRemainder)} pour terminer le mois. Soyez vigilants sur les imprévus.`;
    healthColor = 'text-amber-700 bg-amber-50 border-amber-200';
    healthIcon = AlertCircle;
  }

  // Generate SVG Donut slices
  let cumulativeAngle = 0;
  const totalChartSpend = categoryBreakdown.reduce((s, c) => s + c.amount, 0);

  const donutSlices = categoryBreakdown.map((item) => {
    const sliceAngle = totalChartSpend > 0 ? (item.amount / totalChartSpend) * 360 : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle += sliceAngle;

    // Convert polar coordinates to cartesian for SVG path
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const rOuter = 80;
    const rInner = 50;

    const x1 = 100 + rOuter * Math.cos(startRad);
    const y1 = 100 + rOuter * Math.sin(startRad);
    const x2 = 100 + rOuter * Math.cos(endRad);
    const y2 = 100 + rOuter * Math.sin(endRad);

    const x3 = 100 + rInner * Math.cos(endRad);
    const y3 = 100 + rInner * Math.sin(endRad);
    const x4 = 100 + rInner * Math.cos(startRad);
    const y4 = 100 + rInner * Math.sin(startRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const d = totalChartSpend > 0 && sliceAngle > 0.5
      ? `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`
      : '';

    return {
      ...item,
      d,
      percentage: totalChartSpend > 0 ? (item.amount / totalChartSpend) * 100 : 0,
    };
  });

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Financial Health Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${healthColor}`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-white/70 shadow-xs">
            {React.createElement(healthIcon, { className: 'w-5 h-5' })}
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">{healthTitle}</h2>
            <p className="text-xs opacity-90 mt-0.5">{healthDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onSelectTab('simulator')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 shadow-xs transition-colors flex items-center gap-1"
          >
            Simuler mes prévisions <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenus du mois</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Salaires & Aides</span> perçus
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dépenses Réalisées</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalExpenses)}</p>
            <div className="text-xs text-slate-500 mt-1 flex justify-between">
              <span>Fixes : {formatCurrency(totalFixed)}</span>
              <span>Variables : {formatCurrency(totalVariable)}</span>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Épargne & Projets</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalSavings)}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-teal-600 font-semibold">{savingsRate.toFixed(1)}%</span> des revenus épargnés
            </p>
          </div>
        </div>

        {/* Disposable & Daily Allowance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Reste à Vivre</span>
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-extrabold ${netRemainder >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(netRemainder)}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-300">Journalier ({daysLeft} j. restants) :</span>
              <span className="font-bold text-white">{formatCurrency(dailyDisposable)} / jour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 50 / 30 / 20 Rule Breakdown & Category Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 50 / 30 / 20 Framework */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Règle d'or 50 / 30 / 20</h3>
                <p className="text-xs text-slate-500 mt-0.5">Équilibre idéal recommandé pour le budget d'un foyer</p>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                Guide Budgétaire
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {/* Needs: 50% */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Besoins vitaux & Fixes (Max 50%)</span>
                  <span className={`${needsPercentage > 50 ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                    {needsPercentage.toFixed(1)}% ({formatCurrency(needsSpend)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      needsPercentage > 55 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, needsPercentage)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Logement, énergie, courses, assurances, transports nécessaires</p>
              </div>

              {/* Wants: 30% */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Envies & Loisirs (Max 30%)</span>
                  <span className={`${wantsPercentage > 30 ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                    {wantsPercentage.toFixed(1)}% ({formatCurrency(wantsSpend)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      wantsPercentage > 30 ? 'bg-rose-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(100, wantsPercentage)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Restaurants, shopping plaisir, sorties, abonnements récréatifs</p>
              </div>

              {/* Savings: 20% */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Épargne & Projets d’Avenir (Min 20%)</span>
                  <span className={`${savingsPercentage >= 20 ? 'text-emerald-600 font-bold' : 'text-slate-600'}`}>
                    {savingsPercentage.toFixed(1)}% ({formatCurrency(totalSavings)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (savingsPercentage / 20) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Fonds de sécurité, versements projets, investissements</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pourcentage d'épargne effectif :</span>
            <span className="font-bold text-emerald-600 text-sm">{savingsRate.toFixed(1)} %</span>
          </div>
        </div>

        {/* Expenses by Category (Interactive Donut & List) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">Répartition des Dépenses</h3>
            </div>
            <button
              onClick={() => onSelectTab('budgets')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Gérer les plafonds <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Donut */}
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-sm">
                {donutSlices.map((slice, idx) => (
                  <path
                    key={idx}
                    d={slice.d}
                    fill={slice.color}
                    className="cursor-pointer transition-transform hover:scale-105 origin-center"
                    onMouseEnter={() => setActiveCategoryFilter(slice.name)}
                    onMouseLeave={() => setActiveCategoryFilter(null)}
                  >
                    <title>{`${slice.name}: ${formatCurrency(slice.amount)} (${slice.percentage.toFixed(1)}%)`}</title>
                  </path>
                ))}
              </svg>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Total sorties</span>
                <span className="text-sm font-extrabold text-slate-900">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>

            {/* Category Legend */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs scrollbar-thin">
              {donutSlices.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveCategoryFilter(item.name)}
                  onMouseLeave={() => setActiveCategoryFilter(null)}
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryFilter === item.name ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-slate-700">{item.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                    <span className="text-slate-400 text-[10px] ml-1">({item.percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Nombre de postes de dépenses :</span>
            <span className="font-semibold text-slate-700">{categoryBreakdown.length} catégories</span>
          </div>
        </div>
      </div>

      {/* Row 3: Budget Alerts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Budget Overruns / Warnings */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Surveillance des Enveloppes
            </h3>
            <span className="text-xs text-slate-400">Ce mois-ci</span>
          </div>

          <div className="space-y-4">
            {categories.slice(0, 4).map((cat) => {
              const spent = categorySpendMap[cat.name] || 0;
              const ratio = cat.budgetedAmount > 0 ? (spent / cat.budgetedAmount) * 100 : 0;
              const isOver = spent > cat.budgetedAmount;
              const isWarning = ratio >= 80 && !isOver;

              return (
                <div key={cat.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className={isOver ? 'text-rose-600 font-bold' : isWarning ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
                      {formatCurrency(spent)} / {formatCurrency(cat.budgetedAmount)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>{ratio.toFixed(0)}% consommé</span>
                    <span>
                      {isOver
                        ? `Dépassement de ${formatCurrency(spent - cat.budgetedAmount)}`
                        : `Reste ${formatCurrency(cat.budgetedAmount - spent)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onSelectTab('budgets')}
            className="w-full mt-4 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
          >
            Voir tous les plafonds de dépenses →
          </button>
        </div>

        {/* Recent Transactions List with Cleared Check */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dernières Opérations</h3>
              <p className="text-xs text-slate-500">Cliquez sur le statut pour pointer l'opération</p>
            </div>
            <button
              onClick={() => onSelectTab('transactions')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Historique complet <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const member = members.find((m) => m.id === tx.memberId) || { name: 'Foyer', color: '#64748b' };
              const isIncome = tx.type === 'income';

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleStatus(tx.id)}
                      title={tx.status === 'cleared' ? 'Opération pointée (cliquez pour annuler)' : 'En attente de débit'}
                      className="flex-shrink-0"
                    >
                      {tx.status === 'cleared' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 hover:text-emerald-700" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400 hover:text-amber-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{tx.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="truncate">{tx.category}</span>
                        <span>•</span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-medium"
                          style={{ backgroundColor: `${member.color}15`, color: member.color }}
                        >
                          {member.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                    <p className="text-[10px] text-slate-400 capitalize">{tx.status === 'cleared' ? 'Pointé' : 'En attente'}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{transactions.length} opérations enregistrées pour ce mois</span>
            <button
              onClick={onOpenAddModal}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              + Ajouter une dépense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
