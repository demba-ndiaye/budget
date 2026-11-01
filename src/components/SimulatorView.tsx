import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  Sliders, 
  Clock, 
  HelpCircle,
  PiggyBank,
  CheckCircle2
} from 'lucide-react';
import { SavingsGoal, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SimulatorViewProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ transactions, goals }) => {
  // Monthly baselines
  const currentIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentFixed = transactions
    .filter((t) => t.type === 'fixed_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentVariable = transactions
    .filter((t) => t.type === 'variable_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const baseExpenses = currentFixed + currentVariable;
  const currentSavingsMonthly = transactions
    .filter((t) => t.type === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  const initialSavingsReserve = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Simulation Sliders
  const [savingsBoost, setSavingsBoost] = useState<number>(100); // extra € / month
  const [variableCutPercent, setVariableCutPercent] = useState<number>(5); // -X% on variable spend
  const [expectedAnnualYield, setExpectedAnnualYield] = useState<number>(3.0); // Livret A / Assurance Vie %

  // Calculated simulation variables
  const monthlyVariableSavings = (currentVariable * variableCutPercent) / 100;
  const totalSimulatedMonthlySavings = currentSavingsMonthly + savingsBoost + monthlyVariableSavings;

  // Monthly yield rate
  const monthlyYieldRate = (expectedAnnualYield / 100) / 12;

  // Projections for 6, 12, 24, 36 months
  const horizonMonths = [6, 12, 24, 36];
  const projections = horizonMonths.map((m) => {
    let accumulated = initialSavingsReserve;
    for (let i = 1; i <= m; i++) {
      accumulated = (accumulated + totalSimulatedMonthlySavings) * (1 + monthlyYieldRate);
    }
    return {
      months: m,
      totalCapital: accumulated,
      interestEarned: accumulated - (initialSavingsReserve + totalSimulatedMonthlySavings * m),
      netSavingsContribution: totalSimulatedMonthlySavings * m,
    };
  });

  // Resilience: how many months of basic needs can the emergency fund cover
  const monthlyVitalNeeds = currentFixed + (currentVariable * 0.7); // vital needs
  const monthsOfSurvival = monthlyVitalNeeds > 0 ? (initialSavingsReserve / monthlyVitalNeeds).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/50 text-white">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Simulateur d'Avenir Financier</h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Visualisez le potentiel de croissance du patrimoine familial en ajustant vos habitudes d'épargne.
            </p>
          </div>
        </div>

        {/* Resilience Card */}
        <div className="mt-6 pt-6 border-t border-blue-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-blue-200 uppercase">Trésorerie d'urgence actuelle</span>
            <p className="text-xl font-bold mt-1 text-white">{formatCurrency(initialSavingsReserve)}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-blue-200 uppercase">Indice de sécurité du foyer</span>
            <p className="text-xl font-bold mt-1 text-emerald-400">{monthsOfSurvival} mois d'autonomie</p>
            <p className="text-[10px] text-blue-200 mt-0.5">Objectif recommandé : 3 à 6 mois</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-blue-200 uppercase">Capacité d'épargne simulée</span>
            <p className="text-xl font-bold mt-1 text-teal-300">{formatCurrency(totalSimulatedMonthlySavings)} / mois</p>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sliders */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Leviers d'Optimisation</h3>
          </div>

          {/* Slider 1: Extra monthly savings */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-700">Effort d'épargne supplémentaire</span>
              <span className="text-blue-600 font-bold text-sm">+{formatCurrency(savingsBoost)} / mois</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={savingsBoost}
              onChange={(e) => setSavingsBoost(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 €</span>
              <span>+250 €</span>
              <span>+500 €</span>
            </div>
          </div>

          {/* Slider 2: Optimization of discretionary expenses */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-700">Optimisation des courses & loisirs</span>
              <span className="text-emerald-600 font-bold text-sm">-{variableCutPercent}% ({formatCurrency(monthlyVariableSavings)} / mois)</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={variableCutPercent}
              onChange={(e) => setVariableCutPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (aucun changement)</span>
              <span>-10%</span>
              <span>-20% (très frugal)</span>
            </div>
          </div>

          {/* Slider 3: Interest Yield */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-700">Rendement annuel estimé (Livret A, assurance-vie)</span>
              <span className="text-slate-800 font-bold text-sm">{expectedAnnualYield}% / an</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.5"
              value={expectedAnnualYield}
              onChange={(e) => setExpectedAnnualYield(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.5% (Compte courant)</span>
              <span>3.0% (Livret A / LDDS)</span>
              <span>6.0% (Fonds indiciel / PEA)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Gain mensuel total réinjecté : </span>
            <strong className="text-emerald-600">+{formatCurrency(savingsBoost + monthlyVariableSavings)}</strong> chaque mois
            vers vos cagnottes et projets !
          </div>
        </div>

        {/* Right: Horizons Table & Visual Bar chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Capital Cumulé Prévisionnel
              </h3>
              <span className="text-xs text-slate-400 font-medium">Simulation avec intérêts composés</span>
            </div>

            <div className="space-y-4">
              {projections.map((p) => {
                const maxCapital = projections[projections.length - 1].totalCapital;
                const percent = maxCapital > 0 ? (p.totalCapital / maxCapital) * 100 : 0;

                return (
                  <div key={p.months} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        Dans {p.months} mois ({p.months / 12 >= 1 ? `${p.months / 12} an(s)` : `${p.months} mois`})
                      </span>
                      <span className="text-base font-extrabold text-emerald-600">
                        {formatCurrency(p.totalCapital)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                      <span>Dont versements : {formatCurrency(p.netSavingsContribution)}</span>
                      <span className="text-indigo-600 font-medium">+ {formatCurrency(p.interestEarned)} d'intérêts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              La régularité est la clé de la tranquillité financière familiale : même 50 € épargnés automatiquement le 2 du mois changent la donne sur 3 ans.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
