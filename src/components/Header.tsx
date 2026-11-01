import React from 'react';
import { 
  PiggyBank, 
  PlusCircle, 
  Download, 
  RotateCcw, 
  Calendar,
  Wallet,
  Users
} from 'lucide-react';
import { formatCurrency, getMonthLabel } from '../utils/formatters';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
  totalIncome: number;
  totalExpenses: number;
  remainingDisposable: number;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  availableMonths,
  totalIncome,
  totalExpenses,
  remainingDisposable,
  onOpenAddModal,
  onExportCSV,
  onResetData,
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Wallet },
    { id: 'transactions', label: 'Opérations', icon: PiggyBank },
    { id: 'budgets', label: 'Plafonds & Enveloppes', icon: Calendar },
    { id: 'family', label: 'Répartition Foyer', icon: Users },
    { id: 'goals', label: 'Objectifs d’Épargne', icon: Download },
    { id: 'simulator', label: 'Simulateur', icon: RotateCcw },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Budget Familial</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Foyer Actif
                </span>
              </div>
              <p className="text-xs text-slate-500">Gestion financière, charges communes et épargne</p>
            </div>
          </div>

          {/* Center Month Selector & Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500 ml-2 mr-1.5" />
              <select
                value={currentMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 py-1 pr-3 focus:outline-none cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {getMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouvelle opération</span>
            </button>

            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                onClick={onExportCSV}
                title="Exporter les opérations en CSV"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={onResetData}
                title="Réinitialiser avec les données d'exemple"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Month Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Revenus du mois :</span>
            <span className="font-bold text-emerald-600">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Total Dépenses :</span>
            <span className="font-bold text-slate-800">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <span className="text-slate-500">Reste à vivre :</span>
            <span className={`font-bold ${remainingDisposable >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {formatCurrency(remainingDisposable)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto border-t border-slate-200 py-2 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Vue d’ensemble' },
            { id: 'transactions', label: 'Opérations & Échéances' },
            { id: 'budgets', label: 'Plafonds de Budget' },
            { id: 'family', label: 'Répartition du Foyer' },
            { id: 'goals', label: 'Épargne & Projets' },
            { id: 'simulator', label: 'Simulateur & Prévisions' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
